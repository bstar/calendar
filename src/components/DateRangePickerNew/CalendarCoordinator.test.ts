import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// We need to reset module state between tests by reimporting fresh instances
let registerCalendar: any;
let useCalendarCoordination: any;

describe('CalendarCoordinator', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    
    // Fresh import to reset module state
    const module = await import('./CalendarCoordinator');
    registerCalendar = module.registerCalendar;
    useCalendarCoordination = module.useCalendarCoordination;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('registerCalendar Function', () => {
    it('should register a calendar and return control methods', () => {
      const mockCallback = vi.fn();
      const calendar = registerCalendar('test-calendar', mockCallback);
      
      expect(calendar.open).toBeDefined();
      expect(calendar.close).toBeDefined();
      expect(calendar.unregister).toBeDefined();
      expect(calendar.isActive).toBeDefined();
      expect(calendar.canOpen).toBeDefined();
    });

    it('should initially allow calendar to open', () => {
      const mockCallback = vi.fn();
      const calendar = registerCalendar('test-calendar', mockCallback);
      
      expect(calendar.canOpen()).toBe(true);
      expect(calendar.isActive()).toBe(false);
    });

    it('should activate calendar when opened', () => {
      const mockCallback = vi.fn();
      const calendar = registerCalendar('test-calendar', mockCallback);
      
      calendar.open();
      
      expect(calendar.isActive()).toBe(true);
      expect(calendar.canOpen()).toBe(true);
    });

    it('should close calendar when close is called', () => {
      const mockCallback = vi.fn();
      const calendar = registerCalendar('test-calendar', mockCallback);
      
      calendar.open();
      expect(calendar.isActive()).toBe(true);
      
      calendar.close();
      expect(calendar.isActive()).toBe(false);
    });

    it('should close other calendars when opening a new one', () => {
      const mockCallback1 = vi.fn();
      const mockCallback2 = vi.fn();
      
      const calendar1 = registerCalendar('calendar-1', mockCallback1);
      const calendar2 = registerCalendar('calendar-2', mockCallback2);
      
      // Open first calendar
      calendar1.open();
      expect(calendar1.isActive()).toBe(true);
      expect(calendar2.isActive()).toBe(false);
      
      // Open second calendar - should close first
      calendar2.open();
      expect(calendar1.isActive()).toBe(false);
      expect(calendar2.isActive()).toBe(true);
      
      // First calendar's callback should have been called to notify it was closed
      expect(mockCallback1).toHaveBeenCalled();
    });

    it('should handle unregistration correctly', () => {
      const mockCallback = vi.fn();
      const calendar = registerCalendar('test-calendar', mockCallback);
      
      calendar.open();
      expect(calendar.isActive()).toBe(true);
      
      calendar.unregister();
      expect(calendar.isActive()).toBe(false);
    });

    it('should prevent opening when another calendar is active', () => {
      const mockCallback1 = vi.fn();
      const mockCallback2 = vi.fn();
      
      const calendar1 = registerCalendar('calendar-1', mockCallback1);
      const calendar2 = registerCalendar('calendar-2', mockCallback2);
      
      calendar1.open();
      
      expect(calendar1.canOpen()).toBe(true);
      expect(calendar2.canOpen()).toBe(false);
    });

    it('should handle multiple calendars coordination', () => {
      const calendars = [];
      const callbacks = [];
      
      // Register 3 calendars
      for (let i = 0; i < 3; i++) {
        const callback = vi.fn();
        callbacks.push(callback);
        calendars.push(registerCalendar(`calendar-${i}`, callback));
      }
      
      // Initially all should be able to open
      calendars.forEach(calendar => {
        expect(calendar.canOpen()).toBe(true);
        expect(calendar.isActive()).toBe(false);
      });
      
      // Open middle calendar
      calendars[1].open();
      expect(calendars[1].isActive()).toBe(true);
      
      // Others should not be able to open and should not be active
      expect(calendars[0].canOpen()).toBe(false);
      expect(calendars[0].isActive()).toBe(false);
      expect(calendars[2].canOpen()).toBe(false);
      expect(calendars[2].isActive()).toBe(false);
    });

    it('should handle rapid switching between calendars', () => {
      const mockCallback1 = vi.fn();
      const mockCallback2 = vi.fn();
      const mockCallback3 = vi.fn();
      
      const calendar1 = registerCalendar('calendar-1', mockCallback1);
      const calendar2 = registerCalendar('calendar-2', mockCallback2);
      const calendar3 = registerCalendar('calendar-3', mockCallback3);
      
      // Rapidly switch between calendars
      calendar1.open();
      calendar2.open();
      calendar3.open();
      calendar1.open();
      
      // Only the last opened should be active
      expect(calendar1.isActive()).toBe(true);
      expect(calendar2.isActive()).toBe(false);
      expect(calendar3.isActive()).toBe(false);
      
      // All callbacks except the active one should have been called
      expect(mockCallback1).toHaveBeenCalled(); // Called when calendar2 opened
      expect(mockCallback2).toHaveBeenCalled(); // Called when calendar3 opened
      expect(mockCallback3).toHaveBeenCalled(); // Called when calendar1 reopened
    });
  });

  describe('useCalendarCoordination Hook', () => {
    it('should provide coordination functions', () => {
      const { result } = renderHook(() => useCalendarCoordination('test-calendar'));
      
      expect(result.current.register).toBeDefined();
      expect(result.current.isAnyCalendarActive).toBeDefined();
      expect(result.current.getActiveCalendarId).toBeDefined();
    });

    it('should register calendar and track state', () => {
      const { result } = renderHook(() => useCalendarCoordination('test-calendar'));
      
      // Initially no calendar should be active
      expect(result.current.isAnyCalendarActive()).toBe(false);
      expect(result.current.getActiveCalendarId()).toBeNull();
      
      // Register and open calendar
      const mockCallback = vi.fn();
      const calendar = result.current.register(mockCallback);
      
      calendar.open();
      
      // Should now show as active
      expect(result.current.isAnyCalendarActive()).toBe(true);
      expect(result.current.getActiveCalendarId()).toBe('test-calendar');
    });

    it('should track state across multiple hook instances', () => {
      const { result: result1 } = renderHook(() => useCalendarCoordination('calendar-1'));
      const { result: result2 } = renderHook(() => useCalendarCoordination('calendar-2'));
      
      // Both should see no active calendar initially
      expect(result1.current.isAnyCalendarActive()).toBe(false);
      expect(result2.current.isAnyCalendarActive()).toBe(false);
      
      // Register and open first calendar
      const mockCallback1 = vi.fn();
      const calendar1 = result1.current.register(mockCallback1);
      calendar1.open();
      
      // Both should see calendar-1 as active
      expect(result1.current.isAnyCalendarActive()).toBe(true);
      expect(result1.current.getActiveCalendarId()).toBe('calendar-1');
      expect(result2.current.isAnyCalendarActive()).toBe(true);
      expect(result2.current.getActiveCalendarId()).toBe('calendar-1');
      
      // Register and open second calendar
      const mockCallback2 = vi.fn();
      const calendar2 = result2.current.register(mockCallback2);
      calendar2.open();
      
      // Both should see calendar-2 as active
      expect(result1.current.getActiveCalendarId()).toBe('calendar-2');
      expect(result2.current.getActiveCalendarId()).toBe('calendar-2');
    });

    it('should provide consistent function behavior', () => {
      const { result, rerender } = renderHook(() => useCalendarCoordination('test-calendar'));
      
      // Functions should be defined and work consistently
      expect(typeof result.current.register).toBe('function');
      expect(typeof result.current.isAnyCalendarActive).toBe('function');
      expect(typeof result.current.getActiveCalendarId).toBe('function');
      
      rerender();
      
      // Functions should still be defined after re-render
      expect(typeof result.current.register).toBe('function');
      expect(typeof result.current.isAnyCalendarActive).toBe('function');
      expect(typeof result.current.getActiveCalendarId).toBe('function');
    });
  });

  describe('Integration Tests', () => {
    it('should coordinate between function and hook usage', () => {
      // Use function-based registration
      const directCallback = vi.fn();
      const directCalendar = registerCalendar('direct-calendar', directCallback);
      
      // Use hook-based registration
      const { result } = renderHook(() => useCalendarCoordination('hook-calendar'));
      const hookCallback = vi.fn();
      const hookCalendar = result.current.register(hookCallback);
      
      // Open direct calendar
      directCalendar.open();
      expect(directCalendar.isActive()).toBe(true);
      expect(hookCalendar.isActive()).toBe(false);
      expect(result.current.getActiveCalendarId()).toBe('direct-calendar');
      
      // Open hook calendar
      hookCalendar.open();
      expect(directCalendar.isActive()).toBe(false);
      expect(hookCalendar.isActive()).toBe(true);
      expect(result.current.getActiveCalendarId()).toBe('hook-calendar');
      
      // Direct calendar should have been notified
      expect(directCallback).toHaveBeenCalled();
    });

    it('should handle calendar lifecycle properly', () => {
      const mockCallback1 = vi.fn();
      const mockCallback2 = vi.fn();
      
      const calendar1 = registerCalendar('calendar-1', mockCallback1);
      const calendar2 = registerCalendar('calendar-2', mockCallback2);
      
      // Open first calendar
      calendar1.open();
      expect(calendar1.isActive()).toBe(true);
      
      // Unregister first calendar while active
      calendar1.unregister();
      expect(calendar1.isActive()).toBe(false);
      
      // Second calendar should now be able to open
      expect(calendar2.canOpen()).toBe(true);
      calendar2.open();
      expect(calendar2.isActive()).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle opening already active calendar', () => {
      const mockCallback = vi.fn();
      const calendar = registerCalendar('test-calendar', mockCallback);
      
      calendar.open();
      expect(calendar.isActive()).toBe(true);
      
      // Opening again should not cause issues
      calendar.open();
      expect(calendar.isActive()).toBe(true);
    });

    it('should handle closing inactive calendar', () => {
      const mockCallback = vi.fn();
      const calendar = registerCalendar('test-calendar', mockCallback);
      
      // Close without opening
      calendar.close();
      expect(calendar.isActive()).toBe(false);
      
      // Should not cause issues
      calendar.close();
      expect(calendar.isActive()).toBe(false);
    });

    it('should handle unregistering inactive calendar', () => {
      const mockCallback = vi.fn();
      const calendar = registerCalendar('test-calendar', mockCallback);
      
      expect(() => {
        calendar.unregister();
      }).not.toThrow();
      
      expect(calendar.isActive()).toBe(false);
    });

    it('should handle callback errors by propagating them', () => {
      const faultyCallback = vi.fn(() => {
        throw new Error('Callback error');
      });
      const normalCallback = vi.fn();
      
      const faultyCalendar = registerCalendar('faulty', faultyCallback);
      const normalCalendar = registerCalendar('normal', normalCallback);
      
      // Open faulty calendar first
      faultyCalendar.open();
      expect(faultyCalendar.isActive()).toBe(true);
      
      // Open normal calendar - this will trigger the faulty callback and throw
      expect(() => {
        normalCalendar.open();
      }).toThrow('Callback error');
    });

    it('should handle same ID registration multiple times', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      const calendar1 = registerCalendar('same-id', callback1);
      const calendar2 = registerCalendar('same-id', callback2);
      
      calendar1.open();
      expect(calendar1.isActive()).toBe(true);
      expect(calendar2.isActive()).toBe(true); // Both think they're active
      
      // This creates an interesting edge case where both instances
      // think they control the same ID, which is expected behavior
      // since the real system should prevent duplicate IDs
    });
  });

  describe('Performance', () => {
    it('should handle many calendar registrations efficiently', () => {
      const calendars = [];
      const startTime = performance.now();
      
      // Register 100 calendars
      for (let i = 0; i < 100; i++) {
        const callback = vi.fn();
        calendars.push(registerCalendar(`calendar-${i}`, callback));
      }
      
      // Open one calendar
      calendars[50].open();
      
      const endTime = performance.now();
      
      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(10);
      expect(calendars[50].isActive()).toBe(true);
      
      // Other calendars should not be active
      const activeCount = calendars.filter(cal => cal.isActive()).length;
      expect(activeCount).toBe(1);
    });
  });
});