import { RefObject, MutableRefObject } from 'react';
import { format, parseISO, startOfMonth, addMonthsUTC } from '../../../utils/DateUtils';
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

export class CLACalendarHandlers {
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
          const newBaseMonth = startOfMonth(date, 'UTC');
          setCurrentMonth(newBaseMonth);
        } else {
          // For end date, we want it in the rightmost month
          const newBaseMonth = addMonthsUTC(startOfMonth(date, 'UTC'), -(validVisibleMonths - 1));
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
    setIsSelecting: (isSelecting: boolean) => void,
    enableOutOfBoundsScroll: boolean = false
  ) {
    const handleDocumentMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      if (!isSelecting || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const { clientX: mouseX, clientY: mouseY } = e;
      
      setMousePosition({ x: mouseX, y: mouseY });

      // Only handle out-of-bounds scrolling if enabled
      if (enableOutOfBoundsScroll) {
        const BOUNDARY_THRESHOLD = 20;
        
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

            // Store the interval ID in a safer way
            const mouseEvent = e as MouseEvent & { intervalId?: IntervalID };
            mouseEvent.intervalId = intervalId;
          }
        }
      }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
      if (isSelecting) return;
      e.preventDefault();

      const setUserSelectNone = () => {
        const styles = ['userSelect', 'webkitUserSelect', 'mozUserSelect', 'msUserSelect'] as const;
        styles.forEach(style => document.body.style[style as UserSelectProperty] = 'none');
      };

      setUserSelectNone();
      
      // Always attach document handlers during selection for proper drag tracking
      document.addEventListener("mousemove", handleDocumentMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    const handleMouseUp = () => {
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
    isSelectingRef: MutableRefObject<boolean>,
    setIsSelecting: (isSelecting: boolean) => void,
    setSelectedRange: (range: DateRange) => void,
    setNotification: (message: string | null) => void,
    showSelectionAlert: boolean,
    selectedRange: DateRange,
    outOfBoundsDirection: 'prev' | 'next' | null
  ) {
    const handleSelectionStart = (date: Date, isMouseDrag: boolean = false) => {
      const result = selectionManager.startSelection(date);

      if (!result.success) {
        if (showSelectionAlert && outOfBoundsDirection) {
          setNotification(result.message);
        }
        return;
      }

      // Only enter selecting state for mouse drag in range mode
      if (selectionManager.getSelectionMode() === 'single') {
        setSelectedRange(result.range);
        setNotification(null);
      } else {
        // Only set isSelecting for actual mouse drag, not keyboard selection
        if (isMouseDrag) {
          setIsSelecting(true);
          isSelectingRef.current = true;
          
          // Attach document handlers for drag tracking
          const setUserSelectNone = () => {
            const styles = ['userSelect', 'webkitUserSelect', 'mozUserSelect', 'msUserSelect'] as const;
            styles.forEach(style => document.body.style[style as any] = 'none');
          };
          setUserSelectNone();
          
          // Create handlers inline to ensure they have access to the current state
          const handleDocumentMouseMove = (e: MouseEvent) => {
            e.preventDefault();
            // The mouse move will be handled by MonthGrid's onMouseEnter
            // We just need to track that we're still dragging
          };
          
          const handleMouseUp = () => {
            setIsSelecting(false);
            isSelectingRef.current = false;
            
            // Restore user select
            const styles = ['userSelect', 'webkitUserSelect', 'mozUserSelect', 'msUserSelect'] as const;
            styles.forEach(style => {
              document.body.style[style as any] = '';
            });
            
            // Clean up event listeners
            document.removeEventListener('mousemove', handleDocumentMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };
          
          document.addEventListener('mousemove', handleDocumentMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        }
        setSelectedRange(result.range);
        setNotification(null);
      }
    };

    const handleSelectionMove = (date: Date, forceUpdate: boolean = false): DateRange => {
      // Only process move events if we're in selecting mode (mouse drag)
      // OR if it's a forced update (keyboard selection)
      if (!isSelectingRef.current && !forceUpdate) {
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
    closeOnClickAway?: boolean,
    submissionFormatter?: (date: Date) => string
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
      // Helper function to format dates for submission
      const formatForSubmission = (dateString: string) => {
        // If no formatter provided, return ISO format (backward compatibility)
        if (!submissionFormatter) return dateString;
        
        try {
          // Parse and format the date
          const date = parseISO(dateString);
          return submissionFormatter(date);
        } catch (error) {
          // If formatter throws, fall back to ISO format
          console.error('Error in submissionFormatter:', error);
          return dateString;
        }
      };

      // In range mode, if only start is selected (no drag), use it for both dates
      if (selectedRange.start && !selectedRange.end && onSubmit) {
        const formattedStart = formatForSubmission(selectedRange.start);
        onSubmit(formattedStart, formattedStart);
      } 
      // If we have a valid range and onSubmit handler, call it directly
      else if (selectedRange.start && selectedRange.end && onSubmit) {
        const formattedStart = formatForSubmission(selectedRange.start);
        const formattedEnd = formatForSubmission(selectedRange.end);
        onSubmit(formattedStart, formattedEnd);
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