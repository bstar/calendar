import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  Container,
  Form,
  Button,
  Card,
  Row,
  Col,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { ChevronRight, ChevronLeft } from "react-bootstrap-icons";
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
import "bootstrap/dist/css/bootstrap.min.css";


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
      const validations = [
        rules.isValidFormat(value),
        rules.isValidDate(value),
        ...(context.startDate && context.endDate ? [rules.isValidRange(context.startDate, context.endDate)] : [])
      ];

      return validations.reduce((result, validation) =>
        !validation.isValid ? validation.error : result,
        null
      );
    },
    formatValue: (date) => !date ? '' : format(date, DATE_FORMAT),
    parseValue: (value) => !value ? null : parse(value, DATE_FORMAT, new Date()),
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
    if (inputValue === previousInputRef.current) {
      return;
    }

    previousInputRef.current = inputValue;

    // Handle empty input
    if (!inputValue.trim()) {
      onChange(null);
      setError(null);
      setShowError(false);
      if (value) {
        setShowIndicator('error');
        setTimeout(() => setShowIndicator(null), 1500);
      }
      return;
    }

    // First check if it matches the format
    let parsedDate;
    try {
      parsedDate = parse(inputValue, dateValidator.DATE_FORMAT, new Date());
      if (!isValid(parsedDate)) {
        showValidationError({
          message: 'Invalid date',
          type: 'error',
          field: 'date'
        });
        return;
      }
    } catch {
      showValidationError({
        message: `Please use format: January 15, 2024`,
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
    <div className="px-2">
      <div
        className="d-grid calendar-grid"
        style={{
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "0",
          height: "240px", // Fixed height for 6 rows plus header
          gridTemplateRows: `32px repeat(${totalWeeks}, 1fr)`, // Header row plus 6 week rows
        }}
      >
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(day => (
          <div
            key={day}
            className="text-center"
            style={{
              fontSize: "0.8rem",
              fontWeight: "600",
              color: "#6c757d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {day}
          </div>
        ))}

        {Object.values(weeks).flatMap(week =>
          week.map(date => {
            const isCurrentMonth = isSameMonth(date, baseDate);
            return (
              <DayCell
                key={date.toISOString()}
                date={date}
                selectedRange={selectedRange}
                isCurrentMonth={isCurrentMonth}
                onMouseDown={() => onSelectionStart(date)}
                onMouseEnter={() => onSelectionMove(date)}
              />
            );
          })
        )}
        
        {/* Add empty cells for consistency */}
        {[...Array(emptyWeeks * 7)].map((_, i) => (
          <div
            key={`empty-${i}`}
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
              backgroundColor: "white"
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Update the DayCell component
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

  if (!isCurrentMonth) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          backgroundColor: "white"
        }}
      />
    );
  }

  return (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip>{`Week ${getISOWeek(date)}`}</Tooltip>}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderTopLeftRadius: isRangeStart ? "15px" : "0",
            borderBottomLeftRadius: isRangeStart ? "15px" : "0",
            borderTopRightRadius: isRangeEnd ? "15px" : "0",
            borderBottomRightRadius: isRangeEnd ? "15px" : "0",
            margin: "3px 0",
            backgroundColor: (isSelected || isInRange) ? "#b1e4e5" : "transparent",
            color: "inherit",
            transition: "background-color 0.15s ease, color 0.15s ease",
            fontWeight: isSelected ? "600" : "normal",
          }}
          onMouseDown={onMouseDown}
          onMouseEnter={onMouseEnter}
        >
          {format(date, "d")}
        </div>
      </div>
    </OverlayTrigger>
  );
};

const MonthPair = ({
  firstMonth,
  secondMonth,
  selectedRange,
  onSelectionStart,
  onSelectionMove,
  isSelecting,
}) => (
  <div style={{ display: "flex", minWidth: "100%", flex: "none" }}>
    {[firstMonth, secondMonth].map((month, index) => (
      <div key={month.toString()} style={{ width: "50%" }}>
        <MonthGrid
          baseDate={month}
          selectedRange={selectedRange}
          onSelectionStart={onSelectionStart}
          onSelectionMove={onSelectionMove}
          isSelecting={isSelecting}
        />
      </div>
    ))}
  </div>
);

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

