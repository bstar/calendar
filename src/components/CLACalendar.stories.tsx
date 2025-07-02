import type { Meta, StoryObj } from '@storybook/react';
import { CLACalendar } from './CLACalendar';
import { CalendarSettings } from './CLACalendar.config';
import { generateStoryDocs, formatLayerInfo, formatRestrictionInfo } from './utils/storybook-docs';
import { CLACalendarArgTypes, CLACalendarDefaultArgs, mapArgsToSettings } from './utils/storybook-argtypes';

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
  argTypes: CLACalendarArgTypes as any, // Type assertion to allow our custom argTypes
} satisfies Meta<typeof CLACalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  render: (args) => (
    <CLACalendar 
      key="default-story"
      settings={mapArgsToSettings(args)}
    />
  ),
  args: CLACalendarDefaultArgs as any, // Type assertion for Storybook args compatibility
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
      settings={mapArgsToSettings(args)}
      onSubmit={(start, end) => {
        console.log('Date range selected:', { start, end });
      }}
    />
  ),
  args: {
    ...CLACalendarDefaultArgs,
    visibleMonths: 1,
  } as any, // Type assertion for Storybook args compatibility
};

// Single date selection
export const SingleSelection: Story = {
  render: (args) => (
    <CLACalendar 
      key="single-selection-story"
      settings={mapArgsToSettings(args)}
    />
  ),
  args: {
    ...CLACalendarDefaultArgs,
    visibleMonths: 1,
    selectionMode: 'single',
  } as any, // Type assertion for Storybook args compatibility
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
      settings={mapArgsToSettings(args)}
    />
  ),
  args: {
    ...CLACalendarDefaultArgs,
    visibleMonths: 3,
  } as any, // Type assertion for Storybook args compatibility
};

// With custom colors
export const CustomColors: Story = {
  render: (args) => (
    <CLACalendar 
      key="custom-colors-story"
      settings={{
        ...mapArgsToSettings(args),
        colors: {
          primary: '#8B5CF6',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
        },
      }}
    />
  ),
  args: CLACalendarDefaultArgs as any, // Type assertion for Storybook args compatibility
};

// Week starting on Sunday
export const WeekStartSunday: Story = {
  render: (args) => (
    <CLACalendar 
      key="week-start-sunday-story"
      settings={mapArgsToSettings(args)}
    />
  ),
  args: {
    ...CLACalendarDefaultArgs,
    visibleMonths: 1,
    startWeekOnSunday: true,
  } as any, // Type assertion for Storybook args compatibility
};

// With sample events
export const WithEvents: Story = {
  render: (args) => (
    <CLACalendar 
      key="with-events-story"
      settings={{
        ...mapArgsToSettings(args),
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
    ...CLACalendarDefaultArgs,
    showLayersNavigation: true,
  } as any, // Type assertion for Storybook args compatibility
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
        ...mapArgsToSettings(args),
        defaultLayer: 'Calendar',
      }}
    />
  ),
  args: {
    ...CLACalendarDefaultArgs,
    visibleMonths: 1,
  } as any, // Type assertion for Storybook args compatibility
};

// Test case: Submit button disabled
export const NoSubmitButton: Story = {
  render: (args) => (
    <CLACalendar 
      key="no-submit-button-story"
      settings={mapArgsToSettings(args)}
    />
  ),
  args: {
    ...CLACalendarDefaultArgs,
    visibleMonths: 1,
    showSubmitButton: false, // Explicitly testing submit OFF
  } as any, // Type assertion for Storybook args compatibility
};