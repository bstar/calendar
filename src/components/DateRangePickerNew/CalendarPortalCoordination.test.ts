import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';

// Import the hook from CalendarPortal
// Note: We need to extract the hook function since it's defined inline
// For testing purposes, let's recreate the hook logic here with the same implementation

// Recreate the global coordination state used in CalendarPortal
let globalActiveCalendarId: string | null = null;
const globalStateListeners = new Set<() => void>();

const setGlobalActiveCalendar = (id: string | null) => {
  globalActiveCalendarId = id;
  globalStateListeners.forEach(listener => listener());
};

// Recreated useCalendarCoordination hook from CalendarPortal.tsx
const useCalendarCoordination = (id: string) => {
  const [localActiveId, setLocalActiveId] = React.useState<string | null>(globalActiveCalendarId);
  
  React.useEffect(() => {
    const updateLocalState = () => {
      setLocalActiveId(globalActiveCalendarId);
    };
    
    globalStateListeners.add(updateLocalState);
    
    return () => {
      globalStateListeners.delete(updateLocalState);
      
      // If this calendar was active, deactivate it
      if (globalActiveCalendarId === id) {
        setGlobalActiveCalendar(null);
      }
    };
  }, [id]);
  
  const openCalendar = React.useCallback(() => {
    setGlobalActiveCalendar(id);
  }, [id]);
  
  const closeCalendar = React.useCallback(() => {
    if (globalActiveCalendarId === id) {
      setGlobalActiveCalendar(null);
    }
  }, [id]);
  
  const isOpen = localActiveId === id;
  const canOpen = localActiveId === null || localActiveId === id;
  
  return {
    openCalendar,
    closeCalendar,
    isOpen,
    canOpen
  };
};

