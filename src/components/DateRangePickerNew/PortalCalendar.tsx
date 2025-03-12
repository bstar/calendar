import React, { useEffect, useRef, useCallback } from 'react';
import { CalendarPortal } from './CalendarPortal';
import { registerCalendar } from './CalendarCoordinator';
import { CalendarSettings } from '../DateRangePicker.config';
import './CalendarPortal.css';

// Simple counter for generating unique IDs
let calendarCounter = 0;

interface PortalCalendarProps {
  children: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  triggerRef: React.RefObject<HTMLElement>;
  settings: CalendarSettings;
  id?: string; // Optional ID provided by parent
}

/**
 * PortalCalendar component that wraps calendar content and renders it in a portal
 * when open. Handles coordination with other calendar instances.
 */
export const PortalCalendar: React.FC<PortalCalendarProps> = ({
  children,
  isOpen,
  onOpenChange,
  triggerRef,
  settings,
  id
}) => {
  // Use provided ID or generate a simple numerical ID
  const calendarIdRef = useRef<string>(id || `calendar-${++calendarCounter}`);
  
  // Reference to store coordinator controls
  const coordinatorRef = useRef<ReturnType<typeof registerCalendar> | null>(null);
  
  // Handle coordination with other calendars
  useEffect(() => {
    const handleStateChange = () => {
      // Only close if we're currently open
      if (isOpen && coordinatorRef.current && !coordinatorRef.current.isActive()) {
        onOpenChange(false);
      }
    };
    
    coordinatorRef.current = registerCalendar(calendarIdRef.current, handleStateChange);
    
    return () => {
      coordinatorRef.current?.unregister();
    };
  }, [isOpen, onOpenChange]);
  
  // Sync calendar open state with coordinator
  useEffect(() => {
    if (!coordinatorRef.current) return;
    
    if (isOpen) {
      coordinatorRef.current.open();
    } else if (coordinatorRef.current.isActive()) {
      coordinatorRef.current.close();
    }
  }, [isOpen]);
  
  // Handle closing the calendar
  const handleClose = useCallback(() => {
    if (settings.closeOnClickAway) {
      onOpenChange(false);
    }
  }, [onOpenChange, settings.closeOnClickAway]);
  
  // If the calendar is not supposed to be a popup, render it directly
  if (settings.displayMode === 'embedded') {
    return <>{children}</>;
  }
  
  // Otherwise, render in a portal when open
  return (
    <CalendarPortal
      isOpen={isOpen}
      triggerRef={triggerRef}
      onClose={handleClose}
      portalStyle={{
        maxWidth: `${settings.visibleMonths * settings.singleMonthWidth}px`,
        width: 'auto'
      }}
    >
      {children}
    </CalendarPortal>
  );
}; 