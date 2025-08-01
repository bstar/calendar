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
  isSameMonth
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
  settings
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
      <div className="month-grid-weekdays">
        {weekDays.map(day => (
          <div
            key={day}
            className="month-grid-weekday"
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
        className="month-grid-days"
        onMouseMove={handleGridMouseMove}
        onMouseLeave={handleGridMouseLeave}
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