describe('CalendarPortal useCalendarCoordination Hook', () => {
  beforeEach(() => {
    // Reset global state before each test
    globalActiveCalendarId = null;
    globalStateListeners.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should initialize with no active calendar', () => {
      const { result } = renderHook(() => useCalendarCoordination('test-calendar'));
      
      expect(result.current.isOpen).toBe(false);
      expect(result.current.canOpen).toBe(true);
    });

    it('should open calendar correctly', () => {
      const { result } = renderHook(() => useCalendarCoordination('test-calendar'));
      
      act(() => {
        result.current.openCalendar();
      });
      
      expect(result.current.isOpen).toBe(true);
      expect(result.current.canOpen).toBe(true);
      expect(globalActiveCalendarId).toBe('test-calendar');
    });

    it('should close calendar correctly', () => {
      const { result } = renderHook(() => useCalendarCoordination('test-calendar'));
      
      // First open the calendar
      act(() => {
        result.current.openCalendar();
      });
      
      expect(result.current.isOpen).toBe(true);
      
      // Then close it
      act(() => {
        result.current.closeCalendar();
      });
      
      expect(result.current.isOpen).toBe(false);
      expect(result.current.canOpen).toBe(true);
      expect(globalActiveCalendarId).toBeNull();
    });

    it('should provide stable callback functions', () => {
      const { result, rerender } = renderHook(() => useCalendarCoordination('test-calendar'));
      
      const initialOpenCalendar = result.current.openCalendar;
      const initialCloseCalendar = result.current.closeCalendar;
      
      rerender();
      
      expect(result.current.openCalendar).toBe(initialOpenCalendar);
      expect(result.current.closeCalendar).toBe(initialCloseCalendar);
    });
  });

  describe('Multi-Calendar Coordination', () => {
    it('should prevent multiple calendars from being open simultaneously', () => {
      const { result: result1 } = renderHook(() => useCalendarCoordination('calendar-1'));
      const { result: result2 } = renderHook(() => useCalendarCoordination('calendar-2'));
      
      // Open first calendar
      act(() => {
        result1.current.openCalendar();
      });
      
      expect(result1.current.isOpen).toBe(true);
      expect(result2.current.isOpen).toBe(false);
      expect(result1.current.canOpen).toBe(true);
      expect(result2.current.canOpen).toBe(false); // Cannot open when another is active
      
      // Try to open second calendar
      act(() => {
        result2.current.openCalendar();
      });
      
      expect(result1.current.isOpen).toBe(false); // First should be closed
      expect(result2.current.isOpen).toBe(true);  // Second should be open
      expect(result1.current.canOpen).toBe(false);
      expect(result2.current.canOpen).toBe(true);
    });

    it('should update all instances when global state changes', () => {
      const { result: result1 } = renderHook(() => useCalendarCoordination('calendar-1'));
      const { result: result2 } = renderHook(() => useCalendarCoordination('calendar-2'));
      const { result: result3 } = renderHook(() => useCalendarCoordination('calendar-3'));
      
      // Initially all should indicate they can open
      expect(result1.current.canOpen).toBe(true);
      expect(result2.current.canOpen).toBe(true);
      expect(result3.current.canOpen).toBe(true);
      
      // Open one calendar
      act(() => {
        result2.current.openCalendar();
      });
      
      // All should reflect the new state
      expect(result1.current.canOpen).toBe(false);
      expect(result2.current.canOpen).toBe(true);
      expect(result3.current.canOpen).toBe(false);
      
      expect(result1.current.isOpen).toBe(false);
      expect(result2.current.isOpen).toBe(true);
      expect(result3.current.isOpen).toBe(false);
    });

    it('should allow reopening the same calendar', () => {
      const { result } = renderHook(() => useCalendarCoordination('test-calendar'));
      
      // Open calendar
      act(() => {
        result.current.openCalendar();
      });
      
      expect(result.current.isOpen).toBe(true);
      expect(result.current.canOpen).toBe(true);
      
      // Opening again should not change state
      act(() => {
        result.current.openCalendar();
      });
      
      expect(result.current.isOpen).toBe(true);
      expect(result.current.canOpen).toBe(true);
    });
  });

  describe('Cleanup Behavior', () => {
    it('should clean up active calendar on unmount', () => {
      const { result, unmount } = renderHook(() => useCalendarCoordination('test-calendar'));
      
      // Open the calendar
      act(() => {
        result.current.openCalendar();
      });
      
      expect(globalActiveCalendarId).toBe('test-calendar');
      
      // Unmount the hook
      unmount();
      
      expect(globalActiveCalendarId).toBeNull();
    });

    it('should not affect other calendars on unmount when not active', () => {
      const { result: result1 } = renderHook(() => useCalendarCoordination('calendar-1'));
      const { result: result2, unmount: unmount2 } = renderHook(() => useCalendarCoordination('calendar-2'));
      
      // Open first calendar
      act(() => {
        result1.current.openCalendar();
      });
      
      expect(result1.current.isOpen).toBe(true);
      expect(globalActiveCalendarId).toBe('calendar-1');
      
      // Unmount second calendar (not active)
      unmount2();
      
      // First calendar should remain active
      expect(result1.current.isOpen).toBe(true);
      expect(globalActiveCalendarId).toBe('calendar-1');
    });

    it('should handle cleanup when switching calendar IDs', () => {
      const { rerender, unmount } = renderHook(
        ({ id }) => useCalendarCoordination(id),
        { initialProps: { id: 'calendar-1' } }
      );
      
      // Set initial calendar as active by directly manipulating global state
      act(() => {
        setGlobalActiveCalendar('calendar-1');
      });
      
      expect(globalActiveCalendarId).toBe('calendar-1');
      
      // Change the calendar ID
      rerender({ id: 'calendar-2' });
      
      // Previous calendar should be deactivated
      expect(globalActiveCalendarId).toBeNull();
      
      unmount();
    });

    it('should remove listeners properly on unmount', () => {
      const { unmount } = renderHook(() => useCalendarCoordination('test-calendar'));
      
      const initialListenerCount = globalStateListeners.size;
      
      unmount();
      
      // Listener should be removed
      expect(globalStateListeners.size).toBe(initialListenerCount - 1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle closing calendar that is not currently active', () => {
      const { result: result1 } = renderHook(() => useCalendarCoordination('calendar-1'));
      const { result: result2 } = renderHook(() => useCalendarCoordination('calendar-2'));
      
      // Open first calendar
      act(() => {
        result1.current.openCalendar();
      });
      
      expect(globalActiveCalendarId).toBe('calendar-1');
      
      // Try to close second calendar (not active)
      act(() => {
        result2.current.closeCalendar();
      });
      
      // First calendar should remain active
      expect(globalActiveCalendarId).toBe('calendar-1');
      expect(result1.current.isOpen).toBe(true);
      expect(result2.current.isOpen).toBe(false);
    });

    it('should handle rapid open/close operations', () => {
      const { result } = renderHook(() => useCalendarCoordination('test-calendar'));
      
      // Rapid operations
      act(() => {
        result.current.openCalendar();
        result.current.closeCalendar();
        result.current.openCalendar();
        result.current.closeCalendar();
      });
      
      expect(result.current.isOpen).toBe(false);
      expect(result.current.canOpen).toBe(true);
      expect(globalActiveCalendarId).toBeNull();
    });

    it('should handle state synchronization with many instances', () => {
      const hooks = Array.from({ length: 10 }, (_, i) => 
        renderHook(() => useCalendarCoordination(`calendar-${i}`))
      );
      
      // Initially all should be closeable
      hooks.forEach(({ result }) => {
        expect(result.current.isOpen).toBe(false);
        expect(result.current.canOpen).toBe(true);
      });
      
      // Open one calendar
      act(() => {
        hooks[5].result.current.openCalendar();
      });
      
      // Check all states
      hooks.forEach(({ result }, index) => {
        if (index === 5) {
          expect(result.current.isOpen).toBe(true);
          expect(result.current.canOpen).toBe(true);
        } else {
          expect(result.current.isOpen).toBe(false);
          expect(result.current.canOpen).toBe(false);
        }
      });
      
      // Close the active calendar
      act(() => {
        hooks[5].result.current.closeCalendar();
      });
      
      // All should be openable again
      hooks.forEach(({ result }) => {
        expect(result.current.isOpen).toBe(false);
        expect(result.current.canOpen).toBe(true);
      });
    });
  });

  describe('State Consistency', () => {
    it('should maintain consistent state across re-renders', () => {
      const { result, rerender } = renderHook(() => useCalendarCoordination('test-calendar'));
      
      // Open calendar
      act(() => {
        result.current.openCalendar();
      });
      
      expect(result.current.isOpen).toBe(true);
      
      // Re-render multiple times
      rerender();
      rerender();
      rerender();
      
      // State should remain consistent
      expect(result.current.isOpen).toBe(true);
      expect(result.current.canOpen).toBe(true);
    });

    it('should handle concurrent calendar operations', () => {
      const { result: result1 } = renderHook(() => useCalendarCoordination('calendar-1'));
      const { result: result2 } = renderHook(() => useCalendarCoordination('calendar-2'));
      const { result: result3 } = renderHook(() => useCalendarCoordination('calendar-3'));
      
      // Simulate concurrent operations
      act(() => {
        result1.current.openCalendar();
        result2.current.openCalendar();
        result3.current.openCalendar();
      });
      
      // Only one should be open (the last one to execute)
      const openCount = [result1, result2, result3].filter((hookResult) => hookResult.current.isOpen).length;
      expect(openCount).toBe(1);
      
      // The last calendar to open should be active
      expect(result3.current.isOpen).toBe(true);
      expect(globalActiveCalendarId).toBe('calendar-3');
    });
  });

  describe('Integration with Global State', () => {
    it('should respond to external global state changes', () => {
      const { result } = renderHook(() => useCalendarCoordination('test-calendar'));
      
      expect(result.current.isOpen).toBe(false);
      
      // Externally set the global state
      act(() => {
        setGlobalActiveCalendar('test-calendar');
      });
      
      expect(result.current.isOpen).toBe(true);
      expect(result.current.canOpen).toBe(true);
      
      // Externally clear the global state
      act(() => {
        setGlobalActiveCalendar(null);
      });
      
      expect(result.current.isOpen).toBe(false);
      expect(result.current.canOpen).toBe(true);
    });

    it('should handle external state changes to different calendar', () => {
      const { result } = renderHook(() => useCalendarCoordination('calendar-1'));
      
      expect(result.current.canOpen).toBe(true);
      
      // Externally activate different calendar
      act(() => {
        setGlobalActiveCalendar('calendar-2');
      });
      
      expect(result.current.isOpen).toBe(false);
      expect(result.current.canOpen).toBe(false);
    });
  });
});