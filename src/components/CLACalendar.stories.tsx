import type { Meta, StoryObj } from '@storybook/react';
import { CLACalendar, SimpleCalendar } from './CLACalendar';
import { CalendarSettings, SimpleCalendarSettings } from './CLACalendar.config';
import { generateStoryDocs, formatLayerInfo, formatRestrictionInfo } from './utils/storybook-docs';

const meta = {
  title: 'Calendar/CLACalendar',
  component: CLACalendar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'CLACalendar is a flexible date range picker component for React with drag selection support.',
      },
    },
  },
  argTypes: {
    displayMode: {
      control: { type: 'select' },
      options: ['embedded', 'popup'],
      description: 'How the calendar should be displayed',
    },
    isOpen: {
      control: 'boolean',
      description: 'Whether the calendar is open (for popup mode)',
    },
    visibleMonths: {
      control: { type: 'range', min: 1, max: 6 },
      description: 'Number of months to display',
    },
    selectionMode: {
      control: { type: 'select' },
      options: ['single', 'range'],
      description: 'Calendar selection mode',
    },
    startWeekOnSunday: {
      control: 'boolean',
      description: 'Whether to start the week on Sunday (vs Monday)',
    },
    showSubmitButton: {
      control: 'boolean',
      description: 'Whether to show the submit button',
    },
    showTooltips: {
      control: 'boolean',
      description: 'Whether to show tooltips on calendar items',
    },
    showHeader: {
      control: 'boolean',
      description: 'Whether to show the calendar header',
    },
    showFooter: {
      control: 'boolean',
      description: 'Whether to show the calendar footer',
    },
    showLayersNavigation: {
      control: 'boolean',
      description: 'Whether to show layer navigation tabs',
    },
  },
} satisfies Meta<typeof CLACalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  render: (args) => (
    <CLACalendar 
      key="default-story"
      settings={{
        displayMode: args.displayMode || 'popup',
        isOpen: args.isOpen ?? true,
        visibleMonths: args.visibleMonths || 2,
        selectionMode: args.selectionMode || 'range',
        showSubmitButton: args.showSubmitButton ?? true,
        showHeader: args.showHeader ?? true,
        showFooter: args.showFooter ?? true,
        showTooltips: args.showTooltips ?? true,
        startWeekOnSunday: args.startWeekOnSunday || false,
      }}
    />
  ),
  args: {
    displayMode: 'popup',
    isOpen: true,
    visibleMonths: 2,
    selectionMode: 'range',
    showSubmitButton: true,
    showHeader: true,
    showFooter: true,
    showTooltips: true,
    startWeekOnSunday: false,
  },
  parameters: {
    ...generateStoryDocs(
      'Default Calendar',
      'Basic calendar configuration with popup display and range selection. This is the most common setup for the CLACalendar component.',
      'basic',
      'All standard features are enabled including header, footer, tooltips, and submit button.'
    ),
  },
};

// Simple Calendar story
export const Simple: Story = {
  render: (args) => (
    <CLACalendar 
      key="simple-story"
      settings={{
        displayMode: args.displayMode || 'popup',
        isOpen: args.isOpen ?? true,
        visibleMonths: args.visibleMonths || 1,
        selectionMode: args.selectionMode || 'range',
        showSubmitButton: args.showSubmitButton ?? true,
        startWeekOnSunday: args.startWeekOnSunday || false,
        showHeader: args.showHeader ?? true,
        showFooter: args.showFooter ?? true,
        showTooltips: args.showTooltips ?? true,
      }}
      onSubmit={(start, end) => {
        console.log('Date range selected:', { start, end });
      }}
    />
  ),
  args: {
    displayMode: 'popup',
    isOpen: true,
    visibleMonths: 1,
    selectionMode: 'range',
    showSubmitButton: true,
    startWeekOnSunday: false,
    showHeader: true,
    showFooter: true,
    showTooltips: true,
  },
};

