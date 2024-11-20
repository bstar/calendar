import { useState, useRef, useCallback } from 'react';
import { 
  addMonths, 
  startOfMonth,
  format,
  parseISO
} from 'date-fns';

export const useMonthNavigation = (initialMonth = new Date()) => {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(initialMonth));
  const [isAnimating, setIsAnimating] = useState(false);
  const monthsContainerRef = useRef(null);
  const [lastMonthChange, setLastMonthChange] = useState(0);
  const MONTH_CHANGE_COOLDOWN = 1000;
  
  const [months, setMonths] = useState([
    addMonths(currentMonth, -1),
    currentMonth,
    addMonths(currentMonth, 1)
  ]);

  const canChangeMonth = useCallback(() => {
    const now = Date.now();
    return now - lastMonthChange >= MONTH_CHANGE_COOLDOWN;
  }, [lastMonthChange]);

  const moveToMonth = useCallback((direction) => {
    if (isAnimating || !canChangeMonth()) return;
    
    setLastMonthChange(Date.now());
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
  }, [isAnimating, canChangeMonth, currentMonth]);

  return {
    currentMonth,
    months,
    isAnimating,
    monthsContainerRef,
    moveToMonth,
    canChangeMonth
  };
};

export const useRangeSelection = () => {
  const [selectedRange, setSelectedRange] = useState({ start: null, end: null });
  const [isSelecting, setIsSelecting] = useState(false);
  const [isOutsideBounds, setIsOutsideBounds] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleSelectionStart = (date) => {
    setIsSelecting(true);
    setSelectedRange({ start: date.toISOString(), end: null });
  };

  const handleSelectionMove = (date) => {
    if (!isSelecting || !selectedRange.start) return;
    
    const start = new Date(selectedRange.start);
    if (date < start) {
      setSelectedRange(prev => ({ ...prev, end: prev.start, start: date.toISOString() }));
    } else {
      setSelectedRange(prev => ({ ...prev, end: date.toISOString() }));
    }
  };

  const handleSelectionEnd = () => {
    setIsSelecting(false);
    setIsOutsideBounds(false);
  };

  const clearSelection = () => {
    setSelectedRange({ start: null, end: null });
    setIsSelecting(false);
  };

  const getDisplayText = useCallback(() => {
    if (!selectedRange.start && !selectedRange.end) return 'Select date range';
    if (selectedRange.start && !selectedRange.end) {
      return format(parseISO(selectedRange.start), 'MMM dd, yyyy');
    }
    return `${format(parseISO(selectedRange.start), 'MMM dd, yyyy')} to ${format(parseISO(selectedRange.end), 'MMM dd, yyyy')}`;
  }, [selectedRange]);

  return {
    selectedRange,
    isSelecting,
    isOutsideBounds,
    mousePosition,
    setIsSelecting,
    setIsOutsideBounds,
    setMousePosition,
    handleSelectionStart,
    handleSelectionMove,
    handleSelectionEnd,
    clearSelection,
    getDisplayText
  };
};

export const useMouseTracking = (containerRef, isSelecting, canChangeMonth, moveToMonth) => {
  const handleMouseMove = useCallback((e) => {
    e.preventDefault();
    
    if (!isSelecting || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    const isOutside = mouseX > containerRect.right;
    
    if (isOutside && canChangeMonth()) {
      moveToMonth('next');
    }

    return { mouseX, mouseY, isOutside };
  }, [isSelecting, canChangeMonth, moveToMonth, containerRef]);

  const handleMouseUp = useCallback(() => {
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
    document.body.style.mozUserSelect = '';
    document.body.style.msUserSelect = '';
    
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const handleMouseDown = (e) => {
    if (isSelecting) return;
    e.preventDefault();
    
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.mozUserSelect = 'none';
    document.body.style.msUserSelect = 'none';

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return {
    handleMouseMove,
    handleMouseUp,
    handleMouseDown
  };
};