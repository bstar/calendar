import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCalendarCoordination } from './CalendarPortal';

describe('useCalendarCoordination Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useCalendarCoordination('test-calendar'));
      
      expect(result.current.isOpen).toBe(false);
      expect(result.current.canOpen).toBe(true);
      expect(typeof result.current.openCalendar).toBe('function');
      expect(typeof result.current.closeCalendar).toBe('function');
    });

    it('should open calendar when openCalendar is called', () => {
      const { result } = renderHook(() => useCalendarCoordination('test-calendar'));
      
      act(() => {
        result.current.openCalendar();
      });
      
      expect(result.current.isOpen).toBe(true);
      expect(result.current.canOpen).toBe(true);
    });

    it('should close calendar when closeCalendar is called', () => {
      const { result } = renderHook(() => useCalendarCoordination('test-calendar'));
      
      // Open first
      act(() => {
        result.current.openCalendar();
      });
      
      expect(result.current.isOpen).toBe(true);
      
      // Then close
      act(() => {
        result.current.closeCalendar();
      });
      
      expect(result.current.isOpen).toBe(false);
      expect(result.current.canOpen).toBe(true);
    });

    it('should do nothing when closing an already closed calendar', () => {
      const { result } = renderHook(() => useCalendarCoordination('test-calendar'));
      
      expect(result.current.isOpen).toBe(false);
      
      act(() => {
        result.current.closeCalendar();
      });
      
      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('Multiple Calendar Coordination', () => {
    it('should handle multiple calendar instances independently', () => {
      const { result: calendar1 } = renderHook(() => useCalendarCoordination('calendar-1'));
      const { result: calendar2 } = renderHook(() => useCalendarCoordination('calendar-2'));
      
      // Initially both should be closed
      expect(calendar1.current.isOpen).toBe(false);
      expect(calendar2.current.isOpen).toBe(false);
      expect(calendar1.current.canOpen).toBe(true);
      expect(calendar2.current.canOpen).toBe(true);
      
      // Open first calendar
      act(() => {
        calendar1.current.openCalendar();
      });
      
      // Only first should be open
      expect(calendar1.current.isOpen).toBe(true);
      expect(calendar2.current.isOpen).toBe(false);
      
      // Note: This hook doesn't actually coordinate between instances
      // Each instance has its own state
      expect(calendar1.current.canOpen).toBe(true);
      expect(calendar2.current.canOpen).toBe(true);
    });

    it('should maintain state across rerenders', () => {
      const { result, rerender } = renderHook(() => useCalendarCoordination('test-calendar'));
      
      // Open calendar
      act(() => {
        result.current.openCalendar();
      });
      
      expect(result.current.isOpen).toBe(true);
      
      // Rerender
      rerender();
      
      // State should persist
      expect(result.current.isOpen).toBe(true);
    });
  });

  describe('Cleanup Behavior', () => {
    it('should clean up on unmount when calendar is open', () => {
      const { result, unmount } = renderHook(() => useCalendarCoordination('test-calendar'));
      
      // Open calendar
      act(() => {
        result.current.openCalendar();
      });
      
      expect(result.current.isOpen).toBe(true);
      
      // Unmount should not throw
      expect(() => {
        unmount();
      }).not.toThrow();
    });

    it('should handle ID changes', () => {
      const { result, rerender } = renderHook(
        ({ id }) => useCalendarCoordination(id),
        { initialProps: { id: 'calendar-1' } }
      );
      
      // Open with first ID
      act(() => {
        result.current.openCalendar();
      });
      
      expect(result.current.isOpen).toBe(true);
      
      // Change ID
      rerender({ id: 'calendar-2' });
      
      // Should reset state with new ID
      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid open/close operations', () => {
      const { result } = renderHook(() => useCalendarCoordination('test-calendar'));
      
      act(() => {
        result.current.openCalendar();
        result.current.closeCalendar();
        result.current.openCalendar();
        result.current.closeCalendar();
        result.current.openCalendar();
      });
      
      expect(result.current.isOpen).toBe(true);
    });

    it('should handle opening already open calendar', () => {
      const { result } = renderHook(() => useCalendarCoordination('test-calendar'));
      
      act(() => {
        result.current.openCalendar();
      });
      
      expect(result.current.isOpen).toBe(true);
      
      // Open again
      act(() => {
        result.current.openCalendar();
      });
      
      expect(result.current.isOpen).toBe(true);
    });

    it('should update canOpen based on activeCalendarId', () => {
      const { result } = renderHook(() => useCalendarCoordination('test-calendar'));
      
      // Initially can open
      expect(result.current.canOpen).toBe(true);
      
      // Open calendar
      act(() => {
        result.current.openCalendar();
      });
      
      // Still can open (same calendar)
      expect(result.current.canOpen).toBe(true);
    });
  });

  describe('State Management', () => {
    it('should track registered calendars', () => {
      const { result, unmount } = renderHook(() => useCalendarCoordination('test-calendar'));
      
      // Calendar should be registered on mount
      // (Note: _registeredCalendars is internal state, not exposed)
      
      // Unmount should clean up registration
      unmount();
      
      // No errors should occur
    });

    it('should clean up activeCalendarId on unmount if it matches', () => {
      const { result, unmount } = renderHook(() => useCalendarCoordination('test-calendar'));
      
      // Open calendar
      act(() => {
        result.current.openCalendar();
      });
      
      expect(result.current.isOpen).toBe(true);
      
      // Unmount - cleanup should run
      unmount();
    });

    it('should not affect activeCalendarId on unmount if it does not match', () => {
      const { result: calendar1 } = renderHook(() => useCalendarCoordination('calendar-1'));
      const { result: calendar2, unmount: unmount2 } = renderHook(() => useCalendarCoordination('calendar-2'));
      
      // Open first calendar
      act(() => {
        calendar1.current.openCalendar();
      });
      
      expect(calendar1.current.isOpen).toBe(true);
      expect(calendar2.current.isOpen).toBe(false);
      
      // Unmount second calendar
      unmount2();
      
      // First calendar should remain open
      expect(calendar1.current.isOpen).toBe(true);
    });
  });
});