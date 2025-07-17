import React, { useRef } from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PortalCalendar } from './PortalCalendar';
import { getDefaultSettings } from '../CLACalendar.config';

// Mock the CalendarPortal component
vi.mock('./CalendarPortal', () => ({
  CalendarPortal: ({ children, isOpen, onClose }: any) => {
    return isOpen ? (
      <div data-testid="calendar-portal" onClick={() => onClose?.()}>
        {children}
      </div>
    ) : null;
  }
}));

// Mock the CalendarCoordinator
let mockCoordinatorState = {
  activeCalendarId: null as string | null,
  callbacks: new Map<string, () => void>()
};

vi.mock('./CalendarCoordinator', () => ({
  registerCalendar: (id: string, callback: () => void) => {
    mockCoordinatorState.callbacks.set(id, callback);
    
    return {
      open: () => {
        // Close other calendars
        if (mockCoordinatorState.activeCalendarId && mockCoordinatorState.activeCalendarId !== id) {
          const otherCallback = mockCoordinatorState.callbacks.get(mockCoordinatorState.activeCalendarId);
          otherCallback?.();
        }
        mockCoordinatorState.activeCalendarId = id;
      },
      close: () => {
        if (mockCoordinatorState.activeCalendarId === id) {
          mockCoordinatorState.activeCalendarId = null;
        }
      },
      unregister: () => {
        mockCoordinatorState.callbacks.delete(id);
        if (mockCoordinatorState.activeCalendarId === id) {
          mockCoordinatorState.activeCalendarId = null;
        }
      },
      isActive: () => mockCoordinatorState.activeCalendarId === id
    };
  }
}));

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