// Single date selection
export const SingleSelection: Story = {
  render: (args) => (
    <CLACalendar 
      key="single-selection-story"
      settings={{
        displayMode: args.displayMode || 'popup',
        isOpen: args.isOpen ?? true,
        visibleMonths: args.visibleMonths || 1,
        selectionMode: args.selectionMode || 'single',
        showSubmitButton: args.showSubmitButton ?? true,
        showHeader: args.showHeader ?? true,
        showFooter: args.showFooter ?? true,
        showTooltips: args.showTooltips ?? true,
        startWeekOnSunday: args.startWeekOnSunday || false,
      }}
    />
  ),
  args: {
    displayMode: 'popup',
    isOpen: true,
    visibleMonths: 1,
    selectionMode: 'single',
    showSubmitButton: true,
    showHeader: true,
    showFooter: true,
    showTooltips: true,
    startWeekOnSunday: false,
  },
  parameters: {
    ...generateStoryDocs(
      'Single Date Selection',
      'Calendar configured for single date selection instead of date ranges. Perfect for appointment booking or single-date events.',
      'singleDate',
      'Click any date to select it. Only one date can be selected at a time.'
    ),
  },
};

// Multiple months
export const MultipleMonths: Story = {
  render: (args) => (
    <CLACalendar 
      key="multiple-months-story"
      settings={{
        displayMode: args.displayMode || 'popup',
        isOpen: args.isOpen ?? true,
        visibleMonths: args.visibleMonths || 3,
        selectionMode: args.selectionMode || 'range',
        showHeader: args.showHeader ?? true,
        showFooter: args.showFooter ?? true,
        showTooltips: args.showTooltips ?? true,
        startWeekOnSunday: args.startWeekOnSunday || false,
        showSubmitButton: args.showSubmitButton ?? true,
      }}
    />
  ),
  args: {
    displayMode: 'popup',
    isOpen: true,
    visibleMonths: 3,
    selectionMode: 'range',
    showHeader: true,
    showFooter: true,
    showTooltips: true,
    startWeekOnSunday: false,
    showSubmitButton: true,
  },
};

// With custom colors
export const CustomColors: Story = {
  render: (args) => (
    <CLACalendar 
      key="custom-colors-story"
      settings={{
        displayMode: args.displayMode || 'popup',
        isOpen: args.isOpen ?? true,
        visibleMonths: args.visibleMonths || 2,
        selectionMode: args.selectionMode || 'range',
        showHeader: args.showHeader ?? true,
        showFooter: args.showFooter ?? true,
        showTooltips: args.showTooltips ?? true,
        startWeekOnSunday: args.startWeekOnSunday || false,
        showSubmitButton: args.showSubmitButton ?? true,
        colors: {
          primary: '#8B5CF6',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
        },
      }}
    />
  ),
  args: {
    displayMode: 'popup',
    isOpen: true,
    visibleMonths: 2,
    selectionMode: 'range',
    showHeader: true,
    showFooter: true,
    showTooltips: true,
    startWeekOnSunday: false,
    showSubmitButton: true,
  },
};

// Week starting on Sunday
export const WeekStartSunday: Story = {
  render: (args) => (
    <CLACalendar 
      key="week-start-sunday-story"
      settings={{
        displayMode: args.displayMode || 'popup',
        isOpen: args.isOpen ?? true,
        visibleMonths: args.visibleMonths || 1,
        selectionMode: args.selectionMode || 'range',
        startWeekOnSunday: args.startWeekOnSunday ?? true,
        showHeader: args.showHeader ?? true,
        showFooter: args.showFooter ?? true,
        showTooltips: args.showTooltips ?? true,
        showSubmitButton: args.showSubmitButton ?? true,
      }}
    />
  ),
  args: {
    displayMode: 'popup',
    isOpen: true,
    visibleMonths: 1,
    selectionMode: 'range',
    startWeekOnSunday: true,
    showHeader: true,
    showFooter: true,
    showTooltips: true,
    showSubmitButton: true,
  },
};

