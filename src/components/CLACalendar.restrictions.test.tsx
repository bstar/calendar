import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CLACalendar } from './CLACalendar';
import { getDefaultSettings } from './CLACalendar.config';
import type { CalendarSettings, RestrictionConfig } from './CLACalendar.config';

// Mock portal to avoid DOM complications in tests
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom');
  return {
    ...actual,
    createPortal: vi.fn((element) => element)
  };
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

describe('CLACalendar Restriction Configurations', () => {
  const createTestSetup = () => {
    const mockOnSettingsChange = vi.fn();
    const baseSettings: CalendarSettings = {
      ...getDefaultSettings(),
      layers: [
        {
          name: "Calendar",
          title: "Base Calendar",
          description: "Basic calendar functionality",
          required: true,
          visible: true,
          data: {
            events: [],
            background: []
          }
        }
      ]
    };
    const user = userEvent.setup();
    
    return { mockOnSettingsChange, baseSettings, user };
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Date Range Restrictions', () => {
    it('should handle single date range restriction', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const restrictionConfig: RestrictionConfig = {
        restrictions: [
          {
            type: 'daterange',
            enabled: true,
            ranges: [
              {
                start: '2025-06-20',
                end: '2025-06-25',
                message: 'Holiday week - no bookings allowed'
              }
            ]
          }
        ]
      };

      const restrictedSettings: CalendarSettings = {
        ...baseSettings,
        restrictionConfig
      };

      render(
        <CLACalendar
          settings={restrictedSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Check that the calendar rendered by looking for date elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should handle multiple date range restrictions', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const restrictionConfig: RestrictionConfig = {
        restrictions: [
          {
            type: 'daterange',
            enabled: true,
            ranges: [
              {
                start: '2025-06-20',
                end: '2025-06-22',
                message: 'System maintenance period'
              },
              {
                start: '2025-06-28',
                end: '2025-06-30',
                message: 'End of month closure'
              },
              {
                start: '2025-07-04',
                end: '2025-07-04',
                message: 'Independence Day - office closed'
              }
            ]
          }
        ]
      };

      const restrictedSettings: CalendarSettings = {
        ...baseSettings,
        restrictionConfig
      };

      render(
        <CLACalendar
          settings={restrictedSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Check that the calendar rendered by looking for date elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should handle empty date range restrictions', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const restrictionConfig: RestrictionConfig = {
        restrictions: [
          {
            type: 'daterange',
            enabled: true,
            ranges: []
          }
        ]
      };

      const restrictedSettings: CalendarSettings = {
        ...baseSettings,
        restrictionConfig
      };

      render(
        <CLACalendar
          settings={restrictedSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Check that the calendar rendered by looking for date elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should handle disabled date range restrictions', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const restrictionConfig: RestrictionConfig = {
        restrictions: [
          {
            type: 'daterange',
            enabled: false, // Disabled restriction
            ranges: [
              {
                start: '2025-06-20',
                end: '2025-06-25',
                message: 'This restriction is disabled'
              }
            ]
          }
        ]
      };

      const restrictedSettings: CalendarSettings = {
        ...baseSettings,
        restrictionConfig
      };

      render(
        <CLACalendar
          settings={restrictedSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Check that the calendar rendered by looking for date elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Boundary Restrictions', () => {
    it('should handle before boundary restriction', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const restrictionConfig: RestrictionConfig = {
        restrictions: [
          {
            type: 'boundary',
            enabled: true,
            date: '2025-06-10',
            direction: 'before',
            message: 'Cannot select dates before June 10th'
          }
        ]
      };

      const restrictedSettings: CalendarSettings = {
        ...baseSettings,
        restrictionConfig
      };

      render(
        <CLACalendar
          settings={restrictedSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Check that the calendar rendered by looking for date elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should handle after boundary restriction', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const restrictionConfig: RestrictionConfig = {
        restrictions: [
          {
            type: 'boundary',
            enabled: true,
            date: '2025-07-31',
            direction: 'after',
            message: 'Cannot select dates after July 31st'
          }
        ]
      };

      const restrictedSettings: CalendarSettings = {
        ...baseSettings,
        restrictionConfig
      };

      render(
        <CLACalendar
          settings={restrictedSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Check that the calendar rendered by looking for date elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should handle multiple boundary restrictions', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const restrictionConfig: RestrictionConfig = {
        restrictions: [
          {
            type: 'boundary',
            enabled: true,
            date: '2025-06-01',
            direction: 'before',
            message: 'Booking window opens June 1st'
          },
          {
            type: 'boundary',
            enabled: true,
            date: '2025-08-31',
            direction: 'after',
            message: 'Booking window closes August 31st'
          }
        ]
      };

      const restrictedSettings: CalendarSettings = {
        ...baseSettings,
        restrictionConfig
      };

      render(
        <CLACalendar
          settings={restrictedSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Check that the calendar rendered by looking for date elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Weekday Restrictions', () => {
    it('should handle weekend restrictions', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const restrictionConfig: RestrictionConfig = {
        restrictions: [
          {
            type: 'weekday',
            enabled: true,
            days: [0, 6], // Sunday = 0, Saturday = 6
            message: 'Weekend bookings not allowed'
          }
        ]
      };

      const restrictedSettings: CalendarSettings = {
        ...baseSettings,
        restrictionConfig
      };

      render(
        <CLACalendar
          settings={restrictedSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Check that the calendar rendered by looking for date elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should handle specific weekday restrictions', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const restrictionConfig: RestrictionConfig = {
        restrictions: [
          {
            type: 'weekday',
            enabled: true,
            days: [1, 3, 5], // Monday, Wednesday, Friday
            message: 'Bookings only allowed on Tuesday and Thursday'
          }
        ]
      };

      const restrictedSettings: CalendarSettings = {
        ...baseSettings,
        restrictionConfig
      };

      render(
        <CLACalendar
          settings={restrictedSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Check that the calendar rendered by looking for date elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should handle single weekday restriction', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const restrictionConfig: RestrictionConfig = {
        restrictions: [
          {
            type: 'weekday',
            enabled: true,
            days: [2], // Tuesday only
            message: 'Tuesday maintenance - no bookings'
          }
        ]
      };

      const restrictedSettings: CalendarSettings = {
        ...baseSettings,
        restrictionConfig
      };

      render(
        <CLACalendar
          settings={restrictedSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Check that the calendar rendered by looking for date elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should handle empty weekday restrictions', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const restrictionConfig: RestrictionConfig = {
        restrictions: [
          {
            type: 'weekday',
            enabled: true,
            days: [], // No days restricted
            message: 'No weekday restrictions'
          }
        ]
      };

      const restrictedSettings: CalendarSettings = {
        ...baseSettings,
        restrictionConfig
      };

      render(
        <CLACalendar
          settings={restrictedSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Check that the calendar rendered by looking for date elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Allowed Ranges Only Restrictions', () => {
    it('should handle single allowed range', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const restrictionConfig: RestrictionConfig = {
        restrictions: [
          {
            type: 'allowedranges',
            enabled: true,
            ranges: [
              {
                start: '2025-06-15',
                end: '2025-06-20',
                message: 'Available booking window'
              }
            ]
          }
        ]
      };

      const restrictedSettings: CalendarSettings = {
        ...baseSettings,
        restrictionConfig
      };

      render(
        <CLACalendar
          settings={restrictedSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Check that the calendar rendered by looking for date elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should handle multiple allowed ranges', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const restrictionConfig: RestrictionConfig = {
        restrictions: [
          {
            type: 'allowedranges',
            enabled: true,
            ranges: [
              {
                start: '2025-06-10',
                end: '2025-06-15',
                message: 'Conference Room A available'
              },
              {
                start: '2025-06-20',
                end: '2025-06-25',
                message: 'Conference Room B available'
              },
              {
                start: '2025-07-01',
                end: '2025-07-05',
                message: 'Training Room available'
              }
            ]
          }
        ]
      };

      const restrictedSettings: CalendarSettings = {
        ...baseSettings,
        restrictionConfig
      };

      render(
        <CLACalendar
          settings={restrictedSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Check that the calendar rendered by looking for date elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should handle non-contiguous allowed ranges', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const restrictionConfig: RestrictionConfig = {
        restrictions: [
          {
            type: 'allowedranges',
            enabled: true,
            ranges: [
              {
                start: '2025-06-05',
                end: '2025-06-07',
                message: 'Early week availability'
              },
              {
                start: '2025-06-25',
                end: '2025-06-27',
                message: 'Late month availability'
              }
            ]
          }
        ]
      };

      const restrictedSettings: CalendarSettings = {
        ...baseSettings,
        restrictionConfig
      };

      render(
        <CLACalendar
          settings={restrictedSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Check that the calendar rendered by looking for date elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Complex Mixed Restrictions', () => {
    it('should handle combination of all restriction types', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const restrictionConfig: RestrictionConfig = {
        restrictions: [
          {
            type: 'boundary',
            enabled: true,
            date: '2025-06-01',
            direction: 'before',
            message: 'Booking opens June 1st'
          },
          {
            type: 'boundary',
            enabled: true,
            date: '2025-08-31',
            direction: 'after',
            message: 'Booking closes August 31st'
          },
          {
            type: 'weekday',
            enabled: true,
            days: [0, 6], // No weekends
            message: 'Business hours only - no weekend bookings'
          },
          {
            type: 'daterange',
            enabled: true,
            ranges: [
              {
                start: '2025-07-04',
                end: '2025-07-04',
                message: 'Independence Day - office closed'
              },
              {
                start: '2025-07-15',
                end: '2025-07-19',
                message: 'Summer shutdown week'
              }
            ]
          }
        ]
      };

      const restrictedSettings: CalendarSettings = {
        ...baseSettings,
        restrictionConfig
      };

      render(
        <CLACalendar
          settings={restrictedSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Check that the calendar rendered by looking for date elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should handle disabled and enabled restrictions together', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const restrictionConfig: RestrictionConfig = {
        restrictions: [
          {
            type: 'weekday',
            enabled: false, // Disabled
            days: [0, 6],
            message: 'Weekend restriction (disabled)'
          },
          {
            type: 'daterange',
            enabled: true, // Enabled
            ranges: [
              {
                start: '2025-06-20',
                end: '2025-06-22',
                message: 'Active restriction period'
              }
            ]
          },
          {
            type: 'boundary',
            enabled: true, // Enabled
            date: '2025-05-01',
            direction: 'before',
            message: 'Active boundary restriction'
          }
        ]
      };

      const restrictedSettings: CalendarSettings = {
        ...baseSettings,
        restrictionConfig
      };

      render(
        <CLACalendar
          settings={restrictedSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Check that the calendar rendered by looking for date elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should handle overlapping restrictions', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const restrictionConfig: RestrictionConfig = {
        restrictions: [
          {
            type: 'daterange',
            enabled: true,
            ranges: [
              {
                start: '2025-06-15',
                end: '2025-06-20',
                message: 'Maintenance period'
              }
            ]
          },
          {
            type: 'weekday',
            enabled: true,
            days: [1, 2, 3], // Monday, Tuesday, Wednesday
            message: 'Midweek restrictions'
          }
        ]
      };

      const restrictedSettings: CalendarSettings = {
        ...baseSettings,
        restrictionConfig
      };

      render(
        <CLACalendar
          settings={restrictedSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Check that the calendar rendered by looking for date elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should handle conflicting allowed ranges and date restrictions', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const restrictionConfig: RestrictionConfig = {
        restrictions: [
          {
            type: 'allowedranges',
            enabled: true,
            ranges: [
              {
                start: '2025-06-10',
                end: '2025-06-25',
                message: 'Available period'
              }
            ]
          },
          {
            type: 'daterange',
            enabled: true,
            ranges: [
              {
                start: '2025-06-15',
                end: '2025-06-18',
                message: 'Blocked period within allowed range'
              }
            ]
          }
        ]
      };

      const restrictedSettings: CalendarSettings = {
        ...baseSettings,
        restrictionConfig
      };

      render(
        <CLACalendar
          settings={restrictedSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Check that the calendar rendered by looking for date elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle undefined restriction config', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const restrictedSettings: CalendarSettings = {
        ...baseSettings,
        restrictionConfig: undefined
      };

      render(
        <CLACalendar
          settings={restrictedSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Check that the calendar rendered by looking for date elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should handle empty restrictions array', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const restrictionConfig: RestrictionConfig = {
        restrictions: []
      };

      const restrictedSettings: CalendarSettings = {
        ...baseSettings,
        restrictionConfig
      };

      render(
        <CLACalendar
          settings={restrictedSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Check that the calendar rendered by looking for date elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should handle edge case restriction scenarios gracefully', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const restrictionConfig: RestrictionConfig = {
        restrictions: [
          {
            type: 'daterange',
            enabled: true,
            ranges: [
              {
                start: '2025-06-15',
                end: '2025-06-15',
                message: 'Single day restriction'
              }
            ]
          }
        ]
      };

      const restrictedSettings: CalendarSettings = {
        ...baseSettings,
        restrictionConfig
      };

      render(
        <CLACalendar
          settings={restrictedSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Check that the calendar rendered by looking for date elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should handle invalid weekday numbers', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const restrictionConfig: RestrictionConfig = {
        restrictions: [
          {
            type: 'weekday',
            enabled: true,
            days: [-1, 7, 8, 'invalid' as any], // Invalid day numbers
            message: 'Invalid weekday restriction'
          }
        ]
      };

      const restrictedSettings: CalendarSettings = {
        ...baseSettings,
        restrictionConfig
      };

      render(
        <CLACalendar
          settings={restrictedSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Check that the calendar rendered by looking for date elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should handle extremely long restriction messages', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const longMessage = 'This is an extremely long restriction message that goes on and on and should be handled gracefully by the calendar component without causing any layout issues or performance problems. '.repeat(10);
      
      const restrictionConfig: RestrictionConfig = {
        restrictions: [
          {
            type: 'daterange',
            enabled: true,
            ranges: [
              {
                start: '2025-06-20',
                end: '2025-06-22',
                message: longMessage
              }
            ]
          }
        ]
      };

      const restrictedSettings: CalendarSettings = {
        ...baseSettings,
        restrictionConfig
      };

      render(
        <CLACalendar
          settings={restrictedSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Check that the calendar rendered by looking for date elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});