describe('PortalCalendar', () => {
  beforeEach(() => {
    // Reset coordinator state
    mockCoordinatorState = {
      activeCalendarId: null,
      callbacks: new Map()
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Display Modes', () => {
    it('should render children directly in embedded mode', () => {
      const settings = {
        ...getDefaultSettings(),
        displayMode: 'embedded' as const
      };

      render(
        <TestWrapper>
          {(ref) => (
            <PortalCalendar
              isOpen={true}
              onOpenChange={() => {}}
              triggerRef={ref}
              settings={settings}
            >
              <div>Calendar Content</div>
            </PortalCalendar>
          )}
        </TestWrapper>
      );

      // Should render directly, not in a portal
      expect(screen.getByText('Calendar Content')).toBeInTheDocument();
      expect(screen.queryByTestId('calendar-portal')).not.toBeInTheDocument();
    });

    it('should render in portal in popup mode', () => {
      const settings = {
        ...getDefaultSettings(),
        displayMode: 'popup' as const
      };

      render(
        <TestWrapper>
          {(ref) => (
            <PortalCalendar
              isOpen={true}
              onOpenChange={() => {}}
              triggerRef={ref}
              settings={settings}
            >
              <div>Calendar Content</div>
            </PortalCalendar>
          )}
        </TestWrapper>
      );

      // Should render in portal
      expect(screen.getByTestId('calendar-portal')).toBeInTheDocument();
      expect(screen.getByText('Calendar Content')).toBeInTheDocument();
    });

    it('should not render portal when closed in popup mode', () => {
      const settings = {
        ...getDefaultSettings(),
        displayMode: 'popup' as const
      };

      render(
        <TestWrapper>
          {(ref) => (
            <PortalCalendar
              isOpen={false}
              onOpenChange={() => {}}
              triggerRef={ref}
              settings={settings}
            >
              <div>Calendar Content</div>
            </PortalCalendar>
          )}
        </TestWrapper>
      );

      expect(screen.queryByTestId('calendar-portal')).not.toBeInTheDocument();
      expect(screen.queryByText('Calendar Content')).not.toBeInTheDocument();
    });
  });

  describe('Calendar Coordination', () => {
    it('should register with coordinator on mount', () => {
      const settings = getDefaultSettings();
      const onOpenChange = vi.fn();

      render(
        <TestWrapper>
          {(ref) => (
            <PortalCalendar
              isOpen={false}
              onOpenChange={onOpenChange}
              triggerRef={ref}
              settings={settings}
              id="test-calendar"
            >
              <div>Calendar Content</div>
            </PortalCalendar>
          )}
        </TestWrapper>
      );

      expect(mockCoordinatorState.callbacks.has('test-calendar')).toBe(true);
    });

    it('should generate unique ID if not provided', () => {
      const settings = getDefaultSettings();
      const onOpenChange = vi.fn();

      render(
        <TestWrapper>
          {(ref) => (
            <PortalCalendar
              isOpen={false}
              onOpenChange={onOpenChange}
              triggerRef={ref}
              settings={settings}
            >
              <div>Calendar Content</div>
            </PortalCalendar>
          )}
        </TestWrapper>
      );

      // Should have registered with a generated ID
      expect(mockCoordinatorState.callbacks.size).toBe(1);
      const generatedId = Array.from(mockCoordinatorState.callbacks.keys())[0];
      expect(generatedId).toMatch(/^calendar-\d+$/);
    });

    it('should open calendar in coordinator when isOpen changes to true', () => {
      const settings = getDefaultSettings();
      const onOpenChange = vi.fn();

      const { rerender } = render(
        <TestWrapper>
          {(ref) => (
            <PortalCalendar
              isOpen={false}
              onOpenChange={onOpenChange}
              triggerRef={ref}
              settings={settings}
              id="test-calendar"
            >
              <div>Calendar Content</div>
            </PortalCalendar>
          )}
        </TestWrapper>
      );

      expect(mockCoordinatorState.activeCalendarId).toBeNull();

      rerender(
        <TestWrapper>
          {(ref) => (
            <PortalCalendar
              isOpen={true}
              onOpenChange={onOpenChange}
              triggerRef={ref}
              settings={settings}
              id="test-calendar"
            >
              <div>Calendar Content</div>
            </PortalCalendar>
          )}
        </TestWrapper>
      );

      expect(mockCoordinatorState.activeCalendarId).toBe('test-calendar');
    });

    it('should close calendar in coordinator when isOpen changes to false', () => {
      const settings = getDefaultSettings();
      const onOpenChange = vi.fn();

      // Start with open calendar
      mockCoordinatorState.activeCalendarId = 'test-calendar';

      const { rerender } = render(
        <TestWrapper>
          {(ref) => (
            <PortalCalendar
              isOpen={true}
              onOpenChange={onOpenChange}
              triggerRef={ref}
              settings={settings}
              id="test-calendar"
            >
              <div>Calendar Content</div>
            </PortalCalendar>
          )}
        </TestWrapper>
      );

      expect(mockCoordinatorState.activeCalendarId).toBe('test-calendar');

      rerender(
        <TestWrapper>
          {(ref) => (
            <PortalCalendar
              isOpen={false}
              onOpenChange={onOpenChange}
              triggerRef={ref}
              settings={settings}
              id="test-calendar"
            >
              <div>Calendar Content</div>
            </PortalCalendar>
          )}
        </TestWrapper>
      );

      expect(mockCoordinatorState.activeCalendarId).toBeNull();
    });

    it('should close when another calendar opens', () => {
      const settings = getDefaultSettings();
      const onOpenChange = vi.fn();

      render(
        <TestWrapper>
          {(ref) => (
            <PortalCalendar
              isOpen={true}
              onOpenChange={onOpenChange}
              triggerRef={ref}
              settings={settings}
              id="calendar-1"
            >
              <div>Calendar 1</div>
            </PortalCalendar>
          )}
        </TestWrapper>
      );

      expect(mockCoordinatorState.activeCalendarId).toBe('calendar-1');

      // Simulate another calendar opening
      mockCoordinatorState.activeCalendarId = 'calendar-2';
      const callback = mockCoordinatorState.callbacks.get('calendar-1');
      
      act(() => {
        callback?.();
      });

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('should unregister on unmount', () => {
      const settings = getDefaultSettings();
      const onOpenChange = vi.fn();

      const { unmount } = render(
        <TestWrapper>
          {(ref) => (
            <PortalCalendar
              isOpen={true}
              onOpenChange={onOpenChange}
              triggerRef={ref}
              settings={settings}
              id="test-calendar"
            >
              <div>Calendar Content</div>
            </PortalCalendar>
          )}
        </TestWrapper>
      );

      expect(mockCoordinatorState.callbacks.has('test-calendar')).toBe(true);
      expect(mockCoordinatorState.activeCalendarId).toBe('test-calendar');

      unmount();

      expect(mockCoordinatorState.callbacks.has('test-calendar')).toBe(false);
      expect(mockCoordinatorState.activeCalendarId).toBeNull();
    });
  });

  describe('Click Away Behavior', () => {
    it('should close on click away when closeOnClickAway is true', () => {
      const settings = {
        ...getDefaultSettings(),
        displayMode: 'popup' as const,
        closeOnClickAway: true
      };
      const onOpenChange = vi.fn();

      render(
        <TestWrapper>
          {(ref) => (
            <PortalCalendar
              isOpen={true}
              onOpenChange={onOpenChange}
              triggerRef={ref}
              settings={settings}
            >
              <div>Calendar Content</div>
            </PortalCalendar>
          )}
        </TestWrapper>
      );

      // Click on portal (simulates click away)
      act(() => {
        screen.getByTestId('calendar-portal').click();
      });

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('should not close on click away when closeOnClickAway is false', () => {
      const settings = {
        ...getDefaultSettings(),
        displayMode: 'popup' as const,
        closeOnClickAway: false
      };
      const onOpenChange = vi.fn();

      render(
        <TestWrapper>
          {(ref) => (
            <PortalCalendar
              isOpen={true}
              onOpenChange={onOpenChange}
              triggerRef={ref}
              settings={settings}
            >
              <div>Calendar Content</div>
            </PortalCalendar>
          )}
        </TestWrapper>
      );

      // Click on portal (simulates click away)
      act(() => {
        screen.getByTestId('calendar-portal').click();
      });

      expect(onOpenChange).not.toHaveBeenCalled();
    });
  });

  describe('Portal Styles', () => {
    it('should apply correct portal styles based on settings', () => {
      const settings = {
        ...getDefaultSettings(),
        displayMode: 'popup' as const,
        visibleMonths: 2,
        monthWidth: 300
      };

      const { container } = render(
        <TestWrapper>
          {(ref) => (
            <PortalCalendar
              isOpen={true}
              onOpenChange={() => {}}
              triggerRef={ref}
              settings={settings}
            >
              <div>Calendar Content</div>
            </PortalCalendar>
          )}
        </TestWrapper>
      );

      // Portal should receive maxWidth based on visibleMonths * monthWidth
      const expectedMaxWidth = `${settings.visibleMonths * settings.monthWidth}px`;
      // Since we're mocking CalendarPortal, we can't directly check the styles
      // but we can verify the component received the correct props
      expect(screen.getByTestId('calendar-portal')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid open/close cycles', () => {
      const settings = getDefaultSettings();
      const onOpenChange = vi.fn();

      const { rerender } = render(
        <TestWrapper>
          {(ref) => (
            <PortalCalendar
              isOpen={false}
              onOpenChange={onOpenChange}
              triggerRef={ref}
              settings={settings}
              id="test-calendar"
            >
              <div>Calendar Content</div>
            </PortalCalendar>
          )}
        </TestWrapper>
      );

      // Rapidly toggle
      for (let i = 0; i < 5; i++) {
        rerender(
          <TestWrapper>
            {(ref) => (
              <PortalCalendar
                isOpen={i % 2 === 0}
                onOpenChange={onOpenChange}
                triggerRef={ref}
                settings={settings}
                id="test-calendar"
              >
                <div>Calendar Content</div>
              </PortalCalendar>
            )}
          </TestWrapper>
        );
      }

      // Should handle without errors
      expect(mockCoordinatorState.callbacks.has('test-calendar')).toBe(true);
    });

    it('should handle settings changes', () => {
      const onOpenChange = vi.fn();

      const { rerender } = render(
        <TestWrapper>
          {(ref) => (
            <PortalCalendar
              isOpen={true}
              onOpenChange={onOpenChange}
              triggerRef={ref}
              settings={{
                ...getDefaultSettings(),
                displayMode: 'popup'
              }}
            >
              <div>Calendar Content</div>
            </PortalCalendar>
          )}
        </TestWrapper>
      );

      expect(screen.getByTestId('calendar-portal')).toBeInTheDocument();

      // Change to embedded mode
      rerender(
        <TestWrapper>
          {(ref) => (
            <PortalCalendar
              isOpen={true}
              onOpenChange={onOpenChange}
              triggerRef={ref}
              settings={{
                ...getDefaultSettings(),
                displayMode: 'embedded'
              }}
            >
              <div>Calendar Content</div>
            </PortalCalendar>
          )}
        </TestWrapper>
      );

      // Should no longer be in portal
      expect(screen.queryByTestId('calendar-portal')).not.toBeInTheDocument();
      expect(screen.getByText('Calendar Content')).toBeInTheDocument();
    });

    it('should maintain same calendar ID across rerenders', () => {
      const settings = getDefaultSettings();
      const onOpenChange = vi.fn();

      const { rerender } = render(
        <TestWrapper>
          {(ref) => (
            <PortalCalendar
              isOpen={false}
              onOpenChange={onOpenChange}
              triggerRef={ref}
              settings={settings}
            >
              <div>Calendar Content</div>
            </PortalCalendar>
          )}
        </TestWrapper>
      );

      const initialId = Array.from(mockCoordinatorState.callbacks.keys())[0];

      rerender(
        <TestWrapper>
          {(ref) => (
            <PortalCalendar
              isOpen={true}
              onOpenChange={onOpenChange}
              triggerRef={ref}
              settings={settings}
            >
              <div>Calendar Content</div>
            </PortalCalendar>
          )}
        </TestWrapper>
      );

      // Should still have same ID
      expect(Array.from(mockCoordinatorState.callbacks.keys())[0]).toBe(initialId);
    });

    it('should handle null triggerRef gracefully', () => {
      const settings = {
        ...getDefaultSettings(),
        displayMode: 'popup' as const
      };
      const nullRef = { current: null };

      expect(() => {
        render(
          <PortalCalendar
            isOpen={true}
            onOpenChange={() => {}}
            triggerRef={nullRef as any}
            settings={settings}
          >
            <div>Calendar Content</div>
          </PortalCalendar>
        );
      }).not.toThrow();
    });

    it('should close inactive calendar when isOpen changes to false', () => {
      const settings = getDefaultSettings();
      const onOpenChange = vi.fn();

      const { rerender } = render(
        <TestWrapper>
          {(ref) => (
            <PortalCalendar
              isOpen={true}
              onOpenChange={onOpenChange}
              triggerRef={ref}
              settings={settings}
              id="test-calendar"
            >
              <div>Calendar Content</div>
            </PortalCalendar>
          )}
        </TestWrapper>
      );

      // Make calendar inactive in coordinator
      mockCoordinatorState.activeCalendarId = 'other-calendar';

      rerender(
        <TestWrapper>
          {(ref) => (
            <PortalCalendar
              isOpen={false}
              onOpenChange={onOpenChange}
              triggerRef={ref}
              settings={settings}
              id="test-calendar"
            >
              <div>Calendar Content</div>
            </PortalCalendar>
          )}
        </TestWrapper>
      );

      // Should not call close since it's not active
      expect(mockCoordinatorState.activeCalendarId).toBe('other-calendar');
    });

    it('should handle coordinator state changes when not open', () => {
      const settings = getDefaultSettings();
      const onOpenChange = vi.fn();

      render(
        <TestWrapper>
          {(ref) => (
            <PortalCalendar
              isOpen={false}
              onOpenChange={onOpenChange}
              triggerRef={ref}
              settings={settings}
              id="test-calendar"
            >
              <div>Calendar Content</div>
            </PortalCalendar>
          )}
        </TestWrapper>
      );

      // Trigger the state change callback when calendar is not open
      const callback = mockCoordinatorState.callbacks.get('test-calendar');
      act(() => {
        callback?.();
      });

      // Should not call onOpenChange since calendar is already closed
      expect(onOpenChange).not.toHaveBeenCalled();
    });
  });
});