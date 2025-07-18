import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CLACalendarHandlers } from './CLACalendarHandlers';
import { DateRangeSelectionManager } from '../selection/DateRangeSelectionManager';
import { createDate } from '../../../utils/DateUtils';

// Mock the DateUtils module
vi.mock('../../../utils/DateUtils', async () => {
  const actual = await vi.importActual('../../../utils/DateUtils') as any;
  return {
    ...actual,
    format: vi.fn((date: Date, formatStr: string) => {
      if (formatStr === 'MMM dd, yyyy') {
        // Ensure UTC date formatting
        const options: Intl.DateTimeFormatOptions = { 
          month: 'short', 
          day: '2-digit', 
          year: 'numeric',
          timeZone: 'UTC'
        };
        return date.toLocaleDateString('en-US', options);
      }
      return date.toISOString();
    }),
    parseISO: vi.fn((dateStr: string) => new Date(dateStr)),
    startOfMonth: vi.fn((date: Date) => {
      const d = new Date(date);
      d.setUTCDate(1);
      d.setUTCHours(0, 0, 0, 0);
      return d;
    }),
    addMonths: vi.fn((date: Date, amount: number) => {
      const d = new Date(date);
      d.setUTCMonth(d.getUTCMonth() + amount);
      return d;
    }),
    createDate: actual.createDate // Include createDate from actual module
  };
});

