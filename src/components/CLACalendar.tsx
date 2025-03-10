import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import debounce from "lodash-es/debounce";
import { parse, isValid } from "date-fns"; // Keep only what we haven't implemented yet
import {
  format,
  addMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  parseISO,
  startOfWeek,
  endOfWeek,
  addDays,
  isWithinInterval
} from "../utils/DateUtils"; // Use our UTC-aware functions
import './DateRangePicker.css';
import {
  DEFAULT_LAYERS,
  CalendarSettings,
  Layer,
  DEFAULT_COLORS
} from './DateRangePicker.config';
import { LayerRenderer } from './DateRangePickerNew/layers/LayerRenderer';
import { RestrictionManager } from './DateRangePickerNew/restrictions/RestrictionManager';
import { Notification } from './DateRangePickerNew/Notification';
import { LayerManager } from './DateRangePickerNew/layers/LayerManager';
import { RestrictionBackgroundGenerator } from './DateRangePickerNew/restrictions/RestrictionBackgroundGenerator';
import { DateRangeSelectionManager, DateRange } from './DateRangePickerNew/selection/DateRangeSelectionManager';
import { DateRangePickerHandlers, DateInputContext, MousePosition } from './DateRangePickerNew/handlers/DateRangePickerHandlers';
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
    console.log('Input:', input);

    // Quick test for dot notation attempt
    if (!/\d\./.test(input)) {
      console.log('Not dot notation');
      return null;
    }

    // Parse the components
    const match = input.match(/(\d?\d)\.(\d?\d)\.(\d?\d?\d\d)/);
    console.log('Regex match:', match);

    if (!match) {
      console.log('No match found');
      return null;
    }

    const [_, month, day, year] = match;
    console.log('Parsed components:', { month, day, year });

    const fullYear = year.length === 2 ? `20${year}` : year;
    console.log('Full year:', fullYear);

    // Create and validate date
    const date = new Date(fullYear, parseInt(month) - 1, parseInt(day));
    console.log('Created date:', date);
    console.log('Month check:', date.getMonth(), parseInt(month) - 1);

    const isValid = date.getMonth() === parseInt(month) - 1;
    console.log('Is valid?', isValid);

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
const MonthGrid: React.FC<MonthGridProps> = ({
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
  activeLayer
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

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const restrictionManager = useMemo(() =>
    new RestrictionManager(restrictionConfig ?? { restrictions: [] }),
    [restrictionConfig]
  );

  const weekDays = useMemo(() => {
    const days = startWeekOnSunday
      ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days;
  }, [startWeekOnSunday]);

  const handleGridMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setMousePosition({
      x: e.clientX + 10,
      y: e.clientY + 10
    });
  };

  const handleGridMouseLeave = () => {
    setHoveredDate(null);
  };

  return (
    <div style={{
      width: '100%',
      padding: '0 8px',
      marginTop: 0,  // Ensure no top margin
      ...style
    }}>
      {showMonthHeading && (
        <div style={{
          fontSize: '1rem',
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
              fontSize: "0.8rem",
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
          rowGap: '4px',
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
                onSelectionMove(date);
                setHoveredDate(date);
              }}
              showTooltips={showTooltips}
              renderContent={renderDay}
              layer={layer}
              restrictionConfig={restrictionConfig}
              activeLayer={activeLayer}
            />
          ))
        )}

        {[...Array(emptyWeeks * 7)].map((_, i) => (
          <div key={`empty-${i}`} style={{ backgroundColor: "white" }} />
        ))}
      </div>

      {/* Tooltip at grid level */}
      {hoveredDate && restrictionConfig?.restrictions && document.hasFocus() && (
        (() => {
          // First check standard restriction result
          const result = restrictionManager.checkSelection(hoveredDate, hoveredDate);
          
          // If standard restriction shows message, display it
          if (!result.allowed && result.message) {
            return (
              <div
                style={{
                  position: 'fixed',
                  left: mousePosition.x,
                  top: mousePosition.y,
                  backgroundColor: 'rgba(220, 53, 69, 0.9)',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  fontSize: '13px',
                  pointerEvents: 'none',
                  zIndex: 1000,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  maxWidth: '250px',
                  whiteSpace: 'pre-line'
                }}
              >
                {result.message}
              </div>
            );
          }
          
          // Check specifically for restricted boundary type
          const boundaryRestriction = restrictionConfig.restrictions.find(r => 
            r.type === 'restricted_boundary' && r.enabled
          );
          
          if (boundaryRestriction && selectedRange.start) {
            const selectionStart = parseISO(selectedRange.start);
            
            // Safe cast the boundary restriction to the correct type
            const boundaryWithRanges = boundaryRestriction as any;
            if (boundaryWithRanges.ranges) {
              for (const range of boundaryWithRanges.ranges) {
                const rangeStart = parseISO(range.start);
                const rangeEnd = parseISO(range.end);
                
                if (!isValid(rangeStart) || !isValid(rangeEnd)) continue;
                
                // If selection started within this boundary
                if (isWithinInterval(selectionStart, { start: rangeStart, end: rangeEnd })) {
                  // If hovered date is outside boundary, show tooltip with message
                  if (!isWithinInterval(hoveredDate, { start: rangeStart, end: rangeEnd })) {
                    return (
                      <div
                        style={{
                          position: 'fixed',
                          left: mousePosition.x,
                          top: mousePosition.y,
                          backgroundColor: 'rgba(220, 53, 69, 0.9)',
                          color: 'white',
                          padding: '8px 12px',
                          borderRadius: '4px',
                          fontSize: '13px',
                          pointerEvents: 'none',
                          zIndex: 1000,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                          maxWidth: '250px',
                          whiteSpace: 'pre-line'
                        }}
                      >
                        {range.message || 'Selection must stay within the boundary'}
                      </div>
                    );
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
  activeLayer
}) => {
  const { isSelected, isInRange, isRangeStart, isRangeEnd } = useMemo(() => {
    if (!selectedRange.start) {
      return { isSelected: false, isInRange: false, isRangeStart: false, isRangeEnd: false };
    }

    const startDate = parseISO(selectedRange.start);
    const endDate = selectedRange.end ? parseISO(selectedRange.end) : null;
    
    // Get the anchor date if available
    const anchorDate = selectedRange.anchorDate ? parseISO(selectedRange.anchorDate) : startDate;
    
    // Determine if this is a backward selection (where end date is the anchor)
    const isBackwardSelection = endDate && anchorDate && 
      isSameDay(anchorDate, endDate) && !isSameDay(anchorDate, startDate);

    // For determining if a date is in the range, always use chronological ordering
    const [chronologicalStart, chronologicalEnd] = endDate && startDate > endDate
      ? [endDate, startDate]
      : [startDate, endDate];

    // For visual styling (determining which corners to round), use selection direction
    // In a forward selection, the start date gets the left rounded corners
    // In a backward selection, the start date gets the right rounded corners
    const isAnchor = anchorDate && isSameDay(date, anchorDate);
    
    return {
      isSelected: isSameDay(date, startDate) || (endDate && isSameDay(date, endDate)),
      isInRange: chronologicalEnd
        ? (date >= chronologicalStart && date <= chronologicalEnd)
        : false,
      // For start/end determination (which determines the rounded corners):
      // In forward selection: anchor is start, moving end is end
      // In backward selection: moving start is start, anchor is end
      isRangeStart: isBackwardSelection ? isSameDay(date, startDate) : isAnchor,
      isRangeEnd: isBackwardSelection ? isAnchor : (endDate && isSameDay(date, endDate))
    };
  }, [date, selectedRange]);

  const [isHovered, setIsHovered] = useState(false);

  const restrictionManager = useMemo(() =>
    new RestrictionManager(restrictionConfig ?? { restrictions: [] }),
    [restrictionConfig]
  );

  const restrictionResult = useMemo(() => {
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
        const boundaryWithRanges = restriction as any;
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
        const boundaryWithRanges = restriction as any;
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

  const handleMouseEnter = (e) => {
    setIsHovered(true);
    onMouseEnter?.(e);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const isSingleDay = useMemo(() => {
    if (!selectedRange.start) return false;
    if (!selectedRange.end) return true;
    return isSameDay(parseISO(selectedRange.start), parseISO(selectedRange.end));
  }, [selectedRange.start, selectedRange.end]);

  if (!isCurrentMonth) {
    return <div style={{ width: "100%", height: "100%", position: "relative", backgroundColor: "white" }} />;
  }

  const eventContent = renderContent?.(date);

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
          pointerEvents: 'none'
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
  activeLayer
}) => {
  // Add explicit type for monthsToShow
  const monthsToShow: Date[] = [];
  
  // Use secondMonth if provided, otherwise calculate months based on firstMonth
  if (secondMonth) {
    monthsToShow.push(firstMonth);
    monthsToShow.push(secondMonth);
  } else {
    for (let i = 0; i < visibleMonths && i < 6; i++) {
      monthsToShow.push(addMonths(firstMonth, i));
    }
  }

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

const CalendarGrid: React.FC<CalendarGridProps> = ({
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
  startWeekOnSunday
}) => {
  const renderers: Renderer[] = [];

  if (layer.data?.background) {
    renderers.push(LayerRenderer.createBackgroundRenderer(layer.data.background));
  }

  if (layer.data?.events) {
    renderers.push(LayerRenderer.createEventRenderer(
      layer.data.events.map(event => ({
        ...event,
        type: event.type as 'work' | 'other'
      }))
    ));
  }

  const renderDay = (date: Date): RenderResult | null => {
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
  };

  return (
    <MonthPair
      firstMonth={months[0]}
      secondMonth={visibleMonths === 1 ? null : months[1]}
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
    />
  );
};

interface CLACalendarProps {
  settings: CalendarSettings;
  onSettingsChange: (settings: CalendarSettings) => void;
  initialActiveLayer?: string;
  onSubmit?: (startDate: string, endDate: string) => void;
}

export const CLACalendar: React.FC<CLACalendarProps> = ({
  settings,
  onSettingsChange,
  initialActiveLayer,
  onSubmit
}) => {
  console.log('Calendar Settings:', settings);
  console.log('Restriction Config:', settings.restrictionConfig);
  const colors = settings.colors || DEFAULT_COLORS;
  
  // Use colors throughout the component
  // This ensures we always have colors, falling back to defaults if none provided

  const [isOpen, setIsOpen] = useState(settings.displayMode === 'embedded' || settings.isOpen);
  const [selectedRange, setSelectedRange] = useState<DateRange>({ start: null, end: null });
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [isSelecting, setIsSelecting] = useState(false);
  const [outOfBoundsDirection, setOutOfBoundsDirection] = useState<'prev' | 'next' | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 }); // TODO probably not needed
  const [dateInputContext, setDateInputContext] = useState({
    startDate: null,
    endDate: null,
    currentField: null
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, CalendarValidationError>>({});

  // Create layerManager before using it
  const layerManager = useMemo(() =>
    new LayerManager(settings.layers),
    [settings.layers]
  );

  // Use initialActiveLayer if provided, otherwise use settings.defaultLayer
  const [activeLayer, setActiveLayer] = useState(
    initialActiveLayer || settings.defaultLayer
  );

  // Add a useEffect to update activeLayer when initialActiveLayer changes
  useEffect(() => {
    if (initialActiveLayer) {
      setActiveLayer(initialActiveLayer);
    }
  }, [initialActiveLayer]);

  // Now we can use layerManager
  const [activeLayers, setActiveLayers] = useState<Layer[]>(
    layerManager.getLayers()
  );

  const [notification, setNotification] = useState<string | null>(null);

  const selectionManager = useMemo(() =>
    new DateRangeSelectionManager(
      settings.restrictionConfig,
      settings.selectionMode,
      settings.showSelectionAlert
    ),
    [settings.restrictionConfig, settings.selectionMode, settings.showSelectionAlert]
  );

  const restrictionBackgroundData = useMemo(() =>
    RestrictionBackgroundGenerator.generateBackgroundData(settings.restrictionConfig),
    [settings.restrictionConfig]
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const moveToMonthRef = useRef<((direction: 'prev' | 'next') => void) | null>(null);
  const debouncedMoveToMonthRef = useRef<ReturnType<typeof debounce> | null>(null);

  // Calculate if tooltips should be shown based on selection state and settings
  const shouldShowTooltips = useMemo(() => {
    if (!settings.showTooltips) return false;
    if (settings.suppressTooltipsOnSelection && isSelecting) return false;
    return true;
  }, [settings.showTooltips, settings.suppressTooltipsOnSelection, isSelecting]);

  // Add this effect to update activeLayers when initialLayers changes
  useEffect(() => {
    setActiveLayers(layerManager.getLayers());
    // Ensure we have a valid active layer
    if (!activeLayer || !settings.layers.find(l => l.name === activeLayer)) {
      const defaultLayerExists = settings.layers.find(l => l.name === settings.defaultLayer);
      const firstLayer = settings.layers[0];
      setActiveLayer(defaultLayerExists ? settings.defaultLayer : firstLayer?.name);
    }
  }, [settings.layers, settings.defaultLayer, activeLayer]);

  // In the months memo, update the result array type
  const months = useMemo(() => {
    const validVisibleMonths = Math.min(6, Math.max(1, settings.visibleMonths));
    const result: Date[] = [];
    for (let i = 0; i < validVisibleMonths; i++) {
      result.push(addMonths(currentMonth, i));
    }
    return result;
  }, [currentMonth, settings.visibleMonths]);

  // Keep debounced month change for out-of-bounds scrolling
  useEffect(() => {
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
  }, []);

  // Add back the continuous month advancement effect with enableOutOfBoundsScroll check
  useEffect(() => {
    if (!settings.enableOutOfBoundsScroll) return () => { };

    const shouldAdvance = Boolean(isSelecting && outOfBoundsDirection && moveToMonthRef.current);
    if (!shouldAdvance) return () => { };

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
  }, [isSelecting, outOfBoundsDirection, settings.enableOutOfBoundsScroll]);

  // Use the abstracted handlers
  const { handleMouseMove, handleMouseLeave } = useMemo(() =>
    DateRangePickerHandlers.createMouseHandlers(
      containerRef,
      isSelecting,
      setOutOfBoundsDirection,
      setMousePosition
    ),
    [containerRef, isSelecting, setOutOfBoundsDirection, setMousePosition]
  );

  const { handleDocumentMouseMove, handleMouseUp, handleMouseDown } = useMemo(() =>
    DateRangePickerHandlers.createDocumentMouseHandlers(
      containerRef,
      isSelecting,
      outOfBoundsDirection,
      setOutOfBoundsDirection,
      setMousePosition,
      moveToMonthRef,
      setIsSelecting
    ),
    [containerRef, isSelecting, outOfBoundsDirection, setOutOfBoundsDirection, setMousePosition, moveToMonthRef, setIsSelecting]
  );

  const handleDateChange = useMemo(() =>
    DateRangePickerHandlers.createDateChangeHandler(
      selectedRange,
      dateInputContext,
      setSelectedRange,
      setDateInputContext,
      setValidationErrors,
      setCurrentMonth,
      settings.visibleMonths,
      dateValidator
    ),
    [selectedRange, dateInputContext, setSelectedRange, setDateInputContext, setValidationErrors, setCurrentMonth, settings.visibleMonths, dateValidator]
  );

  const getDisplayText = useMemo(() =>
    DateRangePickerHandlers.createDisplayTextFormatter(
      selectedRange,
      settings.selectionMode
    ),
    [selectedRange, settings.selectionMode]
  );

  // Use the abstracted selection handlers with all required parameters
  const { handleSelectionStart, handleSelectionMove } = useMemo(() =>
    DateRangePickerHandlers.createSelectionHandlers(
      selectionManager,
      isSelecting,
      setIsSelecting,
      setSelectedRange,
      setNotification,
      settings.showSelectionAlert,
      selectedRange,
      outOfBoundsDirection
    ),
    [selectionManager, isSelecting, setIsSelecting, setSelectedRange, setNotification, settings.showSelectionAlert, selectedRange, outOfBoundsDirection]
  );

  // Use the abstracted calendar action handlers
  const { handleClear, handleSubmit, handleLayerChange } = useMemo(() =>
    DateRangePickerHandlers.createCalendarActionHandlers(
      setSelectedRange,
      setDateInputContext,
      setIsSelecting,
      setValidationErrors,
      setCurrentMonth,
      setIsOpen,
      setActiveLayer
    ),
    [setSelectedRange, setDateInputContext, setIsSelecting, setValidationErrors, setCurrentMonth, setIsOpen, setActiveLayer]
  );

  const renderLayer = (layer: Layer) => {
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
        restrictionConfig={settings.restrictionConfig}
        startWeekOnSunday={settings.startWeekOnSunday}
      />
    );
  };

  // Update layers with restriction background
  useEffect(() => {
    const updatedLayers = [...layerManager.getLayers()];
    const calendarLayer = updatedLayers.find(layer => layer.name === 'Calendar');

    if (calendarLayer) {
      const backgrounds = RestrictionBackgroundGenerator.generateBackgroundData(settings.restrictionConfig);
      console.log('Restriction Config:', settings.restrictionConfig);
      console.log('Generated Backgrounds:', backgrounds);
      
      layerManager.setBackgroundData('Calendar', backgrounds);
      console.log('Updated Layer:', layerManager.getLayer('Calendar'));
      setActiveLayers(layerManager.getLayers());
    }
  }, [settings.restrictionConfig, layerManager]);

  // Update isDateRestricted to handle both types
  const isDateRestricted = useCallback((date: Date): boolean => {
    const result = selectionManager.canSelectDate(date);
    return !result.allowed;
  }, [selectionManager]);

  // Update the moveToMonth function to only show notifications during out-of-bounds scrolling
  const moveToMonth = useCallback((direction: 'prev' | 'next') => {
    // First move the month - this happens regardless of selection state
    setCurrentMonth(prev => {
      return direction === 'next'
        ? addMonths(prev, 1)
        : addMonths(prev, -1);
    });

    // Then handle selection logic only if we're in an out-of-bounds selection
    if (isSelecting && outOfBoundsDirection) {
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
  }, [months, selectionManager, settings.showSelectionAlert, isSelecting, outOfBoundsDirection, selectedRange, handleDocumentMouseMove, handleMouseUp]);

  // After the existing moveToMonth function is defined (around line 1480), add:
  useEffect(() => {
    // Set the ref to the current moveToMonth function
    moveToMonthRef.current = moveToMonth;
  }, [moveToMonth]);

  // Add this effect to handle clicks outside the calendar
  useEffect(() => {
    if (!settings.closeOnClickAway || settings.displayMode === 'embedded' || !isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [settings.closeOnClickAway, settings.displayMode, isOpen]);

  // Add a useEffect to call onSubmit when selectedRange changes and isOpen becomes false
  useEffect(() => {
    // If the calendar was just closed (isSubmitted) and we have a valid range
    if (!isOpen && selectedRange.start && selectedRange.end && onSubmit) {
      // Just pass the dates from the range to the callback
      onSubmit(
        selectedRange.start,
        selectedRange.end
      );
    }
  }, [isOpen, selectedRange, onSubmit]);

  return (
    <div className="cla-calendar" style={{ width: 'fit-content' }}>
      {settings.displayMode === 'popup' && (
        <input
          type="text"
          value={getDisplayText()}
          onClick={() => setIsOpen(true)}
          className="cla-form-control"
          readOnly
          style={{
            width: '300px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            ...(settings.inputStyle || {})
          }}
        />
      )}

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
        {settings.showHeader && (
          <>
            <DateInputSection
              selectedRange={selectedRange}
              handleDateChange={handleDateChange}
              dateInputContext={dateInputContext}
              selectionMode={settings.selectionMode}
            />

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
            handleClear={handleClear}
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
      </CalendarContainer>
    </div>
  );
};

export default CLACalendar;