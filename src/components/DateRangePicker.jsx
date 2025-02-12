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
          border: `1px solid ${error ? '#dc3545' : '#dee2e6'}`,
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
  showMonthHeading = false
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
              onMouseDown={() => onSelectionStart(date)}
              onMouseEnter={() => onSelectionMove(date)}
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

// Add custom Tooltip component
const Tooltip = ({ children, content, show }) => {
  if (!show) return children;
  
  return (
    <div style={{ position: 'relative' }}>
      {children}
      <div
        className="cla-tooltip"
        style={{
          position: 'absolute',
          top: '-30px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          whiteSpace: 'nowrap',
          zIndex: 1100,
        }}
      >
        {content}
      </div>
    </div>
  );
};

// Update DayCell to handle circular selection without gaps
const DayCell = ({
  date,
  selectedRange,
  isCurrentMonth,
  onMouseDown,
  onMouseEnter,
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

  const [showTooltip, setShowTooltip] = useState(false);

  // Update single day check to handle both cases
  const isSingleDay = useMemo(() => {
    if (!selectedRange.start) return false;
    if (!selectedRange.end) return true;
    return isSameDay(parseISO(selectedRange.start), parseISO(selectedRange.end));
  }, [selectedRange.start, selectedRange.end]);

  if (!isCurrentMonth) {
    return <div style={{ width: "100%", height: "100%", position: "relative", backgroundColor: "white" }} />;
  }

  return (
    <Tooltip content={format(date, "MMMM d, yyyy")} show={showTooltip}>
      <div
        onMouseEnter={(e) => {
          setShowTooltip(true);
          onMouseEnter?.(e);
        }}
        onMouseLeave={() => setShowTooltip(false)}
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
        {format(date, "d")}
      </div>
    </Tooltip>
  );
};

const MonthPair = ({
  firstMonth,
  secondMonth,
  selectedRange,
  onSelectionStart,
  onSelectionMove,
  isSelecting,
  visibleMonths,
  showMonthHeadings
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
        />
      ))}
    </div>
  );
};

const FloatingIndicator = ({ outOfBoundsDirection, isSelecting, mousePosition }) => {
  if (!outOfBoundsDirection || !isSelecting) return null;

  const isPrev = outOfBoundsDirection === 'prev';

  return (
    <div
      className="floating-indicator"
      style={{
        position: "fixed",
        left: `${mousePosition.x + (isPrev ? -100 : 20)}px`,
        top: `${mousePosition.y - 20}px`,
        backgroundColor: 'rgba(226, 228, 238, 0.5)',
        color: "#000",
        padding: "8px 12px",
        borderRadius: "4px",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        zIndex: 1100,
        fontSize: "14px",
        transition: "opacity 0.2s ease",
        opacity: 1,
        pointerEvents: "none",
        border: '1px solid #979797',
      }}
    >
      {isPrev ? (
        <>
          <ChevronLeft size={16} />
          <span>Previous Month</span>
        </>
      ) : (
        <>
          <ChevronRight size={16} />
          <span>Next Month</span>
        </>
      )}
    </div>
  );
};