// With sample events
export const WithEvents: Story = {
  render: (args) => (
    <CLACalendar 
      key="with-events-story"
      settings={{
        displayMode: args.displayMode || 'popup',
        isOpen: args.isOpen ?? true,
        visibleMonths: args.visibleMonths || 2,
        selectionMode: args.selectionMode || 'range',
        showHeader: args.showHeader ?? true,
        showFooter: args.showFooter ?? true,
        showTooltips: args.showTooltips ?? true,
        startWeekOnSunday: args.startWeekOnSunday || false,
        showSubmitButton: args.showSubmitButton ?? true,
        showLayersNavigation: args.showLayersNavigation ?? true,
        defaultLayer: 'Events',
        defaultRange: {
          start: '2024-01-01',
          end: '2024-01-05',
        },
        layers: [
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
        ],
      }}
    />
  ),
  args: {
    displayMode: 'popup',
    isOpen: true,
    visibleMonths: 2,
    selectionMode: 'range',
    showHeader: true,
    showFooter: true,
    showTooltips: true,
    startWeekOnSunday: false,
    showSubmitButton: true,
    showLayersNavigation: true,
  },
  parameters: {
    docs: {
      description: {
        story: `Calendar with sample events and background colors demonstrating layer functionality.

**Features Shown:**
- Layer navigation tabs
- Event markers with tooltips
- Background color ranges
- Interactive event system

**Configuration Details:**
- **Layers:** 1 layer with events and backgrounds
- **Events:** 2 sample events (Team Meeting, Project Deadline)
- **Backgrounds:** 1 highlighted date range (Jan 10-12)
- **Layer Navigation:** Enabled for switching between layers

**Layer Information:**
${formatLayerInfo([
  {
    name: 'Events',
    title: 'Sample Events',
    data: {
      events: [
        { date: '2024-01-15', title: 'Team Meeting' },
        { date: '2024-01-20', title: 'Project Deadline' }
      ],
      background: [
        { startDate: '2024-01-10', endDate: '2024-01-12' }
      ]
    }
  }
])}

**Usage:** Hover over event markers to see detailed tooltips. Background colors indicate special date ranges.`
      }
    }
  },
};

// Minimal configuration
export const Minimal: Story = {
  render: (args) => (
    <CLACalendar 
      key="minimal-story"
      settings={{
        displayMode: args.displayMode || 'popup',
        isOpen: args.isOpen ?? true,
        visibleMonths: args.visibleMonths || 1,
        selectionMode: args.selectionMode || 'range',
        showHeader: args.showHeader ?? true,
        showFooter: args.showFooter ?? true,
        showTooltips: args.showTooltips ?? true,
        startWeekOnSunday: args.startWeekOnSunday || false,
        showSubmitButton: args.showSubmitButton ?? true,
        defaultLayer: 'Calendar',
      }}
    />
  ),
  args: {
    displayMode: 'popup',
    isOpen: true,
    visibleMonths: 1,
    selectionMode: 'range',
    showHeader: true,
    showFooter: true,
    showTooltips: true,
    startWeekOnSunday: false,
    showSubmitButton: true,
  },
};

// Test case: Submit button disabled
export const NoSubmitButton: Story = {
  render: (args) => (
    <CLACalendar 
      key="no-submit-button-story"
      settings={{
        displayMode: args.displayMode || 'popup',
        isOpen: args.isOpen ?? true,
        visibleMonths: args.visibleMonths || 1,
        selectionMode: args.selectionMode || 'range',
        showHeader: args.showHeader ?? true,
        showFooter: args.showFooter ?? true,
        showTooltips: args.showTooltips ?? true,
        startWeekOnSunday: args.startWeekOnSunday || false,
        showSubmitButton: false, // Explicitly testing submit OFF
      }}
    />
  ),
  args: {
    displayMode: 'popup',
    isOpen: true,
    visibleMonths: 1,
    selectionMode: 'range',
    showHeader: true,
    showFooter: true,
    showTooltips: true,
    startWeekOnSunday: false,
    showSubmitButton: false,
  },
};