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
} from "date-fns";
import "bootstrap/dist/css/bootstrap.min.css";

const DayCell = ({
  date,
  selectedRange,
  isCurrentMonth,
  onMouseDown,
  onMouseEnter,
}) => {
  const tooltipContent = `Week ${getISOWeek(date)}`;

  // Determine if this cell is the start or end of the selection
  const { isSelected, isInRange, isRangeStart, isRangeEnd } = useMemo(() => {
    if (!selectedRange.start) {
      return { isSelected: false, isInRange: false, isRangeStart: false, isRangeEnd: false };
    }

    const startDate = parseISO(selectedRange.start);
    const endDate = selectedRange.end ? parseISO(selectedRange.end) : null;

    // Sort the dates to handle backwards selection
    let rangeStartDate = startDate;
    let rangeEndDate = endDate;
    if (endDate && startDate > endDate) {
      rangeStartDate = endDate;
      rangeEndDate = startDate;
    }

    const isThisSelected = isSameDay(date, startDate) || (endDate && isSameDay(date, endDate));
    const isThisInRange = endDate 
      ? (date >= rangeStartDate && date <= rangeEndDate)
      : false;
    
    return {
      isSelected: isThisSelected,
      isInRange: isThisInRange,
      isRangeStart: isSameDay(date, rangeStartDate),
      isRangeEnd: rangeEndDate ? isSameDay(date, rangeEndDate) : false
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
            backgroundColor: isSelected
              ? "#7dd2d3"
              : isInRange
                ? "#7dd2d3"
                : "transparent",
            color: isSelected
              ? "black"
              : isCurrentMonth
                ? "inherit"
                : "#adb5bd",
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

const createDebouncedMoveToMonth = moveToMonthFn =>
  debounce(moveToMonthFn, 1000, { leading: true, trailing: false });

const DateRangePicker = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState({
    start: null,
    end: null,
  });
  const [isSelecting, setIsSelecting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const monthsContainerRef = useRef(null);
  const containerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isOutsideBounds, setIsOutsideBounds] = useState(false);
  const debouncedMoveToMonthRef = useRef(null);
  const [months, setMonths] = useState([
    currentMonth,                  // Current month (e.g., December)
    addMonths(currentMonth, 1),    // Next month (e.g., January)
    addMonths(currentMonth, 2),    // Month after next (e.g., February)
  ]);
  const moveToMonthRef = useRef(null);


  // Create a stable version of moveToMonth that doesn't change on renders
  moveToMonthRef.current = useCallback((direction) => {
    if (isAnimating) return;

    setIsAnimating(true);
    const container = monthsContainerRef.current;
    if (!container) return;

    const slideAmount = container.offsetWidth / 2; // Half width since we're moving one month

    // 1. First update the months array and current month BEFORE any animation
    const newCurrentMonth = addMonths(currentMonth, direction === 'next' ? 1 : -1);
    setCurrentMonth(newCurrentMonth);

    // 2. Force a reflow to ensure new content is rendered
    container.style.transition = 'none';
    container.style.transform = `translateX(${direction === 'next' ? 0 : -slideAmount}px)`;
    container.offsetHeight; // Force reflow

    // Update months array before animation
    if (direction === 'prev') {
      setMonths(prev => [addMonths(prev[0], -1), prev[0], prev[1]]);
    }

    // 3. Start the animation
    requestAnimationFrame(() => {
      container.style.transition = 'transform 0.3s ease-in-out';
      container.style.transform = `translateX(${direction === 'next' ? -slideAmount : 0}px)`;

      // 4. Clean up after animation
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

  // Setup the debounced version once
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
  }, []); // Empty dependency array since we're using refs

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
    setSelectedRange({ start: date.toISOString(), end: null });
  };

  const handleSelectionMove = date => {
    if (!isSelecting || !selectedRange.start) return;

    const startDate = parseISO(selectedRange.start);

    if (date < startDate) {
      // When selecting backwards
      setSelectedRange({
        start: date.toISOString(),
        end: startDate.toISOString()  // Keep original start as end
      });
    } else {
      // When selecting forwards
      setSelectedRange({
        start: startDate.toISOString(),  // Keep original start
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
        // Trigger immediately when first going outside
        moveToMonthRef.current('next');
      }
    }
  }, [isSelecting, isOutsideBounds]);

  // Update the interval to have a shorter initial delay
  useEffect(() => {
    let checkInterval;

    if (isSelecting && isOutsideBounds) {
      // Do the first check after a delay
      const timeoutId = setTimeout(() => {
        if (isSelecting && isOutsideBounds && moveToMonthRef.current) {
          moveToMonthRef.current('next');
        }
      }, 1000);

      // Then set up the interval
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

  useEffect(() => {
    let checkInterval;

    if (isSelecting && isOutsideBounds) {
      checkInterval = setInterval(() => {
        if (isSelecting && isOutsideBounds && debouncedMoveToMonthRef.current) {
          debouncedMoveToMonthRef.current('next');
        }
      }, 1000);
    }

    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, [isSelecting, isOutsideBounds, moveToMonthRef]);

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
        readOnly
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
                {/* This should create an overlapping sequence of month pairs */}
                <MonthPair
                  firstMonth={months[0]}    // e.g., Dec
                  secondMonth={months[1]}   // e.g., Jan
                  selectedRange={selectedRange}
                  onSelectionStart={handleSelectionStart}
                  onSelectionMove={handleSelectionMove}
                  isSelecting={isSelecting}
                />
                <MonthPair
                  firstMonth={months[1]}    // e.g., Jan
                  secondMonth={months[2]}   // e.g., Feb
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
                onClick={() => {
                  setSelectedRange({ start: null, end: null });
                  setIsSelecting(false);
                }}
              >
                Clear
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setIsOpen(false);
                  setIsSelecting(false);
                  setIsOutsideBounds(false);
                }}
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
