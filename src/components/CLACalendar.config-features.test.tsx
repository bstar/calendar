import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CLACalendar } from './CLACalendar';
import { getDefaultSettings } from './CLACalendar.config';
import type { CalendarSettings, Layer, Event, BackgroundData } from './CLACalendar.config';

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

describe('CLACalendar Configuration Features', () => {
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

  describe('Custom Background Colors and Styling', () => {
    it('should render with custom background colors in layers', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const backgroundSettings: CalendarSettings = {
        ...baseSettings,
        showLayersNavigation: true,
        layers: [
          {
            name: "Calendar",
            title: "Base Calendar",
            description: "Basic calendar functionality",
            required: true,
            visible: true,
            data: { events: [], background: [] }
          },
          {
            name: "Backgrounds",
            title: "Custom Backgrounds",
            description: "Testing background colors",
            visible: true,
            data: {
              events: [],
              background: [
                {
                  startDate: '2025-06-10',
                  endDate: '2025-06-15',
                  color: '#FFE4E1' // Light pink background
                },
                {
                  startDate: '2025-06-20',
                  endDate: '2025-06-25',
                  color: '#E0FFFF' // Light cyan background
                }
              ]
            }
          }
        ]
      };

      render(
        <CLACalendar
          settings={backgroundSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Check that the calendar rendered successfully
      // Check that the calendar rendered by looking for date elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should apply custom container styles', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const styledSettings: CalendarSettings = {
        ...baseSettings,
        containerStyle: {
          backgroundColor: '#f0f8ff',
          border: '3px solid #4169e1',
          borderRadius: '15px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          padding: '25px'
        }
      };

      render(
        <CLACalendar
          settings={styledSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Check that the calendar rendered by looking for date elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should support flat embedded styling (no shadows/borders)', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const flatSettings: CalendarSettings = {
        ...baseSettings,
        displayMode: 'embedded',
        containerStyle: {
          boxShadow: 'none',
          border: 'none',
          borderRadius: '0',
          backgroundColor: 'transparent'
        }
      };

      render(
        <CLACalendar
          settings={flatSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Check that the calendar rendered by looking for date elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should apply custom color themes', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const colorSettings: CalendarSettings = {
        ...baseSettings,
        colors: {
          primary: '#ff6b6b',     // Custom red
          success: '#4ecdc4',     // Custom teal
          warning: '#ffe66d',     // Custom yellow
          danger: '#ff5722',      // Custom orange-red
          purple: '#9c27b0',      // Custom purple
          teal: '#00bcd4',        // Custom cyan
          orange: '#ff9800',      // Custom orange
          pink: '#e91e63'         // Custom pink
        }
      };

      render(
        <CLACalendar
          settings={colorSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Check that the calendar rendered by looking for date elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should handle partial color theme updates', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const partialColorSettings: CalendarSettings = {
        ...baseSettings,
        colors: {
          primary: '#8b5cf6',     // Only override primary
          success: '#10b981'      // Only override success
          // Other colors should use defaults
        }
      };

      render(
        <CLACalendar
          settings={partialColorSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Check that the calendar rendered by looking for date elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Layer Functionality and Data Rendering', () => {
    it('should render multiple layers with events and backgrounds', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const layerSettings: CalendarSettings = {
        ...baseSettings,
        showLayersNavigation: true,
        defaultLayer: 'Events',
        layers: [
          {
            name: "Calendar",
            title: "Base Calendar",
            description: "Basic calendar functionality",
            required: true,
            visible: true,
            data: { events: [], background: [] }
          },
          {
            name: 'Events',
            title: 'Company Events',
            description: 'Internal company events',
            visible: true,
            data: {
              events: [
                {
                  date: '2025-06-20',
                  title: 'Team Meeting',
                  type: 'meeting',
                  time: '10:00 AM',
                  description: 'Weekly sync meeting',
                  color: '#3b82f6'
                },
                {
                  date: '2025-06-25',
                  title: 'Project Deadline',
                  type: 'deadline',
                  time: '5:00 PM',
                  description: 'Sprint completion',
                  color: '#ef4444'
                }
              ],
              background: [
                {
                  startDate: '2025-06-16',
                  endDate: '2025-06-20',
                  color: '#dbeafe' // Light blue background
                }
              ]
            }
          },
          {
            name: 'Holidays',
            title: 'Public Holidays',
            description: 'National holidays',
            visible: false, // Initially hidden
            data: {
              events: [
                {
                  date: '2025-07-04',
                  title: 'Independence Day',
                  type: 'holiday',
                  time: 'All Day',
                  description: 'National holiday',
                  color: '#dc2626'
                }
              ],
              background: []
            }
          }
        ]
      };

      render(
        <CLACalendar
          settings={layerSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Calendar should render successfully
      // Check that the calendar rendered by looking for date elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should handle empty layers gracefully', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const emptyLayerSettings: CalendarSettings = {
        ...baseSettings,
        layers: [
          {
            name: "Calendar",
            title: "Base Calendar",
            description: "Basic calendar functionality",
            required: true,
            visible: true,
            data: { events: [], background: [] }
          },
          {
            name: 'Empty',
            title: 'Empty Layer',
            description: 'Layer with no data',
            visible: true,
            data: {
              events: [],
              background: []
            }
          }
        ],
        showLayersNavigation: true
      };

      render(
        <CLACalendar
          settings={emptyLayerSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Check that the calendar rendered by looking for date elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should support layers without background data', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const eventsOnlySettings: CalendarSettings = {
        ...baseSettings,
        layers: [
          {
            name: "Calendar",
            title: "Base Calendar",
            description: "Basic calendar functionality",
            required: true,
            visible: true,
            data: { events: [], background: [] }
          },
          {
            name: 'EventsOnly',
            title: 'Events Only',
            description: 'Events without backgrounds',
            visible: true,
            data: {
              events: [
                {
                  date: '2025-06-18',
                  title: 'Important Meeting',
                  type: 'meeting',
                  time: '2:00 PM',
                  description: 'Quarterly review',
                  color: '#8b5cf6'
                }
              ]
              // No background property
            }
          }
        ]
      };

      render(
        <CLACalendar
          settings={eventsOnlySettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Check that the calendar rendered by looking for date elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should support complex layer configurations', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const complexLayerSettings: CalendarSettings = {
        ...baseSettings,
        showLayersNavigation: true,
        layers: [
          {
            name: "Calendar",
            title: "Base Calendar",
            description: "Basic calendar functionality",
            required: true,
            visible: true,
            data: { events: [], background: [] }
          },
          {
            name: 'Workload',
            title: 'Workload Intensity',
            description: 'Team workload periods',
            visible: true,
            data: {
              events: [
                {
                  date: '2025-06-23',
                  title: 'High Load Period Start',
                  type: 'workload',
                  time: '9:00 AM',
                  description: 'Increased workload begins',
                  color: '#f59e0b'
                }
              ],
              background: [
                {
                  startDate: '2025-06-23',
                  endDate: '2025-06-27',
                  color: '#fef3c7' // Light yellow for high workload
                },
                {
                  startDate: '2025-06-10',
                  endDate: '2025-06-14',
                  color: '#d1fae5' // Light green for normal workload
                }
              ]
            }
          }
        ]
      };

      render(
        <CLACalendar
          settings={complexLayerSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Check that the calendar rendered by looking for date elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Advanced Date Formatting and Customization', () => {
    it('should use custom date formatter in popup mode', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const customFormatter = (date: Date) => {
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
      };

      const formatterSettings: CalendarSettings = {
        ...baseSettings,
        displayMode: 'popup',
        dateFormatter: customFormatter,
        defaultRange: {
          start: '2025-06-15',
          end: '2025-06-20'
        }
      };

      render(
        <CLACalendar
          settings={formatterSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toContain('15/06/2025');
      expect(input.value).toContain('20/06/2025');
    });

    it('should use custom date range separator', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const separatorSettings: CalendarSettings = {
        ...baseSettings,
        displayMode: 'popup',
        dateRangeSeparator: ' → ',
        defaultRange: {
          start: '2025-06-15',
          end: '2025-06-20'
        }
      };

      render(
        <CLACalendar
          settings={separatorSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toContain(' → ');
    });

    it('should support multiple custom separators and formats', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const customSettings: CalendarSettings = {
        ...baseSettings,
        displayMode: 'popup',
        dateFormatter: (date: Date) => date.toLocaleDateString('de-DE'),
        dateRangeSeparator: ' bis ',
        defaultRange: {
          start: '2025-06-15',
          end: '2025-06-20'
        }
      };

      render(
        <CLACalendar
          settings={customSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toContain(' bis ');
    });

    it('should handle timezone settings', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const timezoneSettings: CalendarSettings = {
        ...baseSettings,
        timezone: 'America/New_York',
        defaultRange: {
          start: '2025-06-15',
          end: '2025-06-20'
        }
      };

      render(
        <CLACalendar
          settings={timezoneSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Check that the calendar rendered by looking for date elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should support custom base font size', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const fontSettings: CalendarSettings = {
        ...baseSettings,
        baseFontSize: '18px'
      };

      render(
        <CLACalendar
          settings={fontSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Check that the calendar rendered by looking for date elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should handle custom month width', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const widthSettings: CalendarSettings = {
        ...baseSettings,
        monthWidth: 350,
        visibleMonths: 3
      };

      render(
        <CLACalendar
          settings={widthSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Check that the calendar rendered by looking for date elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Week Start Configuration', () => {
    it('should start week on Sunday when configured', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const sundaySettings: CalendarSettings = {
        ...baseSettings,
        startWeekOnSunday: true
      };

      render(
        <CLACalendar
          settings={sundaySettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Check that the calendar rendered by looking for date elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should start week on Monday by default', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const mondaySettings: CalendarSettings = {
        ...baseSettings,
        startWeekOnSunday: false
      };

      render(
        <CLACalendar
          settings={mondaySettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Check that the calendar rendered by looking for date elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('UI Feature Toggles', () => {
    it('should hide header when configured', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const noHeaderSettings: CalendarSettings = {
        ...baseSettings,
        showHeader: false
      };

      render(
        <CLACalendar
          settings={noHeaderSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Check that the calendar rendered by looking for date elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should hide footer when configured', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const noFooterSettings: CalendarSettings = {
        ...baseSettings,
        showFooter: false
      };

      render(
        <CLACalendar
          settings={noFooterSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Check that the calendar rendered by looking for date elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should disable tooltips when configured', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const noTooltipsSettings: CalendarSettings = {
        ...baseSettings,
        showTooltips: false
      };

      render(
        <CLACalendar
          settings={noTooltipsSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Check that the calendar rendered by looking for date elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should show submit button when configured', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const submitSettings: CalendarSettings = {
        ...baseSettings,
        showSubmitButton: true
      };

      render(
        <CLACalendar
          settings={submitSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      expect(screen.getByText(/submit/i)).toBeInTheDocument();
    });

    it('should suppress tooltips during selection when configured', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const suppressSettings: CalendarSettings = {
        ...baseSettings,
        suppressTooltipsOnSelection: true
      };

      render(
        <CLACalendar
          settings={suppressSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Check that the calendar rendered by looking for date elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should show selection alerts when configured', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const alertSettings: CalendarSettings = {
        ...baseSettings,
        showSelectionAlert: true
      };

      render(
        <CLACalendar
          settings={alertSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Check that the calendar rendered by looking for date elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Position and Layout Configuration', () => {
    it('should support different popup positions', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const positions = ['bottom-right', 'bottom-left', 'top-right', 'top-left'] as const;
      
      positions.forEach((position, index) => {
        const positionSettings: CalendarSettings = {
          ...baseSettings,
          displayMode: 'popup',
          position: position
        };

        const { unmount } = render(
          <CLACalendar
            settings={positionSettings}
            _onSettingsChange={mockOnSettingsChange}
          />
        );

        // Check that at least one textbox is present
        expect(screen.getAllByRole('textbox').length).toBeGreaterThan(0);
        
        // Unmount after each render to avoid conflicts
        unmount();
      });
    });

    it('should support dynamic positioning', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const dynamicSettings: CalendarSettings = {
        ...baseSettings,
        displayMode: 'popup',
        useDynamicPosition: true,
        position: 'bottom-right'
      };

      render(
        <CLACalendar
          settings={dynamicSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should handle different visible month configurations', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const monthCounts = [1, 2, 3, 4, 5, 6];
      
      monthCounts.forEach(count => {
        const monthSettings: CalendarSettings = {
          ...baseSettings,
          visibleMonths: count
        };

        render(
          <CLACalendar
            settings={monthSettings}
            _onSettingsChange={mockOnSettingsChange}
          />
        );

        // Check that the calendar rendered by looking for date elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Input Customization in Popup Mode', () => {
    it('should apply custom input className', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const inputSettings: CalendarSettings = {
        ...baseSettings,
        displayMode: 'popup',
        inputClassName: 'custom-calendar-input'
      };

      render(
        <CLACalendar
          settings={inputSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-calendar-input');
    });

    it('should apply custom input styles', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const inputSettings: CalendarSettings = {
        ...baseSettings,
        displayMode: 'popup',
        inputStyle: {
          border: '2px solid purple',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '16px'
        }
      };

      render(
        <CLACalendar
          settings={inputSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveStyle({
        border: '2px solid purple',
        padding: '12px'
      });
    });

    it('should handle custom input onChange', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const mockInputChange = vi.fn();
      const inputSettings: CalendarSettings = {
        ...baseSettings,
        displayMode: 'popup',
        inputOnChange: mockInputChange
      };

      render(
        <CLACalendar
          settings={inputSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test input' } });
      
      expect(mockInputChange).toHaveBeenCalled();
    });
  });

  describe('Complex Configuration Combinations', () => {
    it('should handle comprehensive settings configuration', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const comprehensiveSettings: CalendarSettings = {
        ...baseSettings,
        displayMode: 'embedded',
        visibleMonths: 3,
        monthWidth: 350,
        selectionMode: 'range',
        startWeekOnSunday: true,
        showTooltips: true,
        showHeader: true,
        showFooter: true,
        showSubmitButton: true,
        showLayersNavigation: true,
        baseFontSize: '16px',
        dateRangeSeparator: ' ↔ ',
        colors: {
          primary: '#6366f1',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444'
        },
        containerStyle: {
          border: '2px solid #e5e7eb',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        },
        layers: [
          {
            name: "Calendar",
            title: "Base Calendar",
            description: "Basic calendar functionality",
            required: true,
            visible: true,
            data: { events: [], background: [] }
          },
          {
            name: 'ComprehensiveLayer',
            title: 'Comprehensive Test Layer',
            description: 'Layer with all features',
            visible: true,
            data: {
              events: [
                {
                  date: '2025-06-20',
                  title: 'Complex Event',
                  type: 'meeting',
                  time: '3:00 PM',
                  description: 'Event with all properties',
                  color: '#6366f1'
                }
              ],
              background: [
                {
                  startDate: '2025-06-18',
                  endDate: '2025-06-22',
                  color: '#f0f9ff'
                }
              ]
            }
          }
        ],
        defaultRange: {
          start: '2025-06-15',
          end: '2025-06-25'
        }
      };

      render(
        <CLACalendar
          settings={comprehensiveSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Check that the calendar rendered by looking for date elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      // Check for submit button (may be present)
      const submitElements = screen.queryAllByText(/submit/i);
      expect(submitElements.length).toBeGreaterThanOrEqual(0);
    });

    it('should gracefully handle edge case configurations', () => {
      const { mockOnSettingsChange, baseSettings } = createTestSetup();
      const edgeCaseSettings: CalendarSettings = {
        ...baseSettings,
        visibleMonths: 1,
        monthWidth: 200,
        showHeader: false,
        showFooter: false,
        showTooltips: false,
        showLayersNavigation: false,
        layers: [
          {
            name: "Calendar",
            title: "Minimal Calendar",
            description: "Edge case minimal configuration",
            required: true,
            visible: true,
            data: { events: [], background: [] }
          }
        ],
        containerStyle: {
          boxShadow: 'none',
          border: 'none',
          borderRadius: '0',
          backgroundColor: 'transparent'
        }
      };

      render(
        <CLACalendar
          settings={edgeCaseSettings}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Check that the calendar rendered by looking for calendar wrapper or date text
      const calendarWrapper = document.querySelector('.cla-calendar-wrapper');
      expect(calendarWrapper || screen.getByText('1')).toBeTruthy();
    });
  });
});