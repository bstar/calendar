import React, { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  parseISO,
  isValid,
  isWithinInterval,
  isSameMonth,
  addDays,
  addMonths,
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

  // Use our UTC-aware version for the critical date interval calculation
  // This ensures all days are correctly included regardless of timezone
  const calendarDays = eachDayOfInterval({
    start: weekStart,
    end: weekEnd,
  });

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
    if (!focusedDate) return;

    const currentIndex = calendarDays.findIndex(day => 
      isSameDay(day, focusedDate, timezone)
    );
    if (currentIndex === -1) return;

    let newIndex = currentIndex;
    let preventDefault = true;
    let targetDate: Date | null = null;

    switch (e.key) {
      case 'ArrowLeft':
        // Try to find previous valid day in current month
        const prevIndex = findNextValidDay(currentIndex - 1, -1, calendarDays);
        if (prevIndex !== -1) {
          newIndex = prevIndex;
        } else {
          // No more days in current month, try to navigate to previous month
          if (monthIndex !== undefined && monthIndex > 0 && onNavigateToMonth) {
            // Navigate to previous month's last day
            const targetMonthIndex = monthIndex - 1;
            const prevMonth = addMonths(baseDate, -1);
            const prevMonthDays = eachDayOfInterval({
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
        }
        break;
      case 'ArrowRight':
        // Try to find next valid day in current month
        const nextIndex = findNextValidDay(currentIndex + 1, 1, calendarDays);
        if (nextIndex !== -1) {
          newIndex = nextIndex;
        } else {
          // No more days in current month, try to navigate to next month
          if (monthIndex !== undefined && totalMonths !== undefined && 
              monthIndex < totalMonths - 1 && onNavigateToMonth) {
            // Navigate to next month's first day
            const targetMonthIndex = monthIndex + 1;
            const nextMonth = addMonths(baseDate, 1);
            const nextMonthDays = eachDayOfInterval({
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
            }
          }
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
          if (newIndex === currentIndex && monthIndex !== undefined && monthIndex > 0 && onNavigateToMonth) {
            const columnIndex = currentIndex % 7;
            const targetMonthIndex = monthIndex - 1;
            const prevMonth = addMonths(baseDate, -1);
            const prevMonthDays = eachDayOfInterval({
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
          if (newIndex === currentIndex && monthIndex !== undefined && totalMonths !== undefined && 
              monthIndex < totalMonths - 1 && onNavigateToMonth) {
            const columnIndex = currentIndex % 7;
            const targetMonthIndex = monthIndex + 1;
            const nextMonth = addMonths(baseDate, 1);
            const nextMonthDays = eachDayOfInterval({
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
      default:
        preventDefault = false;
    }

    if (preventDefault) {
      e.preventDefault();
      
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < calendarDays.length) {
        const newDate = calendarDays[newIndex];
        setFocusedDate(newDate);
        
        // Focus the new cell
        requestAnimationFrame(() => {
          const cell = gridRef.current?.querySelector(
            `[data-date="${format(newDate, 'yyyy-MM-dd', timezone)}"]`
          ) as HTMLElement;
          cell?.focus();
        });
      }
    }
  }, [focusedDate, calendarDays, baseDate, timezone, monthIndex, totalMonths, onNavigateToMonth, onNavigateMonth, monthsPerRow, startWeekOnSunday, findNextValidDay]);

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
    if (!focusedDate && monthIndex === 0) {
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
    }
  }, []);

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

      {/* Days grid */}
      <div
        ref={gridRef}
        className="month-grid-days"
        onMouseMove={handleGridMouseMove}
        onMouseLeave={handleGridMouseLeave}
        onKeyDown={handleKeyDown}
        role="grid"
        aria-label={`Calendar grid for ${format(monthStart, 'MMMM yyyy')}`}
      >
        {Object.values(weeks).flatMap((week, weekIndex) =>
          week.map((date, dayIndex) => (
            <DayCell
              key={date.toISOString()}
              date={date}
              selectedRange={selectedRange}
              isCurrentMonth={isSameMonth(date, baseDate, timezone)}
              onMouseDown={() => onSelectionStart(date)}
              onMouseEnter={() => {
                onSelectionMove(date);
                requestAnimationFrame(() => {
                  setHoveredDate(date);
                });
              }}
              showTooltips={showTooltips}
              renderContent={renderDay}
              layer={layer}
              restrictionConfig={restrictionConfig}
              settings={settings}
              rowIndex={weekIndex}
              colIndex={dayIndex}
              globalRowIndex={weekIndex}
              globalColIndex={dayIndex}
              tabIndex={focusedDate && isSameDay(date, focusedDate, timezone) ? 0 : -1}
              onFocus={() => setFocusedDate(date)}
            />
          ))
        )}

        {[...Array(emptyWeeks * 7)].map((_, i) => (
          <div 
            key={`empty-${i}`} 
            className="month-grid-empty-cell" 
            style={{ backgroundColor: settings?.backgroundColors?.emptyRows || "white" }} 
          />
        ))}
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