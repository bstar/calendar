import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import debounce from "lodash-es/debounce";
import {
  format,
  parse,
  addMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  parseISO,
  getISOWeek,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isValid
} from "date-fns";
import './DateRangePicker.css';
import PropTypes from "prop-types";
import { DEFAULT_CONTAINER_STYLES, DEFAULT_LAYERS } from './DateRangePicker.config';

// Custom components
const Card = React.forwardRef(({ children, className, ...props }, ref) => (
  <div ref={ref} className={`cla-card ${className || ''}`} {...props}>
    {children}
  </div>
));

Card.Header = ({ children, className, ...props }) => (
  <div className={`cla-card-header ${className || ''}`} {...props}>
    {children}
  </div>
);

Card.Body = ({ children, className, ...props }) => (
  <div className={`cla-card-body ${className || ''}`} {...props}>
    {children}
  </div>
);

Card.Footer = ({ children, className, ...props }) => (
  <div className={`cla-card-footer ${className || ''}`} {...props}>
    {children}
  </div>
);

const Button = ({ variant, children, className, ...props }) => (
  <button 
    className={`cla-button cla-button-${variant} ${className || ''}`} 
    {...props}
  >
    {children}
  </button>
);

const Input = ({ className, ...props }) => (
  <input
    className={`cla-input ${className || ''}`}
    {...props}
  />
);

const ChevronLeft = ({ size = 16 }) => (
  <span 
    className="cla-chevron cla-chevron-left" 
    style={{ width: size, height: size }}
  />
);

const ChevronRight = ({ size = 16 }) => (
  <span 
    className="cla-chevron cla-chevron-right" 
    style={{ width: size, height: size }}
  />
);

