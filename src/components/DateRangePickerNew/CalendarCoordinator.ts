/**
 * CalendarCoordinator is a global singleton manager for coordinating multiple
 * calendar instances on the same page to prevent UI conflicts.
 */

// Global registry to keep track of all active calendar instances
let activeCalendarId: string | null = null;
const registeredCalendars: Set<string> = new Set();
const listeners: Map<string, () => void> = new Map();

/**
 * Register a new calendar instance with the coordinator
 * @param id - Unique identifier for the calendar instance
 * @param onChange - Callback function when active status changes
 * @returns Object with methods to control the calendar
 */
export const registerCalendar = (id: string, onChange: () => void) => {
  registeredCalendars.add(id);
  listeners.set(id, onChange);
  
  return {
    /**
     * Open this calendar instance and close any other open calendars
     */
    open: () => {
      // Close any currently open calendar
      if (activeCalendarId && activeCalendarId !== id && listeners.has(activeCalendarId)) {
        listeners.get(activeCalendarId)?.();
      }
      
      activeCalendarId = id;
      
      // Notify listeners of the change
      listeners.forEach((callback, calendarId) => {
        if (calendarId !== id) {
          callback();
        }
      });
    },
    
    /**
     * Close this calendar instance if it's currently open
     */
    close: () => {
      if (activeCalendarId === id) {
        activeCalendarId = null;
      }
    },
    
    /**
     * Unregister this calendar instance when it's unmounted
     */
    unregister: () => {
      registeredCalendars.delete(id);
      listeners.delete(id);
      
      if (activeCalendarId === id) {
        activeCalendarId = null;
      }
    },
    
    /**
     * Check if this calendar instance is currently active/open
     */
    isActive: () => activeCalendarId === id,
    
    /**
     * Check if this calendar instance can be opened
     * (either it's already open or no other calendar is open)
     */
    canOpen: () => activeCalendarId === null || activeCalendarId === id
  };
};

/**
 * Custom hook for managing coordination between multiple calendar instances
 * @param id - Unique identifier for this calendar instance
 * @returns Object with methods to interact with the coordinator
 */
export const useCalendarCoordination = (id: string) => {
  return {
    /**
     * Register this calendar with the coordinator
     * @param onChange - Callback when active status changes
     */
    register: (onChange: () => void) => registerCalendar(id, onChange),
    
    /**
     * Check if any calendar is currently active
     */
    isAnyCalendarActive: () => activeCalendarId !== null,
    
    /**
     * Get the ID of the currently active calendar (if any)
     */
    getActiveCalendarId: () => activeCalendarId
  };
}; 