describe('CLACalendarHandlers', () => {
  describe('createDateChangeHandler', () => {
    let mockSetSelectedRange: ReturnType<typeof vi.fn>;
    let mockSetDateInputContext: ReturnType<typeof vi.fn>;
    let mockSetValidationErrors: ReturnType<typeof vi.fn>;
    let mockSetCurrentMonth: ReturnType<typeof vi.fn>;
    let mockDateValidator: any;
    let handler: ReturnType<typeof CLACalendarHandlers.createDateChangeHandler>;

    beforeEach(() => {
      mockSetSelectedRange = vi.fn();
      mockSetDateInputContext = vi.fn();
      mockSetValidationErrors = vi.fn();
      mockSetCurrentMonth = vi.fn();
      mockDateValidator = {
        formatValue: vi.fn((date: Date) => date.toLocaleDateString()),
        validate: vi.fn(),
        parseValue: vi.fn(),
        DATE_FORMAT: 'MM/dd/yyyy'
      };

      handler = CLACalendarHandlers.createDateChangeHandler(
        { start: null, end: null },
        { startDate: null, endDate: null, currentField: null },
        mockSetSelectedRange,
        mockSetDateInputContext,
        mockSetValidationErrors,
        mockSetCurrentMonth,
        2,
        mockDateValidator
      );
    });

    it('should clear validation errors when isClearingError is true', () => {
      mockSetValidationErrors.mockImplementation(fn => {
        const result = fn({ start: { message: 'Error', type: 'date', field: 'start' } });
        expect(result).toEqual({});
      });

      handler('start')(null, true);
      expect(mockSetValidationErrors).toHaveBeenCalled();
    });

    it('should set validation error when provided', () => {
      const error = { message: 'Invalid date', type: 'format', field: 'start' };
      handler('start')(null, false, error);

      expect(mockSetValidationErrors).toHaveBeenCalledWith(expect.any(Function));
      // Simulate the function call to verify the result
      const updateFn = mockSetValidationErrors.mock.calls[0][0];
      const result = updateFn({});
      expect(result).toEqual({ start: error });
    });

    it('should update range and context for valid date', () => {
      const date = createDate(2025, 5, 15);
      handler('start')(date);

      expect(mockSetSelectedRange).toHaveBeenCalledWith({
        start: date.toISOString(),
        end: null
      });
      expect(mockSetDateInputContext).toHaveBeenCalledWith({
        startDate: mockDateValidator.formatValue(date),
        endDate: null,
        currentField: null
      });
      expect(mockSetValidationErrors).toHaveBeenCalledWith({});
    });

    it('should update calendar position for start date', () => {
      const date = createDate(2025, 5, 15);
      handler('start')(date);

      expect(mockSetCurrentMonth).toHaveBeenCalled();
      const monthArg = mockSetCurrentMonth.mock.calls[0][0];
      expect(monthArg.getUTCMonth()).toBe(5); // June
      expect(monthArg.getUTCDate()).toBe(1); // First of month
    });

    it('should update calendar position for end date', () => {
      const date = createDate(2025, 7, 20);
      handler('end')(date);

      expect(mockSetCurrentMonth).toHaveBeenCalled();
      const monthArg = mockSetCurrentMonth.mock.calls[0][0];
      expect(monthArg.getUTCMonth()).toBe(6); // July (one month back from August)
    });

    it('should handle null date', () => {
      handler('start')(null);

      expect(mockSetSelectedRange).toHaveBeenCalledWith({
        start: null,
        end: null
      });
      expect(mockSetDateInputContext).toHaveBeenCalledWith({
        startDate: null,
        endDate: null,
        currentField: null
      });
    });

    it('should handle visibleMonths greater than 6', () => {
      handler = CLACalendarHandlers.createDateChangeHandler(
        { start: null, end: null },
        { startDate: null, endDate: null, currentField: null },
        mockSetSelectedRange,
        mockSetDateInputContext,
        mockSetValidationErrors,
        mockSetCurrentMonth,
        10, // More than max of 6
        mockDateValidator
      );

      const date = createDate(2025, 5, 15);
      handler('end')(date);

      expect(mockSetCurrentMonth).toHaveBeenCalled();
      // Should use max of 6 visible months
      const monthArg = mockSetCurrentMonth.mock.calls[0][0];
      expect(monthArg.getUTCMonth()).toBe(0); // January (6 months back from June)
    });
  });

  describe('createMouseHandlers', () => {
    let containerRef: { current: HTMLDivElement | null };
    let mockSetOutOfBoundsDirection: ReturnType<typeof vi.fn>;
    let mockSetMousePosition: ReturnType<typeof vi.fn>;
    let handlers: ReturnType<typeof CLACalendarHandlers.createMouseHandlers>;

    beforeEach(() => {
      containerRef = {
        current: document.createElement('div')
      };
      Object.defineProperty(containerRef.current, 'getBoundingClientRect', {
        value: () => ({
          left: 100,
          right: 500,
          top: 50,
          bottom: 450
        })
      });

      mockSetOutOfBoundsDirection = vi.fn();
      mockSetMousePosition = vi.fn();

      handlers = CLACalendarHandlers.createMouseHandlers(
        containerRef,
        true,
        mockSetOutOfBoundsDirection,
        mockSetMousePosition
      );
    });

    it('should detect left boundary', () => {
      const event = {
        preventDefault: vi.fn(),
        clientX: 110, // Within 20px of left boundary
        clientY: 200
      } as any;

      handlers.handleMouseMove(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockSetMousePosition).toHaveBeenCalledWith({ x: 110, y: 200 });
      expect(mockSetOutOfBoundsDirection).toHaveBeenCalledWith('prev');
    });

    it('should detect right boundary', () => {
      const event = {
        preventDefault: vi.fn(),
        clientX: 490, // Within 20px of right boundary
        clientY: 200
      } as any;

      handlers.handleMouseMove(event);

      expect(mockSetOutOfBoundsDirection).toHaveBeenCalledWith('next');
    });

    it('should detect no boundary', () => {
      const event = {
        preventDefault: vi.fn(),
        clientX: 300, // Middle of container
        clientY: 200
      } as any;

      handlers.handleMouseMove(event);

      expect(mockSetOutOfBoundsDirection).toHaveBeenCalledWith(null);
    });

    it('should not process when not selecting', () => {
      handlers = CLACalendarHandlers.createMouseHandlers(
        containerRef,
        false, // Not selecting
        mockSetOutOfBoundsDirection,
        mockSetMousePosition
      );

      const event = {
        preventDefault: vi.fn(),
        clientX: 110,
        clientY: 200
      } as any;

      handlers.handleMouseMove(event);

      expect(mockSetOutOfBoundsDirection).not.toHaveBeenCalled();
      expect(mockSetMousePosition).not.toHaveBeenCalled();
    });

    it('should handle mouse leave to the left', () => {
      const event = {
        clientX: 50 // Left of container
      } as any;

      handlers.handleMouseLeave(event);

      expect(mockSetOutOfBoundsDirection).toHaveBeenCalledWith('prev');
    });

    it('should handle mouse leave to the right', () => {
      const event = {
        clientX: 550 // Right of container
      } as any;

      handlers.handleMouseLeave(event);

      expect(mockSetOutOfBoundsDirection).toHaveBeenCalledWith('next');
    });

    it('should not handle mouse leave when not selecting', () => {
      handlers = CLACalendarHandlers.createMouseHandlers(
        containerRef,
        false, // Not selecting
        mockSetOutOfBoundsDirection,
        mockSetMousePosition
      );

      const event = {
        clientX: 50
      } as any;

      handlers.handleMouseLeave(event);

      expect(mockSetOutOfBoundsDirection).not.toHaveBeenCalled();
    });
  });

  describe('createDocumentMouseHandlers', () => {
    let containerRef: { current: HTMLDivElement | null };
    let moveToMonthRef: { current: ((direction: 'prev' | 'next') => void) | null };
    let mockSetOutOfBoundsDirection: ReturnType<typeof vi.fn>;
    let mockSetMousePosition: ReturnType<typeof vi.fn>;
    let mockSetIsSelecting: ReturnType<typeof vi.fn>;
    let handlers: ReturnType<typeof CLACalendarHandlers.createDocumentMouseHandlers>;

    beforeEach(() => {
      containerRef = {
        current: document.createElement('div')
      };
      Object.defineProperty(containerRef.current, 'getBoundingClientRect', {
        value: () => ({
          left: 100,
          right: 500,
          top: 50,
          bottom: 450
        })
      });

      moveToMonthRef = {
        current: vi.fn()
      };

      mockSetOutOfBoundsDirection = vi.fn();
      mockSetMousePosition = vi.fn();
      mockSetIsSelecting = vi.fn();

      handlers = CLACalendarHandlers.createDocumentMouseHandlers(
        containerRef,
        true,
        null,
        mockSetOutOfBoundsDirection,
        mockSetMousePosition,
        moveToMonthRef,
        mockSetIsSelecting
      );
    });

    afterEach(() => {
      vi.clearAllTimers();
    });

    it('should handle document mouse move', () => {
      const event = {
        preventDefault: vi.fn(),
        clientX: 110,
        clientY: 200
      } as any;

      handlers.handleDocumentMouseMove(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockSetMousePosition).toHaveBeenCalledWith({ x: 110, y: 200 });
      expect(mockSetOutOfBoundsDirection).toHaveBeenCalledWith('prev');
    });

    it('should trigger month change when entering boundary', () => {
      vi.useFakeTimers();
      
      const event = {
        preventDefault: vi.fn(),
        clientX: 110,
        clientY: 200
      } as any;

      handlers.handleDocumentMouseMove(event);

      expect(moveToMonthRef.current).toHaveBeenCalledWith('prev');
      
      // Fast forward time to check interval
      vi.advanceTimersByTime(1000);
      expect(moveToMonthRef.current).toHaveBeenCalledTimes(2);
      
      vi.useRealTimers();
    });

    it('should handle mouse down', () => {
      // First ensure we're not already selecting
      handlers = CLACalendarHandlers.createDocumentMouseHandlers(
        containerRef,
        false, // Not selecting
        null,
        mockSetOutOfBoundsDirection,
        mockSetMousePosition,
        moveToMonthRef,
        mockSetIsSelecting
      );

      const event = {
        preventDefault: vi.fn()
      } as any;

      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      
      handlers.handleMouseDown(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(document.body.style.userSelect).toBe('none');
      expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
      
      addEventListenerSpy.mockRestore();
    });

    it('should not handle mouse down when already selecting', () => {
      handlers = CLACalendarHandlers.createDocumentMouseHandlers(
        containerRef,
        true, // Already selecting
        null,
        mockSetOutOfBoundsDirection,
        mockSetMousePosition,
        moveToMonthRef,
        mockSetIsSelecting
      );

      const event = {
        preventDefault: vi.fn()
      } as any;

      handlers.handleMouseDown(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('should handle mouse up', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      
      handlers.handleMouseUp();

      expect(mockSetIsSelecting).toHaveBeenCalledWith(false);
      expect(mockSetOutOfBoundsDirection).toHaveBeenCalledWith(null);
      expect(document.body.style.userSelect).toBe('');
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
    });
  });

  describe('createDisplayTextFormatter', () => {
    it('should format single date selection', () => {
      const formatter = CLACalendarHandlers.createDisplayTextFormatter(
        { start: '2025-06-15T00:00:00.000Z', end: null },
        'single'
      );

      expect(formatter()).toBe('Jun 15, 2025');
    });

    it('should format date range selection', () => {
      const formatter = CLACalendarHandlers.createDisplayTextFormatter(
        { start: '2025-06-15T00:00:00.000Z', end: '2025-06-20T00:00:00.000Z' },
        'range'
      );

      expect(formatter()).toBe('Jun 15, 2025 - Jun 20, 2025');
    });

    it('should use custom date formatter', () => {
      const customFormatter = vi.fn((date: Date) => `Custom: ${date.getFullYear()}`);
      const formatter = CLACalendarHandlers.createDisplayTextFormatter(
        { start: '2025-06-15T00:00:00.000Z', end: null },
        'single',
        customFormatter
      );

      expect(formatter()).toBe('Custom: 2025');
      expect(customFormatter).toHaveBeenCalled();
    });

    it('should use custom separator', () => {
      const formatter = CLACalendarHandlers.createDisplayTextFormatter(
        { start: '2025-06-15T00:00:00.000Z', end: '2025-06-20T00:00:00.000Z' },
        'range',
        undefined,
        ' to '
      );

      expect(formatter()).toBe('Jun 15, 2025 to Jun 20, 2025');
    });

    it('should return placeholder when no start date', () => {
      const formatter = CLACalendarHandlers.createDisplayTextFormatter(
        { start: null, end: null },
        'single'
      );

      expect(formatter()).toBe('Select date');
    });

    it('should format only start date when end is null in range mode', () => {
      const formatter = CLACalendarHandlers.createDisplayTextFormatter(
        { start: '2025-06-15T00:00:00.000Z', end: null },
        'range'
      );

      expect(formatter()).toBe('Jun 15, 2025');
    });
  });

  describe('createSelectionHandlers', () => {
    let mockSelectionManager: any;
    let mockSetIsSelecting: ReturnType<typeof vi.fn>;
    let mockSetSelectedRange: ReturnType<typeof vi.fn>;
    let mockSetNotification: ReturnType<typeof vi.fn>;
    let handlers: ReturnType<typeof CLACalendarHandlers.createSelectionHandlers>;

    beforeEach(() => {
      mockSelectionManager = {
        startSelection: vi.fn(),
        updateSelection: vi.fn()
      };
      mockSetIsSelecting = vi.fn();
      mockSetSelectedRange = vi.fn();
      mockSetNotification = vi.fn();

      handlers = CLACalendarHandlers.createSelectionHandlers(
        mockSelectionManager,
        false,
        mockSetIsSelecting,
        mockSetSelectedRange,
        mockSetNotification,
        true,
        { start: null, end: null },
        null
      );
    });

    it('should handle successful selection start', () => {
      const date = createDate(2025, 5, 15);
      mockSelectionManager.startSelection.mockReturnValue({
        success: true,
        range: { start: date.toISOString(), end: null },
        message: null
      });

      handlers.handleSelectionStart(date);

      expect(mockSetIsSelecting).toHaveBeenCalledWith(true);
      expect(mockSetSelectedRange).toHaveBeenCalledWith({
        start: date.toISOString(),
        end: null
      });
      expect(mockSetNotification).toHaveBeenCalledWith(null);
    });

    it('should handle failed selection start', () => {
      const date = createDate(2025, 5, 15);
      mockSelectionManager.startSelection.mockReturnValue({
        success: false,
        range: { start: null, end: null },
        message: 'Date is restricted'
      });

      handlers.handleSelectionStart(date);

      expect(mockSetIsSelecting).not.toHaveBeenCalled();
      expect(mockSetSelectedRange).not.toHaveBeenCalled();
    });

    it('should show notification on failed selection with out of bounds', () => {
      handlers = CLACalendarHandlers.createSelectionHandlers(
        mockSelectionManager,
        false,
        mockSetIsSelecting,
        mockSetSelectedRange,
        mockSetNotification,
        true,
        { start: null, end: null },
        'prev' // Out of bounds direction
      );

      const date = createDate(2025, 5, 15);
      mockSelectionManager.startSelection.mockReturnValue({
        success: false,
        range: { start: null, end: null },
        message: 'Date is restricted'
      });

      handlers.handleSelectionStart(date);

      expect(mockSetNotification).toHaveBeenCalledWith('Date is restricted');
    });

    it('should handle selection move when selecting', () => {
      handlers = CLACalendarHandlers.createSelectionHandlers(
        mockSelectionManager,
        true, // Currently selecting
        mockSetIsSelecting,
        mockSetSelectedRange,
        mockSetNotification,
        true,
        { start: '2025-06-15T00:00:00.000Z', end: null },
        null
      );

      const date = createDate(2025, 5, 20);
      mockSelectionManager.updateSelection.mockReturnValue({
        range: { start: '2025-06-15T00:00:00.000Z', end: date.toISOString() },
        message: null
      });

      const result = handlers.handleSelectionMove(date);

      expect(mockSetSelectedRange).toHaveBeenCalledWith({
        start: '2025-06-15T00:00:00.000Z',
        end: date.toISOString()
      });
      expect(result).toEqual({
        start: '2025-06-15T00:00:00.000Z',
        end: date.toISOString()
      });
    });

    it('should not handle selection move when not selecting', () => {
      const date = createDate(2025, 5, 20);
      const currentRange = { start: '2025-06-15T00:00:00.000Z', end: null };
      
      handlers = CLACalendarHandlers.createSelectionHandlers(
        mockSelectionManager,
        false, // Not selecting
        mockSetIsSelecting,
        mockSetSelectedRange,
        mockSetNotification,
        true,
        currentRange, // Pass the current range
        null
      );

      const result = handlers.handleSelectionMove(date);

      expect(mockSelectionManager.updateSelection).not.toHaveBeenCalled();
      expect(mockSetSelectedRange).not.toHaveBeenCalled();
      expect(result).toEqual(currentRange);
    });

    it('should show notification during selection move with message', () => {
      handlers = CLACalendarHandlers.createSelectionHandlers(
        mockSelectionManager,
        true,
        mockSetIsSelecting,
        mockSetSelectedRange,
        mockSetNotification,
        true, // showSelectionAlert enabled
        { start: '2025-06-15T00:00:00.000Z', end: null },
        null
      );

      const date = createDate(2025, 5, 20);
      mockSelectionManager.updateSelection.mockReturnValue({
        range: { start: '2025-06-15T00:00:00.000Z', end: date.toISOString() },
        message: 'Selection restricted'
      });

      handlers.handleSelectionMove(date);

      expect(mockSetNotification).toHaveBeenCalledWith('Selection restricted');
    });
  });

  describe('createCalendarActionHandlers', () => {
    let mockSetSelectedRange: ReturnType<typeof vi.fn>;
    let mockSetDateInputContext: ReturnType<typeof vi.fn>;
    let mockSetIsSelecting: ReturnType<typeof vi.fn>;
    let mockSetValidationErrors: ReturnType<typeof vi.fn>;
    let mockSetCurrentMonth: ReturnType<typeof vi.fn>;
    let mockSetIsOpen: ReturnType<typeof vi.fn>;
    let mockSetActiveLayer: ReturnType<typeof vi.fn>;
    let mockOnSubmit: ReturnType<typeof vi.fn>;
    let handlers: ReturnType<typeof CLACalendarHandlers.createCalendarActionHandlers>;

    beforeEach(() => {
      mockSetSelectedRange = vi.fn();
      mockSetDateInputContext = vi.fn();
      mockSetIsSelecting = vi.fn();
      mockSetValidationErrors = vi.fn();
      mockSetCurrentMonth = vi.fn();
      mockSetIsOpen = vi.fn();
      mockSetActiveLayer = vi.fn();
      mockOnSubmit = vi.fn();

      handlers = CLACalendarHandlers.createCalendarActionHandlers(
        mockSetSelectedRange,
        mockSetDateInputContext,
        mockSetIsSelecting,
        mockSetValidationErrors,
        mockSetCurrentMonth,
        mockSetIsOpen,
        mockSetActiveLayer,
        { start: '2025-06-15T00:00:00.000Z', end: '2025-06-20T00:00:00.000Z' },
        mockOnSubmit,
        true
      );
    });

    it('should handle clear action', () => {
      handlers.handleClear();

      expect(mockSetSelectedRange).toHaveBeenCalledWith({ start: null, end: null });
      expect(mockSetDateInputContext).toHaveBeenCalledWith({
        startDate: null,
        endDate: null,
        currentField: null
      });
      expect(mockSetIsSelecting).toHaveBeenCalledWith(false);
      expect(mockSetValidationErrors).toHaveBeenCalledWith({});
      expect(mockSetCurrentMonth).toHaveBeenCalled();
    });

    it('should handle submit action', () => {
      handlers.handleSubmit();

      expect(mockOnSubmit).toHaveBeenCalledWith(
        '2025-06-15T00:00:00.000Z',
        '2025-06-20T00:00:00.000Z'
      );
      expect(mockSetIsOpen).toHaveBeenCalledWith(false);
      expect(mockSetIsSelecting).toHaveBeenCalledWith(false);
    });

    it('should not call onSubmit if range is incomplete', () => {
      handlers = CLACalendarHandlers.createCalendarActionHandlers(
        mockSetSelectedRange,
        mockSetDateInputContext,
        mockSetIsSelecting,
        mockSetValidationErrors,
        mockSetCurrentMonth,
        mockSetIsOpen,
        mockSetActiveLayer,
        { start: '2025-06-15T00:00:00.000Z', end: null },
        mockOnSubmit,
        true
      );

      handlers.handleSubmit();

      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(mockSetIsOpen).toHaveBeenCalledWith(false);
    });

    it('should handle click outside when closeOnClickAway is true', () => {
      handlers.handleClickOutside();

      expect(mockSetIsOpen).toHaveBeenCalledWith(false);
      expect(mockSetIsSelecting).toHaveBeenCalledWith(false);
    });

    it('should not handle click outside when closeOnClickAway is false', () => {
      handlers = CLACalendarHandlers.createCalendarActionHandlers(
        mockSetSelectedRange,
        mockSetDateInputContext,
        mockSetIsSelecting,
        mockSetValidationErrors,
        mockSetCurrentMonth,
        mockSetIsOpen,
        mockSetActiveLayer,
        { start: null, end: null },
        undefined,
        false // closeOnClickAway false
      );

      handlers.handleClickOutside();

      expect(mockSetIsOpen).not.toHaveBeenCalled();
      expect(mockSetIsSelecting).not.toHaveBeenCalled();
    });

    it('should handle layer change', () => {
      handlers.handleLayerChange('holiday-layer');

      expect(mockSetActiveLayer).toHaveBeenCalledWith('holiday-layer');
    });
  });
});