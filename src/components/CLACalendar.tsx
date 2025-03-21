import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import ReactDOM from 'react-dom';
import debounce from "lodash-es/debounce";
import { parse, isValid, isAfter, isBefore, eachDayOfInterval } from "date-fns"; // Import from date-fns directly
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  isSameDay,
  isWithinInterval,
  parseISO,
} from "../utils/DateUtils";

import "./DateRangePicker.css";
import "./DateRangePickerNew/CalendarComponents.css";

import { DateRangeSelectionManager, DateRange } from "./DateRangePickerNew/selection/DateRangeSelectionManager";
import { DateRangePickerHandlers } from "./DateRangePickerNew/handlers/DateRangePickerHandlers";
import { RestrictionBackgroundGenerator } from "./DateRangePickerNew/restrictions/RestrictionBackgroundGenerator";
import { LayerManager } from "./DateRangePickerNew/layers/LayerManager";
import {
  CalendarSettings,
  Layer,
  DEFAULT_COLORS,
  DEFAULT_CONTAINER_STYLES
} from "./DateRangePicker.config";
import { LayerRenderer } from './DateRangePickerNew/layers/LayerRenderer';
import { RestrictionManager } from './DateRangePickerNew/restrictions/RestrictionManager';
import { Notification } from './DateRangePickerNew/Notification';
import {
  CalendarHeader,
  DateInputSection,
  CalendarFooter,
  CalendarContainer,
  SideChevronIndicator,
  Tooltip,
  RenderResult,
  MonthGridProps,
  CalendarGridProps,
  ValidationError as CalendarValidationError,
} from './DateRangePickerNew/CalendarComponents';
import { CalendarPortal } from './DateRangePickerNew/CalendarPortal';
import { registerCalendar } from './DateRangePickerNew/CalendarCoordinator';
import './DateRangePickerNew/CalendarPortal.css';
import { RestrictionConfig, Restriction, RestrictedBoundaryRestriction } from './DateRangePickerNew/restrictions/types';

// Font size utility function
/**
 * Calculate a font size based on the calendar's base font size setting
 * @param settings The calendar settings object
 * @param sizeType The type of font size to calculate (default, large, small, etc)
 * @returns A string with the calculated font size
 */
const getFontSize = (settings?: CalendarSettings, sizeType: 'base' | 'large' | 'small' | 'extraSmall' = 'base'): string => {
  // Default base size if not specified in settings
  const baseSize = settings?.baseFontSize || '1rem';
  
  // Calculate relative sizes based on the base size
  switch(sizeType) {
    case 'large':
      return baseSize.includes('rem') ? 
        `${parseFloat(baseSize) * 1.25}rem` : 
        baseSize.includes('px') ? 
          `${parseFloat(baseSize) * 1.25}px` : 
          '1.25rem';
    case 'small':
      return baseSize.includes('rem') ? 
        `${parseFloat(baseSize) * 0.875}rem` : 
        baseSize.includes('px') ? 
          `${parseFloat(baseSize) * 0.875}px` : 
          '0.875rem';
    case 'extraSmall':
      return baseSize.includes('rem') ? 
        `${parseFloat(baseSize) * 0.75}rem` : 
        baseSize.includes('px') ? 
          `${parseFloat(baseSize) * 0.75}px` : 
          '0.75rem';
    case 'base':
    default:
      return baseSize;
  }
};

// Generate a unique ID for each calendar instance
let calendarCounter = 0;

// Add these interfaces after the existing ones
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

interface CardCompositionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

interface CardComponent extends React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>> {
  Header: React.FC<CardCompositionProps>;
  Body: React.FC<CardCompositionProps>;
  Footer: React.FC<CardCompositionProps>;
}

// Custom components
const Card = React.forwardRef<HTMLDivElement, CardProps>(({ children, className, ...props }, ref) => (
  <div ref={ref} className={`cla-card ${className || ''}`} {...props}>
    {children}
  </div>
)) as CardComponent;

Card.Header = ({ children, className, ...props }: CardCompositionProps) => (
  <div className={`cla-card-header ${className || ''}`} {...props}>
    {children}
  </div>
);

Card.Body = ({ children, className, ...props }: CardCompositionProps) => (
  <div className={`cla-card-body ${className || ''}`} {...props}>
    {children}
  </div>
);

Card.Footer = ({ children, className, ...props }: CardCompositionProps) => (
  <div className={`cla-card-footer ${className || ''}`} {...props}>
    {children}
  </div>
);

const Input: React.FC<InputProps> = ({ className, ...props }) => (
  <input
    className={`cla-input ${className || ''}`}
    {...props}
  />
);

// Add these type definitions
interface Renderer {
  (date: Date): RenderResult | null;
}

const useClickOutside = (
  ref: React.RefObject<HTMLElement>,
  handler: (event: MouseEvent) => void
) => {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }

      const isFloatingIndicator = (event.target as Element).closest('.floating-indicator');
      if (isFloatingIndicator) {
        return;
      }

      handler(event);
    };

    document.addEventListener('mousedown', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
    };
  }, [ref, handler]);
};

const dateValidator = (() => {
  const DATE_FORMAT = "MMMM d, yyyy";

  const parseDotNotation = (input) => {
    // Quick test for dot notation attempt
    if (!/\d\./.test(input)) {
      return null;
    }

    // Parse the components
    const match = input.match(/(\d?\d)\.(\d?\d)\.(\d?\d?\d\d)/);

    if (!match) {
      return null;
    }

    const [_, month, day, year] = match;

    const fullYear = year.length === 2 ? `20${year}` : year;

    // Create and validate date
    const date = new Date(fullYear, parseInt(month) - 1, parseInt(day));

    const isValid = date.getMonth() === parseInt(month) - 1;

    return isValid ? date : null;
  };

  return {
    validate: (value, context) => {
      if (!value) return { isValid: true, error: null };

      // Try dot notation if it looks like one
      if (/\d\./.test(value)) {
        const date = parseDotNotation(value);
        return date ? { isValid: true, error: null } : {
          isValid: false,
          error: {
            message: 'Invalid date',
            type: 'error',
            field: 'date'
          }
        };
      }

      // Otherwise use standard format
      try {
        parse(value, DATE_FORMAT, new Date());
        return { isValid: true, error: null };
      } catch {
        return {
          isValid: false,
          error: {
            message: `Please use format: ${DATE_FORMAT}`,
            type: 'error',
            field: 'format'
          }
        };
      }
    },
    formatValue: (date) => !date ? '' : format(date, DATE_FORMAT),
    parseValue: (value) => {
      if (!value) return null;
      return /\d\./.test(value) ? parseDotNotation(value) : parse(value, DATE_FORMAT, new Date());
    },
    DATE_FORMAT
  };
})();

