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
import { ChevronRight } from "react-bootstrap-icons";
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
        if (isValid(date)) {
          return { isValid: true, error: null };
        }
        return {
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

        if (startDate > endDate) {
          return {
            isValid: false,
            error: {
              message: 'Start date must be before end date',
              type: 'error',
              field: 'range'
            }
          };
        }
        return { isValid: true, error: null };
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
        rules.isValidDate(value)
      ];

      // Check range validation for both start and end dates
      if (context.startDate && context.endDate) {
        validations.push(rules.isValidRange(context.startDate, context.endDate));
      }

      for (const validation of validations) {
        if (!validation.isValid) {
          return validation.error;
        }
      }

      return null;
    },
    formatValue: (date) => {
      if (!date) return '';
      try {
        return format(date, DATE_FORMAT);
      } catch {
        return '';
      }
    },
    parseValue: (value) => {
      if (!value) return null;
      try {
        return parse(value, DATE_FORMAT, new Date());
      } catch {
        return null;
      }
    },
    DATE_FORMAT
  };
})();

const DateInput = ({ value, onChange, field, placeholder, context, selectedRange }) => {  // Add selectedRange to props
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState(null);
  const [isTouched, setIsTouched] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);  // New state for error indicator
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing && value) {
      setInputValue(dateValidator.formatValue(value));
    } else if (!isEditing && !value) {
      setInputValue('');
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

  const handleBlur = () => {
    setIsTouched(true);
    setIsEditing(false);
    validateAndUpdate();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      validateAndUpdate();
    }
  };

  const validateAndUpdate = () => {
    if (!inputValue) {
      onChange(null);
      setError(null);
      setShowError(false);
      return;
    }

    // First validate format and date
    const parsedDate = dateValidator.parseValue(inputValue);
    if (!parsedDate) {
      const formatError = {
        message: `Please use format: January 15, 2024`,
        type: 'error',
        field: 'format'
      };
      showValidationError(formatError);
      return;
    }

    // Then validate range if needed
    if (field === 'start' && selectedRange?.end) {  // Use selectedRange from props with optional chaining
      const endDate = parseISO(selectedRange.end);
      if (parsedDate > endDate) {
        const rangeError = {
          message: 'Start date must be before end date',
          type: 'error',
          field: 'range'
        };
        showValidationError(rangeError);
        return;
      }
    } else if (field === 'end' && selectedRange?.start) {  // Use selectedRange from props with optional chaining
      const startDate = parseISO(selectedRange.start);
      if (parsedDate < startDate) {
        const rangeError = {
          message: 'End date must be after start date',
          type: 'error',
          field: 'range'
        };
        showValidationError(rangeError);
        return;
      }
    }

    // If we get here, the date is valid
    onChange(parsedDate);
    setError(null);
    setShowError(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1500);
  };

  // Helper function to show validation errors
  const showValidationError = (error) => {
    setError(error);
    setShowError(true);
    onChange(null, false, error);

    // Revert to last valid value
    if (value) {
      setInputValue(dateValidator.formatValue(value));
    } else {
      setInputValue('');
    }

    // Clear error after delay
    setTimeout(() => {
      setShowError(false);
      setError(null);
    }, 2000);
  };

  return (
    <div
      style={{ position: 'relative', flex: 1 }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        style={{
          width: '100%',
          padding: '8px 12px',
          border: `1px solid ${error ? '#dc3545' : '#dee2e6'}`,
          borderRadius: '4px',
          backgroundColor: 'white',
          color: 'inherit',
          transition: 'border-color 0.15s ease',
          cursor: 'text',
          userSelect: 'text',
          WebkitUserSelect: 'text',
          MozUserSelect: 'text',
        }}
      />
      {showSuccess && (
        <div
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#28a745',
            animation: 'fadeInOut 1.5s ease'
          }}
        >
          ✓
        </div>
      )}
      {error && showError && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '100%',
            marginTop: '4px',
            fontSize: '0.875rem',
            color: '#dc3545',
            opacity: 1,
            animation: 'errorMessage 2s ease forwards',
            overflow: 'hidden'
          }}
        >
          {error.message}
        </div>
      )}

      <style>
        {`
    @keyframes fadeInOut {
      0% { opacity: 0; }
      20% { opacity: 1; }
      80% { opacity: 1; }
      100% { opacity: 0; }
    }

    @keyframes containerPadding {
      0% { padding-bottom: 16px; }
      10% { padding-bottom: 40px; }
      80% { padding-bottom: 40px; }
      100% { padding-bottom: 16px; }
    }
  `}
      </style>
    </div>
  );
};

