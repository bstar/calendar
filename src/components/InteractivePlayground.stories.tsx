import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { CLACalendar, SimpleCalendar } from './CLACalendar';
import { CalendarSettings, createCalendarSettings } from './CLACalendar.config';

const meta = {
  title: 'Calendar/Interactive Playground',
  component: CLACalendar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Interactive playground for testing all calendar features with live controls.',
      },
    },
  },
} satisfies Meta<typeof CLACalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Full featured playground
export const FullPlayground: Story = {
  render: (args) => {
    const [selectedRange, setSelectedRange] = useState<{start: string | null, end: string | null}>({
      start: null,
      end: null,
    });

    const settings = createCalendarSettings({
      displayMode: args.displayMode || 'embedded',
      visibleMonths: args.visibleMonths || 2,
      selectionMode: args.selectionMode || 'range',
      showSubmitButton: args.showSubmitButton || false,
      showHeader: args.showHeader ?? true,
      showFooter: args.showFooter ?? true,
      showTooltips: args.showTooltips ?? true,
      startWeekOnSunday: args.startWeekOnSunday || false,
      colors: {
        primary: args.primaryColor || '#0366d6',
        success: args.successColor || '#28a745',
        warning: args.warningColor || '#f6c23e',
        danger: args.dangerColor || '#dc3545',
      },
      layers: args.showEvents ? [
        {
          name: 'Events',
          title: 'Sample Events',
          description: 'Example events layer',
          visible: true,
          data: {
            events: [
              {
                date: '2024-01-15',
                title: 'Team Meeting',
                type: 'meeting',
                time: '10:00 AM',
                description: 'Weekly team sync',
                color: '#3B82F6',
              },
              {
                date: '2024-01-20',
                title: 'Project Deadline',
                type: 'deadline',
                time: '5:00 PM',
                description: 'Sprint deadline',
                color: '#EF4444',
              },
            ],
            background: [
              {
                startDate: '2024-01-10',
                endDate: '2024-01-12',
                color: '#FEF3C7',
              },
            ],
          },
        },
      ] : undefined,
    });

    return (
      <div style={{ padding: '20px' }}>
        <CLACalendar
          settings={settings}
          onSubmit={(start, end) => {
            setSelectedRange({ start, end });
          }}
        />
        {selectedRange.start && (
          <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
            <strong>Selected Range:</strong>
            <br />
            Start: {selectedRange.start}
            <br />
            End: {selectedRange.end}
          </div>
        )}
      </div>
    );
  },
  args: {
    displayMode: 'embedded',
    visibleMonths: 2,
    selectionMode: 'range',
    showSubmitButton: true,
    showHeader: true,
    showFooter: true,
    showTooltips: true,
    startWeekOnSunday: false,
    showEvents: true,
    primaryColor: '#0366d6',
    successColor: '#28a745',
    warningColor: '#f6c23e',
    dangerColor: '#dc3545',
  },
  argTypes: {
    displayMode: {
      control: { type: 'select' },
      options: ['embedded', 'popup'],
      description: 'Calendar display mode',
    },
    visibleMonths: {
      control: { type: 'range', min: 1, max: 6 },
      description: 'Number of months to display',
    },
    selectionMode: {
      control: { type: 'select' },
      options: ['single', 'range'],
      description: 'Date selection mode',
    },
    showSubmitButton: {
      control: 'boolean',
      description: 'Show submit button',
    },
    showHeader: {
      control: 'boolean',
      description: 'Show calendar header',
    },
    showFooter: {
      control: 'boolean',
      description: 'Show calendar footer',
    },
    showTooltips: {
      control: 'boolean',
      description: 'Show tooltips on hover',
    },
    startWeekOnSunday: {
      control: 'boolean',
      description: 'Start week on Sunday',
    },
    showEvents: {
      control: 'boolean',
      description: 'Show sample events layer',
    },
    primaryColor: {
      control: 'color',
      description: 'Primary theme color',
    },
    successColor: {
      control: 'color',
      description: 'Success theme color',
    },
    warningColor: {
      control: 'color',
      description: 'Warning theme color',
    },
    dangerColor: {
      control: 'color',
      description: 'Danger theme color',
    },
  },
};

// Simple Calendar Playground
export const SimplePlayground: Story = {
  render: (args) => {
    const [selectedRange, setSelectedRange] = useState<{start: string | null, end: string | null}>({
      start: null,
      end: null,
    });

    return (
      <div style={{ padding: '20px' }}>
        <SimpleCalendar
          config={{
            displayMode: args.displayMode || 'embedded',
            visibleMonths: args.visibleMonths || 1,
            selectionMode: args.selectionMode || 'range',
            showSubmitButton: args.showSubmitButton || false,
            startWeekOnSunday: args.startWeekOnSunday || false,
            colors: {
              primary: args.primaryColor || '#0366d6',
            },
          }}
          onSubmit={(start, end) => {
            setSelectedRange({ start, end });
          }}
        />
        {selectedRange.start && (
          <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
            <strong>Selected:</strong>
            <br />
            {args.selectionMode === 'single' 
              ? `Date: ${selectedRange.start}`
              : `Range: ${selectedRange.start} to ${selectedRange.end}`
            }
          </div>
        )}
      </div>
    );
  },
  args: {
    displayMode: 'embedded',
    visibleMonths: 1,
    selectionMode: 'range',
    showSubmitButton: true,
    startWeekOnSunday: false,
    primaryColor: '#0366d6',
  },
  argTypes: {
    displayMode: {
      control: { type: 'select' },
      options: ['embedded', 'popup'],
      description: 'Calendar display mode',
    },
    visibleMonths: {
      control: { type: 'range', min: 1, max: 3 },
      description: 'Number of months to display',
    },
    selectionMode: {
      control: { type: 'select' },
      options: ['single', 'range'],
      description: 'Date selection mode',
    },
    showSubmitButton: {
      control: 'boolean',
      description: 'Show submit button',
    },
    startWeekOnSunday: {
      control: 'boolean',
      description: 'Start week on Sunday',
    },
    primaryColor: {
      control: 'color',
      description: 'Primary theme color',
    },
  },
};

// Configuration Comparison
export const ConfigurationComparison: Story = {
  render: () => {
    return (
      <div style={{ padding: '20px' }}>
        <h3>Configuration Comparison</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          
          <div>
            <h4>Minimal Configuration</h4>
            <SimpleCalendar />
          </div>
          
          <div>
            <h4>Single Date Selection</h4>
            <SimpleCalendar 
              config={{
                selectionMode: 'single',
                visibleMonths: 1,
                showSubmitButton: true,
              }}
            />
          </div>
          
          <div>
            <h4>Multiple Months</h4>
            <SimpleCalendar 
              config={{
                visibleMonths: 2,
                selectionMode: 'range',
              }}
            />
          </div>
          
          <div>
            <h4>Custom Theme</h4>
            <SimpleCalendar 
              config={{
                visibleMonths: 1,
                colors: {
                  primary: '#9333EA',
                  success: '#059669',
                },
              }}
            />
          </div>
          
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'fullscreen',
  },
};

// Performance Test
export const PerformanceTest: Story = {
  render: () => {
    return (
      <div style={{ padding: '20px' }}>
        <h3>Performance Test - Multiple Calendars</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i}>
              <h4>Calendar {i + 1}</h4>
              <SimpleCalendar 
                config={{
                  visibleMonths: 1,
                  selectionMode: i % 2 === 0 ? 'single' : 'range',
                  colors: {
                    primary: `hsl(${i * 60}, 70%, 50%)`,
                  },
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'fullscreen',
  },
};