// Use the imported ValidationError type instead of defining our own
// interface ValidationError {
//   message: string;
//   type: string;
//   field: string;
// }

/**
 * A reliable implementation of isSameMonth that compares year and month components directly
 * rather than relying on equality of Date objects which can be affected by timezone issues.
 * 
 * @param {Date} date1 - First date to compare
 * @param {Date} date2 - Second date to compare
 * @returns {boolean} True if both dates are in the same month and year
 */
const isSameMonth = (date1: Date, date2: Date): boolean => {
  // Extract year and month components directly 
  const year1 = date1.getFullYear();
  const month1 = date1.getMonth();
  
  const year2 = date2.getFullYear();
  const month2 = date2.getMonth();
  
  return year1 === year2 && month1 === month2;
};

// Update the MonthGrid to use proper types for weeks
const MonthGrid: React.FC<MonthGridProps & { settings?: CalendarSettings }> = ({
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
  const monthStart = startOfMonth(baseDate);
  const monthEnd = endOfMonth(monthStart);
  const weekStart = startOfWeek(monthStart, { weekStartsOn: startWeekOnSunday ? 0 : 1 });
  const weekEnd = endOfWeek(monthEnd, { weekStartsOn: startWeekOnSunday ? 0 : 1 });
  
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

  // Only render tooltip when necessary
  const renderTooltip = useCallback((message: string, settings?: CalendarSettings) => {
    // Use the ref value to avoid render loops
    const position = mousePositionRef.current;
    
    return ReactDOM.createPortal(
      <div 
        style={{
          position: 'fixed',
          left: `${position.x + 10}px`,
          top: `${position.y + 10}px`,
          backgroundColor: 'rgba(220, 53, 69, 0.9)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: getFontSize(settings, 'small'),
          pointerEvents: 'none',
          zIndex: 2147483647, // Maximum possible z-index value
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          maxWidth: '250px',
          whiteSpace: 'pre-line',
          margin: 0,
          transform: 'none'
        }}
      >
        {message}
      </div>,
      document.body
    );
  }, []);

  return (
    <div style={{
      width: '100%',
      padding: '0 8px',
      marginTop: 0,  // Ensure no top margin
      ...style
    }}>
      {showMonthHeading && (
        <div style={{
          fontSize: getFontSize(settings, 'large'),
          fontWeight: '600',
          color: '#333',
          textAlign: 'left',
          marginTop: 0,  // Ensure no top margin
          marginBottom: '8px',
          paddingTop: 0,  // Ensure no top padding
          paddingLeft: '2px'
        }}>
          {format(monthStart, 'MMMM')}
        </div>
      )}

      {/* Weekday header row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        marginBottom: '8px',
        paddingLeft: '2px'  // Match month heading alignment
      }}>
        {weekDays.map(day => (
          <div
            key={day}
            style={{
              fontSize: getFontSize(settings, 'small'),
              fontWeight: "600",
              color: "#6c757d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "24px"  // Reduced header height
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div
        onMouseMove={handleGridMouseMove}
        onMouseLeave={handleGridMouseLeave}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gridAutoRows: '36px',
          rowGap: '3px',
          paddingLeft: '2px'  // Match month heading alignment
        }}
      >
        {Object.values(weeks).flatMap(week =>
          week.map(date => (
            <DayCell
              key={date.toISOString()}
              date={date}
              selectedRange={selectedRange}
              isCurrentMonth={isSameMonth(date, baseDate)}
              onMouseDown={() => onSelectionStart(date)}
              onMouseEnter={() => {
                // Call these separately to avoid a potential update loop
                onSelectionMove(date);
                // Use requestAnimationFrame to avoid rapid re-renders
                // that could cause infinite update loops
                requestAnimationFrame(() => {
                  setHoveredDate(date);
                });
              }}
              showTooltips={showTooltips}
              renderContent={renderDay}
              layer={layer}
              restrictionConfig={restrictionConfig}
              activeLayer={activeLayer}
              settings={settings}
            />
          ))
        )}

        {[...Array(emptyWeeks * 7)].map((_, i) => (
          <div key={`empty-${i}`} style={{ backgroundColor: "white" }} />
        ))}
      </div>

      {/* Portaled tooltip to body */}
      {hoveredDate && restrictionConfig?.restrictions && document.hasFocus() && (
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
                const rangeStart = parseISO(range.start);
                const rangeEnd = parseISO(range.end);
                
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

// Update the DayCell component to add debug logging and ensure hover events
const DayCell = ({
  date,
  selectedRange,
  isCurrentMonth,
  onMouseDown,
  onMouseEnter,
  showTooltips,
  renderContent,
  layer,
  restrictionConfig,
  activeLayer,
  settings
}) => {
  const { isSelected, isInRange, isRangeStart, isRangeEnd } = useMemo(() => {
    if (!selectedRange.start) {
      return { isSelected: false, isInRange: false, isRangeStart: false, isRangeEnd: false };
    }

    const startDate = parseISO(selectedRange.start);
    const endDate = selectedRange.end ? parseISO(selectedRange.end) : null;
    
    // Always use chronological ordering for visual styling
    const [chronologicalStart, chronologicalEnd] = endDate && startDate > endDate
      ? [endDate, startDate]
      : [startDate, endDate];
    
    return {
      isSelected: isSameDay(date, startDate) || (endDate && isSameDay(date, endDate)),
      isInRange: chronologicalEnd
        ? (date >= chronologicalStart && date <= chronologicalEnd)
        : false,
      // Use chronological ordering for range start/end determination
      isRangeStart: isSameDay(date, chronologicalStart),
      isRangeEnd: chronologicalEnd && isSameDay(date, chronologicalEnd)
    };
  }, [date, selectedRange]);

  const [isHovered, setIsHovered] = useState(false);

  const restrictionManager = useMemo(() => {
    if (!restrictionConfig || !restrictionConfig.restrictions || restrictionConfig.restrictions.length === 0) {
      return null;
    }
    return new RestrictionManager(restrictionConfig ?? { restrictions: [] });
  }, [restrictionConfig]);

  const restrictionResult = useMemo(() => {
    if (!restrictionManager) {
      return { allowed: true };
    }
    
    // Get basic restriction status for this date
    const baseRestriction = restrictionManager.checkSelection(date, date);
    
    // If no selection is in progress or this isn't a restricted date, just return the base result
    if (!selectedRange.start || (baseRestriction.allowed && !hasAnyBoundaryRestriction())) {
      return baseRestriction;
    }
    
    // From here, we're dealing with a selection in progress
    // Get the anchor date - the fixed point of the selection
    const anchorDate = selectedRange.anchorDate 
      ? parseISO(selectedRange.anchorDate) 
      : parseISO(selectedRange.start);
    
    // Check if the anchor is in a boundary - this is the key to determine if we need
    // to apply boundary restrictions
    const anchorInBoundary = isAnchorInAnyBoundary(anchorDate);
    const currentDateInBoundary = isDateInAnyBoundary(date);
    
    // If anchor is in a boundary but current date is not, show restriction
    if (anchorInBoundary.inBoundary && !isInSameBoundary(date, anchorInBoundary.boundaryStart, anchorInBoundary.boundaryEnd)) {
      return { allowed: false, message: anchorInBoundary.message };
    }
    
    // If anchor is NOT in a boundary but current date IS, do NOT show restriction pattern
    // This allows selections to cross into boundaries when starting outside them
    if (!anchorInBoundary.inBoundary && currentDateInBoundary) {
      return { allowed: true };
    }
    
    // For all other cases, use the base restriction result
    return baseRestriction;
    
    // Helper functions
    function hasAnyBoundaryRestriction() {
      const currentRestrictionConfig = restrictionConfig ?? { restrictions: [] };
      return currentRestrictionConfig.restrictions.some(r => 
        r.type === 'restricted_boundary' && r.enabled
      );
    }
    
    function isAnchorInAnyBoundary(anchor: Date) {
      const currentRestrictionConfig = restrictionConfig ?? { restrictions: [] };
      
      // Look for boundary restrictions
      for (const restriction of currentRestrictionConfig.restrictions) {
        if (restriction.type !== 'restricted_boundary' || !restriction.enabled) continue;
        
        // Safe cast to access ranges
        const boundaryWithRanges = restriction as RestrictedBoundaryRestriction;
        if (boundaryWithRanges.ranges) {
          for (const range of boundaryWithRanges.ranges) {
            const rangeStart = parseISO(range.start);
            const rangeEnd = parseISO(range.end);
            
            if (!isValid(rangeStart) || !isValid(rangeEnd)) continue;
            
            // Check if anchor is in this boundary
            if (anchor >= rangeStart && anchor <= rangeEnd) {
              return {
                inBoundary: true,
                boundaryStart: rangeStart,
                boundaryEnd: rangeEnd,
                message: range.message || 'Selection must stay within the boundary'
              };
            }
          }
        }
      }
      
      return { inBoundary: false, boundaryStart: null, boundaryEnd: null, message: null };
    }
    
    function isDateInAnyBoundary(checkDate: Date) {
      const currentRestrictionConfig = restrictionConfig ?? { restrictions: [] };
      
      // Look for boundary restrictions
      for (const restriction of currentRestrictionConfig.restrictions) {
        if (restriction.type !== 'restricted_boundary' || !restriction.enabled) continue;
        
        // Safe cast to access ranges
        const boundaryWithRanges = restriction as RestrictedBoundaryRestriction;
        if (boundaryWithRanges.ranges) {
          for (const range of boundaryWithRanges.ranges) {
            const rangeStart = parseISO(range.start);
            const rangeEnd = parseISO(range.end);
            
            if (!isValid(rangeStart) || !isValid(rangeEnd)) continue;
            
            // Check if date is in this boundary
            if (checkDate >= rangeStart && checkDate <= rangeEnd) {
              return true;
            }
          }
        }
      }
      
      return false;
    }
    
    function isInSameBoundary(checkDate: Date, boundaryStart: Date | null, boundaryEnd: Date | null) {
      if (!boundaryStart || !boundaryEnd) return false;
      return checkDate >= boundaryStart && checkDate <= boundaryEnd;
    }
  }, [date, restrictionManager, selectedRange, restrictionConfig]);

  const handleMouseEnter = useCallback((e) => {
    setIsHovered(true);
    if (onMouseEnter) onMouseEnter(e);
  }, [onMouseEnter]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const isSingleDay = useMemo(() => {
    if (!selectedRange.start) return false;
    if (!selectedRange.end) return true;
    return isSameDay(parseISO(selectedRange.start), parseISO(selectedRange.end));
  }, [selectedRange.start, selectedRange.end]);

  if (!isCurrentMonth) {
    return <div style={{ width: "100%", height: "100%", position: "relative", backgroundColor: "white" }} />;
  }

  const eventContent = useMemo(() => {
    // Only compute event content when:
    // 1. We have a render function
    // 2. The cell is current month (to avoid computation for previous/next month dates)
    // 3. Either we're showing tooltips or the date is in the selection range
    if (!renderContent || !isCurrentMonth) return null;
    
    // Compute event content if we need to display it
    if (showTooltips || isSelected || isInRange || isHovered) {
      return renderContent(date);
    }
    return null;
  }, [renderContent, date, isCurrentMonth, showTooltips, isSelected, isInRange, isHovered]);

  const getBackgroundColor = () => {
    // Only get background color for non-restricted dates
    if (layer.data?.background) {
      const renderer = LayerRenderer.createBackgroundRenderer(layer.data.background);
      const result = renderer(date);
      return result?.backgroundColor || 'transparent';
    }
    return 'transparent';
  };

  const cellContent = (
    <div
      className={!restrictionResult.allowed ? 'restricted-date-pattern' : ''}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={onMouseDown}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        cursor: !restrictionResult.allowed ? 'not-allowed' : 'pointer',
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // Only apply backgroundColor for non-restricted dates
        ...(!restrictionResult.allowed ? {} : {
          backgroundColor: (isSelected || isInRange) ? "#b1e4e5" : getBackgroundColor()
        }),
        borderRadius: isSingleDay && (isSelected || isInRange) ? "50%" : (
          isRangeStart || isRangeEnd ?
            `${isRangeStart ? "15px" : "0"} ${isRangeEnd ? "15px" : "0"} ${isRangeEnd ? "15px" : "0"} ${isRangeStart ? "15px" : "0"}`
            : "0"
        ),
        fontWeight: isSelected ? "600" : "normal",
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
        ...(isSingleDay && (isSelected || isInRange) ? {
          width: "36px",
          height: "36px",
          margin: "auto"
        } : {})
      }}
    >
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 3 // Ensure date number appears above pattern and below events
      }}>
        <span style={{
          position: 'relative',
          pointerEvents: 'none',
          fontSize: getFontSize(settings, 'base'),
        }}>
          {format(date, "d")}
        </span>
      </div>
      {eventContent?.element && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 10 // Higher z-index to ensure events display above the restricted pattern
        }}>
          {eventContent.element}
        </div>
      )}
    </div>
  );

  // Only show tooltips if showTooltips is true and we have tooltip content
  return (showTooltips && eventContent?.tooltipContent) ? (
    <Tooltip
      content={eventContent?.tooltipContent}
      show={isHovered}
    >
      {cellContent}
    </Tooltip>
  ) : cellContent;
};

