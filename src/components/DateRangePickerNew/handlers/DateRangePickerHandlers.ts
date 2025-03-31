import { RefObject } from 'react';
import { format, parseISO, startOfMonth, addMonths } from '../../../utils/DateUtils';
import { DateRange, DateRangeSelectionManager } from '../selection/DateRangeSelectionManager';

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

export interface DateValidator {
  validate: (value: string, context?: Record<string, unknown>) => { isValid: boolean; error: ValidationError | null };
  formatValue: (date: Date) => string;
  parseValue: (value: string) => Date | null;
  DATE_FORMAT: string;
}

// Define a type for style properties
type UserSelectProperty = 'userSelect' | 'webkitUserSelect' | 'mozUserSelect' | 'msUserSelect';

// Use NodeJS.Timeout for setInterval return type
type IntervalID = ReturnType<typeof setInterval>;

export class DateRangePickerHandlers {
  /**
   * Handle date input changes
   */
  static createDateChangeHandler(
    selectedRange: DateRange,
    dateInputContext: DateInputContext,
    setSelectedRange: (range: DateRange) => void,
    setDateInputContext: (context: DateInputContext) => void,
    setValidationErrors: (errors: Record<string, ValidationError> | ((prev: Record<string, ValidationError>) => Record<string, ValidationError>)) => void,
    setCurrentMonth: (month: Date) => void,
    visibleMonths: number,
    dateValidator: DateValidator
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
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {} as Record<string, ValidationError>)
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
    console.log('[MouseHandlers] Initializing with isSelecting:', isSelecting);
    
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      console.log('[MouseHandlers] Mouse Move - isSelecting:', isSelecting, 'containerRef exists:', !!containerRef.current);
      if (!isSelecting || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const { clientX: mouseX, clientY: mouseY } = e;
      const BOUNDARY_THRESHOLD = 20;

      setMousePosition({ x: mouseX, y: mouseY });

      // Check both boundaries with equal thresholds - keep the original logic
      const newDirection = mouseX < containerRect.left + BOUNDARY_THRESHOLD ? 'prev'
        : mouseX > containerRect.right - BOUNDARY_THRESHOLD ? 'next'
          : null;

      console.log('[MouseHandlers] Boundary Check:', {
        mouseX,
        containerLeft: containerRect.left,
        containerRight: containerRect.right,
        threshold: BOUNDARY_THRESHOLD,
        newDirection,
        isSelecting // Add isSelecting to this log
      });

      setOutOfBoundsDirection(newDirection);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      console.log('[MouseHandlers] Mouse Leave - isSelecting:', isSelecting, 'containerRef exists:', !!containerRef.current);
      // Only handle out of bounds when selecting
      if (!isSelecting) return;

      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;
      const { clientX: mouseX } = e;

      console.log('[MouseHandlers] Mouse Leave Position:', {
        mouseX,
        containerLeft: containerRect.left,
        containerRight: containerRect.right,
        isSelecting // Add isSelecting to this log
      });

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
    console.log('[DocumentHandlers] Initializing with isSelecting:', isSelecting);

    const handleDocumentMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      console.log('[DocumentHandlers] Document Mouse Move - START', {
        isSelecting,
        containerExists: !!containerRef.current,
        hasMoveFn: !!moveToMonthRef.current
      });
      
      if (!isSelecting || !containerRef.current) {
        console.log('[DocumentHandlers] Early return - isSelecting or container missing');
        return;
      }

      const containerRect = containerRef.current.getBoundingClientRect();
      const { clientX: mouseX, clientY: mouseY } = e;
      const BOUNDARY_THRESHOLD = 20;

      setMousePosition({ x: mouseX, y: mouseY });

      // Check both boundaries with equal thresholds
      const newDirection = mouseX < containerRect.left + BOUNDARY_THRESHOLD ? 'prev'
        : mouseX > containerRect.right - BOUNDARY_THRESHOLD ? 'next'
          : null;

      console.log('[DocumentHandlers] Document Boundary Check:', {
        mouseX,
        containerLeft: containerRect.left,
        containerRight: containerRect.right,
        threshold: BOUNDARY_THRESHOLD,
        newDirection,
        currentOutOfBoundsDirection: outOfBoundsDirection,
        isSelecting
      });

      if (newDirection !== outOfBoundsDirection) {
        console.log('[DocumentHandlers] Direction change detected:', {
          newDirection,
          oldDirection: outOfBoundsDirection,
          hasMoveFn: !!moveToMonthRef.current
        });
        
        setOutOfBoundsDirection(newDirection);

        // If we're entering a boundary area, trigger the month change
        if (newDirection && moveToMonthRef.current) {
          console.log('[DocumentHandlers] Triggering month change:', newDirection);
          // Immediately move to the next/prev month
          moveToMonthRef.current(newDirection);

          // Set up an interval to continue moving if mouse stays in boundary
          const intervalId = setInterval(() => {
            if (moveToMonthRef.current) {
              console.log('[DocumentHandlers] Interval triggered month change:', {
                direction: newDirection,
                isSelecting,
                hasMoveFn: !!moveToMonthRef.current
              });
              moveToMonthRef.current(newDirection);
            }
          }, 1000);

          // Store the interval ID in a safer way
          const mouseEvent = e as MouseEvent & { intervalId?: IntervalID };
          mouseEvent.intervalId = intervalId;
        }
      }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
      console.log('[DocumentHandlers] Mouse Down - Pre-check:', {
        currentIsSelecting: isSelecting,
        hasContainer: !!containerRef.current
      });
      
      if (isSelecting) {
        console.log('[DocumentHandlers] Mouse Down blocked - already selecting');
        return;
      }
      e.preventDefault();

      const setUserSelectNone = () => {
        const styles = ['userSelect', 'webkitUserSelect', 'mozUserSelect', 'msUserSelect'] as const;
        styles.forEach(style => document.body.style[style as UserSelectProperty] = 'none');
      };

      setUserSelectNone();
      console.log('[DocumentHandlers] Adding document event listeners');
      document.addEventListener("mousemove", handleDocumentMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    const handleMouseUp = () => {
      console.log('[DocumentHandlers] Mouse Up - Cleaning up selection. Current state:', {
        isSelecting,
        outOfBoundsDirection,
        hasContainer: !!containerRef.current
      });
      
      setIsSelecting(false);
      setOutOfBoundsDirection(null);

      const styles: UserSelectProperty[] = ['userSelect', 'webkitUserSelect', 'mozUserSelect', 'msUserSelect'];
      styles.forEach(style => {
        document.body.style[style as UserSelectProperty] = '';
      });

      // Clear any active intervals using a safer approach
      interface DocumentWithInterval extends Document {
        activeIntervalId?: IntervalID;
      }

      const docWithInterval = document as DocumentWithInterval;
      if (docWithInterval.activeIntervalId) {
        console.log('[DocumentHandlers] Clearing active interval');
        clearInterval(docWithInterval.activeIntervalId);
        docWithInterval.activeIntervalId = undefined;
      }

      document.removeEventListener("mousemove", handleDocumentMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
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
    selectionMode: 'single' | 'range',
    dateFormatter?: (date: Date) => string,
    dateRangeSeparator: string = " - " // Default separator if not provided
  ) {
    return () => {
      const { start, end } = selectedRange;
      if (!start) return "Select date";

      // Format dates using custom formatter if provided, otherwise use default format
      const formatDate = (dateString: string) => {
        const date = parseISO(dateString);
        return dateFormatter
          ? dateFormatter(date)
          : format(date, "MMM dd, yyyy");
      };

      if (selectionMode === 'single') {
        return formatDate(start);
      }

      return !end
        ? formatDate(start)
        : `${formatDate(start)}${dateRangeSeparator}${formatDate(end)}`;
    };
  }

  /**
   * Create handlers for selection actions
   */
  static createSelectionHandlers(
    selectionManager: DateRangeSelectionManager,
    isSelecting: boolean,
    setIsSelecting: (isSelecting: boolean) => void,
    setSelectedRange: (range: DateRange) => void,
    setNotification: (message: string | null) => void,
    showSelectionAlert: boolean,
    selectedRange: DateRange,
    outOfBoundsDirection: 'prev' | 'next' | null
  ) {
    const handleSelectionStart = (date: Date) => {
      const result = selectionManager.startSelection(date);

      if (!result.success) {
        if (showSelectionAlert && outOfBoundsDirection) {
          setNotification(result.message);
        }
        return;
      }

      setIsSelecting(true);
      setSelectedRange(result.range);
      setNotification(null);
    };

    const handleSelectionMove = (date: Date): DateRange => {
      // If we're not in selecting mode, don't process move events
      if (!isSelecting) {
        return selectedRange;
      }

      // Get updated selection with boundary restrictions
      const selectionUpdate = selectionManager.updateSelection(
        selectedRange,
        date
      );

      // Update the selection range with the result
      setSelectedRange(selectionUpdate.range);

      // Show notification only if there's a message and we have showSelectionAlert enabled
      if (selectionUpdate.message && showSelectionAlert) {
        setNotification(selectionUpdate.message);
      } else {
        setNotification(null);
      }

      return selectionUpdate.range;
    };

    return {
      handleSelectionStart,
      handleSelectionMove
    };
  }

  /**
   * Create handlers for calendar actions (clear, submit, layer change)
   */
  static createCalendarActionHandlers(
    setSelectedRange: (range: DateRange) => void,
    setDateInputContext: (context: DateInputContext) => void,
    setIsSelecting: (isSelecting: boolean) => void,
    setValidationErrors: (errors: Record<string, ValidationError>) => void,
    setCurrentMonth: (month: Date) => void,
    setIsOpen: (isOpen: boolean) => void,
    setActiveLayer: (layerId: string) => void,
    selectedRange: DateRange,
    onSubmit?: (startDate: string, endDate: string) => void,
    closeOnClickAway?: boolean
  ) {
    const handleClear = () => {
      // Reset range and context
      setSelectedRange({ start: null, end: null });
      setDateInputContext({ startDate: null, endDate: null, currentField: null });

      // Reset selection states
      setIsSelecting(false);

      // Reset validation
      setValidationErrors({});

      // Reset to current month view
      const currentDate = startOfMonth(new Date());
      setCurrentMonth(currentDate);
    };

    const handleSubmit = () => {
      // If we have a valid range and onSubmit handler, call it directly
      if (selectedRange.start && selectedRange.end && onSubmit) {
        onSubmit(selectedRange.start, selectedRange.end);
      }

      // Close the calendar
      setIsOpen(false);
      setIsSelecting(false);
    };

    const handleClickOutside = () => {
      if (closeOnClickAway) {
        setIsOpen(false);
        setIsSelecting(false);
      }
    };

    const handleLayerChange = (layerId: string) => {
      setActiveLayer(layerId);
    };

    return {
      handleClear,
      handleSubmit,
      handleClickOutside,
      handleLayerChange
    };
  }
} 