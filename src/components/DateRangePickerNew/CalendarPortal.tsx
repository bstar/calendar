import React, { useEffect, useState, useRef } from 'react';
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
    element.setAttribute('data-debug', 'calendar-portal');
    
    // Add debug styling to make it very visible during development
    element.style.border = '3px solid red';
    element.style.backgroundColor = 'white';
    
    document.body.appendChild(element);
    setPortalElement(element);
    portalRef.current = element;
    
    console.log('Portal element created and added to DOM', element);
    
    // Clean up the portal element when component unmounts
    return () => {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
        console.log('Portal element removed from DOM');
      }
    };
  }, [portalClassName]);
  
  // Update portal position when it's open or the trigger ref changes
  useEffect(() => {
    if (!isOpen || !triggerRef.current || !portalElement) {
      console.log('Skipping position update, conditions not met:', { 
        isOpen, 
        hasTriggerRef: !!triggerRef.current, 
        hasPortalElement: !!portalElement 
      });
      return;
    }
    
    const updatePortalPosition = () => {
      if (!triggerRef.current || !portalElement) return;
      
      const triggerRect = triggerRef.current.getBoundingClientRect();
      console.log('Trigger element rect:', triggerRect);
      
      // Calculate position - default to appear below the trigger
      portalElement.style.position = 'fixed';
      portalElement.style.zIndex = '2147483647'; // Max z-index
      
      // Force visibility for debugging
      portalElement.style.display = 'block';
      portalElement.style.visibility = 'visible';
      portalElement.style.opacity = '1';
      
      // Position below the trigger element
      const topPosition = triggerRect.bottom + window.scrollY;
      
      // Check if there's enough space below, if not place it above
      const viewportHeight = window.innerHeight;
      const portalHeight = portalElement.offsetHeight || 300; // Default estimate if not rendered yet
      
      console.log('Portal dimensions:', {
        portalHeight,
        viewportHeight,
        topPosition,
        wouldOverflow: topPosition + portalHeight > viewportHeight + window.scrollY
      });
      
      if (topPosition + portalHeight > viewportHeight + window.scrollY && triggerRect.top > portalHeight) {
        // Not enough space below, position above the trigger if there's room
        console.log('Positioning portal ABOVE trigger');
        portalElement.style.top = `${triggerRect.top + window.scrollY - portalHeight}px`;
      } else {
        // Position below the trigger
        console.log('Positioning portal BELOW trigger');
        portalElement.style.top = `${topPosition}px`;
      }
      
      // Horizontal positioning - align with trigger and ensure it's within viewport
      const viewportWidth = window.innerWidth;
      // If no width is specified in portalStyle, use the trigger width
      let portalWidth;
      if (portalStyle.width && portalStyle.width !== 'auto') {
        portalWidth = parseFloat(portalStyle.width as string);
      } else {
        portalWidth = portalElement.offsetWidth || triggerRect.width;
      }
      
      console.log('Width calculation:', {
        portalWidth,
        viewportWidth,
        triggerWidth: triggerRect.width,
        styleWidth: portalStyle.width
      });
      
      // Default left position aligned with trigger
      let leftPosition = triggerRect.left + window.scrollX;
      
      // Check if the portal would extend beyond the right edge of the viewport
      if (leftPosition + portalWidth > viewportWidth + window.scrollX) {
        // Adjust to keep it within the viewport
        leftPosition = Math.max(0, viewportWidth + window.scrollX - portalWidth);
        console.log('Adjusting left position to fit viewport:', leftPosition);
      }
      
      portalElement.style.left = `${leftPosition}px`;
      portalElement.style.width = portalWidth ? `${portalWidth}px` : 'auto';
      
      // Add transition for smooth appearance
      portalElement.style.transition = 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out';
      
      console.log('Final portal position and styles:', {
        top: portalElement.style.top,
        left: portalElement.style.left,
        width: portalElement.style.width,
        display: portalElement.style.display,
        zIndex: portalElement.style.zIndex
      });
    };
    
    // Initial position update
    console.log('Running initial position update');
    updatePortalPosition();
    
    // Update position after a short delay to account for content rendering
    const delayedUpdate = setTimeout(() => {
      console.log('Running delayed position update');
      updatePortalPosition();
    }, 50);
    
    // Keep position updated on window resize or scroll
    window.addEventListener('resize', updatePortalPosition);
    window.addEventListener('scroll', updatePortalPosition, true);
    
    return () => {
      clearTimeout(delayedUpdate);
      window.removeEventListener('resize', updatePortalPosition);
      window.removeEventListener('scroll', updatePortalPosition, true);
    };
  }, [isOpen, triggerRef, portalElement, portalStyle]);
  
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
  
  // Add debug logging to check what's being rendered
  console.log('Rendering into portal:', { children, hasChildren: !!children });
  
  return ReactDOM.createPortal(
    <div 
      className="cla-calendar-portal-content" 
      data-debug="portal-content"
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