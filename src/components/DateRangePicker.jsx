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
  const [baseMonth, setBaseMonth] = useState(startOfMonth(new Date()));
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const popoverRef = useRef(null);

  const handleMonthChange = (newDirection) => {
    if (isAnimating) return;
    
    setDirection(newDirection);
    setIsAnimating(true);
    
    setTimeout(() => {
      setBaseMonth(prev => newDirection === 'next' ? addMonths(prev, 1) : addMonths(prev, -1));
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

  const getDisplayText = () => {
    if (!selectedRange.start && !selectedRange.end) return 'Select date range';
    if (selectedRange.start && !selectedRange.end) {
      return format(parseISO(selectedRange.start), 'MMM dd, yyyy');
    }
    return `${format(parseISO(selectedRange.start), 'MMM dd, yyyy')} to ${format(parseISO(selectedRange.end), 'MMM dd, yyyy')}`;
  };

  return (
    <div className="position-relative">
      <Form.Control
        type="text"
        value={getDisplayText()}
        onClick={() => setIsOpen(true)}
        readOnly
        style={{ width: '300px', cursor: 'pointer' }}
      />
      
      {isOpen && (
        <Card 
          ref={popoverRef}
          className="position-absolute mt-2 shadow"
          style={{ 
            zIndex: 1000, 
            width: '700px',
            userSelect: 'none',
            WebkitUserSelect: 'none', // For Safari
            MozUserSelect: 'none',    // For Firefox
            msUserSelect: 'none'      // For IE/Edge
          }}
          onMouseUp={handleSelectionEnd}
        >
          <Card.Header className="d-flex justify-content-between align-items-center bg-white border-bottom">
            <Button
              variant="light"
              onClick={() => handleMonthChange('prev')}
              className="px-2 py-1"
            >
              ←
            </Button>
            <span className="fw-bold">
              {format(baseMonth, 'MMMM yyyy')} - {format(addMonths(baseMonth, 1), 'MMMM yyyy')}
            </span>
            <Button
              variant="light"
              onClick={() => handleMonthChange('next')}
              className="px-2 py-1"
            >
              →
            </Button>
          </Card.Header>
          <Card.Body 
            style={{ 
              overflow: 'hidden',
              padding: '1rem 0.5rem',
              touchAction: 'none' // Prevents touch scrolling during selection
            }}
          >
            <div
              style={{
                transform: isAnimating 
                  ? `translateX(${direction === 'next' ? '-100%' : '100%'})` 
                  : 'translateX(0)',
                transition: 'transform 0.3s ease-in-out',
                display: 'flex',
              }}
            >
              <div className="d-flex" style={{ width: '100%' }}>
                <div style={{ width: '50%' }}>
                  <MonthGrid
                    baseDate={baseMonth}
                    selectedRange={selectedRange}
                    onSelectionStart={handleSelectionStart}
                    onSelectionMove={handleSelectionMove}
                    isSelecting={isSelecting}
                  />
                </div>
                <div style={{ width: '50%' }}>
                  <MonthGrid
                    baseDate={addMonths(baseMonth, 1)}
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