const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      // If click is on the ref element or inside it, do nothing
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }

      // Also ignore clicks on the floating indicator
      const isFloatingIndicator = event.target.closest('.floating-indicator');
      if (isFloatingIndicator) {
        return;
      }

      handler(event);
    };

    // Use mousedown instead of click to handle the event earlier in the cycle
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

  const rules = {
    isValidFormat: (value) => {
      if (!value) return { isValid: true, error: null };
      try {
        parse(value, DATE_FORMAT, new Date());
        return { isValid: true, error: null };
      } catch {
        return {
          isValid: false,
          error: {
            message: `Please use format: January 15, 2024`,
            type: 'error',
            field: 'format'
          }
        };
      }
    },

    isValidDate: (value) => {
      if (!value) return { isValid: true, error: null };
      try {
        const date = parse(value, DATE_FORMAT, new Date());
        return isValid(date)
          ? { isValid: true, error: null }
          : {
            isValid: false,
            error: {
              message: 'Invalid date',
              type: 'error',
              field: 'date'
            }
          };
      } catch {
        return {
          isValid: false,
          error: {
            message: 'Invalid date',
            type: 'error',
            field: 'date'
          }
        };
      }
    },

    isValidRange: (start, end) => {
      if (!start || !end) return { isValid: true, error: null };

      try {
        const startDate = parse(start, DATE_FORMAT, new Date());
        const endDate = parse(end, DATE_FORMAT, new Date());

        return startDate > endDate
          ? {
            isValid: false,
            error: {
              message: 'Start date must be before end date',
              type: 'error',
              field: 'range'
            }
          }
          : { isValid: true, error: null };
      } catch {
        return {
          isValid: false,
          error: {
            message: 'Invalid date range',
            type: 'error',
            field: 'range'
          }
        };
      }
    }
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

const DateInput = ({ value, onChange, field, placeholder, context, selectedRange }) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showIndicator, setShowIndicator] = useState(null);
  const previousInputRef = useRef('');

  useEffect(() => {
    if (!isEditing && value) {
      const formattedValue = dateValidator.formatValue(value);
      setInputValue(formattedValue);
      previousInputRef.current = formattedValue;
    } else if (!isEditing && !value) {
      setInputValue('');
      previousInputRef.current = '';
    }
  }, [value, isEditing]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsEditing(true);

    if (error) {
      setError(null);
      setShowError(false);
      onChange(null, true);
    }
  };

  const validateAndUpdate = () => {
    console.log('Validating input:', inputValue);

    if (inputValue === previousInputRef.current) {
      console.log('No change in input');
      return;
    }

    previousInputRef.current = inputValue;

    // Handle empty input
    if (!inputValue.trim()) {
      console.log('Empty input');
      onChange(null);
      setError(null);
      setShowError(false);
      if (value) {
        setShowIndicator('error');
        setTimeout(() => setShowIndicator(null), 1500);
      }
      return;
    }

    // Try to parse the input value using our flexible parser
    console.log('Attempting to parse:', inputValue);
    const parsedDate = dateValidator.parseValue(inputValue);
    console.log('Parse result:', parsedDate);

    if (!parsedDate) {
      console.log('Parse failed, showing error');
      showValidationError({
        message: `Please use format: MM/DD/YY or ${dateValidator.DATE_FORMAT}`,
        type: 'error',
        field: 'format'
      });
      return;
    }

    // Range validation
    if (field === 'start' && selectedRange?.end) {
      const endDate = parseISO(selectedRange.end);
      if (parsedDate > endDate) {
        showValidationError({
          message: 'Start date must be before end date',
          type: 'error',
          field: 'range'
        });
        return;
      }
    } else if (field === 'end' && selectedRange?.start) {
      const startDate = parseISO(selectedRange.start);
      if (parsedDate < startDate) {
        showValidationError({
          message: 'End date must be after start date',
          type: 'error',
          field: 'range'
        });
        return;
      }
    }

    // Only show success for valid new values
    const isNewValue = !value || !isSameDay(parsedDate, value);
    if (isNewValue) {
      setShowIndicator('success');
      setTimeout(() => setShowIndicator(null), 1500);
    }

    onChange(parsedDate);
    setError(null);
    setShowError(false);
  };

  const showValidationError = (error) => {
    setError(error);
    setShowError(true);
    setShowIndicator('error');
    onChange(null, false, error);

    setTimeout(() => {
      setShowError(false);
      setError(null);
      setShowIndicator(null);
    }, 1500);
  };

  return (
    <div
      style={{
        position: 'relative',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        onBlur={() => {
          setIsEditing(false);
          validateAndUpdate();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setIsEditing(false);
            validateAndUpdate();
          }
        }}
        placeholder={placeholder}
        autoComplete="off"
        style={{
          width: '100%',
          padding: '8px 12px',
          borderRadius: '4px',
          backgroundColor: 'white',
          color: '#000',
          transition: 'border-color 0.15s ease',
          cursor: 'text',
          userSelect: 'text',
          WebkitUserSelect: 'text',
          MozUserSelect: 'text',
          border: '1px solid #979797',
          textAlign: 'center',
        }}
      />
      {showIndicator && (
        <div
          style={{
            position: 'absolute',
            right: '8px',
            top: '8px',
            color: showIndicator === 'success' ? '#28a745' : '#dc3545',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {showIndicator === 'success' ? '✓' : '×'}
        </div>
      )}
      <div
        style={{
          height: error && showError ? '24px' : '0',
          marginTop: error && showError ? '4px' : '0',
          fontSize: '0.875rem',
          color: '#dc3545',
          overflow: 'hidden',
          transition: 'height 0.2s ease-in-out, margin-top 0.2s ease-in-out',
        }}
      >
        {error?.message}
      </div>
    </div>
  );
};

// Update the MonthGrid component
const MonthGrid = ({
  baseDate,
  selectedRange,
  onSelectionStart,
  onSelectionMove,
  isSelecting,
  style,
  showMonthHeading = false,
  showTooltips,
  renderDay
}) => {
  const monthStart = startOfMonth(baseDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const weeks = calendarDays.reduce((acc, day, index) => {
    const weekIndex = Math.floor(index / 7);
    return {
      ...acc,
      [weekIndex]: [...(acc[weekIndex] || []), day]
    };
  }, {});

  // Always maintain 6 rows of space regardless of actual weeks in month
  const totalWeeks = 6;
  const currentWeeks = Object.keys(weeks).length;
  const emptyWeeks = totalWeeks - currentWeeks;

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
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(day => (
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
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gridAutoRows: '36px',
        rowGap: '4px',
        columnGap: 0,
        paddingLeft: '2px'  // Match month heading alignment
      }}>
        {Object.values(weeks).flatMap(week =>
          week.map(date => (
            <DayCell
              key={date.toISOString()}
              date={date}
              selectedRange={selectedRange}
              isCurrentMonth={isSameMonth(date, baseDate)}
              onMouseDown={() => onSelectionStart?.(date)}
              onMouseEnter={() => onSelectionMove?.(date)}
              showTooltips={showTooltips}
              renderContent={renderDay}
            />
          ))
        )}
        
        {[...Array(emptyWeeks * 7)].map((_, i) => (
          <div key={`empty-${i}`} style={{ backgroundColor: "white" }} />
        ))}
      </div>
    </div>
  );
};

// Update the Tooltip component to remove console logs
const Tooltip = ({ content, show, children }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const tooltipRef = useRef(null);
  const targetRef = useRef(null);

  useEffect(() => {
    if (show && isHovered && targetRef.current && tooltipRef.current) {
      const targetRect = targetRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      const newPosition = {
        top: targetRect.top - tooltipRect.height - 8,
        left: targetRect.left + (targetRect.width - tooltipRect.width) / 2
      };

      setPosition(newPosition);
    }
  }, [show, isHovered, content]);

  return (
    <div 
      ref={targetRef} 
      style={{ position: 'relative', width: '100%', height: '100%' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      {show && isHovered && (
        <div
          ref={tooltipRef}
          style={{
            position: 'fixed',
            top: position.top,
            left: position.left,
            backgroundColor: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
            borderRadius: '4px',
            zIndex: 9999,
            fontSize: '14px',
            maxWidth: '300px',
            padding: '8px',
            pointerEvents: 'none',
            border: '1px solid rgba(0,0,0,0.2)'
          }}
        >
          {content}
        </div>
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
  renderContent
}) => {
  const { isSelected, isInRange, isRangeStart, isRangeEnd } = useMemo(() => {
    if (!selectedRange.start) {
      return { isSelected: false, isInRange: false, isRangeStart: false, isRangeEnd: false };
    }

    const startDate = parseISO(selectedRange.start);
    const endDate = selectedRange.end ? parseISO(selectedRange.end) : null;

    const [chronologicalStart, chronologicalEnd] = endDate && startDate > endDate
      ? [endDate, startDate]
      : [startDate, endDate];

    return {
      isSelected: isSameDay(date, startDate) || (endDate && isSameDay(date, endDate)),
      isInRange: chronologicalEnd
        ? (date >= chronologicalStart && date <= chronologicalEnd)
        : false,
      isRangeStart: chronologicalEnd ? isSameDay(date, chronologicalStart) : false,
      isRangeEnd: chronologicalEnd ? isSameDay(date, chronologicalEnd) : false
    };
  }, [date, selectedRange.start, selectedRange.end]);

  const [isHovered, setIsHovered] = useState(false);

  // Update single day check to handle both cases
  const isSingleDay = useMemo(() => {
    if (!selectedRange.start) return false;
    if (!selectedRange.end) return true;
    return isSameDay(parseISO(selectedRange.start), parseISO(selectedRange.end));
  }, [selectedRange.start, selectedRange.end]);

  const handleMouseEnter = (e) => {
    const content = renderContent?.(date);
    setIsHovered(true);
    onMouseEnter?.(e);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  if (!isCurrentMonth) {
    return <div style={{ width: "100%", height: "100%", position: "relative", backgroundColor: "white" }} />;
  }

  const eventContent = renderContent?.(date);
  
  const dayCell = (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={onMouseDown}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: (isSelected || isInRange) ? "#b1e4e5" : "transparent",
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
        pointerEvents: 'none'
      }}>
        <span style={{ 
          position: 'relative', 
          zIndex: 1,
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
          pointerEvents: 'none'
        }}>
          {eventContent.element}
        </div>
      )}
    </div>
  );

  return showTooltips ? (
    <Tooltip 
      content={eventContent?.tooltipContent}
      show={isHovered && showTooltips && eventContent?.tooltipContent}
    >
      {dayCell}
    </Tooltip>
  ) : dayCell;
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
  renderDay
}) => {
  // Create array of months to display
  const monthsToShow = [];
  for (let i = 0; i < visibleMonths && i < 6; i++) {
    monthsToShow.push(addMonths(firstMonth, i));
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
        />
      ))}
    </div>
  );
};

