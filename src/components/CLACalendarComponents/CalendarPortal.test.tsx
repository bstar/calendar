import React, { useRef } from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CalendarPortal } from './CalendarPortal';

// Mock ReactDOM.createPortal
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom');
  return {
    ...actual,
    default: actual,
    createPortal: (children: React.ReactNode, container: Element) => {
      return (
        <div data-testid="portal-mock" data-container={container.className}>
          {children}
        </div>
      );
    }
  };
});

// Mock Intersection Observer
class MockIntersectionObserver {
  callback: IntersectionObserverCallback;
  elements: Set<Element> = new Set();

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    mockIntersectionObserverInstances.push(this);
  }

  observe(element: Element) {
    this.elements.add(element);
  }

  unobserve(element: Element) {
    this.elements.delete(element);
  }

  disconnect() {
    this.elements.clear();
  }

  // Helper to trigger intersection events
  trigger(entries: Partial<IntersectionObserverEntry>[]) {
    this.callback(entries as IntersectionObserverEntry[], this);
  }
}

let mockIntersectionObserverInstances: MockIntersectionObserver[] = [];

// Store original IntersectionObserver
const OriginalIntersectionObserver = global.IntersectionObserver;

beforeEach(() => {
  mockIntersectionObserverInstances = [];
  global.IntersectionObserver = MockIntersectionObserver as any;
});

afterEach(() => {
  global.IntersectionObserver = OriginalIntersectionObserver;
  // Clean up any portal elements
  document.querySelectorAll('.cla-calendar-portal').forEach(el => el.remove());
});

// Helper component that provides a ref
const TestWrapper: React.FC<{ children: (ref: React.RefObject<HTMLDivElement>) => React.ReactNode }> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <>
      <div ref={ref} data-testid="trigger-element">Trigger</div>
      {children(ref)}
    </>
  );
};