const DayCell = ({
  date,
  selectedRange,
  isCurrentMonth,
  onMouseDown,
  onMouseEnter,
}) => {
  const tooltipContent = `Week ${getISOWeek(date)}`;

  if (!isCurrentMonth) {
    return (
      <div
        style={{
          width: "100%",
          paddingBottom: "100%",
          position: "relative",
          backgroundColor: "white"
        }}
      />
    );
  }

  const { isSelected, isInRange, isRangeStart, isRangeEnd } = useMemo(() => {
    if (!selectedRange.start) {
      return { isSelected: false, isInRange: false, isRangeStart: false, isRangeEnd: false };
    }

    const startDate = parseISO(selectedRange.start);
    const endDate = selectedRange.end ? parseISO(selectedRange.end) : null;

    let chronologicalStart = startDate;
    let chronologicalEnd = endDate;

    if (endDate && startDate > endDate) {
      chronologicalStart = endDate;
      chronologicalEnd = startDate;
    }

    const isThisSelected = isSameDay(date, startDate) || (endDate && isSameDay(date, endDate));
    const isThisInRange = chronologicalEnd
      ? (date >= chronologicalStart && date <= chronologicalEnd)
      : false;

    const isThisRangeStart = chronologicalEnd ? isSameDay(date, chronologicalStart) : false;
    const isThisRangeEnd = chronologicalEnd ? isSameDay(date, chronologicalEnd) : false;

    return {
      isSelected: isThisSelected,
      isInRange: isThisInRange,
      isRangeStart: isThisRangeStart,
      isRangeEnd: isThisRangeEnd
    };
  }, [date, selectedRange.start, selectedRange.end]);

  return (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip>{tooltipContent}</Tooltip>}
    >
      <div
        style={{
          width: "100%",
          paddingBottom: "100%",
          position: "relative",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "6px",
            right: "0px",
            bottom: "6px",
            left: "0px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderTopLeftRadius: isRangeStart ? "15px" : "0px",
            borderBottomLeftRadius: isRangeStart ? "15px" : "0px",
            borderTopRightRadius: isRangeEnd ? "15px" : "0px",
            borderBottomRightRadius: isRangeEnd ? "15px" : "0px",
            backgroundColor: (isSelected || isInRange) ? "#7dd2d3" : "transparent",
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

  const weeks = [];
  let currentWeek = [];

  calendarDays.forEach(day => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  return (
    <div className="px-2">
      <div
        className="d-grid"
        style={{ gridTemplateColumns: "repeat(7, 1fr)", gap: "0px" }}
      >
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(day => (
          <div
            key={day}
            className="text-center mb-2"
            style={{ fontSize: "0.8rem", fontWeight: "600", color: "#6c757d" }}
          >
            {day}
          </div>
        ))}

        {weeks.flat().map(date => {
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
        })}
      </div>
    </div>
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
    <div style={{ width: "50%" }}>
      <MonthGrid
        baseDate={firstMonth}
        selectedRange={selectedRange}
        onSelectionStart={onSelectionStart}
        onSelectionMove={onSelectionMove}
        isSelecting={isSelecting}
      />
    </div>
    <div style={{ width: "50%" }}>
      <MonthGrid
        baseDate={secondMonth}
        selectedRange={selectedRange}
        onSelectionStart={onSelectionStart}
        onSelectionMove={onSelectionMove}
        isSelecting={isSelecting}
      />
    </div>
  </div>
);

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
  const monthsContainerRef = useRef(null);
  const containerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isOutsideBounds, setIsOutsideBounds] = useState(false);
  const debouncedMoveToMonthRef = useRef(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [dateInputContext, setDateInputContext] = useState({
    startDate: null,
    endDate: null
  });
  const [months, setMonths] = useState([
    currentMonth,
    addMonths(currentMonth, 1),
    addMonths(currentMonth, 2),
  ]);
  const moveToMonthRef = useRef(null);

  const handleDateChange = (field) => (date, isClearingError, validationError) => {
    if (isClearingError) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      return;
    }

    if (validationError) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: validationError
      }));
      return;
    }

    const dateStr = date?.toISOString() || null;
    const newRange = { ...selectedRange };
    const newContext = { ...dateInputContext };

    if (field === 'start') {
      newRange.start = dateStr;
      newContext.startDate = date ? dateValidator.formatValue(date) : null;
    } else {
      newRange.end = dateStr;
      newContext.endDate = date ? dateValidator.formatValue(date) : null;
    }

    setSelectedRange(newRange);
    setDateInputContext(newContext);
    setValidationErrors({});

    // Update months if needed
    if (date) {
      if (field === 'start') {
        const startMonth = startOfMonth(date);
        setMonths([
          startMonth,
          addMonths(startMonth, 1),
          addMonths(startMonth, 2)
        ]);
      } else {
        const endMonth = startOfMonth(date);
        setMonths([
          addMonths(endMonth, -1),
          endMonth,
          addMonths(endMonth, 1)
        ]);
      }
    }
  };

  moveToMonthRef.current = useCallback((direction) => {
    if (isAnimating) return;

    setIsAnimating(true);
    const container = monthsContainerRef.current;
    if (!container) return;

    const slideAmount = container.offsetWidth / 2;

    const newCurrentMonth = addMonths(currentMonth, direction === 'next' ? 1 : -1);
    setCurrentMonth(newCurrentMonth);

    container.style.transition = 'none';
    container.style.transform = `translateX(${direction === 'next' ? 0 : -slideAmount}px)`;
    container.offsetHeight;

    if (direction === 'prev') {
      setMonths(prev => [addMonths(prev[0], -1), prev[0], prev[1]]);
    }

    requestAnimationFrame(() => {
      container.style.transition = 'transform 0.3s ease-in-out';
      container.style.transform = `translateX(${direction === 'next' ? -slideAmount : 0}px)`;

      setTimeout(() => {
        container.style.transition = 'none';
        container.style.transform = 'translateX(0)';

        setMonths(prev => {
          if (direction === 'next') {
            return [prev[1], prev[2], addMonths(prev[2], 1)];
          } else {
            return [prev[0], prev[1], addMonths(prev[1], 1)];
          }
        });

        setIsAnimating(false);
      }, 300);
    });
  }, [isAnimating, currentMonth]);

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

  const FloatingIndicator = () => {
    if (!isOutsideBounds || !isSelecting) return null;

    return (
      <div
        style={{
          position: "fixed",
          left: `${mousePosition.x + 20}px`,
          top: `${mousePosition.y - 20}px`,
          background: "#0d6efd",
          color: "white",
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
        }}
      >
        <ChevronRight size={16} />
        <span>Next Month</span>
      </div>
    );
  };

  const handleSelectionStart = date => {
    setIsSelecting(true);
    setInitialDate(date);
    setSelectedRange({
      start: date.toISOString(),
      end: null
    });
  };

  const handleSelectionMove = date => {
    if (!isSelecting || !initialDate) return;

    if (date < initialDate) {
      setSelectedRange({
        start: date.toISOString(),
        end: initialDate.toISOString()
      });
    } else {
      setSelectedRange({
        start: initialDate.toISOString(),
        end: date.toISOString()
      });
    }
  };

  const handleMouseMove = useCallback((e) => {
    e.preventDefault();

    if (!isSelecting || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    setMousePosition({ x: mouseX, y: mouseY });

    const wasOutside = isOutsideBounds;
    const isOutside = mouseX > containerRect.right;

    if (isOutside !== wasOutside) {
      setIsOutsideBounds(isOutside);
      if (isOutside && debouncedMoveToMonthRef.current) {
        moveToMonthRef.current('next');
      }
    }
  }, [isSelecting, isOutsideBounds]);

  useEffect(() => {
    let checkInterval;

    if (isSelecting && isOutsideBounds) {
      const timeoutId = setTimeout(() => {
        if (isSelecting && isOutsideBounds && moveToMonthRef.current) {
          moveToMonthRef.current('next');
        }
      }, 1000);

      checkInterval = setInterval(() => {
        if (isSelecting && isOutsideBounds && moveToMonthRef.current) {
          moveToMonthRef.current('next');
        }
      }, 1000);

      return () => {
        clearTimeout(timeoutId);
        clearInterval(checkInterval);
      };
    }

    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, [isSelecting, isOutsideBounds, moveToMonthRef]);

  const handleMouseUp = useCallback(() => {
    setIsSelecting(false);
    setIsOutsideBounds(false);
    setInitialDate(null);

    document.body.style.userSelect = "";
    document.body.style.webkitUserSelect = "";
    document.body.style.mozUserSelect = "";
    document.body.style.msUserSelect = "";

    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  const handleMouseDown = e => {
    if (isSelecting) return;
    e.preventDefault();
    setIsSelecting(true);

    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";
    document.body.style.mozUserSelect = "none";
    document.body.style.msUserSelect = "none";

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleClear = () => {
    setSelectedRange({ start: null, end: null });
    setIsSelecting(false);
    setInitialDate(null);
    setValidationErrors({});
    setDateInputContext({
      startDate: null,
      endDate: null
    });
  };

  const getDisplayText = () => {
    if (!selectedRange.start && !selectedRange.end) return "Select date range";
    if (selectedRange.start && !selectedRange.end) {
      return format(parseISO(selectedRange.start), "MMM dd, yyyy");
    }
    return `${format(
      parseISO(selectedRange.start),
      "MMM dd, yyyy"
    )} to ${format(parseISO(selectedRange.end), "MMM dd, yyyy")}`;
  };

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
            }}
            onMouseDown={e => {
              e.stopPropagation();
              handleMouseDown(e);
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => setIsOutsideBounds(true)}
          >
            <div style={{
              backgroundColor: '#2e334e33',
              padding: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              gap: '20px',
              userSelect: 'text',
              WebkitUserSelect: 'text',
              MozUserSelect: 'text',
              animation: Object.keys(validationErrors).length > 0 ? 'containerPadding 2s ease forwards' : ''
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
                selectedRange={selectedRange}  // Make sure this is passed
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
                selectedRange={selectedRange}  // Make sure this is passed
              />
            </div>

            <Card.Header className="d-flex justify-content-between align-items-center bg-white border-bottom">
              <Button
                variant="light"
                onClick={() => moveToMonthRef.current("prev")}
                className="px-2 py-1"
                disabled={isAnimating}
              >
                ←
              </Button>
              <span className="fw-bold">
                {format(months[0], "MMMM yyyy")} -{" "}
                {format(months[1], "MMMM yyyy")}
              </span>
              <Button
                variant="light"
                onClick={() => moveToMonthRef.current("next")}
                className="px-2 py-1"
                disabled={isAnimating}
              >
                →
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
                  display: 'flex',
                  width: '100%',
                  position: 'relative',
                  transform: 'translateX(0)',
                  willChange: 'transform'
                }}
              >
                <MonthPair
                  firstMonth={months[0]}
                  secondMonth={months[1]}
                  selectedRange={selectedRange}
                  onSelectionStart={handleSelectionStart}
                  onSelectionMove={handleSelectionMove}
                  isSelecting={isSelecting}
                />
                <MonthPair
                  firstMonth={months[1]}
                  secondMonth={months[2]}
                  selectedRange={selectedRange}
                  onSelectionStart={handleSelectionStart}
                  onSelectionMove={handleSelectionMove}
                  isSelecting={isSelecting}
                />
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
                disabled={Object.keys(validationErrors).length > 0}
              >
                Apply
              </Button>
            </Card.Footer>
          </Card>
          <FloatingIndicator />
        </>
      )}
    </div>
  );
};

export default DateRangePicker;