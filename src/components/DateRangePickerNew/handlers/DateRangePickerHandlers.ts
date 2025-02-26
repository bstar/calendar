import { RefObject } from 'react';
import { format, parseISO, startOfMonth, addMonths } from 'date-fns';
import { DateRange } from '../selection/DateRangeSelectionManager';

export interface ValidationError {
  message: string;
  type: string;
  field: string;
}

export interface DateInputContext {
  startDate: string | null;
  endDate: string | null;
  currentField: string | null;
}

export interface MousePosition {
  x: number;
  y: number;
}

export class DateRangePickerHandlers {
  /**
   * Handle date input changes
   */
  static createDateChangeHandler(
    selectedRange: DateRange,
    dateInputContext: DateInputContext,
    setSelectedRange: (range: DateRange) => void,
    setDateInputContext: (context: DateInputContext) => void,
    setValidationErrors: (errors: Record<string, ValidationError>) => void,
    setCurrentMonth: (month: Date) => void,
    visibleMonths: number,
    dateValidator: any
  ) {
    return (field: 'start' | 'end') => (
      date: Date | null,
      isClearingError?: boolean,
      validationError?: ValidationError
    ) => {
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
          const newBaseMonth = startOfMonth(date);
          setCurrentMonth(newBaseMonth);
        } else {
          // For end date, we want it in the rightmost month
          const newBaseMonth = addMonths(startOfMonth(date), -(validVisibleMonths - 1));
          setCurrentMonth(newBaseMonth);
        }
      }
    };
  }

  /**
   * Handle mouse events for out-of-bounds scrolling
   */
  static createMouseHandlers(
    containerRef: RefObject<HTMLDivElement>,
    isSelecting: boolean,
    setOutOfBoundsDirection: (direction: 'prev' | 'next' | null) => void,
    setMousePosition: (position: MousePosition) => void
  ) {
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!isSelecting || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const { clientX: mouseX, clientY: mouseY } = e;
      const BOUNDARY_THRESHOLD = 20;

      setMousePosition({ x: mouseX, y: mouseY });

      // Check both boundaries with equal thresholds - keep the original logic
      const newDirection = mouseX < containerRect.left + BOUNDARY_THRESHOLD ? 'prev'
        : mouseX > containerRect.right - BOUNDARY_THRESHOLD ? 'next'
          : null;

      setOutOfBoundsDirection(newDirection);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      // Only handle out of bounds when selecting
      if (!isSelecting) return;
      
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;
      const { clientX: mouseX } = e;

      if (mouseX < containerRect.left) {
        setOutOfBoundsDirection('prev');
      } else if (mouseX > containerRect.right) {
        setOutOfBoundsDirection('next');
      }
    };

    return {
      handleMouseMove,
      handleMouseLeave
    };
  }

  /**
   * Create document-level mouse handlers for drag selection
   */
  static createDocumentMouseHandlers(
    containerRef: RefObject<HTMLDivElement>,
    isSelecting: boolean,
    outOfBoundsDirection: 'prev' | 'next' | null,
    setOutOfBoundsDirection: (direction: 'prev' | 'next' | null) => void,
    setMousePosition: (position: MousePosition) => void,
    moveToMonthRef: RefObject<((direction: 'prev' | 'next') => void) | null>,
    setIsSelecting: (isSelecting: boolean) => void
  ) {
    const handleDocumentMouseMove = (e: MouseEvent) => {
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
        
        // If we're entering a boundary area, trigger the month change
        if (newDirection && moveToMonthRef.current) {
          // Immediately move to the next/prev month
          moveToMonthRef.current(newDirection);
          
          // Set up an interval to continue moving if mouse stays in boundary
          const intervalId = setInterval(() => {
            if (moveToMonthRef.current) {
              moveToMonthRef.current(newDirection);
            }
          }, 1000);
          
          // Store the interval ID so we can clear it later
          (e as any).intervalId = intervalId;
        }
      }
    };

    const handleMouseUp = () => {
      setIsSelecting(false);
      setOutOfBoundsDirection(null);

      const styles = ['userSelect', 'webkitUserSelect', 'mozUserSelect', 'msUserSelect'] as const;
      styles.forEach(style => document.body.style[style as any] = '');

      // Clear any active intervals
      if ((document as any).activeIntervalId) {
        clearInterval((document as any).activeIntervalId);
        (document as any).activeIntervalId = null;
      }

      document.removeEventListener("mousemove", handleDocumentMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
      if (isSelecting) return;
      e.preventDefault();

      const setUserSelectNone = () => {
        const styles = ['userSelect', 'webkitUserSelect', 'mozUserSelect', 'msUserSelect'] as const;
        styles.forEach(style => document.body.style[style as any] = 'none');
      };

      setUserSelectNone();

      document.addEventListener("mousemove", handleDocumentMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    return {
      handleDocumentMouseMove,
      handleMouseUp,
      handleMouseDown
    };
  }

  /**
   * Create display text formatter for the input field
   */
  static createDisplayTextFormatter(
    selectedRange: DateRange,
    selectionMode: 'single' | 'range'
  ) {
    return () => {
      const { start, end } = selectedRange;
      if (!start) return "Select date";
      
      if (selectionMode === 'single') {
        return format(parseISO(start), "MMM dd, yyyy");
      }
      
      return !end
        ? format(parseISO(start), "MMM dd, yyyy")
        : `${format(parseISO(start), "MMM dd, yyyy")} - ${format(parseISO(end), "MMM dd, yyyy")}`;
    };
  }
} 