const DateRangePicker = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState({
    start: null,
    end: null,
  });
  const [initialDate, setInitialDate] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
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
      addMonths(initial, -1),  // Hidden previous
      initial,                 // First visible
      addMonths(initial, 1),   // Second visible
      addMonths(initial, 2),   // Hidden next
    ];
  });

  const monthsContainerRef = useRef(null);
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

    if (date) {
      const baseMonth = startOfMonth(date);
      const monthUpdates = field === 'start'
        ? [baseMonth, addMonths(baseMonth, 1), addMonths(baseMonth, 2)]
        : [addMonths(baseMonth, -1), baseMonth, addMonths(baseMonth, 1)];

      setMonths(monthUpdates);
    }
  };

  moveToMonthRef.current = useCallback((direction) => {
    if (isAnimating) return;
    setIsAnimating(true);

    const container = monthsContainerRef.current?.firstChild;
    if (!container) return;

    // Start animation
    requestAnimationFrame(() => {
      container.style.transition = 'transform 0.3s ease-in-out';
      container.style.transform = `translateX(${direction === 'next' ? '-50%' : '0%'})`;

      // Wait for animation to complete before any React updates
      setTimeout(() => {
        // Update state after animation is done
        setMonths(prev => direction === 'next'
          ? [prev[1], prev[2], addMonths(prev[2], 1)]
          : [addMonths(prev[0], -1), prev[0], prev[1]]
        );

        // Reset position instantly
        container.style.transition = 'none';
        container.style.transform = 'translateX(-25%)';
        
        setCurrentMonth(prev => addMonths(prev, direction === 'next' ? 1 : -1));
        setIsAnimating(false);
      }, 300);
    });
  }, [isAnimating]);

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
    let checkInterval;
    let timeoutId;

    if (isSelecting && outOfBoundsDirection) {
      const advanceMonth = () => {
        if (isSelecting && outOfBoundsDirection && moveToMonthRef.current) {
          moveToMonthRef.current(outOfBoundsDirection);
        }
      };

      timeoutId = setTimeout(advanceMonth, 1000);
      checkInterval = setInterval(advanceMonth, 1000);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [isSelecting, outOfBoundsDirection]);

  const handleSelectionStart = useCallback(date => {
    setIsSelecting(true);
    setInitialDate(date);
    setSelectedRange({
      start: date.toISOString(),
      end: null
    });
  }, []);

  const handleSelectionMove = useCallback(date => {
    if (!isSelecting || !initialDate) return;

    const [start, end] = date < initialDate
      ? [date, initialDate]
      : [initialDate, date];

    setSelectedRange({
      start: start.toISOString(),
      end: end.toISOString()
    });
  }, [isSelecting, initialDate]);

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
      addMonths(currentDate, -1),  // Hidden previous
      currentDate,                 // First visible
      addMonths(currentDate, 1),   // Second visible
      addMonths(currentDate, 2),   // Hidden next
    ]);
  }, []);

  const getDisplayText = useCallback(() => {
    const { start, end } = selectedRange;
    return !start && !end
      ? "Select date range"
      : start && !end
        ? format(parseISO(start), "MMM dd, yyyy")
        : `${format(parseISO(start), "MMM dd, yyyy")} to ${format(parseISO(end), "MMM dd, yyyy")}`;
  }, [selectedRange]);

return (
  <div
    className="position-relative"
    onMouseDown={handleMouseDown}
    style={{
      userSelect: "none",
      WebkitUserSelect: "none",
      MozUserSelect: "none",
      msUserSelect: "none",
    }}
  >
    <Form.Control
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
          className="position-absolute mt-2 shadow"
          style={{
            zIndex: 1000,
            width: "700px",
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none",
            overflow: "hidden",
            border: "1px solid #B1E4E5",
            borderRadius: '3px',
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
            gap: '20px',
            height: '67px',
            alignItems: 'center',
            userSelect: 'text',
            WebkitUserSelect: 'text',
            MozUserSelect: 'text'
          }}>
            <DateInput
              value={selectedRange.start ? parseISO(selectedRange.start) : null}
              onChange={handleDateChange('start')}
              field="start"
              placeholder="Start date"
              context={{
                startDate: dateInputContext.startDate,
                endDate: dateInputContext.endDate,
                currentField: 'start',
              }}
              selectedRange={selectedRange}
            />
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
          </div>

          <Card.Header className="d-flex justify-content-between align-items-center bg-white border-bottom">
            <Button
              variant="light"
              onClick={() => moveToMonthRef.current("prev")}
              className="px-2 py-1"
              disabled={isAnimating}
              style={{ backgroundColor: 'white', border: 'none' }}
            >
              <ChevronLeft size={16} />
            </Button>
            <span className="fw-bold">
              {format(months[1], "MMMM yyyy")} -{" "}
              {format(months[2], "MMMM yyyy")}
            </span>
            <Button
              variant="light"
              onClick={() => moveToMonthRef.current("next")}
              className="px-2 py-1"
              disabled={isAnimating}
              style={{ backgroundColor: 'white', border: 'none' }}
            >
              <ChevronRight size={16} />
            </Button>
          </Card.Header>

          <Card.Body
            style={{
              padding: "1rem 0.5rem",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              ref={monthsContainerRef}
              style={{
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{
                display: 'flex',
                position: 'relative',
                width: '400%',  // Space for 4 MonthPairs
                transform: 'translateX(-25%)'  // Show the second pair
              }}>
                {/* Hidden Previous */}
                <div style={{ width: '25%' }}>
                  <MonthPair
                    firstMonth={addMonths(months[0], -2)}
                    secondMonth={addMonths(months[0], -1)}
                    selectedRange={selectedRange}
                    onSelectionStart={handleSelectionStart}
                    onSelectionMove={handleSelectionMove}
                    isSelecting={isSelecting}
                  />
                </div>
                {/* Current Visible */}
                <div style={{ width: '25%' }}>
                  <MonthPair
                    firstMonth={months[0]}
                    secondMonth={months[1]}
                    selectedRange={selectedRange}
                    onSelectionStart={handleSelectionStart}
                    onSelectionMove={handleSelectionMove}
                    isSelecting={isSelecting}
                  />
                </div>
                {/* Next */}
                <div style={{ width: '25%' }}>
                  <MonthPair
                    firstMonth={months[1]}
                    secondMonth={months[2]}
                    selectedRange={selectedRange}
                    onSelectionStart={handleSelectionStart}
                    onSelectionMove={handleSelectionMove}
                    isSelecting={isSelecting}
                  />
                </div>
                {/* Hidden Next */}
                <div style={{ width: '25%' }}>
                  <MonthPair
                    firstMonth={months[2]}
                    secondMonth={addMonths(months[2], 1)}
                    selectedRange={selectedRange}
                    onSelectionStart={handleSelectionStart}
                    onSelectionMove={handleSelectionMove}
                    isSelecting={isSelecting}
                  />
                </div>
              </div>
            </div>
          </Card.Body>

          <Card.Footer className="d-flex justify-content-between">
            <Button
              variant="light"
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

export default DateRangePicker;