const DateRangePicker = ({ 
  visibleMonths = 2,
  showMonthHeadings = false,
  selectionMode = 'range'  // Add new prop: 'single' | 'range'
}) => {
  // Clamp visibleMonths between 1 and 6
  const validVisibleMonths = Math.min(6, Math.max(1, visibleMonths));

  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState({
    start: null,
    end: null,
  });
  const [initialDate, setInitialDate] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isOutsideBounds, setIsOutsideBounds] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [dateInputContext, setDateInputContext] = useState({
    startDate: null,
    endDate: null
  });
  const [months, setMonths] = useState(() => {
    const initial = startOfMonth(new Date());
    return [
      addMonths(initial, -2),
      addMonths(initial, -1),
      initial,
      addMonths(initial, 1),
      addMonths(initial, 2)
    ];
  });

  const containerRef = useRef(null);
  const debouncedMoveToMonthRef = useRef(null);
  const moveToMonthRef = useRef(null);

  const [outOfBoundsDirection, setOutOfBoundsDirection] = useState(null); // 'prev', 'next', or null

  // Add buffer state
  const [buffer, setBuffer] = useState(null);

  const handleClickOutside = useCallback(() => {
    if (isOpen) {
      setIsOpen(false);
      setIsSelecting(false);
      setIsOutsideBounds(false);
      setInitialDate(null);
    }
  }, [isOpen]);

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

    // Update months to maintain the correct sequence
    if (date) {
      const baseMonth = startOfMonth(date);
      setMonths([
        addMonths(baseMonth, -2),
        addMonths(baseMonth, -1),
        baseMonth,
        addMonths(baseMonth, 1),
        addMonths(baseMonth, 2)
      ]);
    }
  };

  const moveToMonth = useCallback((direction) => {
    setMonths(prev => direction === 'next'
      ? [
          prev[1],
          prev[2],
          prev[3],
          prev[4],
          addMonths(prev[4], 1)
        ]
      : [
          addMonths(prev[0], -1),
          prev[0],
          prev[1],
          prev[2],
          prev[3]
        ]
    );
    setCurrentMonth(prev => addMonths(prev, direction === 'next' ? 1 : -1));
  }, []);

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

  useEffect(() => {
    const shouldAdvance = isSelecting && outOfBoundsDirection && moveToMonthRef.current;
    if (!shouldAdvance) return () => {};

    const advanceMonth = () => {
      if (shouldAdvance) {
        moveToMonthRef.current(outOfBoundsDirection);
      }
    };

    const initialAdvance = setTimeout(advanceMonth, 1000);
    const continuousAdvance = setInterval(advanceMonth, 1000);

    return () => {
      clearTimeout(initialAdvance);
      clearInterval(continuousAdvance);
    };
  }, [isSelecting, outOfBoundsDirection]);

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
    const BOUNDARY_THRESHOLD = 1;

    setMousePosition({ x: mouseX, y: mouseY });

    // Check both boundaries and maintain direction
    const newDirection = mouseX < containerRect.left + BOUNDARY_THRESHOLD ? 'prev'
      : mouseX > containerRect.right - BOUNDARY_THRESHOLD ? 'next'
        : null;

    if (newDirection !== outOfBoundsDirection) {
      setOutOfBoundsDirection(newDirection);
      if (newDirection) {
        moveToMonthRef.current(newDirection);
      }
    }
  }, [isSelecting, outOfBoundsDirection]);

  const handleMouseUp = useCallback(() => {
    setIsSelecting(false);
    setOutOfBoundsDirection(null);
    setInitialDate(null);

    const resetUserSelect = () => {
      const styles = ['userSelect', 'webkitUserSelect', 'mozUserSelect', 'msUserSelect'];
      styles.forEach(style => document.body.style[style] = '');
    };

    resetUserSelect();

    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  const handleMouseDown = useCallback(e => {
    if (isSelecting) return;
    e.preventDefault();

    const setUserSelectNone = () => {
      const styles = ['userSelect', 'webkitUserSelect', 'mozUserSelect', 'msUserSelect'];
      styles.forEach(style => document.body.style[style] = 'none');
    };

    setIsSelecting(true);
    setUserSelectNone();

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [isSelecting, handleMouseMove, handleMouseUp]);

  const handleClear = useCallback(() => {
    // Reset range and context
    setSelectedRange({ start: null, end: null });
    setDateInputContext({ startDate: null, endDate: null });

    // Reset selection states
    setIsSelecting(false);
    setInitialDate(null);
    setIsOutsideBounds(false);

    // Reset validation
    setValidationErrors({});

    // Reset to current month view
    const currentDate = startOfMonth(new Date());
    setMonths([
      addMonths(currentDate, -2),
      addMonths(currentDate, -1),
      currentDate,
      addMonths(currentDate, 1),
      addMonths(currentDate, 2)
    ]);
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

  // Fix the moveToMonth reference
  moveToMonthRef.current = moveToMonth;

  return (
    <div
      className="cla-container"
      onMouseDown={handleMouseDown}
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
      }}
    >
      <Input
        type="text"
        value={getDisplayText()}
        onClick={() => setIsOpen(true)}
        style={{
          width: "300px",
          cursor: "pointer",
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}
      />

      {isOpen && (
        <>
          <Card
            ref={containerRef}
            className="cla-card-popup"
            style={{
              zIndex: 1000,
              width: `${(validVisibleMonths === 1 ? 400 : 400) * validVisibleMonths}px`,
              userSelect: "none",
              WebkitUserSelect: "none",
              MozUserSelect: "none",
              msUserSelect: "none",
              overflow: "hidden",
              border: "1px solid #B1E4E5",
              borderRadius: '3px'
            }}
            onMouseDown={e => {
              e.stopPropagation();
              handleMouseDown(e);
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={e => {
              const containerRect = containerRef.current.getBoundingClientRect();
              const { clientX: mouseX } = e;

              if (mouseX < containerRect.left) {
                setOutOfBoundsDirection('prev');
              } else if (mouseX > containerRect.right) {
                setOutOfBoundsDirection('next');
              }
            }}
          >
            <div style={{
              backgroundColor: 'rgba(226, 228, 238, 0.5)',
              padding: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              gap: validVisibleMonths === 1 ? '12px' : '20px',
              height: '67px',
              alignItems: 'center',
              // Hide second input for single mode
              ...(selectionMode === 'single' && {
                justifyContent: 'center',
                gap: 0
              })
            }}>
              <DateInput
                value={selectedRange.start ? parseISO(selectedRange.start) : null}
                onChange={handleDateChange('start')}
                field="start"
                placeholder={selectionMode === 'single' ? "Select date" : "Start date"}
                context={{
                  startDate: dateInputContext.startDate,
                  endDate: dateInputContext.endDate,
                  currentField: 'start',
                }}
                selectedRange={selectedRange}
              />
              {selectionMode === 'range' && (
                <DateInput
                  value={selectedRange.end ? parseISO(selectedRange.end) : null}
                  onChange={handleDateChange('end')}
                  field="end"
                  placeholder="End date"
                  context={{
                    startDate: dateInputContext.startDate,
                    endDate: dateInputContext.endDate,
                    currentField: 'end',
                  }}
                  selectedRange={selectedRange}
                />
              )}
            </div>

            <Card.Header className="cla-header">
              <Button
                variant="light"
                onClick={() => moveToMonth("prev")}
                className="cla-button-nav"
              >
                <ChevronLeft size={16} />
              </Button>
              <span className="cla-header-title">
                {`${format(months[2], "MMMM yyyy")} - ${format(addMonths(months[2], validVisibleMonths - 1), "MMMM yyyy")}`}
              </span>
              <Button
                variant="light"
                onClick={() => moveToMonth("next")}
                className="cla-button-nav"
              >
                <ChevronRight size={16} />
              </Button>
            </Card.Header>

            <Card.Body
              style={{
                padding: "0.25rem 0.5rem",  // Reduced top/bottom padding even more
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: 'flex',
                  position: 'relative',
                  width: '500%',
                  transform: 'translateX(-40%)',
                  willChange: 'transform'
                }}
              >
                <div style={{ width: '20%' }}>
                  <MonthPair
                    firstMonth={months[0]}
                    secondMonth={months[1]}
                    selectedRange={selectedRange}
                    onSelectionStart={handleSelectionStart}
                    onSelectionMove={handleSelectionMove}
                    isSelecting={isSelecting}
                    visibleMonths={validVisibleMonths}
                    showMonthHeadings={showMonthHeadings}
                  />
                </div>
                <div style={{ width: '20%' }}>
                  <MonthPair
                    firstMonth={months[1]}
                    secondMonth={months[2]}
                    selectedRange={selectedRange}
                    onSelectionStart={handleSelectionStart}
                    onSelectionMove={handleSelectionMove}
                    isSelecting={isSelecting}
                    visibleMonths={validVisibleMonths}
                    showMonthHeadings={showMonthHeadings}
                  />
                </div>
                <div style={{ width: '20%' }}>
                  <MonthPair
                    firstMonth={months[2]}
                    secondMonth={months[3]}
                    selectedRange={selectedRange}
                    onSelectionStart={handleSelectionStart}
                    onSelectionMove={handleSelectionMove}
                    isSelecting={isSelecting}
                    visibleMonths={validVisibleMonths}
                    showMonthHeadings={showMonthHeadings}
                  />
                </div>
                <div style={{ width: '20%' }}>
                  <MonthPair
                    firstMonth={months[3]}
                    secondMonth={months[4]}
                    selectedRange={selectedRange}
                    onSelectionStart={handleSelectionStart}
                    onSelectionMove={handleSelectionMove}
                    isSelecting={isSelecting}
                    visibleMonths={validVisibleMonths}
                    showMonthHeadings={showMonthHeadings}
                  />
                </div>
                <div style={{ width: '20%' }}>
                  <MonthPair
                    firstMonth={months[4]}
                    secondMonth={addMonths(months[4], 1)}
                    selectedRange={selectedRange}
                    onSelectionStart={handleSelectionStart}
                    onSelectionMove={handleSelectionMove}
                    isSelecting={isSelecting}
                    visibleMonths={validVisibleMonths}
                    showMonthHeadings={showMonthHeadings}
                  />
                </div>
              </div>
            </Card.Body>

            <Card.Footer className="cla-card-footer">
              <Button
                variant="primary"
                onClick={handleClear}
              >
                Clear
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setIsOpen(false);
                  setIsSelecting(false);
                  setIsOutsideBounds(false);
                  setInitialDate(null);
                }}
                style={{
                  backgroundColor: 'rgba(226, 228, 238, 0.5)',
                  color: "#000",
                  border: '1px solid #979797',
                }}
                disabled={Object.keys(validationErrors).length > 0}
              >
                Apply
              </Button>
            </Card.Footer>
          </Card>
          <FloatingIndicator
            className="floating-indicator"
            outOfBoundsDirection={outOfBoundsDirection}
            isSelecting={isSelecting}
            mousePosition={mousePosition}
          />
        </>
      )}
    </div>
  );
};

DateRangePicker.propTypes = {
  /** Number of months to display (1-6) */
  visibleMonths: PropTypes.oneOf([1, 2, 3, 4, 5, 6]),
  /** Show month headings above each calendar */
  showMonthHeadings: PropTypes.bool,
  /** Selection mode: single day or range */
  selectionMode: PropTypes.oneOf(['single', 'range'])
};

DateRangePicker.defaultProps = {
  visibleMonths: 2,
  showMonthHeadings: false
};

export default DateRangePicker;