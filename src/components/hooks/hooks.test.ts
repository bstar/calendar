import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMonthNavigation, useRangeSelection, useMouseTracking } from './index';

describe('Custom Calendar Hooks', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('useMonthNavigation', () => {
    it('should initialize with current month by default', () => {
      const { result } = renderHook(() => useMonthNavigation());
      
      expect(result.current.currentMonth.getFullYear()).toBe(2025);
      expect(result.current.currentMonth.getUTCMonth()).toBe(5); // June (0-indexed)
      expect(result.current.isAnimating).toBe(false);
    });

    it('should initialize with provided initial month', () => {
      const initialMonth = new Date('2025-03-15');
      const { result } = renderHook(() => useMonthNavigation(initialMonth));
      
      expect(result.current.currentMonth.getFullYear()).toBe(2025);
      expect(result.current.currentMonth.getUTCMonth()).toBe(2); // March (0-indexed)
      expect(result.current.currentMonth.getUTCDate()).toBe(1); // startOfMonth
    });

    it('should provide three months (prev, current, next)', () => {
      const { result } = renderHook(() => useMonthNavigation());
      
      expect(result.current.months).toHaveLength(3);
      
      // Check order: previous, current, next
      const [prev, current, next] = result.current.months;
      expect(prev.getUTCMonth()).toBe(4); // May
      expect(current.getUTCMonth()).toBe(5); // June
      expect(next.getUTCMonth()).toBe(6); // July
    });

    it('should move to next month correctly with container', () => {
      const { result } = renderHook(() => useMonthNavigation());
      const mockContainer = document.createElement('div');
      Object.defineProperty(mockContainer, 'offsetWidth', { value: 300 });
      Object.defineProperty(mockContainer, 'offsetHeight', { value: 200 });
      Object.defineProperty(mockContainer, 'style', { 
        value: { transition: '', transform: '' },
        writable: true
      });
      result.current.monthsContainerRef.current = mockContainer;
      
      act(() => {
        result.current.moveToMonth('next');
      });
      
      expect(result.current.currentMonth.getUTCMonth()).toBe(6); // July
      expect(result.current.isAnimating).toBe(true);
    });

    it('should not move month without container', () => {
      const { result } = renderHook(() => useMonthNavigation());
      const initialMonth = result.current.currentMonth.getMonth();
      
      act(() => {
        result.current.moveToMonth('next');
      });
      
      // Should not change without container
      expect(result.current.currentMonth.getMonth()).toBe(initialMonth);
    });

    it('should handle year boundaries correctly', () => {
      const initialMonth = new Date('2025-01-15');
      const { result } = renderHook(() => useMonthNavigation(initialMonth));
      const mockContainer = document.createElement('div');
      Object.defineProperty(mockContainer, 'offsetWidth', { value: 300 });
      Object.defineProperty(mockContainer, 'style', { 
        value: { transition: '', transform: '' },
        writable: true
      });
      result.current.monthsContainerRef.current = mockContainer;
      
      // Move to previous month (should go to December of previous year)
      act(() => {
        result.current.moveToMonth('prev');
      });
      
      expect(result.current.currentMonth.getFullYear()).toBe(2024);
      expect(result.current.currentMonth.getUTCMonth()).toBe(11); // December
    });

    it('should handle cooldown period to prevent rapid month changes', () => {
      const { result } = renderHook(() => useMonthNavigation());
      const mockContainer = document.createElement('div');
      Object.defineProperty(mockContainer, 'offsetWidth', { value: 300 });
      Object.defineProperty(mockContainer, 'style', { 
        value: { transition: '', transform: '' },
        writable: true
      });
      result.current.monthsContainerRef.current = mockContainer;
      
      // First change should work
      act(() => {
        result.current.moveToMonth('next');
      });
      expect(result.current.canChangeMonth()).toBe(false);
      
      // After cooldown period, should work again
      act(() => {
        vi.advanceTimersByTime(1100); // 1.1 seconds
      });
      expect(result.current.canChangeMonth()).toBe(true);
    });

    it('should clear animation state after timeout', () => {
      const { result } = renderHook(() => useMonthNavigation());
      const mockContainer = document.createElement('div');
      Object.defineProperty(mockContainer, 'offsetWidth', { value: 300 });
      Object.defineProperty(mockContainer, 'style', { 
        value: { transition: '', transform: '' },
        writable: true
      });
      result.current.monthsContainerRef.current = mockContainer;
      
      act(() => {
        result.current.moveToMonth('next');
      });
      
      expect(result.current.isAnimating).toBe(true);
      
      // Animation should clear after animation duration (300ms)
      act(() => {
        vi.advanceTimersByTime(350); // Slightly more than 300ms
      });
      
      expect(result.current.isAnimating).toBe(false);
    });

    it('should handle invalid direction gracefully', () => {
      const { result } = renderHook(() => useMonthNavigation());
      const initialMonth = result.current.currentMonth;
      
      act(() => {
        result.current.moveToMonth('invalid' as any);
      });
      
      // Should not change month for invalid direction
      expect(result.current.currentMonth).toEqual(initialMonth);
    });

    it('should provide monthsContainerRef', () => {
      const { result } = renderHook(() => useMonthNavigation());
      
      expect(result.current.monthsContainerRef).toBeDefined();
      expect(result.current.monthsContainerRef.current).toBeNull(); // Initially null
    });
  });

  describe('useRangeSelection', () => {
    it('should initialize with empty selection', () => {
      const { result } = renderHook(() => useRangeSelection());
      
      expect(result.current.selectedRange.start).toBeNull();
      expect(result.current.selectedRange.end).toBeNull();
      expect(result.current.isSelecting).toBe(false);
      expect(result.current.isOutsideBounds).toBe(false);
    });

    it('should start selection correctly', () => {
      const { result } = renderHook(() => useRangeSelection());
      const startDate = new Date('2025-06-15T12:00:00.000Z');
      
      act(() => {
        result.current.handleSelectionStart(startDate);
      });
      
      expect(result.current.selectedRange.start).toBe(startDate.toISOString());
      expect(result.current.selectedRange.end).toBeNull();
      expect(result.current.isSelecting).toBe(true);
    });

    it('should update selection during move', () => {
      const { result } = renderHook(() => useRangeSelection());
      const startDate = new Date('2025-06-15T12:00:00.000Z');
      const endDate = new Date('2025-06-20T12:00:00.000Z');
      
      act(() => {
        result.current.handleSelectionStart(startDate);
      });
      
      act(() => {
        result.current.handleSelectionMove(endDate);
      });
      
      expect(result.current.selectedRange.start).toBe(startDate.toISOString());
      expect(result.current.selectedRange.end).toBe(endDate.toISOString());
    });

    it('should handle backward selection (end before start)', () => {
      const { result } = renderHook(() => useRangeSelection());
      const startDate = new Date('2025-06-20T12:00:00.000Z');
      const endDate = new Date('2025-06-15T12:00:00.000Z');
      
      act(() => {
        result.current.handleSelectionStart(startDate);
      });
      
      act(() => {
        result.current.handleSelectionMove(endDate);
      });
      
      // Hook swaps dates when end is before start
      expect(result.current.selectedRange.start).toBe(endDate.toISOString());
      expect(result.current.selectedRange.end).toBe(startDate.toISOString());
    });

    it('should end selection correctly', () => {
      const { result } = renderHook(() => useRangeSelection());
      const startDate = new Date('2025-06-15T12:00:00.000Z');
      const endDate = new Date('2025-06-20T12:00:00.000Z');
      
      act(() => {
        result.current.handleSelectionStart(startDate);
      });
      
      act(() => {
        result.current.handleSelectionMove(endDate);
      });
      
      act(() => {
        result.current.handleSelectionEnd();
      });
      
      expect(result.current.isSelecting).toBe(false);
      expect(result.current.selectedRange.start).toBe(startDate.toISOString());
      expect(result.current.selectedRange.end).toBe(endDate.toISOString());
    });

    it('should clear selection', () => {
      const { result } = renderHook(() => useRangeSelection());
      const startDate = new Date('2025-06-15T12:00:00.000Z');
      
      act(() => {
        result.current.handleSelectionStart(startDate);
      });
      
      act(() => {
        result.current.clearSelection();
      });
      
      expect(result.current.selectedRange.start).toBeNull();
      expect(result.current.selectedRange.end).toBeNull();
      expect(result.current.isSelecting).toBe(false);
    });

    it('should generate correct display text for single date', () => {
      const { result } = renderHook(() => useRangeSelection());
      const date = new Date('2025-06-15T12:00:00.000Z'); // Use same time as system time
      
      act(() => {
        result.current.handleSelectionStart(date);
      });
      
      act(() => {
        result.current.handleSelectionEnd();
      });
      
      const displayText = result.current.getDisplayText();
      expect(displayText).toBe('Jun 15, 2025');
    });

    it('should generate correct display text for date range', () => {
      const { result } = renderHook(() => useRangeSelection());
      const startDate = new Date('2025-06-15T12:00:00.000Z'); // Use same time as system time
      const endDate = new Date('2025-06-20T12:00:00.000Z');
      
      act(() => {
        result.current.handleSelectionStart(startDate);
      });
      
      act(() => {
        result.current.handleSelectionMove(endDate);
      });
      
      act(() => {
        result.current.handleSelectionEnd();
      });
      
      const displayText = result.current.getDisplayText();
      expect(displayText).toBe('Jun 15, 2025 to Jun 20, 2025');
    });

    it('should handle outside bounds tracking', () => {
      const { result } = renderHook(() => useRangeSelection());
      
      act(() => {
        result.current.setIsOutsideBounds(true);
      });
      
      expect(result.current.isOutsideBounds).toBe(true);
    });

    it('should handle selection move without active selection', () => {
      const { result } = renderHook(() => useRangeSelection());
      const date = new Date('2025-06-15T12:00:00.000Z');
      
      // Try to move selection without starting one
      act(() => {
        result.current.handleSelectionMove(date);
      });
      
      // Should not crash and maintain empty state
      expect(result.current.selectedRange.start).toBeNull();
      expect(result.current.selectedRange.end).toBeNull();
    });
  });

  describe('useMouseTracking', () => {
    const createMouseTrackingSetup = () => {
      const mockContainerRef = { current: document.createElement('div') };
      const mockCanChangeMonth = vi.fn(() => true);
      const mockMoveToMonth = vi.fn();
      
      return { mockContainerRef, mockCanChangeMonth, mockMoveToMonth };
    };

    it('should initialize with proper handlers', () => {
      const { mockContainerRef, mockCanChangeMonth, mockMoveToMonth } = createMouseTrackingSetup();
      const { result } = renderHook(() => 
        useMouseTracking(mockContainerRef, false, mockCanChangeMonth, mockMoveToMonth)
      );
      
      expect(result.current.handleMouseMove).toBeDefined();
      expect(result.current.handleMouseUp).toBeDefined();
      expect(result.current.handleMouseDown).toBeDefined();
    });

    it('should not track mouse when not selecting', () => {
      const { mockContainerRef, mockCanChangeMonth, mockMoveToMonth } = createMouseTrackingSetup();
      const { result } = renderHook(() => 
        useMouseTracking(mockContainerRef, false, mockCanChangeMonth, mockMoveToMonth)
      );
      
      const mockEvent = {
        clientX: 350,
        clientY: 150,
        preventDefault: vi.fn()
      } as unknown as MouseEvent;
      
      act(() => {
        result.current.handleMouseMove(mockEvent);
      });
      
      expect(mockMoveToMonth).not.toHaveBeenCalled();
    });

    it('should handle mouse down by preventing text selection', () => {
      const { mockContainerRef, mockCanChangeMonth, mockMoveToMonth } = createMouseTrackingSetup();
      const { result } = renderHook(() => 
        useMouseTracking(mockContainerRef, false, mockCanChangeMonth, mockMoveToMonth)
      );
      
      const mockEvent = {
        preventDefault: vi.fn()
      } as unknown as React.MouseEvent;
      
      act(() => {
        result.current.handleMouseDown(mockEvent);
      });
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should handle mouse up by restoring text selection', () => {
      const { mockContainerRef, mockCanChangeMonth, mockMoveToMonth } = createMouseTrackingSetup();
      const { result } = renderHook(() => 
        useMouseTracking(mockContainerRef, true, mockCanChangeMonth, mockMoveToMonth)
      );
      
      // Mock setAttribute method
      document.body.setAttribute = vi.fn();
      
      act(() => {
        result.current.handleMouseUp();
      });
      
      expect(document.body.setAttribute).toHaveBeenCalledWith(
        'style', 
        'user-select: auto; -webkit-user-select: auto;'
      );
    });

    it('should handle missing container ref gracefully', () => {
      const { mockCanChangeMonth, mockMoveToMonth } = createMouseTrackingSetup();
      const emptyRef = { current: null };
      
      const { result } = renderHook(() => 
        useMouseTracking(emptyRef, true, mockCanChangeMonth, mockMoveToMonth)
      );
      
      const mockEvent = {
        clientX: 350,
        clientY: 150,
        preventDefault: vi.fn()
      } as unknown as MouseEvent;
      
      act(() => {
        result.current.handleMouseMove(mockEvent);
      });
      
      // Should not crash and not call moveToMonth
      expect(mockMoveToMonth).not.toHaveBeenCalled();
    });

    it('should provide stable callback functions', () => {
      const { mockContainerRef, mockCanChangeMonth, mockMoveToMonth } = createMouseTrackingSetup();
      const { result, rerender } = renderHook(() => 
        useMouseTracking(mockContainerRef, false, mockCanChangeMonth, mockMoveToMonth)
      );
      
      const initialHandleMouseMove = result.current.handleMouseMove;
      const initialHandleMouseUp = result.current.handleMouseUp;
      const initialHandleMouseDown = result.current.handleMouseDown;
      
      rerender();
      
      expect(result.current.handleMouseMove).toBe(initialHandleMouseMove);
      expect(result.current.handleMouseUp).toBe(initialHandleMouseUp);
      expect(result.current.handleMouseDown).toBe(initialHandleMouseDown);
    });
  });

  describe('Hook Integration', () => {
    it('should work together for complete calendar functionality', () => {
      const { result: navResult } = renderHook(() => useMonthNavigation());
      const { result: selectionResult } = renderHook(() => useRangeSelection());
      const { result: trackingResult } = renderHook(() => 
        useMouseTracking(
          { current: document.createElement('div') },
          selectionResult.current.isSelecting,
          navResult.current.canChangeMonth,
          navResult.current.moveToMonth
        )
      );
      
      // Start a selection
      act(() => {
        selectionResult.current.handleSelectionStart(new Date('2025-06-15T12:00:00.000Z'));
      });
      
      expect(selectionResult.current.isSelecting).toBe(true);
      
      // Navigation should work
      expect(navResult.current.canChangeMonth()).toBe(true);
      
      // Tracking handlers should be available
      expect(trackingResult.current.handleMouseMove).toBeDefined();
      expect(trackingResult.current.handleMouseUp).toBeDefined();
      expect(trackingResult.current.handleMouseDown).toBeDefined();
    });
  });
});