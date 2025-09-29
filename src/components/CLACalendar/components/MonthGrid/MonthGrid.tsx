import React, { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  eachDayOfIntervalUTC,
  format,
  parseISO,
  isValid,
  isWithinInterval,
  isSameMonth,
  addDays,
  addDaysUTC,
  addMonthsUTC,
  isSameDay
} from '../../../../utils/DateUtils';
import { RestrictionManager } from '../../../CLACalendarComponents/restrictions/RestrictionManager';
import { RestrictedBoundaryRestriction } from '../../../CLACalendarComponents/restrictions/types';
import { CalendarSettings } from '../../../CLACalendar.config';
import { DayCell } from '../DayCell';
import { MonthGridProps } from './MonthGrid.types';
import { getFontSize } from '../../utils/calendar.utils';
import './MonthGrid.css';

export const MonthGrid: React.FC<MonthGridProps> = ({
  baseDate,
  monthIndex = 0,
  selectedRange,
  onSelectionStart,
  onSelectionMove,
  isSelecting = false,
  style,
  showMonthHeading = false,
  showTooltips,
  renderDay,
  layer,
  startWeekOnSunday = false,
  restrictionConfig,
  activeLayer,
  settings,
  totalMonths,
  onNavigateToMonth,
  onNavigateMonth,
  monthsPerRow = totalMonths // Default to all months in one row
}) => {
  const timezone = settings?.timezone || 'UTC';
  const monthStart = startOfMonth(baseDate, timezone);
  const monthEnd = endOfMonth(monthStart, timezone);
  const weekStart = startOfWeek(monthStart, { weekStartsOn: startWeekOnSunday ? 0 : 1, timezone });
  const weekEnd = endOfWeek(monthEnd, { weekStartsOn: startWeekOnSunday ? 0 : 1, timezone });

  // Generate the calendar interval days using UTC-safe iteration when in UTC mode
  // This avoids DST-induced duplicates (e.g. March 8, 2026 in US timezones)
  const calendarDays = (timezone === 'UTC' ? eachDayOfIntervalUTC : eachDayOfInterval)({
    start: weekStart,
    end: weekEnd,
  });

  // Ensure we always have exactly 42 cells (6 weeks × 7 days)
  const TOTAL_CELLS = 42;
  const cellsToAdd = TOTAL_CELLS - calendarDays.length;
  
  // Pad with additional days if needed (this handles edge cases where eachDayOfInterval doesn't return 42 days)
  if (cellsToAdd > 0) {
    const lastDay = calendarDays[calendarDays.length - 1];
    for (let i = 1; i <= cellsToAdd; i++) {
      const addFn = timezone === 'UTC' ? addDaysUTC : addDays;
      calendarDays.push(addFn(lastDay, i));
    }
  }

  const weeks: Record<number, Date[]> = calendarDays.reduce((acc, day, index) => {
    const weekIndex = Math.floor(index / 7);
    return {
      ...acc,
      [weekIndex]: [...(acc[weekIndex] || []), day]
    };
  }, {} as Record<number, Date[]>);

  // Always maintain 6 rows of space regardless of actual weeks in month
  const totalWeeks = 6;
  const currentWeeks = Object.keys(weeks).length;
  const emptyWeeks = totalWeeks - currentWeeks;

  // Use a ref for current mouse position instead of state to avoid render loops
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [focusedDate, setFocusedDate] = useState<Date | null>(null);
  
  // Find the first day of the current month for initial tab index
  const firstDayOfMonth = useMemo(() => 
    calendarDays.find(d => isSameMonth(d, baseDate, timezone)) || null,
    [calendarDays, baseDate, timezone]
  );
  const gridRef = useRef<HTMLDivElement>(null);
  const restrictionManager = useMemo(() => {
    if (!hoveredDate || !restrictionConfig || !restrictionConfig.restrictions || restrictionConfig.restrictions.length === 0) {
      return null;
    }
    return new RestrictionManager(restrictionConfig ?? { restrictions: [] });
  }, [hoveredDate, restrictionConfig]);

  const weekDays = useMemo(() => {
    const days = startWeekOnSunday
      ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days;
  }, [startWeekOnSunday]);

  const handleGridMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Store exact mouse coordinates without any offset
    mousePositionRef.current = {
      x: e.clientX,
      y: e.clientY
    };
    
    // If user moves mouse significantly, exit keyboard navigation mode
    // This allows hover effects to work again
    if (focusedDate) {
      // Only exit if mouse actually moved (not just from focus changes)
      const movement = Math.abs(e.movementX) + Math.abs(e.movementY);
      if (movement > 5) {
        setFocusedDate(null);
      }
    }
  };

  const handleGridMouseLeave = () => {
    setHoveredDate(null);
  };

  // Helper function to find next valid day in current month
  const findNextValidDay = useCallback((startIndex: number, direction: 1 | -1, days: Date[]): number => {
    let index = startIndex;
    while (index >= 0 && index < days.length) {
      if (isSameMonth(days[index], baseDate, timezone)) {
        return index;
      }
      index += direction;
    }
    return -1;
  }, [baseDate, timezone]);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    // Always handle Tab for footer focus handoff when on rightmost month
    if (e.key === 'Tab') {
      // Only if focus is within this grid
      if (gridRef.current?.contains(document.activeElement)) {
        if (!e.shiftKey && totalMonths && monthIndex !== undefined && monthIndex === totalMonths - 1) {
          const clearButton = document.querySelector('[aria-label="Clear date selection"]') as HTMLElement | null;
          const submitButton = document.querySelector('[aria-label="Submit date selection"]') as HTMLElement | null;
          if (clearButton) {
            e.preventDefault();
            clearButton.focus();
            return;
          }
          if (submitButton) {
            e.preventDefault();
            submitButton.focus();
            return;
          }
        }
      }
      // Fall through to default browser behavior
    }

    if (!focusedDate) return;

    // Prevent handling other keyboard events if the grid doesn't contain the active element
    // This prevents the navigation loop when focus leaves
    if (!gridRef.current?.contains(document.activeElement)) {
      return;
    }

    const currentIndex = calendarDays.findIndex(day => 
      isSameDay(day, focusedDate, timezone)
    );
    if (currentIndex === -1) return;

    let newIndex = currentIndex;
    let preventDefault = true;
    let targetDate: Date | null = null;

    switch (e.key) {
      case 'Tab':
        // Already handled above; allow default behavior here
        preventDefault = false;
        break;
      case 'ArrowLeft':
        // Try to find previous valid day in current month
        const prevIndex = findNextValidDay(currentIndex - 1, -1, calendarDays);
        if (prevIndex !== -1) {
          newIndex = prevIndex;
        } else {
          // No more days in current month, try to navigate to previous month
          // Only if there are multiple months visible AND we have a valid previous month
          if (totalMonths && totalMonths > 1 && monthIndex !== undefined && onNavigateToMonth) {
            // Navigate to previous month's last day
            const targetMonthIndex = monthIndex - 1;
            const prevMonth = addMonthsUTC(baseDate, -1);
            const prevMonthDays = (timezone === 'UTC' ? eachDayOfIntervalUTC : eachDayOfInterval)({
              start: startOfWeek(startOfMonth(prevMonth, timezone), { weekStartsOn: startWeekOnSunday ? 0 : 1, timezone }),
              end: endOfWeek(endOfMonth(prevMonth, timezone), { weekStartsOn: startWeekOnSunday ? 0 : 1, timezone })
            });
            // Find last day in previous month that's actually in that month
            for (let i = prevMonthDays.length - 1; i >= 0; i--) {
              if (isSameMonth(prevMonthDays[i], prevMonth, timezone)) {
                targetDate = prevMonthDays[i];
                break;
              }
            }
            if (targetDate) {
              onNavigateToMonth(targetMonthIndex, targetDate);
            }
          }
          // If single month or can't navigate, stay on current cell
          // Keep preventDefault = true to prevent default browser behavior
        }
        break;
      case 'ArrowRight':
        // Try to find next valid day in current month
        const nextIndex = findNextValidDay(currentIndex + 1, 1, calendarDays);
        if (nextIndex !== -1) {
          newIndex = nextIndex;
        } else {
          // No more days in current month, try to navigate to next month
          // Only if there are multiple months visible
          if (totalMonths && totalMonths > 1 && monthIndex !== undefined && onNavigateToMonth) {
            // Navigate to next month's first day
            const targetMonthIndex = monthIndex + 1;
            const nextMonth = addMonthsUTC(baseDate, 1);
            const nextMonthDays = (timezone === 'UTC' ? eachDayOfIntervalUTC : eachDayOfInterval)({
              start: startOfWeek(startOfMonth(nextMonth, timezone), { weekStartsOn: startWeekOnSunday ? 0 : 1, timezone }),
              end: endOfWeek(endOfMonth(nextMonth, timezone), { weekStartsOn: startWeekOnSunday ? 0 : 1, timezone })
            });
            // Find first day in next month that's actually in that month
            for (let i = 0; i < nextMonthDays.length; i++) {
              if (isSameMonth(nextMonthDays[i], nextMonth, timezone)) {
                targetDate = nextMonthDays[i];
                break;
              }
            }
            if (targetDate) {
              onNavigateToMonth(targetMonthIndex, targetDate);
              e.preventDefault();
              return;
            }
          }
          // If single month or can't navigate, stay on current cell
          // Keep preventDefault = true to prevent default browser behavior
        }
        break;
      case 'ArrowUp':
        let upIndex = currentIndex - 7;
        // Check if the up index would be valid and in current month
        if (upIndex >= 0 && isSameMonth(calendarDays[upIndex], baseDate, timezone)) {
          newIndex = upIndex;
        } else {
          // Try to find a valid day above in current month
          while (upIndex >= 0) {
            if (isSameMonth(calendarDays[upIndex], baseDate, timezone)) {
              newIndex = upIndex;
              break;
            }
            upIndex -= 7;
          }
          
          // If no valid day found above, try to navigate to previous month
          // Only if there are multiple months
          if (newIndex === currentIndex && totalMonths && totalMonths > 1 && monthIndex !== undefined && onNavigateToMonth) {
            const columnIndex = currentIndex % 7;
            const targetMonthIndex = monthIndex - 1;
            const prevMonth = addMonthsUTC(baseDate, -1);
            const prevMonthDays = (timezone === 'UTC' ? eachDayOfIntervalUTC : eachDayOfInterval)({
              start: startOfWeek(startOfMonth(prevMonth, timezone), { weekStartsOn: startWeekOnSunday ? 0 : 1, timezone }),
              end: endOfWeek(endOfMonth(prevMonth, timezone), { weekStartsOn: startWeekOnSunday ? 0 : 1, timezone })
            });
            
            // Find a valid day in the same column from bottom to top
            for (let week = Math.floor((prevMonthDays.length - 1) / 7); week >= 0; week--) {
              const idx = week * 7 + columnIndex;
              if (idx < prevMonthDays.length && isSameMonth(prevMonthDays[idx], prevMonth, timezone)) {
                targetDate = prevMonthDays[idx];
                break;
              }
            }
            
            if (targetDate) {
              onNavigateToMonth(targetMonthIndex, targetDate);
              e.preventDefault();
              return;
            }
          }
        }
        break;
      case 'ArrowDown':
        let downIndex = currentIndex + 7;
        // Check if the down index would be valid and in current month
        if (downIndex < calendarDays.length && isSameMonth(calendarDays[downIndex], baseDate, timezone)) {
          newIndex = downIndex;
        } else {
          // Try to find a valid day below in current month
          while (downIndex < calendarDays.length) {
            if (isSameMonth(calendarDays[downIndex], baseDate, timezone)) {
              newIndex = downIndex;
              break;
            }
            downIndex += 7;
          }
          
          // If no valid day found below, try to navigate to next month
          // Only if there are multiple months
          if (newIndex === currentIndex && totalMonths && totalMonths > 1 && monthIndex !== undefined && onNavigateToMonth) {
            const columnIndex = currentIndex % 7;
            const targetMonthIndex = monthIndex + 1;
            const nextMonth = addMonthsUTC(baseDate, 1);
            const nextMonthDays = (timezone === 'UTC' ? eachDayOfIntervalUTC : eachDayOfInterval)({
              start: startOfWeek(startOfMonth(nextMonth, timezone), { weekStartsOn: startWeekOnSunday ? 0 : 1, timezone }),
              end: endOfWeek(endOfMonth(nextMonth, timezone), { weekStartsOn: startWeekOnSunday ? 0 : 1, timezone })
            });
            
            // Find a valid day in the same column from top to bottom
            for (let week = 0; week <= Math.floor((nextMonthDays.length - 1) / 7); week++) {
              const idx = week * 7 + columnIndex;
              if (idx < nextMonthDays.length && isSameMonth(nextMonthDays[idx], nextMonth, timezone)) {
                targetDate = nextMonthDays[idx];
                break;
              }
            }
            
            if (targetDate) {
              onNavigateToMonth(targetMonthIndex, targetDate);
              e.preventDefault();
              return;
            }
          }
        }
        break;
      case 'Home':
        if (e.ctrlKey) {
          // Go to first day of month
          newIndex = calendarDays.findIndex(day => 
            isSameMonth(day, baseDate, timezone)
          );
        } else {
          // Go to first day of week within current month
          const weekStart = Math.floor(currentIndex / 7) * 7;
          // Find first valid day in this week
          for (let i = weekStart; i < weekStart + 7 && i < calendarDays.length; i++) {
            if (isSameMonth(calendarDays[i], baseDate, timezone)) {
              newIndex = i;
              break;
            }
          }
        }
        break;
      case 'End':
        if (e.ctrlKey) {
          // Go to last day of month
          for (let i = calendarDays.length - 1; i >= 0; i--) {
            if (isSameMonth(calendarDays[i], baseDate, timezone)) {
              newIndex = i;
              break;
            }
          }
        } else {
          // Go to last day of week within current month
          const weekStart = Math.floor(currentIndex / 7) * 7;
          const weekEnd = Math.min(weekStart + 6, calendarDays.length - 1);
          // Find last valid day in this week
          for (let i = weekEnd; i >= weekStart; i--) {
            if (isSameMonth(calendarDays[i], baseDate, timezone)) {
              newIndex = i;
              break;
            }
          }
        }
        break;
      case 'PageUp':
        // Move to previous month
        e.preventDefault();
        if (onNavigateMonth) {
          onNavigateMonth('prev');
        }
        return;
      case 'PageDown':
        // Move to next month
        e.preventDefault();
        if (onNavigateMonth) {
          onNavigateMonth('next');
        }
        return;
      case 'Escape':
        // Exit keyboard navigation mode by blurring the focused element
        e.preventDefault();
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        setFocusedDate(null);
        return;
      default:
        preventDefault = false;
    }

    if (preventDefault) {
      e.preventDefault();
      
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < calendarDays.length) {
        const newDate = calendarDays[newIndex];
        setFocusedDate(newDate);
        
        // Focus the new cell within this grid instance only
        requestAnimationFrame(() => {
          if (!gridRef.current) return;
          const cell = gridRef.current.querySelector(
            `[data-date="${format(newDate, 'yyyy-MM-dd', timezone)}"]`
          ) as HTMLElement;
          if (cell) {
            cell.focus();
          }
        });
      }
    }
  }, [focusedDate, calendarDays, baseDate, timezone, monthIndex, totalMonths, onNavigateToMonth, onNavigateMonth, startWeekOnSunday, findNextValidDay]);

  // Add scroll handler to hide tooltip on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (hoveredDate) {
        setHoveredDate(null);
      }
    };

    // Listen for scroll on window and capture phase for all parents
    window.addEventListener('scroll', handleScroll, true);
    
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [hoveredDate]);

  // Set initial focus on the current date or first day of month
  useEffect(() => {
    // Only set initial focus if we don't already have a focused date and this is the first month
    if (!focusedDate && monthIndex === 0) {
      // Use a small delay to allow manual focus to take precedence (important for tests)
      const timer = setTimeout(() => {
        // Check again after the delay to see if focus was set manually
        if (focusedDate) return;
        
        const today = new Date();
        const isCurrentMonthView = isSameMonth(today, baseDate, timezone);
        
        // Check if today is in the current month view and is visible
        if (isCurrentMonthView) {
          const todayInCalendar = calendarDays.find(day => isSameDay(day, today, timezone));
          if (todayInCalendar && isSameMonth(todayInCalendar, baseDate, timezone)) {
            setFocusedDate(todayInCalendar);
            return;
          }
        }
        
        // Otherwise, focus on the first day of the current month
        const firstDayOfMonth = calendarDays.find(day => 
          isSameMonth(day, baseDate, timezone)
        );
        if (firstDayOfMonth) {
          setFocusedDate(firstDayOfMonth);
        }
      }, 10); // Small delay to allow manual focus to take precedence
      
      return () => clearTimeout(timer);
    }
  }, [focusedDate, monthIndex, baseDate, timezone, calendarDays]);

  // Only render tooltip when necessary
  const renderTooltip = useCallback((message: string, settings?: CalendarSettings) => {
    // Use the ref value to avoid render loops
    const position = mousePositionRef.current;

    return ReactDOM.createPortal(
      <div
        className="month-grid-tooltip"
        style={{
          left: `${position.x + 10}px`,
          top: `${position.y + 10}px`,
          fontSize: getFontSize(settings, 'small')
        }}
      >
        {message}
      </div>,
      document.body
    );
  }, []);

  return (
    <div className="month-grid-container" style={style}>
      {showMonthHeading && (
        <div 
          className="month-grid-heading" 
          style={{
            fontSize: getFontSize(settings, 'small'),
            backgroundColor: settings?.backgroundColors?.monthHeader || 'transparent'
          }}
        >
          {format(monthStart, 'MMM yyyy')}
        </div>
      )}

      {/* Weekday header row */}
      <div className="month-grid-weekdays" role="row">
        {weekDays.map(day => (
          <div
            key={day}
            className="month-grid-weekday"
            role="columnheader"
            aria-label={day}
            style={{
              fontSize: getFontSize(settings, 'small')
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days grid - Always renders exactly 42 cells */}
      <div
        ref={gridRef}
        className="month-grid-days"
        onMouseMove={handleGridMouseMove}
        onMouseLeave={handleGridMouseLeave}
        onKeyDown={handleKeyDown}
        onBlur={(e) => {
          // Clear focused date when focus leaves the grid entirely
          // Check if the new focus target is outside this grid
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setFocusedDate(null);
          }
        }}
        role="grid"
        aria-label={`Calendar grid for ${format(monthStart, 'MMMM yyyy')}`}
      >
        {calendarDays.map((date, index) => {
          const isCurrentMonth = isSameMonth(date, baseDate, timezone);
          const weekIndex = Math.floor(index / 7);
          const dayIndex = index % 7;
          
          return (
            <DayCell
              key={date.toISOString()}
              date={date}
              selectedRange={selectedRange}
              isCurrentMonth={isCurrentMonth}
              onMouseDown={(e: React.MouseEvent) => {
                // Only exit keyboard navigation mode for real mouse clicks
                // (clientX and clientY are 0 for keyboard-generated synthetic events)
                const isRealMouseEvent = e.clientX !== 0 || e.clientY !== 0;
                if (isRealMouseEvent) {
                  setFocusedDate(null);
                }
                
                if (e.shiftKey && selectedRange.start) {
                  // Shift+Click: extend selection
                  // For keyboard (synthetic event), pass forceUpdate=true
                  onSelectionMove(date, !isRealMouseEvent);
                } else {
                  // Regular click: start new selection
                  // Pass isMouseDrag=true only for real mouse events
                  onSelectionStart(date, isRealMouseEvent);
                }
              }}
              onMouseEnter={() => {
                // Trigger selection move if:
                // 1. We're in drag selection mode (isSelecting), OR
                // 2. We're not in keyboard navigation mode (!focusedDate)
                // This prevents the selection from following the mouse cursor during keyboard nav
                // but allows drag selection to work even when focusedDate is set
                if (isSelecting || !focusedDate) {
                  onSelectionMove(date);
                }
                // Always update hovered date for tooltip display
                requestAnimationFrame(() => {
                  setHoveredDate(date);
                });
              }}
              onSelectionStart={onSelectionStart}
              onSelectionMove={onSelectionMove}
              showTooltips={showTooltips}
              renderContent={renderDay}
              layer={layer}
              restrictionConfig={restrictionConfig}
              settings={settings}
              rowIndex={weekIndex}
              colIndex={dayIndex}
              globalRowIndex={weekIndex}
              globalColIndex={dayIndex}
              tabIndex={
                focusedDate ? 
                  (isSameDay(date, focusedDate, timezone) ? 0 : -1) :
                  (firstDayOfMonth && isSameDay(date, firstDayOfMonth, timezone) ? 0 : -1)
              }
              onFocus={() => setFocusedDate(date)}
              onKeyDown={handleKeyDown}
            />
          );
        })}
      </div>

      {/* Portaled tooltip to body */}
      {hoveredDate && restrictionConfig?.restrictions && restrictionManager && document.hasFocus() && (
        (() => {
          // First check standard restriction result
          const result = restrictionManager.checkSelection(hoveredDate, hoveredDate);

          // If standard restriction shows message, display it
          if (!result.allowed && result.message) {
            return renderTooltip(result.message, settings);
          }

          // Check specifically for restricted boundary type
          const boundaryRestriction = restrictionConfig.restrictions.find(r =>
            r.type === 'restricted_boundary' && r.enabled
          );

          if (boundaryRestriction && selectedRange.start) {
            const selectionStart = parseISO(selectedRange.start);

            // Safe cast the boundary restriction to the correct type
            const boundaryWithRanges = boundaryRestriction as RestrictedBoundaryRestriction;
            if (boundaryWithRanges.ranges) {
              for (const range of boundaryWithRanges.ranges) {
                // Skip if dates are missing
                if (!range.startDate || !range.endDate) continue;

                const rangeStart = parseISO(range.startDate);
                const rangeEnd = parseISO(range.endDate);

                if (!isValid(rangeStart) || !isValid(rangeEnd)) continue;

                // If selection started within this boundary
                if (isWithinInterval(selectionStart, { start: rangeStart, end: rangeEnd })) {
                  // If hovered date is outside boundary, show tooltip with message
                  if (!isWithinInterval(hoveredDate, { start: rangeStart, end: rangeEnd })) {
                    return renderTooltip(range.message || 'Selection must stay within the boundary', settings);
                  }
                }
              }
            }
          }

          return null;
        })()
      )}
    </div>
  );
};