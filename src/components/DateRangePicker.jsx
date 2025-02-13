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
  showTooltips
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
              showTooltips={showTooltips}
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
  showTooltips
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

  // Wrap with Tooltip only if showTooltips is true
  const dayCell = (
    <div
      onMouseEnter={(e) => {
        if (showTooltips) setShowTooltip(true);
        onMouseEnter?.(e);
      }}
      onMouseLeave={() => showTooltips && setShowTooltip(false)}
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
  );

  return showTooltips ? (
    <Tooltip content={format(date, "MMMM d, yyyy")} show={showTooltip}>
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
  showTooltips
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

const DateRangePicker = ({ 
  visibleMonths = 2,
  showMonthHeadings = false,
  selectionMode = 'range',
  showTooltips = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState({ start: null, end: null });
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
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

  const containerRef = useRef(null);
  const moveToMonthRef = useRef(null);
  const debouncedMoveToMonthRef = useRef(null);

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

  // Add back the continuous month advancement effect
  useEffect(() => {
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
  }, [isSelecting, outOfBoundsDirection]);

  // Simple month navigation
  const moveToMonth = useCallback((direction) => {
    setCurrentMonth(prev => addMonths(prev, direction === 'next' ? 1 : -1));
  }, []);

  // Set the ref for out-of-bounds scrolling
  moveToMonthRef.current = moveToMonth;

  const handleClickOutside = useCallback(() => {
    if (isOpen) {
      setIsOpen(false);
      setIsSelecting(false);
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

  return (
    <div className="cla-calendar" style={{ width: 'fit-content' }}>
      <input
        type="text"
        value={getDisplayText()}
        onClick={() => setIsOpen(true)}
        className="cla-form-control"
        readOnly
        style={{
          width: '300px',  // Keep input width independent
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      />

      {isOpen && (
        <div 
          ref={containerRef}
          className="cla-card cla-card-popup"
          style={{
            width: visibleMonths === 1 ? '500px' : `${400 * Math.min(6, Math.max(1, visibleMonths))}px`,
            position: 'relative'
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
          <div className="cla-input-container">
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

          <div className="cla-header">
            <button className="cla-button-nav" onClick={() => moveToMonth('prev')}>
              <ChevronLeft size={16} />
            </button>
            <span className="cla-header-title">
              {visibleMonths === 1 
                ? format(months[0], "MMMM yyyy")  // Single month display
                : `${format(months[0], "MMMM yyyy")} - ${format(months[months.length - 1], "MMMM yyyy")}`
              }
            </span>
            <button className="cla-button-nav" onClick={() => moveToMonth('next')}>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="cla-card-body">
            <div style={{ display: 'flex' }}>
              <MonthPair
                firstMonth={months[0]}
                secondMonth={visibleMonths === 1 ? null : months[1]}
                selectedRange={selectedRange}
                onSelectionStart={handleSelectionStart}
                onSelectionMove={handleSelectionMove}
                isSelecting={isSelecting}
                visibleMonths={visibleMonths}
                showMonthHeadings={showMonthHeadings}
                showTooltips={showTooltips}
              />
            </div>
          </div>

          <div className="cla-card-footer">
            <Button variant="primary" onClick={handleClear}>
              Clear
            </Button>
          </div>

          <SideChevronIndicator
            outOfBoundsDirection={outOfBoundsDirection}
            isSelecting={isSelecting}
          />
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;