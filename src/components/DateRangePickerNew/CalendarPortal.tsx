import React, { useEffect, useState, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
  isOpen: boolean;
  triggerRef: React.RefObject<HTMLElement>;
  onClose?: () => void;
  portalClassName?: string;
  portalStyle?: React.CSSProperties;
}

/**
 * CalendarPortal component renders its children in a portal attached to document.body
 * 
 * This helps avoid CSS selector hierarchy issues when the calendar is used within complex layouts
 * 
 * @param children - The content to render in the portal
 * @param isOpen - Whether the portal should be visible
 * @param triggerRef - Reference to the element that triggered the portal
 * @param onClose - Optional callback when the portal should be closed
 * @param portalClassName - Optional class name for the portal container
 * @param portalStyle - Optional inline styles for the portal container
 */
export const CalendarPortal: React.FC<PortalProps> = ({
  children,
  isOpen,
  triggerRef,
  onClose,
  portalClassName = 'cla-calendar-portal',
  portalStyle = {}
}) => {
  const [portalElement, setPortalElement] = useState<HTMLDivElement | null>(null);
  const portalRef = useRef<HTMLDivElement | null>(null);
  
  // Create portal element when component mounts
  useEffect(() => {
    const element = document.createElement('div');
    element.className = portalClassName;
    document.body.appendChild(element);
    setPortalElement(element);
    portalRef.current = element;
    
    return () => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    };
  }, [portalClassName]);
  
  // Update portal position when it's open or the trigger ref changes
  const updatePosition = useCallback(() => {
    if (!portalElement || !triggerRef.current) {
      return;
    }

    // Only update if the portal is actually visible
    if (!portalElement.offsetParent) {
      return;
    }

    // Get dimensions
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const portalHeight = portalElement.offsetHeight;
    const portalWidth = portalElement.offsetWidth;

    // Viewport dimensions
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Determine position strategy (above or below the trigger)
    let topPosition = 0;
    const spaceBelow = viewportHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;

    // Check if we have enough space below, if not try above
    if (spaceBelow >= portalHeight || spaceBelow > spaceAbove) {
      // Position below
      topPosition = triggerRect.bottom + 8;
    } else {
      // Position above
      topPosition = Math.max(8, triggerRect.top - portalHeight - 8);
    }

    // Calculate width and horizontal position
    const availableWidth = viewportWidth - 16; // 8px padding on each side
    const idealWidth = Math.max(triggerRect.width, portalWidth);
    const actualWidth = Math.min(idealWidth, availableWidth);

    // Center horizontally on the trigger element
    let leftPosition = triggerRect.left + (triggerRect.width - actualWidth) / 2;

    // Ensure the portal doesn't go off-screen horizontally
    if (leftPosition < 8) {
      leftPosition = 8;
    } else if (leftPosition + actualWidth > viewportWidth - 8) {
      leftPosition = viewportWidth - actualWidth - 8;
    }

    // Set styles
    const styles = {
      top: `${topPosition}px`,
      left: `${leftPosition}px`,
      width: `${actualWidth}px`,
      position: 'fixed',
      zIndex: 2147483647,
    } as React.CSSProperties;

    // Update styles
    if (portalElement) {
      Object.entries(styles).forEach(([key, value]) => {
        if (key && value !== undefined) {
          portalElement.style[key as any] = value as string;
        }
      });
    }
  }, [portalElement, triggerRef]);
  
  // Initial and delayed position updates
  useEffect(() => {
    updatePosition();
    // Also update after a short delay to account for any rendering latency
    const timeoutId = setTimeout(updatePosition, 50);
    return () => clearTimeout(timeoutId);
  }, [updatePosition, isOpen]);
  
  // Handle click outside to close the portal
  useEffect(() => {
    if (!isOpen || !onClose) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (
        portalRef.current && 
        !portalRef.current.contains(event.target as Node) && 
        triggerRef.current && 
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);
  
  // Add keyboard support (Escape to close)
  useEffect(() => {
    if (!isOpen || !onClose) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);
  
  // Apply custom styles to the portal
  useEffect(() => {
    if (portalElement && portalStyle) {
      Object.entries(portalStyle).forEach(([key, value]) => {
        if (key && value !== undefined) {
          portalElement.style[key as any] = value as string;
        }
      });
    }
  }, [portalElement, portalStyle]);

  if (!portalElement || !isOpen) return null;
  
  return ReactDOM.createPortal(
    <div 
      ref={portalRef}
      className="cla-calendar-portal-content" 
      style={{
        minHeight: '300px', // Force minimum height
        background: 'white',
        padding: '8px',
        boxSizing: 'border-box',
        overflow: 'visible'
      }}
    >
      {children || <div style={{ padding: '20px', color: 'red' }}>No calendar content provided!</div>}
    </div>,
    portalElement
  );
};

/**
 * Custom hook for managing the global state of calendar instances
 * Ensures only one calendar can be open at a time
 */
export const useCalendarCoordination = (id: string) => {
  // Store currently open calendar ID
  const [activeCalendarId, setActiveCalendarId] = useState<string | null>(null);
  
  // Keep track of all calendar IDs for coordination
  const [registeredCalendars, setRegisteredCalendars] = useState<string[]>([]);
  
  // Register this calendar instance
  useEffect(() => {
    setRegisteredCalendars(prev => [...prev, id]);
    return () => {
      setRegisteredCalendars(prev => prev.filter(calId => calId !== id));
      if (activeCalendarId === id) {
        setActiveCalendarId(null);
      }
    };
  }, [id, activeCalendarId]);
  
  const openCalendar = () => {
    setActiveCalendarId(id);
  };
  
  const closeCalendar = () => {
    if (activeCalendarId === id) {
      setActiveCalendarId(null);
    }
  };
  
  const isOpen = activeCalendarId === id;
  const canOpen = !activeCalendarId || activeCalendarId === id;
  
  return {
    openCalendar,
    closeCalendar,
    isOpen,
    canOpen
  };
}; 