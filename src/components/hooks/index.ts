import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  addMonths, 
  startOfMonth,
  format,
  parseISO
} from 'date-fns';

// Simple now function to replace the missing import
const now = () => new Date();

export const useMonthNavigation = (initialMonth = now()) => {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(initialMonth));
  const [isAnimating, setIsAnimating] = useState(false);
  const monthsContainerRef = useRef<HTMLDivElement | null>(null);
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

  const moveToMonth = useCallback((direction: 'next' | 'prev') => {
    if (isAnimating || !canChangeMonth()) return;
    
    setLastMonthChange(Date.now());
    setIsAnimating(true);

    const container = monthsContainerRef.current;
    if (!container) return;
    
    const slideAmount = container.offsetWidth;

    // Prepare the new content before animation
    setMonths(prev => {
      if (direction === 'next') {
        return [prev[1], prev[2], addMonths(prev[2], 1)];
      } else {
        return [addMonths(prev[0], -1), prev[0], prev[1]];
      }
    });

    // Force a reflow to ensure new content is rendered
    void container.offsetHeight;

    // Now start the animation
    container.style.transition = 'transform 0.3s ease-in-out';
    container.style.transform = `translateX(${direction === 'next' ? -slideAmount : slideAmount}px)`;

    const newCurrentMonth = addMonths(currentMonth, direction === 'next' ? 1 : -1);
    setCurrentMonth(newCurrentMonth);

    // Use window.setTimeout to ensure it's typed correctly
    window.setTimeout(() => {
      if (!container) return;
      container.style.transition = 'none';
      container.style.transform = 'translateX(0)';
      
      // Update months array to prepare for next transition
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
  const [selectedRange, setSelectedRange] = useState<{ start: string | null, end: string | null }>({ start: null, end: null });
  const [isSelecting, setIsSelecting] = useState(false);
  const [isOutsideBounds, setIsOutsideBounds] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleSelectionStart = (date: Date) => {
    setIsSelecting(true);
    setSelectedRange({ start: date.toISOString(), end: null });
  };

  const handleSelectionMove = (date: Date) => {
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
    return `${format(parseISO(selectedRange.start || ''), 'MMM dd, yyyy')} to ${format(parseISO(selectedRange.end || ''), 'MMM dd, yyyy')}`;
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

export const useMouseTracking = (
  containerRef: React.RefObject<HTMLDivElement>,
  isSelecting: boolean,
  canChangeMonth: () => boolean,
  moveToMonth: (direction: 'next' | 'prev') => void
) => {
  const handleMouseMove = useCallback((e: MouseEvent) => {
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
    if (document.body) {
      document.body.style.userSelect = '';
      // Use standard userSelect property with vendor prefixes via style attributes
      document.body.setAttribute('style', 'user-select: auto; -webkit-user-select: auto;');
    }
    
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isSelecting) return;
    e.preventDefault();
    
    if (document.body) {
      document.body.style.userSelect = 'none';
      // Use standard userSelect property with vendor prefixes via style attributes
      document.body.setAttribute('style', 'user-select: none; -webkit-user-select: none;');
    }

    document.addEventListener('mousemove', handleMouseMove as unknown as EventListener);
    document.addEventListener('mouseup', handleMouseUp);
  }, [isSelecting, handleMouseMove, handleMouseUp]);

  return {
    handleMouseMove,
    handleMouseUp,
    handleMouseDown
  };
};