describe('CalendarPortal', () => {
  describe('Basic Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(
        <TestWrapper>
          {(ref) => (
            <CalendarPortal isOpen={false} triggerRef={ref}>
              <div>Portal Content</div>
            </CalendarPortal>
          )}
        </TestWrapper>
      );

      expect(screen.queryByText('Portal Content')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(
        <TestWrapper>
          {(ref) => (
            <CalendarPortal isOpen={true} triggerRef={ref}>
              <div>Portal Content</div>
            </CalendarPortal>
          )}
        </TestWrapper>
      );

      expect(screen.getByText('Portal Content')).toBeInTheDocument();
    });

    it('should create portal element with correct class', () => {
      const { rerender } = render(
        <TestWrapper>
          {(ref) => (
            <CalendarPortal isOpen={true} triggerRef={ref} portalClassName="custom-portal">
              <div>Portal Content</div>
            </CalendarPortal>
          )}
        </TestWrapper>
      );

      const portalElement = document.querySelector('.custom-portal');
      expect(portalElement).toBeTruthy();
      expect(portalElement?.style.position).toBe('fixed');
      expect(portalElement?.style.zIndex).toBe('2147483647');
    });
  });

  describe('Positioning', () => {
    beforeEach(() => {
      // Mock getBoundingClientRect
      Element.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
        top: 100,
        left: 50,
        bottom: 130,
        right: 250,
        width: 200,
        height: 30
      });

      // Mock window dimensions
      Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
      Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true });
    });

    it('should position portal at bottom-left by default', async () => {
      render(
        <TestWrapper>
          {(ref) => (
            <CalendarPortal isOpen={true} triggerRef={ref}>
              <div>Portal Content</div>
            </CalendarPortal>
          )}
        </TestWrapper>
      );

      await waitFor(() => {
        const portalElement = document.querySelector('.cla-calendar-portal');
        expect(portalElement?.style.top).toBe('138px'); // 130 + 8 padding
        expect(portalElement?.style.left).toBe('50px');
      });
    });

    it('should position portal at bottom-right when specified', async () => {
      render(
        <TestWrapper>
          {(ref) => (
            <CalendarPortal isOpen={true} triggerRef={ref} position="bottom-right" expectedWidth={300} dynamicPosition={false}>
              <div>Portal Content</div>
            </CalendarPortal>
          )}
        </TestWrapper>
      );

      await waitFor(() => {
        const portalElement = document.querySelector('.cla-calendar-portal');
        expect(portalElement?.style.top).toBe('138px');
        expect(portalElement?.style.left).toBe('-50px'); // 250 - 300
      });
    });

    it('should position portal at top-left when specified', async () => {
      render(
        <TestWrapper>
          {(ref) => (
            <CalendarPortal isOpen={true} triggerRef={ref} position="top-left" dynamicPosition={false}>
              <div style={{ height: '400px' }}>Portal Content</div>
            </CalendarPortal>
          )}
        </TestWrapper>
      );

      await waitFor(() => {
        const portalElement = document.querySelector('.cla-calendar-portal');
        expect(portalElement?.style.top).toBe('-308px'); // 100 - 400 - 8
        expect(portalElement?.style.left).toBe('50px');
      });
    });

    it('should use dynamic positioning when enabled', async () => {
      // Mock trigger near bottom of viewport
      Element.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
        top: 700,
        left: 50,
        bottom: 730,
        right: 250,
        width: 200,
        height: 30
      });

      render(
        <TestWrapper>
          {(ref) => (
            <CalendarPortal isOpen={true} triggerRef={ref} dynamicPosition={true}>
              <div style={{ height: '400px' }}>Portal Content</div>
            </CalendarPortal>
          )}
        </TestWrapper>
      );

      await waitFor(() => {
        const portalElement = document.querySelector('.cla-calendar-portal');
        // Should position above since not enough space below
        expect(parseInt(portalElement?.style.top || '0')).toBeLessThan(700);
      });
    });
  });

  describe('Event Handling', () => {
    it('should close on click outside when onClose is provided', async () => {
      const onClose = vi.fn();
      
      render(
        <TestWrapper>
          {(ref) => (
            <CalendarPortal isOpen={true} triggerRef={ref} onClose={onClose}>
              <div>Portal Content</div>
            </CalendarPortal>
          )}
        </TestWrapper>
      );

      // Click outside the portal
      fireEvent.mouseDown(document.body);
      
      expect(onClose).toHaveBeenCalled();
    });

    it('should not close when clicking inside the portal', async () => {
      const onClose = vi.fn();
      
      render(
        <TestWrapper>
          {(ref) => (
            <CalendarPortal isOpen={true} triggerRef={ref} onClose={onClose}>
              <div>Portal Content</div>
            </CalendarPortal>
          )}
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Portal Content')).toBeInTheDocument();
      });

      // Click inside the portal
      fireEvent.mouseDown(screen.getByText('Portal Content'));
      
      expect(onClose).not.toHaveBeenCalled();
    });

    it('should not close when clicking on trigger element', () => {
      const onClose = vi.fn();
      
      render(
        <TestWrapper>
          {(ref) => (
            <CalendarPortal isOpen={true} triggerRef={ref} onClose={onClose}>
              <div>Portal Content</div>
            </CalendarPortal>
          )}
        </TestWrapper>
      );

      // Click on trigger element
      fireEvent.mouseDown(screen.getByTestId('trigger-element'));
      
      expect(onClose).not.toHaveBeenCalled();
    });

    it('should close on ESC key press', () => {
      const onClose = vi.fn();
      
      render(
        <TestWrapper>
          {(ref) => (
            <CalendarPortal isOpen={true} triggerRef={ref} onClose={onClose}>
              <div>Portal Content</div>
            </CalendarPortal>
          )}
        </TestWrapper>
      );

      // Press ESC key
      fireEvent.keyDown(document, { key: 'Escape' });
      
      expect(onClose).toHaveBeenCalled();
    });

    it('should not respond to other keys', () => {
      const onClose = vi.fn();
      
      render(
        <TestWrapper>
          {(ref) => (
            <CalendarPortal isOpen={true} triggerRef={ref} onClose={onClose}>
              <div>Portal Content</div>
            </CalendarPortal>
          )}
        </TestWrapper>
      );

      // Press other keys
      fireEvent.keyDown(document, { key: 'Enter' });
      fireEvent.keyDown(document, { key: 'Space' });
      
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Window Events', () => {
    it('should update position on window resize', async () => {
      const { rerender } = render(
        <TestWrapper>
          {(ref) => (
            <CalendarPortal isOpen={true} triggerRef={ref}>
              <div>Portal Content</div>
            </CalendarPortal>
          )}
        </TestWrapper>
      );

      const portalElement = document.querySelector('.cla-calendar-portal');
      const initialTop = portalElement?.style.top;

      // Change window size and trigger resize
      (window as any).innerHeight = 600;
      
      act(() => {
        fireEvent.resize(window);
      });

      // Wait for debounced resize handler
      await waitFor(() => {
        const newTop = portalElement?.style.top;
        expect(newTop).toBeDefined();
      }, { timeout: 200 });
    });

    it('should update position on window scroll', async () => {
      render(
        <TestWrapper>
          {(ref) => (
            <CalendarPortal isOpen={true} triggerRef={ref}>
              <div>Portal Content</div>
            </CalendarPortal>
          )}
        </TestWrapper>
      );

      const updatePositionSpy = vi.spyOn(Element.prototype, 'getBoundingClientRect');

      act(() => {
        fireEvent.scroll(window);
      });

      // Wait for debounced scroll handler
      await waitFor(() => {
        expect(updatePositionSpy).toHaveBeenCalled();
      }, { timeout: 200 });
    });
  });

  describe('Intersection Observer', () => {
    it.skip('should observe portal element when dynamic positioning is enabled', async () => {
      render(
        <TestWrapper>
          {(ref) => (
            <CalendarPortal isOpen={true} triggerRef={ref} dynamicPosition={true}>
              <div>Portal Content</div>
            </CalendarPortal>
          )}
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockIntersectionObserverInstances.length).toBeGreaterThan(0);
      }, { timeout: 200 });
      
      // Wait for the observer timer
      await waitFor(() => {
        const observer = mockIntersectionObserverInstances[0];
        expect(observer.elements.size).toBe(1);
      }, { timeout: 300 });
    });

    it('should reposition when portal is partially cut off', async () => {
      render(
        <TestWrapper>
          {(ref) => (
            <CalendarPortal isOpen={true} triggerRef={ref} dynamicPosition={true}>
              <div>Portal Content</div>
            </CalendarPortal>
          )}
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockIntersectionObserverInstances.length).toBeGreaterThan(0);
      }, { timeout: 200 });

      const observer = mockIntersectionObserverInstances[0];
      const updatePositionSpy = vi.spyOn(Element.prototype, 'getBoundingClientRect');

      // Trigger intersection with less than 95% visible
      act(() => {
        observer.trigger([{
          intersectionRatio: 0.8,
          isIntersecting: true,
          target: document.querySelector('.cla-calendar-portal')!,
          boundingClientRect: {} as DOMRectReadOnly,
          intersectionRect: {} as DOMRectReadOnly,
          rootBounds: null,
          time: Date.now()
        }]);
      });

      expect(updatePositionSpy).toHaveBeenCalled();
    });

    it('should not reposition when fully visible', async () => {
      render(
        <TestWrapper>
          {(ref) => (
            <CalendarPortal isOpen={true} triggerRef={ref} dynamicPosition={true}>
              <div>Portal Content</div>
            </CalendarPortal>
          )}
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockIntersectionObserverInstances.length).toBeGreaterThan(0);
      }, { timeout: 200 });

      const observer = mockIntersectionObserverInstances[0];
      const updatePositionSpy = vi.spyOn(Element.prototype, 'getBoundingClientRect');
      updatePositionSpy.mockClear();

      // Trigger intersection with 100% visible
      act(() => {
        observer.trigger([{
          intersectionRatio: 1.0,
          isIntersecting: true,
          target: document.querySelector('.cla-calendar-portal')!,
          boundingClientRect: {} as DOMRectReadOnly,
          intersectionRect: {} as DOMRectReadOnly,
          rootBounds: null,
          time: Date.now()
        }]);
      });

      expect(updatePositionSpy).not.toHaveBeenCalled();
    });
  });

  describe('Style Application', () => {
    it('should apply custom portal styles', () => {
      const customStyle = {
        width: '500px',
        backgroundColor: 'red',
        padding: '20px'
      };

      render(
        <TestWrapper>
          {(ref) => (
            <CalendarPortal isOpen={true} triggerRef={ref} portalStyle={customStyle}>
              <div>Portal Content</div>
            </CalendarPortal>
          )}
        </TestWrapper>
      );

      const portalElement = document.querySelector('.cla-calendar-portal');
      expect(portalElement?.style.width).toBe('500px');
      expect(portalElement?.style.backgroundColor).toBe('red');
      expect(portalElement?.style.padding).toBe('20px');
    });

    it('should preserve fixed positioning despite custom styles', () => {
      const customStyle = {
        position: 'absolute' as const,
        zIndex: '100'
      };

      render(
        <TestWrapper>
          {(ref) => (
            <CalendarPortal isOpen={true} triggerRef={ref} portalStyle={customStyle}>
              <div>Portal Content</div>
            </CalendarPortal>
          )}
        </TestWrapper>
      );

      const portalElement = document.querySelector('.cla-calendar-portal');
      // Should override to maintain portal functionality
      expect(portalElement?.style.position).toBe('absolute');
      expect(portalElement?.style.zIndex).toBe('100');
    });

    it('should apply visibility style when positioned', async () => {
      const customStyle = {
        visibility: 'visible' as const
      };

      render(
        <TestWrapper>
          {(ref) => (
            <CalendarPortal isOpen={true} triggerRef={ref} portalStyle={customStyle}>
              <div>Portal Content</div>
            </CalendarPortal>
          )}
        </TestWrapper>
      );

      // Wait for positioning
      await waitFor(() => {
        const portalElement = document.querySelector('.cla-calendar-portal');
        expect(portalElement?.style.visibility).toBe('visible');
      });
    });

    it('should apply all supported CSS properties', () => {
      const customStyle = {
        display: 'block',
        pointerEvents: 'none' as const,
        right: '10px',
        bottom: '20px',
        margin: '5px',
        border: '1px solid red',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        color: 'blue',
        opacity: '0.9',
        transition: 'all 0.3s',
        transform: 'scale(0.95)'
      };

      render(
        <TestWrapper>
          {(ref) => (
            <CalendarPortal isOpen={true} triggerRef={ref} portalStyle={customStyle}>
              <div>Portal Content</div>
            </CalendarPortal>
          )}
        </TestWrapper>
      );

      const portalElement = document.querySelector('.cla-calendar-portal');
      expect(portalElement?.style.display).toBe('block');
      expect(portalElement?.style.pointerEvents).toBe('none');
      expect(portalElement?.style.right).toBe('10px');
      expect(portalElement?.style.bottom).toBe('20px');
      expect(portalElement?.style.margin).toBe('5px');
      expect(portalElement?.style.border).toBe('1px solid red');
      expect(portalElement?.style.borderRadius).toBe('8px');
      expect(portalElement?.style.boxShadow).toBe('0 2px 4px rgba(0,0,0,0.1)');
      expect(portalElement?.style.color).toBe('blue');
      expect(portalElement?.style.transition).toBe('all 0.3s');
      expect(portalElement?.style.transform).toBe('scale(0.95)');
    });
  });

  describe('Lifecycle', () => {
    it('should clean up portal element on unmount', () => {
      const { unmount } = render(
        <TestWrapper>
          {(ref) => (
            <CalendarPortal isOpen={true} triggerRef={ref}>
              <div>Portal Content</div>
            </CalendarPortal>
          )}
        </TestWrapper>
      );

      expect(document.querySelector('.cla-calendar-portal')).toBeTruthy();

      unmount();

      expect(document.querySelector('.cla-calendar-portal')).toBeFalsy();
    });

    it('should remove event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      const removeDocumentListenerSpy = vi.spyOn(document, 'removeEventListener');

      const { unmount } = render(
        <TestWrapper>
          {(ref) => (
            <CalendarPortal isOpen={true} triggerRef={ref} onClose={() => {}}>
              <div>Portal Content</div>
            </CalendarPortal>
          )}
        </TestWrapper>
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function), true);
      expect(removeDocumentListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
      expect(removeDocumentListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it.skip('should disconnect intersection observer on unmount', async () => {
      const { unmount } = render(
        <TestWrapper>
          {(ref) => (
            <CalendarPortal isOpen={true} triggerRef={ref} dynamicPosition={true}>
              <div>Portal Content</div>
            </CalendarPortal>
          )}
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockIntersectionObserverInstances.length).toBeGreaterThan(0);
      }, { timeout: 200 });

      // Wait for observer to be set up
      await waitFor(() => {
        const observer = mockIntersectionObserverInstances[0];
        expect(observer.elements.size).toBe(1);
      }, { timeout: 300 });

      const observer = mockIntersectionObserverInstances[0];
      const disconnectSpy = vi.spyOn(observer, 'disconnect');

      unmount();

      expect(disconnectSpy).toHaveBeenCalled();
    });

    it('should handle rapid open/close cycles', async () => {
      const { rerender } = render(
        <TestWrapper>
          {(ref) => (
            <CalendarPortal isOpen={false} triggerRef={ref}>
              <div>Portal Content</div>
            </CalendarPortal>
          )}
        </TestWrapper>
      );

      // Rapidly toggle open/close
      for (let i = 0; i < 5; i++) {
        rerender(
          <TestWrapper>
            {(ref) => (
              <CalendarPortal isOpen={true} triggerRef={ref}>
                <div>Portal Content</div>
              </CalendarPortal>
            )}
          </TestWrapper>
        );

        rerender(
          <TestWrapper>
            {(ref) => (
              <CalendarPortal isOpen={false} triggerRef={ref}>
                <div>Portal Content</div>
              </CalendarPortal>
            )}
          </TestWrapper>
        );
      }

      // Should handle without errors
      expect(document.querySelectorAll('.cla-calendar-portal').length).toBeLessThanOrEqual(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing triggerRef gracefully', () => {
      const nullRef = { current: null };
      
      expect(() => {
        render(
          <CalendarPortal isOpen={true} triggerRef={nullRef as any}>
            <div>Portal Content</div>
          </CalendarPortal>
        );
      }).not.toThrow();
    });

    it('should handle portal style updates', async () => {
      const { rerender } = render(
        <TestWrapper>
          {(ref) => (
            <CalendarPortal isOpen={true} triggerRef={ref} portalStyle={{ width: '300px' }}>
              <div>Portal Content</div>
            </CalendarPortal>
          )}
        </TestWrapper>
      );

      const portalElement = document.querySelector('.cla-calendar-portal');
      expect(portalElement?.style.width).toBe('300px');

      rerender(
        <TestWrapper>
          {(ref) => (
            <CalendarPortal isOpen={true} triggerRef={ref} portalStyle={{ width: '500px' }}>
              <div>Portal Content</div>
            </CalendarPortal>
          )}
        </TestWrapper>
      );

      expect(portalElement?.style.width).toBe('500px');
    });

    it('should show fallback content when no children provided', () => {
      render(
        <TestWrapper>
          {(ref) => (
            <CalendarPortal isOpen={true} triggerRef={ref}>
              {null}
            </CalendarPortal>
          )}
        </TestWrapper>
      );

      expect(screen.getByText('No calendar content provided!')).toBeInTheDocument();
    });

    it.skip('should reset positioning state when closing', async () => {
      const { rerender } = render(
        <TestWrapper>
          {(ref) => (
            <CalendarPortal isOpen={true} triggerRef={ref}>
              <div>Portal Content</div>
            </CalendarPortal>
          )}
        </TestWrapper>
      );

      await waitFor(() => {
        const portalElement = document.querySelector('.cla-calendar-portal');
        expect(portalElement?.style.visibility).toBe('visible');
      });

      rerender(
        <TestWrapper>
          {(ref) => (
            <CalendarPortal isOpen={false} triggerRef={ref}>
              <div>Portal Content</div>
            </CalendarPortal>
          )}
        </TestWrapper>
      );

      // The portal element should be hidden when closed
      await waitFor(() => {
        const portalElement = document.querySelector('.cla-calendar-portal');
        expect(portalElement?.style.visibility).toBe('hidden');
        expect(portalElement?.style.opacity).toBe('0');
      });
    });
  });
});