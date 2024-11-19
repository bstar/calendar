import React, { useState, useRef } from 'react';
import { Container, Form, Button, Card, Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
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
  isSameMonth
} from 'date-fns';
import 'bootstrap/dist/css/bootstrap.min.css';

const DateRangePicker = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState({ start: null, end: null });
  const [isSelecting, setIsSelecting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const monthsContainerRef = useRef(null);
  const [months, setMonths] = useState([
    addMonths(currentMonth, -1),
    currentMonth,
    addMonths(currentMonth, 1)
  ]);

  const moveToMonth = (direction) => {
    if (isAnimating) return;
    setIsAnimating(true);

    const container = monthsContainerRef.current;
    const slideAmount = container.offsetWidth;
    
    container.style.transition = 'transform 0.3s ease-in-out';
    container.style.transform = `translateX(${direction === 'next' ? -slideAmount : slideAmount}px)`;

    const newCurrentMonth = addMonths(currentMonth, direction === 'next' ? 1 : -1);
    setCurrentMonth(newCurrentMonth);

    setTimeout(() => {
      container.style.transition = 'none';
      container.style.transform = 'translateX(0)';
      
      setMonths(prev => {
        if (direction === 'next') {
          return [prev[1], prev[2], addMonths(prev[2], 1)];
        } else {
          return [addMonths(prev[0], -1), prev[0], prev[1]];
        }
      });
      
      setIsAnimating(false);
    }, 300);
  };

  const handleSelectionStart = (date) => {
    setIsSelecting(true);
    setSelectedRange({ start: date.toISOString(), end: null });
  };

  const handleSelectionMove = (date) => {
    if (!isSelecting || !selectedRange.start) return;
    
    const start = parseISO(selectedRange.start);
    if (date < start) {
      setSelectedRange(prev => ({ ...prev, end: prev.start, start: date.toISOString() }));
    } else {
      setSelectedRange(prev => ({ ...prev, end: date.toISOString() }));
    }
  };

  const handleSelectionEnd = () => {
    setIsSelecting(false);
  };

  const handleMouseDown = (e) => {
    if (isSelecting) return;
    e.preventDefault();
    setIsSelecting(true);
    
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.mozUserSelect = 'none';
    document.body.style.msUserSelect = 'none';

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    e.preventDefault();
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
    
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
    document.body.style.mozUserSelect = '';
    document.body.style.msUserSelect = '';
    
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const getDisplayText = () => {
    if (!selectedRange.start && !selectedRange.end) return 'Select date range';
    if (selectedRange.start && !selectedRange.end) {
      return format(parseISO(selectedRange.start), 'MMM dd, yyyy');
    }
    return `${format(parseISO(selectedRange.start), 'MMM dd, yyyy')} to ${format(parseISO(selectedRange.end), 'MMM dd, yyyy')}`;
  };

  const MonthPair = ({ firstMonth, secondMonth }) => (
    <div style={{ display: 'flex', minWidth: '100%', flex: 'none' }}>
      <div style={{ width: '50%' }}>
        <MonthGrid
          baseDate={firstMonth}
          selectedRange={selectedRange}
          onSelectionStart={handleSelectionStart}
          onSelectionMove={handleSelectionMove}
          isSelecting={isSelecting}
        />
      </div>
      <div style={{ width: '50%' }}>
        <MonthGrid
          baseDate={secondMonth}
          selectedRange={selectedRange}
          onSelectionStart={handleSelectionStart}
          onSelectionMove={handleSelectionMove}
          isSelecting={isSelecting}
        />
      </div>
    </div>
  );

  return (
    <div 
      className="position-relative"
      onMouseDown={handleMouseDown}
      style={{ 
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none'
      }}
    >
      <Form.Control
        type="text"
        value={getDisplayText()}
        onClick={() => setIsOpen(true)}
        readOnly
        style={{ 
          width: '300px', 
          cursor: 'pointer',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none'
        }}
      />
      
      {isOpen && (
        <Card 
          className="position-absolute mt-2 shadow"
          style={{ 
            zIndex: 1000, 
            width: '700px',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            overflow: 'hidden'
          }}
          onMouseDown={e => {
            e.stopPropagation();
            handleMouseDown(e);
          }}
          onMouseUp={e => {
            e.stopPropagation();
            handleMouseUp();
            handleSelectionEnd();
          }}
        >
          <Card.Header className="d-flex justify-content-between align-items-center bg-white border-bottom">
            <Button
              variant="light"
              onClick={() => moveToMonth('prev')}
              className="px-2 py-1"
              disabled={isAnimating}
            >
              ←
            </Button>
            <span className="fw-bold">
              {format(currentMonth, 'MMMM yyyy')} - {format(addMonths(currentMonth, 1), 'MMMM yyyy')}
            </span>
            <Button
              variant="light"
              onClick={() => moveToMonth('next')}
              className="px-2 py-1"
              disabled={isAnimating}
            >
              →
            </Button>
          </Card.Header>
          <Card.Body style={{ padding: '1rem 0.5rem', position: 'relative', overflow: 'hidden' }}>
            <div 
              ref={monthsContainerRef}
              style={{
                display: 'flex',
                width: '100%'
              }}
            >
              <MonthPair firstMonth={months[0]} secondMonth={months[1]} />
              <MonthPair firstMonth={months[1]} secondMonth={months[2]} />
              <MonthPair firstMonth={months[2]} secondMonth={addMonths(months[2], 1)} />
            </div>
          </Card.Body>
          <Card.Footer className="d-flex justify-content-between">
            <Button
              variant="light"
              onClick={() => setSelectedRange({ start: null, end: null })}
            >
              Clear
            </Button>
            <Button
              variant="primary"
              onClick={() => setIsOpen(false)}
            >
              Apply
            </Button>
          </Card.Footer>
        </Card>
      )}
    </div>
  );
};

const DayCell = ({ 
  date, 
  isSelected, 
  isInRange, 
  isCurrentMonth, 
  onMouseDown,
  onMouseEnter
}) => {
  const tooltipContent = `Week ${getISOWeek(date)}`;
  
  return (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip>{tooltipContent}</Tooltip>}
    >
      <div 
        style={{
          width: '100%',
          paddingBottom: '100%',
          position: 'relative',
          cursor: 'pointer'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            bottom: '2px',
            left: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isSelected ? '#0d6efd' : isInRange ? '#e9ecef' : 'transparent',
            color: isSelected ? 'white' : isCurrentMonth ? 'inherit' : '#adb5bd',
            borderRadius: '4px',
            transition: 'background-color 0.15s ease, color 0.15s ease',
            fontWeight: isSelected ? '600' : 'normal',
            ':hover': {
              backgroundColor: isSelected ? '#0d6efd' : '#e9ecef'
            }
          }}
          onMouseDown={onMouseDown}
          onMouseEnter={onMouseEnter}
        >
          {format(date, 'd')}
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
  isSelecting 
}) => {
  const monthStart = startOfMonth(baseDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

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
      <div className="d-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px' }}>
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
          <div 
            key={day} 
            className="text-center mb-2"
            style={{ fontSize: '0.8rem', fontWeight: '600', color: '#6c757d' }}
          >
            {day}
          </div>
        ))}
        
        {weeks.flat().map(date => {
          const isSelected = selectedRange.start && 
            (isSameDay(parseISO(selectedRange.start), date) || 
             (selectedRange.end && isSameDay(parseISO(selectedRange.end), date)));
          
          const isInRange = selectedRange.start && selectedRange.end && 
            date > parseISO(selectedRange.start) && date < parseISO(selectedRange.end);

          const isCurrentMonth = isSameMonth(date, baseDate);

          return (
            <DayCell
              key={date.toISOString()}
              date={date}
              isSelected={isSelected}
              isInRange={isInRange}
              isCurrentMonth={isCurrentMonth}
              onMouseDown={() => onSelectionStart(date)}
              onMouseEnter={() => isSelecting && onSelectionMove(date)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default DateRangePicker;