const MonthPair = ({
  firstMonth,
  secondMonth,
  selectedRange,
  onSelectionStart,
  onSelectionMove,
  isSelecting,
  visibleMonths,
  showMonthHeadings,
  showTooltips,
  renderDay,
  layer,
  restrictionConfig,
  startWeekOnSunday,
  activeLayer,
  settings,
  months
}) => {
  // Use the months array directly if provided, otherwise calculate months
  const monthsToShow: Date[] = months || (() => {
    const result: Date[] = [];
    
    // Use secondMonth if provided, otherwise calculate months based on firstMonth
    if (secondMonth) {
      result.push(firstMonth);
      result.push(secondMonth);
    } else {
      for (let i = 0; i < visibleMonths && i < 6; i++) {
        result.push(addMonths(firstMonth, i));
      }
    }
    
    return result;
  })();

  return (
    <div style={{
      display: 'flex',
      width: '100%',
      gap: '1rem'
    }}>
      {monthsToShow.map((month, index) => (
        <MonthGrid
          key={month.toISOString()}
          baseDate={month}
          selectedRange={selectedRange}
          onSelectionStart={onSelectionStart}
          onSelectionMove={onSelectionMove}
          isSelecting={isSelecting}
          style={{ width: `${100 / visibleMonths}%` }}
          showMonthHeading={showMonthHeadings}
          showTooltips={showTooltips}
          renderDay={renderDay}
          layer={layer}
          activeLayer={activeLayer}
          restrictionConfig={restrictionConfig}
          startWeekOnSunday={startWeekOnSunday}
          settings={settings}
        />
      ))}
    </div>
  );
};