const SideChevronIndicator = ({ outOfBoundsDirection, isSelecting }) => {
  if (!outOfBoundsDirection || !isSelecting) return null;

  const isPrev = outOfBoundsDirection === 'prev';
  
  return (
    <div
      className="side-chevron-indicator"
      style={{
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        [isPrev ? 'left' : 'right']: "-24px",
        backgroundColor: '#fff',
        color: "#000",
        padding: "12px 6px",
        height: "60px",
        borderRadius: isPrev ? "20px 0 0 20px" : "0 20px 20px 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        zIndex: 1100,
        transition: "all 0.2s ease",
        opacity: 0.95,
        border: '1px solid var(--border-color)',
        cursor: "pointer",
        '&:hover': {
          opacity: 1,
          backgroundColor: 'var(--bg-hover)'
        }
      }}
    >
      {isPrev ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
    </div>
  );
};

const LayerControl = ({ layers, activeLayer, onLayerChange }) => {
  return (
    <div className="cla-layer-control" style={{
      padding: '12px 16px',
      borderTop: '1px solid #dee2e6',
      display: 'flex',
      gap: '8px'
    }}>
      {layers
        .filter(layer => layer.visible !== false) // Only show visible layers
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

const EventsLayer = ({
  months,
  selectedRange,
  onSelectionStart,
  onSelectionMove,
  isSelecting,
  visibleMonths,
  showMonthHeadings,
  showTooltips,
  data = []
}) => {
  // Use useMemo to memoize the renderDay function based on data changes
  const renderDay = useMemo(() => (date) => {
    const dayEvents = data.filter(event => {
      const eventDate = parseISO(event.date);
      return isSameDay(eventDate, date);
    });
    
    if (dayEvents.length === 0) return null;

    const mainEvent = dayEvents[0];
    
    return {
      element: (
        <div 
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: mainEvent.type === 'work' 
              ? 'rgba(3, 102, 214, 0.2)' 
              : 'rgba(40, 167, 69, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}
        >
          {dayEvents.length > 1 && (
            <span style={{ 
              fontSize: '12px', 
              fontWeight: 'bold',
              color: mainEvent.type === 'work' ? '#0366d6' : '#28a745',
              lineHeight: 1,
              pointerEvents: 'none'
            }}>
              {dayEvents.length}
            </span>
          )}
        </div>
      ),
      tooltipContent: (
        <div style={{ 
          padding: '8px',
          backgroundColor: 'white',
          borderRadius: '4px'
        }}>
          {dayEvents.map((event, index) => (
            <div key={index} style={{ 
              marginBottom: index < dayEvents.length - 1 ? '8px' : 0,
              whiteSpace: 'nowrap'
            }}>
              <div style={{ 
                fontWeight: 'bold',
                color: event.type === 'work' ? '#0366d6' : '#28a745'
              }}>
                {event.title}
              </div>
              <div style={{ fontSize: '0.9em', color: '#666' }}>{event.time}</div>
              <div style={{ fontSize: '0.9em' }}>{event.description}</div>
            </div>
          ))}
        </div>
      )
    };
  }, [data]); // Dependency on data ensures renderDay updates when data changes

  return (
    <div style={{ width: '100%' }}>
      <MonthPair
        key={JSON.stringify(data)} // Force re-render when data changes
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
      />
    </div>
  );
};

const BaseLayer = ({
  months,
  selectedRange,
  onSelectionStart,
  onSelectionMove,
  isSelecting,
  visibleMonths,
  showMonthHeadings,
  showTooltips,
  data = []
}) => {
  // Use useMemo to memoize the renderDay function based on data changes
  const renderDay = useMemo(() => (date) => {
    const dayData = data.filter(item => {
      const itemDate = parseISO(item.date);
      return isSameDay(itemDate, date);
    });
    
    if (dayData.length === 0) return null;

    const mainItem = dayData[0];
    
    return {
      element: (
        <div 
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}
        >
          {dayData.length > 1 && (
            <span style={{ 
              fontSize: '12px', 
              fontWeight: 'bold',
              color: '#666',
              lineHeight: 1,
              pointerEvents: 'none'
            }}>
              {dayData.length}
            </span>
          )}
        </div>
      ),
      tooltipContent: (
        <div style={{ 
          padding: '8px',
          backgroundColor: 'white',
          borderRadius: '4px'
        }}>
          {dayData.map((item, index) => (
            <div key={index} style={{ 
              marginBottom: index < dayData.length - 1 ? '8px' : 0,
              whiteSpace: 'nowrap'
            }}>
              <div style={{ fontWeight: 'bold' }}>{item.title}</div>
              <div style={{ fontSize: '0.9em', color: '#666' }}>{item.time}</div>
              <div style={{ fontSize: '0.9em' }}>{item.description}</div>
            </div>
          ))}
        </div>
      )
    };
  }, [data]);

  return (
    <MonthPair
      key={JSON.stringify(data)} // Force re-render when data changes
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
    />
  );
};

const DateRangePickerNew = ({ 
  displayMode = 'popup',
  containerStyle = null,
  isOpen: initialIsOpen = false,
  visibleMonths = 2,
  showMonthHeadings = false,
  selectionMode = 'range',
  showTooltips = true,
  showHeader = true,
  closeOnClickAway = true,
  showSubmitButton = false,
  showFooter = true,
  singleMonthWidth = 500,
  enableOutOfBoundsScroll = true,
  suppressTooltipsOnSelection = false,
  layers: initialLayers = DEFAULT_LAYERS
}) => {
  const [isOpen, setIsOpen] = useState(displayMode === 'embedded' || initialIsOpen);
  const [selectedRange, setSelectedRange] = useState({ start: null, end: null });
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date(2025, 1, 1)));
  const [isSelecting, setIsSelecting] = useState(false);
  const [initialDate, setInitialDate] = useState(null);
  const [outOfBoundsDirection, setOutOfBoundsDirection] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [dateInputContext, setDateInputContext] = useState({
    startDate: null,
    endDate: null,
    currentField: null
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [activeLayers, setActiveLayers] = useState(initialLayers);
  const [activeLayer, setActiveLayer] = useState(() => {
    // Find default layer or fall back to first visible layer
    const defaultLayer = initialLayers.find(l => l.isDefault) 
      || initialLayers.find(l => l.visible !== false);
    return defaultLayer?.name || 'Calendar';
  });
  const [forceShowTooltips, setForceShowTooltips] = useState(true);

  const containerRef = useRef(null);
  const moveToMonthRef = useRef(null);
  const debouncedMoveToMonthRef = useRef(null);

  // Add logging when initialLayers prop changes
  useEffect(() => {
    console.log('=== DateRangePickerNew Layers ===');
    console.log('initialLayers:', initialLayers);
  }, [initialLayers]);

  // Add logging when activeLayers state changes
  useEffect(() => {
    console.log('=== Active Layers Updated ===');
    console.log('activeLayers:', activeLayers);
  }, [activeLayers]);

  // Add this effect to update activeLayers when initialLayers changes
  useEffect(() => {
    setActiveLayers(initialLayers);
  }, [initialLayers]);

  // Update active layer when layers change
  useEffect(() => {
    const defaultLayer = initialLayers.find(l => l.isDefault) 
      || initialLayers.find(l => l.visible !== false);
    setActiveLayer(defaultLayer?.name || 'Calendar');
  }, [initialLayers]);

  // Simplified month generation
  const months = useMemo(() => {
    const validVisibleMonths = Math.min(6, Math.max(1, visibleMonths));
    const result = [];
    for (let i = 0; i < validVisibleMonths; i++) {
      result.push(addMonths(currentMonth, i));
    }
    return result;
  }, [currentMonth, visibleMonths]);

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
    if (!enableOutOfBoundsScroll) return () => {};

    const shouldAdvance = isSelecting && outOfBoundsDirection && moveToMonthRef.current;
    if (!shouldAdvance) return () => {};

    const advanceMonth = () => {
      if (shouldAdvance) {
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
  }, [isSelecting, outOfBoundsDirection, enableOutOfBoundsScroll]);

  // Simple month navigation
  const moveToMonth = useCallback((direction) => {
    setCurrentMonth(prev => addMonths(prev, direction === 'next' ? 1 : -1));
  }, []);

  // Set the ref for out-of-bounds scrolling
  moveToMonthRef.current = moveToMonth;

  const handleClickOutside = useCallback(() => {
    if (isOpen && closeOnClickAway) {
      setIsOpen(false);
      setIsSelecting(false);
      setInitialDate(null);
    }
  }, [isOpen, closeOnClickAway]);

  useClickOutside(containerRef, handleClickOutside);

  const handleDateChange = (field) => (date, isClearingError, validationError) => {
    if (isClearingError) {
      setValidationErrors(prev =>
        Object.entries(prev)
          .filter(([key]) => key !== field)
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
      );
      return;
    }

    if (validationError) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: validationError
      }));
      return;
    }

    const newState = {
      range: { ...selectedRange, [field]: date?.toISOString() || null },
      context: {
        ...dateInputContext,
        [`${field}Date`]: date ? dateValidator.formatValue(date) : null
      }
    };

    setSelectedRange(newState.range);
    setDateInputContext(newState.context);
    setValidationErrors({});

    // Only update calendar position if we have a valid date
    if (date) {
      const validVisibleMonths = Math.min(6, Math.max(1, visibleMonths));
      
      if (field === 'start') {
        // For start date, we want it in the leftmost month
        // If we want March to show on the left, and we're showing 3 months,
        // we need March to be our currentMonth (since we show currentMonth to currentMonth + 2)
        const newBaseMonth = startOfMonth(date);
        setCurrentMonth(newBaseMonth);
      } else {
        // For end date, we want it in the rightmost month
        // If we want April to show on the right, and we're showing 3 months,
        // we need February to be our currentMonth (since we show currentMonth + 2)
        const newBaseMonth = addMonths(startOfMonth(date), -(validVisibleMonths - 1));
        setCurrentMonth(newBaseMonth);
      }
    }
  };

  const handleSelectionStart = useCallback(date => {
    setIsSelecting(true);
    setInitialDate(date);
    
    if (selectionMode === 'single') {
      // For single mode, set both start and end to the same date
      setSelectedRange({
        start: date.toISOString(),
        end: date.toISOString()
      });
      setIsSelecting(false);  // End selection immediately
    } else {
      // For range mode, start the selection
      setSelectedRange({
        start: date.toISOString(),
        end: null
      });
    }
  }, [selectionMode]);

  const handleSelectionMove = useCallback(date => {
    // Only handle range selection
    if (selectionMode === 'single' || !isSelecting || !initialDate) return;

    const [start, end] = date < initialDate
      ? [date, initialDate]
      : [initialDate, date];

    setSelectedRange({
      start: start.toISOString(),
      end: end.toISOString()
    });
  }, [isSelecting, initialDate, selectionMode]);

  const handleMouseMove = useCallback((e) => {
    e.preventDefault();
    if (!isSelecting || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const { clientX: mouseX, clientY: mouseY } = e;
    const BOUNDARY_THRESHOLD = 20;

    setMousePosition({ x: mouseX, y: mouseY });

    // Check both boundaries with equal thresholds
    const newDirection = mouseX < containerRect.left + BOUNDARY_THRESHOLD ? 'prev'
      : mouseX > containerRect.right - BOUNDARY_THRESHOLD ? 'next'
        : null;

    if (newDirection !== outOfBoundsDirection) {
      setOutOfBoundsDirection(newDirection);
      // Only start the month changes after a delay when first entering the boundary
      if (newDirection && !outOfBoundsDirection) {
        setTimeout(() => {
          moveToMonthRef.current(newDirection);
        }, 1000);
      }
    }
  }, [isSelecting, outOfBoundsDirection]);

  const handleMouseUp = useCallback(() => {
    setIsSelecting(false);
    if (suppressTooltipsOnSelection) {
      setForceShowTooltips(true);  // Only re-enable tooltips if suppression was enabled
    }
    console.log('ending selection');
    setOutOfBoundsDirection(null);
    setInitialDate(null);

    const styles = ['userSelect', 'webkitUserSelect', 'mozUserSelect', 'msUserSelect'];
    styles.forEach(style => document.body.style[style] = '');

    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove, suppressTooltipsOnSelection]);

  const handleMouseDown = useCallback(e => {
    if (isSelecting) return;
    e.preventDefault();

    const setUserSelectNone = () => {
      const styles = ['userSelect', 'webkitUserSelect', 'mozUserSelect', 'msUserSelect'];
      styles.forEach(style => document.body.style[style] = 'none');
    };

    setIsSelecting(true);
    if (suppressTooltipsOnSelection) {
      setForceShowTooltips(false);  // Only disable tooltips if suppression is enabled
    }
    console.log('starting selection');
    setUserSelectNone();

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [isSelecting, handleMouseMove, handleMouseUp, suppressTooltipsOnSelection]);

  const handleClear = useCallback(() => {
    // Reset range and context
    setSelectedRange({ start: null, end: null });
    setDateInputContext({ startDate: null, endDate: null, currentField: null });

    // Reset selection states
    setIsSelecting(false);
    setInitialDate(null);

    // Reset validation
    setValidationErrors({});

    // Reset to current month view
    const currentDate = startOfMonth(new Date());
    setCurrentMonth(currentDate);
  }, []);

  const handleSubmit = useCallback(() => {
    setIsOpen(false);
    setIsSelecting(false);
    setInitialDate(null);
  }, []);

  const getDisplayText = useCallback(() => {
    const { start, end } = selectedRange;
    if (!start) return "Select date";
    
    if (selectionMode === 'single') {
      return format(parseISO(start), "MMM dd, yyyy");
    }
    
    return !end
      ? format(parseISO(start), "MMM dd, yyyy")
      : `${format(parseISO(start), "MMM dd, yyyy")} - ${format(parseISO(end), "MMM dd, yyyy")}`;
  }, [selectedRange, selectionMode]);

  // Fix the props reference in settings
  const settings = {
    displayMode,
    visibleMonths,
    showMonthHeadings,
    selectionMode,
    showTooltips,
    showHeader,
    closeOnClickAway,
    showSubmitButton,
    showFooter,
    singleMonthWidth,
    enableOutOfBoundsScroll
  };

  const handleMouseLeave = useCallback((e) => {
    const containerRect = containerRef.current.getBoundingClientRect();
    const { clientX: mouseX } = e;

    if (mouseX < containerRect.left) {
      setOutOfBoundsDirection('prev');
    } else if (mouseX > containerRect.right) {
      setOutOfBoundsDirection('next');
    }
  }, []);

  const handleLayerChange = (layerId) => {
    setActiveLayer(layerId);
  };

  // Add back the tooltipProps
  const tooltipProps = {
    showTooltips: showTooltips || forceShowTooltips
  };

  const renderLayer = (layer) => {
    console.log('=== Rendering Layer ===');
    console.log('Layer:', layer.name);
    console.log('Layer data:', layer.data);
    
    switch (layer.type) {
      case 'base':
        return (
          <BaseLayer
            months={months}
            selectedRange={selectedRange}
            onSelectionStart={handleSelectionStart}
            onSelectionMove={handleSelectionMove}
            isSelecting={isSelecting}
            visibleMonths={visibleMonths}
            showMonthHeadings={showMonthHeadings}
            showTooltips={tooltipProps.showTooltips}
            data={layer.data}
          />
        );
      case 'overlay':
        return (
          <EventsLayer
            months={months}
            selectedRange={selectedRange}
            onSelectionStart={handleSelectionStart}
            onSelectionMove={handleSelectionMove}
            isSelecting={isSelecting}
            visibleMonths={visibleMonths}
            showMonthHeadings={showMonthHeadings}
            showTooltips={tooltipProps.showTooltips}
            data={layer.data}
          />
        );
      default:
        console.warn(`Unknown layer type: ${layer.type}`);
        return null;
    }
  };

  return (
    <div className="cla-calendar" style={{ width: 'fit-content' }}>
      {displayMode === 'popup' && (
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
            textOverflow: 'ellipsis'
          }}
        />
      )}

      {(isOpen || displayMode === 'embedded') && (
        <div 
          ref={containerRef}
          className={`cla-card ${displayMode === 'popup' ? 'cla-card-popup' : ''}`}
          style={{
            width: visibleMonths === 1 ? `${singleMonthWidth}px` : `${400 * Math.min(6, Math.max(1, visibleMonths))}px`,
            position: displayMode === 'popup' ? 'relative' : 'static',
            padding: 0,
            ...DEFAULT_CONTAINER_STYLES,
            ...containerStyle
          }}
          {...(settings.enableOutOfBoundsScroll ? {
            onMouseDown: handleMouseDown,
            onMouseMove: handleMouseMove,
            onMouseLeave: handleMouseLeave
          } : {})}
        >
          {showHeader && (
            <>
              <div className="cla-input-container" style={{ padding: '16px' }}>
                <div className="cla-input-wrapper">
                  <DateInput
                    value={selectedRange.start ? parseISO(selectedRange.start) : null}
                    onChange={handleDateChange('start')}
                    field="start"
                    placeholder={selectionMode === 'single' ? "Select date" : "Start date"}
                    context={dateInputContext}
                    selectedRange={selectedRange}
                  />
                </div>
                {selectionMode === 'range' && (
                  <div className="cla-input-wrapper">
                    <DateInput
                      value={selectedRange.end ? parseISO(selectedRange.end) : null}
                      onChange={handleDateChange('end')}
                      field="end"
                      placeholder="End date"
                      context={dateInputContext}
                      selectedRange={selectedRange}
                    />
                  </div>
                )}
              </div>

              <div className="cla-header" style={{ padding: '12px 16px' }}>
                <button className="cla-button-nav" onClick={() => moveToMonth('prev')}>
                  <ChevronLeft size={16} />
                </button>
                <span className="cla-header-title">
                  {visibleMonths === 1 
                    ? format(months[0], "MMMM yyyy")
                    : `${format(months[0], "MMMM yyyy")} - ${format(months[months.length - 1], "MMMM yyyy")}`
                  }
                </span>
                <button className="cla-button-nav" onClick={() => moveToMonth('next')}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </>
          )}

          <LayerControl
            layers={activeLayers}
            activeLayer={activeLayer}
            onLayerChange={handleLayerChange}
          />

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

          {showFooter && (
            <div className="cla-card-footer" style={{ padding: '16px' }}>
              <Button
                variant="primary"
                onClick={handleClear}
              >
                Clear
              </Button>
              {showSubmitButton && (
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  style={{ marginLeft: '8px' }}
                >
                  Submit
                </Button>
              )}
            </div>
          )}

          {enableOutOfBoundsScroll && (
            <SideChevronIndicator
              outOfBoundsDirection={outOfBoundsDirection}
              isSelecting={isSelecting}
            />
          )}
        </div>
      )}
    </div>
  );
};

DateRangePickerNew.propTypes = {
  displayMode: PropTypes.string,
  containerStyle: PropTypes.object,
  isOpen: PropTypes.bool,
  visibleMonths: PropTypes.number,
  showMonthHeadings: PropTypes.bool,
  selectionMode: PropTypes.string,
  showTooltips: PropTypes.bool,
  showHeader: PropTypes.bool,
  closeOnClickAway: PropTypes.bool,
  showSubmitButton: PropTypes.bool,
  showFooter: PropTypes.bool,
  singleMonthWidth: PropTypes.number,
  enableOutOfBoundsScroll: PropTypes.bool,
  suppressTooltipsOnSelection: PropTypes.bool,
  layers: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    required: PropTypes.bool,
    data: PropTypes.array
  }))
};

export default DateRangePickerNew;