/**
 * @fileoverview Calendar portal component for rendering popup calendars
 * 
 * This component creates a React portal that renders the calendar outside of the
 * normal DOM hierarchy, attached directly to document.body. This approach solves
 * several common issues:
 * - Prevents CSS inheritance issues from parent components
 * - Avoids z-index stacking context problems
 * - Ensures the calendar can overflow container boundaries
 * - Provides better positioning control for popup mode
 * 
 * The portal automatically positions itself relative to a trigger element and
 * includes smart positioning logic to keep the calendar visible within the viewport.
 * 
 * @module CalendarPortal
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';

/**
 * Props interface for the CalendarPortal component
 * @interface PortalProps
 * @property children - React nodes to render inside the portal
 * @property isOpen - Controls the visibility of the portal
 * @property triggerRef - Reference to the element that triggers the portal (e.g., input field)
 * @property onClose - Optional callback fired when the portal should close
 * @property portalClassName - CSS class name for the portal container
 * @property portalStyle - Inline styles for the portal container
 * @property position - Preferred position relative to the trigger element
 * @property dynamicPosition - Whether to automatically adjust position to fit in viewport
 * @property expectedWidth - Expected width of the portal content for positioning calculations
 */
interface PortalProps {
  children: React.ReactNode;
  isOpen: boolean;
  triggerRef: React.RefObject<HTMLElement>;
  onClose?: () => void;
  portalClassName?: string;
  portalStyle?: React.CSSProperties;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  dynamicPosition?: boolean;
  expectedWidth?: number;
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
  portalStyle = {},
  position = 'bottom-left',
  dynamicPosition = true,
  expectedWidth
}) => {
  const [portalElement, setPortalElement] = useState<HTMLDivElement | null>(null);
  const portalRef = useRef<HTMLDivElement | null>(null);
  const [isPositioned, setIsPositioned] = useState(false);

  // Create portal element when component mounts
  useEffect(() => {
    const element = document.createElement('div');
    element.className = portalClassName;
    
    // Portal element should always be fixed position
    element.style.position = 'fixed';
    element.style.zIndex = '2147483647';
    // Hide completely until positioned
    element.style.visibility = 'hidden';
    element.style.opacity = '0';
    // Add smooth transition for repositioning
    element.style.transition = 'top 0.2s ease-out, left 0.2s ease-out';
    
    document.body.appendChild(element);
    setPortalElement(element);
    portalRef.current = element;

    return () => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    };
  }, [portalClassName]); // Remove portalStyle dependency to prevent recreation
  
  // Reset positioning state when portal closes
  useEffect(() => {
    if (!isOpen && portalElement) {
      setIsPositioned(false);
      portalElement.style.visibility = 'hidden';
      portalElement.style.opacity = '0';
    }
  }, [isOpen, portalElement]);

  // Update portal position when it's open or the trigger ref changes
  const updatePosition = useCallback(() => {
    if (!portalElement || !triggerRef.current) {
      return;
    }

    // Skip the offsetParent check - we need to position even when hidden
    // The portal might have visibility: hidden initially but still needs positioning

    // Remove the check - always position relative to trigger
    // This ensures the portal is always anchored to the input

    // Get dimensions
    const triggerRect = triggerRef.current.getBoundingClientRect();
    // Try to get dimensions from the portal content first, then fallback
    const contentElement = portalElement.querySelector('.cla-calendar-portal-content') as HTMLElement;
    const portalHeight = contentElement?.offsetHeight || portalElement.offsetHeight || 400; // Fallback height
    // Use expected width if provided (for right-aligned positions)
    const portalWidth = expectedWidth || contentElement?.offsetWidth || portalElement.offsetWidth || 500;
    const PADDING = 8;


    let topPosition: number;
    let leftPosition: number;

    // If dynamic positioning is disabled, use the fixed position
    if (!dynamicPosition) {
      switch (position) {
        case 'bottom-left':
          topPosition = triggerRect.bottom + PADDING;
          leftPosition = triggerRect.left;
          break;
        case 'bottom-right':
          topPosition = triggerRect.bottom + PADDING;
          leftPosition = triggerRect.right - portalWidth;
          break;
        case 'top-left':
          topPosition = triggerRect.top - portalHeight - PADDING;
          leftPosition = triggerRect.left;
          break;
        case 'top-right':
          topPosition = triggerRect.top - portalHeight - PADDING;
          leftPosition = triggerRect.right - portalWidth;
          break;
      }
    } else {
      // Dynamic positioning - determine best position based on available space
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      const spaceBelow = viewportHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;
      
      // Vertical position - be more aggressive about switching to top
      // Switch to top if calendar would be cut off by more than 20px
      const wouldBeClipped = triggerRect.bottom + portalHeight + PADDING > viewportHeight - 20;
      
      if (wouldBeClipped && spaceAbove > spaceBelow) {
        // Position above
        topPosition = Math.max(PADDING, triggerRect.top - portalHeight - PADDING);
      } else if (spaceBelow >= portalHeight + PADDING) {
        // Position below - enough space
        topPosition = triggerRect.bottom + PADDING;
      } else if (spaceAbove >= portalHeight + PADDING) {
        // Position above - not enough space below
        topPosition = triggerRect.top - portalHeight - PADDING;
      } else {
        // Not enough space either way, position where there's more room
        if (spaceBelow > spaceAbove) {
          topPosition = triggerRect.bottom + PADDING;
        } else {
          topPosition = Math.max(PADDING, triggerRect.top - portalHeight - PADDING);
        }
      }
      
      // Horizontal position
      if (triggerRect.left + portalWidth <= viewportWidth - PADDING) {
        leftPosition = triggerRect.left;
      } else if (triggerRect.right - portalWidth >= PADDING) {
        leftPosition = triggerRect.right - portalWidth;
      } else {
        leftPosition = Math.max(PADDING, Math.min(viewportWidth - portalWidth - PADDING, triggerRect.left));
      }
    }

    // Apply styles directly using properties that are safe to set
    if (portalElement) {
      portalElement.style.top = `${topPosition}px`;
      portalElement.style.left = `${leftPosition}px`;
      // Don't set width here - let it be controlled by portalStyle
      portalElement.style.position = 'fixed';
      portalElement.style.zIndex = '2147483647';
      
      // Mark as positioned
      setIsPositioned(true);
      
      // Show the element now that it's positioned
      portalElement.style.visibility = 'visible';
      portalElement.style.opacity = '1';
    }
  }, [portalElement, triggerRef, portalStyle, position, dynamicPosition, expectedWidth]);

  // Initial and delayed position updates
  useEffect(() => {
    // For right-aligned positions, we need to wait for width to be applied
    const needsDelayedPositioning = position?.includes('right');
    
    if (!needsDelayedPositioning) {
      // Left-aligned positions can be calculated immediately
      updatePosition();
    }
    
    // Always do a delayed update to ensure proper dimensions
    const timeoutId = setTimeout(updatePosition, needsDelayedPositioning ? 10 : 50);
    return () => clearTimeout(timeoutId);
  }, [updatePosition, isOpen, portalStyle, position]); // Include portalStyle to react to position changes
  
  // Handle window resize for dynamic repositioning
  useEffect(() => {
    if (!isOpen || !dynamicPosition) return;
    
    const handleResize = () => {
      updatePosition();
    };
    
    // Debounce resize events for performance
    let resizeTimer: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleResize, 100);
    };
    
    window.addEventListener('resize', debouncedResize);
    // Also listen for scroll events in case the input moves
    window.addEventListener('scroll', debouncedResize, true);
    
    return () => {
      window.removeEventListener('resize', debouncedResize);
      window.removeEventListener('scroll', debouncedResize, true);
      clearTimeout(resizeTimer);
    };
  }, [isOpen, dynamicPosition, updatePosition]);
  
  // Use Intersection Observer to detect when calendar is cut off
  useEffect(() => {
    if (!isOpen || !dynamicPosition || !portalElement) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // If less than 95% of the calendar is visible, reposition
          if (entry.intersectionRatio < 0.95 && entry.intersectionRatio > 0) {
            updatePosition();
          }
        });
      },
      {
        root: null, // Use viewport as root
        rootMargin: '0px',
        threshold: [0.95, 1.0] // Check at 95% and 100% visibility
      }
    );
    
    // Start observing after a small delay to avoid initial positioning
    const observerTimer = setTimeout(() => {
      if (portalElement) {
        observer.observe(portalElement);
      }
    }, 100);
    
    return () => {
      clearTimeout(observerTimer);
      observer.disconnect();
    };
  }, [isOpen, dynamicPosition, portalElement, updatePosition]);

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
    if (!portalElement || !portalStyle) return;
    
    // Apply width immediately before positioning
    if (portalStyle.width && !isPositioned) {
      portalElement.style.width = portalStyle.width.toString();
    }

    // Apply each style individually in a type-safe way
    // This avoids any issues with trying to set read-only properties
    const applyStyle = (el: HTMLElement, styles: React.CSSProperties) => {
      // Safely apply common CSS properties
      if (styles.width) el.style.width = styles.width.toString();
      if (styles.height) el.style.height = styles.height.toString();
      if (styles.backgroundColor) el.style.backgroundColor = styles.backgroundColor;
      if (styles.color) el.style.color = styles.color;
      if (styles.padding) el.style.padding = styles.padding.toString();
      if (styles.margin) el.style.margin = styles.margin.toString();
      if (styles.border) el.style.border = styles.border.toString();
      if (styles.borderRadius) el.style.borderRadius = styles.borderRadius.toString();
      if (styles.boxShadow) el.style.boxShadow = styles.boxShadow.toString();
      // Only apply opacity if positioned
      if (styles.opacity && isPositioned) {
        el.style.opacity = styles.opacity.toString();
      }
      if (styles.transition) el.style.transition = styles.transition.toString();
      if (styles.transform) el.style.transform = styles.transform.toString();
      if (styles.display) el.style.display = styles.display;
      // Only apply visibility if element is positioned
      if (styles.visibility && isPositioned) {
        el.style.visibility = styles.visibility;
      }
      if (styles.pointerEvents) el.style.pointerEvents = styles.pointerEvents;
      // Always apply position styles if provided
      if (styles.position) el.style.position = styles.position;
      if (styles.top !== undefined) el.style.top = styles.top.toString();
      if (styles.right !== undefined) el.style.right = styles.right.toString();
      if (styles.bottom !== undefined) el.style.bottom = styles.bottom.toString();
      if (styles.left !== undefined) el.style.left = styles.left.toString();
      if (styles.zIndex) el.style.zIndex = styles.zIndex.toString();
    };

    applyStyle(portalElement, portalStyle);
  }, [portalElement, portalStyle, isPositioned]);

  if (!portalElement || !isOpen) return null;

  return ReactDOM.createPortal(
    <div
      ref={portalRef}
      className="cla-calendar-portal-content"
      style={{
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
  const [_registeredCalendars, setRegisteredCalendars] = useState<string[]>([]);

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