const LayerControl = ({ layers, activeLayer, onLayerChange }) => {
  return (
    <div className="cla-layer-control" style={{
    }}>
      {layers
        .filter(layer => layer.visible !== false)
        .map(layer => (
          <button
            key={layer.name}
            onClick={() => onLayerChange(layer.name)}
            className={`cla-layer-button ${activeLayer === layer.name ? 'active' : ''}`}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: '1px solid #dee2e6',
              backgroundColor: activeLayer === layer.name ? '#e7f3ff' : '#fff',
              color: activeLayer === layer.name ? '#0366d6' : '#666',
              cursor: 'pointer'
            }}
          >
            {layer.title}
          </button>
        ))}
    </div>
  );
};

const CalendarGrid: React.FC<CalendarGridProps & { settings?: CalendarSettings }> = ({
  months,
  selectedRange,
  onSelectionStart,
  onSelectionMove,
  isSelecting,
  visibleMonths,
  showMonthHeadings,
  showTooltips,
  layer,
  activeLayer,
  restrictionConfig,
  startWeekOnSunday,
  settings
}) => {
  // Only create renderers when needed and they contain actual data
  const renderers: Renderer[] = useMemo(() => {
    const results: Renderer[] = [];
    
    if (layer.data?.background) {
      results.push(LayerRenderer.createBackgroundRenderer(layer.data.background));
    }

    if (layer.data?.events && layer.data.events.length > 0) {
      results.push(LayerRenderer.createEventRenderer(
        layer.data.events.map(event => ({
          ...event,
          type: event.type as 'work' | 'other'
        }))
      ));
    }
    
    return results;
  }, [layer.data?.background, layer.data?.events]);

  const renderDay = useCallback((date: Date): RenderResult | null => {
    // Quick exit if no renderers - avoids unnecessary work
    if (renderers.length === 0) return null;

    const results = renderers
      .map(renderer => renderer(date))
      .filter((result): result is RenderResult => result !== null);

    if (results.length === 0) return null;

    return results.reduce((combined, result) => ({
      backgroundColor: result.backgroundColor || combined.backgroundColor,
      element: result.element ? (
        <div style={{ position: 'relative' }}>
          {combined.element}
          {result.element}
        </div>
      ) : combined.element,
      tooltipContent: result.tooltipContent ? (
        <div>
          {combined.tooltipContent}
          {result.tooltipContent}
        </div>
      ) : combined.tooltipContent
    }));
  }, [renderers]);

  return (
    <MonthPair
      firstMonth={months[0]}
      secondMonth={visibleMonths === 1 ? null : null}
      selectedRange={selectedRange}
      onSelectionStart={onSelectionStart}
      onSelectionMove={onSelectionMove}
      isSelecting={isSelecting}
      visibleMonths={visibleMonths}
      showMonthHeadings={showMonthHeadings}
      showTooltips={showTooltips}
      renderDay={renderDay}
      layer={layer}
      activeLayer={activeLayer}
      restrictionConfig={restrictionConfig}
      startWeekOnSunday={startWeekOnSunday}
      settings={settings}
      months={months}
    />
  );
};

interface CLACalendarProps {
  settings: CalendarSettings;
  onSettingsChange: (settings: CalendarSettings) => void;
  initialActiveLayer?: string;
  onSubmit?: (startDate: string, endDate: string) => void;
  layersFactory?: () => Layer[];
  restrictionConfigFactory?: () => RestrictionConfig;
}

export const CLACalendar: React.FC<CLACalendarProps> = ({
  settings,
  onSettingsChange,
  initialActiveLayer,
  onSubmit,
  layersFactory,
  restrictionConfigFactory
}) => {
  const colors = settings.colors || DEFAULT_COLORS;
  
  // Track whether calendar has ever been initialized (opened)
  const [everInitialized, setEverInitialized] = useState(settings.displayMode === 'embedded' || settings.isOpen);
  
  // Track if lazy data has been loaded
  const [lazyDataLoaded, setLazyDataLoaded] = useState(false);
  
  // Store lazy-loaded data
  const [lazyLayers, setLazyLayers] = useState<Layer[] | null>(null);
  const [lazyRestrictionConfig, setLazyRestrictionConfig] = useState<RestrictionConfig | null>(null);
  
  // Basic state needed for input field display
  const [isOpen, setIsOpen] = useState(settings.displayMode === 'embedded' || settings.isOpen);
  const [selectedRange, setSelectedRange] = useState<DateRange>({ start: null, end: null });
  const [displayRange, setDisplayRange] = useState<DateRange>({ start: null, end: null });
  
  // Reference handlers
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const calendarIdRef = useRef<string>(`calendar-${++calendarCounter}`);
  const coordinatorRef = useRef<ReturnType<typeof registerCalendar> | null>(null);
  
  // These states will only be initialized when calendar is first opened
  const [currentMonth, setCurrentMonth] = useState(() => 
    everInitialized ? startOfMonth(new Date()) : null
  );
  const [outOfBoundsDirection, setOutOfBoundsDirection] = useState<'prev' | 'next' | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, CalendarValidationError>>({});
  const [notification, setNotification] = useState<string | null>(null);
  const [dateInputContext, setDateInputContext] = useState({
    startDate: null,
    endDate: null,
    currentField: null
  });
  
  // Store mouse position in a ref to avoid re-renders
  const mousePositionRef = useRef({ x: 0, y: 0 });
  
  // Load lazy data when calendar is first opened
  useEffect(() => {
    if (everInitialized && !lazyDataLoaded) {
      // Load lazy layers if factory provided
      if (layersFactory) {
        const layers = layersFactory();
        setLazyLayers(layers);
        
        // Initialize the LayerManager immediately with the layers
        const tempLayerManager = new LayerManager(layers);
        setActiveLayers(tempLayerManager.getLayers());
      }
      
      // Load lazy restriction config if factory provided
      if (restrictionConfigFactory) {
        const config = restrictionConfigFactory();
        setLazyRestrictionConfig(config);
      }
      
      setLazyDataLoaded(true);
    }
  }, [everInitialized, lazyDataLoaded, layersFactory, restrictionConfigFactory]);
  
  // Get the effective layers to use - either from lazy loading or direct settings
  const effectiveLayers = useMemo(() => {
    if (layersFactory && lazyLayers) {
      return lazyLayers;
    }
    return settings.layers;
  }, [settings.layers, lazyLayers, layersFactory]);
  
  // Get the effective restriction config to use - either from lazy loading or direct settings
  const effectiveRestrictionConfig = useMemo(() => {
    if (restrictionConfigFactory && lazyRestrictionConfig) {
      return lazyRestrictionConfig;
    }
    return settings.restrictionConfig;
  }, [settings.restrictionConfig, lazyRestrictionConfig, restrictionConfigFactory]);
  
  // These expensive operations only happen when the calendar is first opened
  
  // Create LayerManager only when calendar is first opened and layers are available
  const layerManager = useMemo(() => {
    if (!everInitialized) return null;
    
    // Only create manager when we have layers (either direct or lazy-loaded)
    if (layersFactory && !lazyLayers) return null;
    
    return new LayerManager(effectiveLayers);
  }, [everInitialized, effectiveLayers, layersFactory, lazyLayers]);
  
  // Initialize the selection manager only when first opened and restriction config is available
  const selectionManager = useMemo(() => {
    if (!everInitialized) return null;
    
    // Only create manager when we have restriction config (either direct or lazy-loaded)
    if (restrictionConfigFactory && !lazyRestrictionConfig) return null;
    
    return new DateRangeSelectionManager(
      effectiveRestrictionConfig,
      settings.selectionMode,
      settings.showSelectionAlert
    );
  }, [everInitialized, effectiveRestrictionConfig, settings.selectionMode, settings.showSelectionAlert, restrictionConfigFactory, lazyRestrictionConfig]);
  
  // Generate restriction background data only when first opened and restriction config is available
  const restrictionBackgroundData = useMemo(() => {
    if (!everInitialized) return null;
    
    // Only generate data when we have restriction config (either direct or lazy-loaded)
    if (restrictionConfigFactory && !lazyRestrictionConfig) return null;
    
    return RestrictionBackgroundGenerator.generateBackgroundData(effectiveRestrictionConfig);
  }, [everInitialized, effectiveRestrictionConfig, restrictionConfigFactory, lazyRestrictionConfig]);
  
  // Use initialActiveLayer if provided, otherwise use settings.defaultLayer
  const [activeLayer, setActiveLayer] = useState(
    initialActiveLayer || settings.defaultLayer
  );
  
  // Initialize activeLayers only when first opened
  const [activeLayers, setActiveLayers] = useState<Layer[]>([]);
  
  // Update active layers when layerManager and initialization state changes
  useEffect(() => {
    if (layerManager && everInitialized) {
      setActiveLayers(layerManager.getLayers());
    }
  }, [layerManager, everInitialized]);
  
  // Update layers with restriction background - only when initialized
  useEffect(() => {
    if (!layerManager || !everInitialized) return;
    
    const updatedLayers = [...layerManager.getLayers()];
    const calendarLayer = updatedLayers.find(layer => layer.name === 'Calendar');
    
    if (calendarLayer) {
      const backgrounds = RestrictionBackgroundGenerator.generateBackgroundData(effectiveRestrictionConfig);
      layerManager.setBackgroundData('Calendar', backgrounds);
      setActiveLayers(layerManager.getLayers());
    }
  }, [everInitialized, effectiveRestrictionConfig, layerManager]);
  
  // Helpers and refs for month navigation
  const moveToMonthRef = useRef<((direction: 'prev' | 'next') => void) | null>(null);
  const debouncedMoveToMonthRef = useRef<ReturnType<typeof debounce> | null>(null);
  
  // Update moveToMonth function
  useEffect(() => {
    if (!everInitialized) return;
    
    debouncedMoveToMonthRef.current = debounce((direction) => {
      if (moveToMonthRef.current) {
        moveToMonthRef.current(direction);
      }
    }, 1000, { leading: true, trailing: false });
    
    return () => {
      if (debouncedMoveToMonthRef.current) {
        debouncedMoveToMonthRef.current.cancel();
      }
    };
  }, [everInitialized]);
  
  // Only calculate months when initialized
  const months = useMemo(() => {
    if (!everInitialized || !currentMonth) return [];
    
    const validVisibleMonths = Math.min(6, Math.max(1, settings.visibleMonths));
    const result: Date[] = [];
    for (let i = 0; i < validVisibleMonths; i++) {
      result.push(addMonths(currentMonth, i));
    }
    return result;
  }, [currentMonth, settings.visibleMonths, everInitialized]);
  
  // Only show tooltips when initialized
  const shouldShowTooltips = useMemo(() => {
    if (!everInitialized) return false;
    if (!settings.showTooltips) return false;
    if (settings.suppressTooltipsOnSelection && isSelecting) return false;
    return true;
  }, [everInitialized, settings.showTooltips, settings.suppressTooltipsOnSelection, isSelecting]);
  
  // Initialize during first open
  useEffect(() => {
    if (isOpen && !everInitialized) {
      setEverInitialized(true);
      // Initialize currentMonth when first opened
      setCurrentMonth(startOfMonth(new Date()));
    }
  }, [isOpen, everInitialized]);
  
  // Add a useEffect to update activeLayer when initialActiveLayer changes
  useEffect(() => {
    if (initialActiveLayer) {
      setActiveLayer(initialActiveLayer);
    }
  }, [initialActiveLayer]);
  
  // Effect for continuous month advancement - only when initialized
  useEffect(() => {
    if (!everInitialized || !settings.enableOutOfBoundsScroll) return () => {};
    
    const shouldAdvance = Boolean(isSelecting && outOfBoundsDirection && moveToMonthRef.current);
    if (!shouldAdvance) return () => {};
    
    const advanceMonth = () => {
      if (moveToMonthRef.current && outOfBoundsDirection) {
        moveToMonthRef.current(outOfBoundsDirection);
      }
    };
    
    // Initial delay then continuous advancement every second
    const initialAdvance = setTimeout(advanceMonth, 1000);
    const continuousAdvance = setInterval(advanceMonth, 1000);
    
    return () => {
      clearTimeout(initialAdvance);
      clearInterval(continuousAdvance);
    };
  }, [everInitialized, isSelecting, outOfBoundsDirection, settings.enableOutOfBoundsScroll]);
  
  // Only create mouse handlers when initialized
  const { handleMouseMove, handleMouseLeave } = useMemo(() => {
    if (!everInitialized) {
      return {
        handleMouseMove: () => {},
        handleMouseLeave: () => {}
      };
    }
    
    return DateRangePickerHandlers.createMouseHandlers(
      containerRef,
      isSelecting,
      setOutOfBoundsDirection,
      (position) => {
        mousePositionRef.current = position;
      }
    );
  }, [everInitialized, containerRef, isSelecting, setOutOfBoundsDirection]);
  
  // Only create document mouse handlers when initialized
  const { handleDocumentMouseMove, handleMouseUp, handleMouseDown } = useMemo(() => {
    if (!everInitialized) {
      return {
        handleDocumentMouseMove: () => {},
        handleMouseUp: () => {},
        handleMouseDown: () => {}
      };
    }
    
    return DateRangePickerHandlers.createDocumentMouseHandlers(
      containerRef,
      isSelecting,
      outOfBoundsDirection,
      setOutOfBoundsDirection,
      (position) => {
        mousePositionRef.current = position;
      },
      moveToMonthRef,
      setIsSelecting
    );
  }, [everInitialized, containerRef, isSelecting, outOfBoundsDirection, setOutOfBoundsDirection, moveToMonthRef, setIsSelecting]);
  
  // Only create date change handler when initialized
  const handleDateChange = useMemo(() => {
    if (!everInitialized) {
      // Return a function with the same signature as the real handler
      return (field: "end" | "start") => (date: Date, isClearingError?: boolean, validationError?: CalendarValidationError) => {};
    }
    
    return DateRangePickerHandlers.createDateChangeHandler(
      selectedRange,
      dateInputContext,
      setSelectedRange,
      setDateInputContext,
      setValidationErrors,
      setCurrentMonth,
      settings.visibleMonths,
      dateValidator
    );
  }, [everInitialized, selectedRange, dateInputContext, setSelectedRange, setDateInputContext, setValidationErrors, setCurrentMonth, settings.visibleMonths, dateValidator]);
  
  // Format display text doesn't need the whole calendar to be initialized
  const getDisplayText = useMemo(() =>
    DateRangePickerHandlers.createDisplayTextFormatter(
      displayRange,
      settings.selectionMode,
      settings.dateFormatter,
      settings.dateRangeSeparator
    ),
    [displayRange, settings.selectionMode, settings.dateFormatter, settings.dateRangeSeparator]
  );
  
  // Only create selection handlers when initialized
  const { handleSelectionStart, handleSelectionMove } = useMemo(() => {
    if (!everInitialized || !selectionManager) {
      return {
        handleSelectionStart: () => {},
        handleSelectionMove: () => {}
      };
    }
    
    return DateRangePickerHandlers.createSelectionHandlers(
      selectionManager,
      isSelecting,
      setIsSelecting,
      setSelectedRange,
      setNotification,
      settings.showSelectionAlert,
      selectedRange,
      outOfBoundsDirection
    );
  }, [everInitialized, selectionManager, isSelecting, setIsSelecting, setSelectedRange, setNotification, settings.showSelectionAlert, selectedRange, outOfBoundsDirection]);
  
  // Use the abstracted calendar action handlers
  const { handleClear, handleSubmit: originalHandleSubmit, handleClickOutside, handleLayerChange } = useMemo(() =>
    DateRangePickerHandlers.createCalendarActionHandlers(
      setSelectedRange,
      setDateInputContext,
      setIsSelecting,
      setValidationErrors,
      setCurrentMonth,
      setIsOpen,
      setActiveLayer,
      selectedRange,
      onSubmit,
      settings.closeOnClickAway
    ),
    [setSelectedRange, setDateInputContext, setIsSelecting, setValidationErrors, setCurrentMonth, setIsOpen, setActiveLayer, selectedRange, onSubmit, settings.closeOnClickAway]
  );
  
  // Wrap the original handleSubmit to update displayRange
  const handleSubmit = useCallback(() => {
    setDisplayRange(selectedRange);
    originalHandleSubmit();
  }, [selectedRange, originalHandleSubmit]);
  
  // Update handleClear to also clear displayRange
  const handleClearAll = useCallback(() => {
    handleClear();
    setDisplayRange({ start: null, end: null });
  }, [handleClear]);
  
  // Layer rendering function - only used when calendar is initialized
  const renderLayer = useCallback((layer: Layer) => {
    if (!everInitialized) return null;
    
    return (
      <CalendarGrid
        months={months}
        selectedRange={selectedRange}
        onSelectionStart={handleSelectionStart}
        onSelectionMove={handleSelectionMove}
        isSelecting={isSelecting}
        visibleMonths={settings.visibleMonths}
        showMonthHeadings={settings.showMonthHeadings}
        showTooltips={shouldShowTooltips}
        layer={layer}
        activeLayer={layer.name}
        restrictionConfig={effectiveRestrictionConfig}
        startWeekOnSunday={settings.startWeekOnSunday}
        settings={settings}
      />
    );
  }, [everInitialized, months, selectedRange, handleSelectionStart, handleSelectionMove, isSelecting, settings, shouldShowTooltips, effectiveRestrictionConfig]);
  
  // Register with the calendar coordinator 
  useEffect(() => {
    // Define the state change handler
    const handleStateChange = () => {
      // If another calendar is activated, close this one
      if (coordinatorRef.current && !coordinatorRef.current.isActive() && isOpen) {
        setIsOpen(false);
      }
    };
    
    // Register this calendar with the coordinator
    coordinatorRef.current = registerCalendar(calendarIdRef.current, handleStateChange);
    
    // Clean up on unmount
    return () => {
      coordinatorRef.current?.unregister();
    };
  }, []); // Empty dependency array - only run once on mount
  
  // Sync calendar open state with coordinator
  useEffect(() => {
    if (!coordinatorRef.current) return;
    
    if (isOpen && settings.displayMode === 'popup') {
      coordinatorRef.current.open();
    } else if (coordinatorRef.current.isActive() && !isOpen) {
      coordinatorRef.current.close();
    }
  }, [isOpen, settings.displayMode]);
  
  // Update isDateRestricted to handle both types - only needed when initialized
  const isDateRestricted = useCallback((date: Date): boolean => {
    if (!everInitialized || !selectionManager) return false;
    const result = selectionManager.canSelectDate(date);
    return !result.allowed;
  }, [everInitialized, selectionManager]);
  
  // Update the moveToMonth function - only needed when initialized
  const moveToMonth = useCallback((direction: 'prev' | 'next') => {
    if (!everInitialized || !currentMonth) return;
    
    // First move the month - this happens regardless of selection state
    setCurrentMonth(prev => {
      return direction === 'next'
        ? addMonths(prev, 1)
        : addMonths(prev, -1);
    });
    
    // Then handle selection logic only if we're in an out-of-bounds selection
    if (isSelecting && outOfBoundsDirection && selectionManager) {
      const start = selectedRange.start ? parseISO(selectedRange.start) : null;
      if (!start) return;
      
      // Calculate the month we just moved to
      const nextMonth = direction === 'next'
        ? addMonths(months[months.length - 1], 1)
        : addMonths(months[0], -1);
      
      const firstDayOfMonth = startOfMonth(nextMonth);
      const lastDayOfMonth = endOfMonth(nextMonth);
      
      // Determine the potential new end of the selection
      const potentialEnd = direction === 'next' ? lastDayOfMonth : firstDayOfMonth;
      
      // Use the selection manager to handle the update, which now properly checks boundaries
      const updateResult = selectionManager.updateSelection(
        selectedRange,
        potentialEnd
      );
      
      // Update the selection range with the result
      setSelectedRange(updateResult.range);
      
      // If there's a message or the update wasn't successful, we hit a restriction
      if (updateResult.message || !updateResult.success) {
        // End the selection and show message
        setIsSelecting(false);
        setOutOfBoundsDirection(null);
        
        // Only show notification during out-of-bounds scrolling
        if (settings.showSelectionAlert && outOfBoundsDirection) {
          setNotification(updateResult.message);
        }
        
        document.removeEventListener("mousemove", handleDocumentMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      }
    }
  }, [everInitialized, months, selectionManager, settings.showSelectionAlert, isSelecting, outOfBoundsDirection, selectedRange, handleDocumentMouseMove, handleMouseUp, currentMonth]);
  
  // Update moveToMonthRef when moveToMonth changes
  useEffect(() => {
    moveToMonthRef.current = moveToMonth;
  }, [moveToMonth]);
  
  // Update click outside handler to use the new handler
  useEffect(() => {
    if (!settings.closeOnClickAway || settings.displayMode === 'embedded' || !isOpen) return;
    
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        handleClickOutside();
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [settings.closeOnClickAway, settings.displayMode, isOpen, handleClickOutside]);
  
  // Handle input click to open calendar and initialize if needed
  const handleInputClick = () => {
    // Always open the calendar when input is clicked
    setIsOpen(true);
    
    // Ensure the calendar is initialized when first opened
    if (!everInitialized) {
      setEverInitialized(true);
      setCurrentMonth(startOfMonth(new Date()));
      
      // Force immediate loading of lazy data
      if (layersFactory && !lazyLayers) {
        const layers = layersFactory();
        setLazyLayers(layers);
        
        // Initialize activeLayers right away
        const tempLayerManager = new LayerManager(layers);
        setActiveLayers(tempLayerManager.getLayers());
        
        // Make sure we have a valid activeLayer
        if (layers.length > 0) {
          const validLayer = layers.find(l => l.name === activeLayer) || layers[0];
          setActiveLayer(validLayer.name);
        }
      }
    }
    
    // Force the coordinator to register this calendar as active
    if (coordinatorRef.current) {
      coordinatorRef.current.open();
    }
  };
  
  // Effect to handle clicks outside the portal for the direct portal implementation
  useEffect(() => {
    if (!isOpen || settings.displayMode === 'embedded' || !settings.closeOnClickAway) return;
    
    const handleOutsideClick = (event: MouseEvent) => {
      // Don't close if clicking on the input field
      if (inputRef.current && inputRef.current.contains(event.target as Node)) {
        return;
      }
      
      // Don't close if clicking inside the calendar container
      if (containerRef.current && containerRef.current.contains(event.target as Node)) {
        return;
      }
      
      // Close the calendar
      setIsOpen(false);
    };
    
    // Add the event listener with a slight delay to prevent immediate closing
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleOutsideClick);
    }, 100);
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, settings.closeOnClickAway, settings.displayMode]);
  
  // Simple effect to hide calendar on scroll
  useEffect(() => {
    if (!isOpen || settings.displayMode === 'embedded') return;
    
    const handleScroll = () => {
      setIsOpen(false);
    };
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen, settings.displayMode]);
  
  // Helper function to render the calendar content
  const renderCalendarContent = () => {
    if (!everInitialized) return null;
    
    // Make sure we have layers before attempting to render
    // This is crucial to prevent empty rendering
    if ((layersFactory && !lazyLayers) || !activeLayers || activeLayers.length === 0) {
      return <div>Loading calendar data...</div>;
    }
    
    // Make sure we have at least one active layer that matches activeLayer
    const hasValidActiveLayer = activeLayers.some(layer => layer.name === activeLayer);
    if (!hasValidActiveLayer) {
      // If the activeLayer isn't valid, use the first available layer
      if (activeLayers.length > 0) {
        setActiveLayer(activeLayers[0].name);
      }
      return <div>Initializing calendar view...</div>;
    }
    
    return (
      <>
        {settings.showHeader && (
          <>
            <div className="cla-date-inputs-wrapper" style={{
              width: '100%',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              margin: 0,
              padding: 0,
            }}>
              <DateInputSection
                selectedRange={selectedRange}
                handleDateChange={handleDateChange}
                dateInputContext={dateInputContext}
                selectionMode={settings.selectionMode}
              />
            </div>
            
            <CalendarHeader
              months={months}
              visibleMonths={settings.visibleMonths}
              moveToMonth={moveToMonth}
              timezone={settings.timezone}
            />
          </>
        )}
        
        {settings.showLayersNavigation && (
          <LayerControl
            layers={activeLayers}
            activeLayer={activeLayer}
            onLayerChange={handleLayerChange}
          />
        )}
        
        <div className="cla-card-body" style={{ padding: '16px' }}>
          <div style={{ display: 'flex' }}>
            {activeLayers.map(layer =>
              layer.name === activeLayer && (
                <div key={layer.name} style={{ width: '100%' }}>
                  {renderLayer(layer)}
                </div>
              )
            )}
          </div>
        </div>
        
        {settings.showFooter && (
          <CalendarFooter
            showSubmitButton={settings.showSubmitButton}
            handleClear={handleClearAll}
            handleSubmit={handleSubmit}
          />
        )}
        
        {settings.enableOutOfBoundsScroll && (
          <SideChevronIndicator
            outOfBoundsDirection={outOfBoundsDirection}
            isSelecting={isSelecting}
          />
        )}
        
        {settings.showSelectionAlert && notification && (
          <Notification
            message={notification}
            onDismiss={() => setNotification(null)}
          />
        )}
      </>
    );
  };
  
  // Render either directly or in a portal based on display mode
  return (
    <div 
      className="cla-calendar-wrapper"
      data-open={isOpen ? "true" : "false"}
    >
      {settings.inputStyle && (
        <style>
          {`
          #${calendarIdRef.current}-input {
            ${Object.entries(settings.inputStyle).map(([key, value]) => 
              `${key}: ${value} !important;`
            ).join('\n            ')}
          }
          `}
        </style>
      )}
      <input
        ref={inputRef}
        id={`${calendarIdRef.current}-input`}
        type="text"
        className={`cla-form-control cla-input-custom`}
        readOnly
        value={getDisplayText()}
        onClick={handleInputClick}
      />
      
      {/* Only render the calendar when it's open */}
      {isOpen && (
        settings.displayMode === 'embedded' ? (
          // For embedded mode, render directly
          <CalendarContainer
            isOpen={isOpen}
            displayMode={settings.displayMode}
            containerRef={containerRef}
            containerStyle={settings.containerStyle}
            visibleMonths={settings.visibleMonths}
            singleMonthWidth={settings.singleMonthWidth}
            enableOutOfBoundsScroll={settings.enableOutOfBoundsScroll}
            handleMouseDown={handleMouseDown}
            handleMouseMove={handleMouseMove}
            handleMouseLeave={handleMouseLeave}
          >
            {renderCalendarContent()}
          </CalendarContainer>
        ) : (
          // For popup mode, use a direct portal
          ReactDOM.createPortal(
            <div 
              className="cla-calendar-portal"
              style={{
                position: 'fixed',
                zIndex: 2147483647,
                top: inputRef.current ? inputRef.current.getBoundingClientRect().bottom + 8 + 'px' : '0px',
                left: inputRef.current ? inputRef.current.getBoundingClientRect().left + 'px' : '0px',
                width: `${settings.visibleMonths * settings.singleMonthWidth + ((settings.visibleMonths - 1) * 16)}px` // Include gap between months
              }}
              onClick={(e) => e.stopPropagation()} // Prevent click from closing immediately
            >
              <div 
                ref={containerRef}
                className="cla-card"
                style={{
                  width: `${settings.visibleMonths * settings.singleMonthWidth + ((settings.visibleMonths - 1) * 16)}px`, // Include gap between months
                  ...DEFAULT_CONTAINER_STYLES,
                  ...settings.containerStyle
                }}
                onMouseDown={settings.enableOutOfBoundsScroll ? handleMouseDown : undefined}
                onMouseMove={settings.enableOutOfBoundsScroll ? handleMouseMove : undefined}
                onMouseLeave={settings.enableOutOfBoundsScroll ? handleMouseLeave : undefined}
              >
                {renderCalendarContent()}
              </div>
            </div>,
            document.body
          )
        )
      )}
    </div>
  );
};

export default CLACalendar;