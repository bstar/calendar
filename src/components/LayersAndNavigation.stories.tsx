import type { Meta, StoryObj } from '@storybook/react';
import { CLACalendar } from './CLACalendar';
import { CalendarSettings } from './CLACalendar.config';
import { formatLayerInfo } from './utils/storybook-docs';

const meta = {
  title: 'Calendar/Layers & Navigation',
  component: CLACalendar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Examples showcasing layer management, navigation, and background colors with visible layer tabs.',
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
    showLayersNavigation: {
      control: 'boolean',
      description: 'Show layer navigation tabs',
    },
  },
} satisfies Meta<typeof CLACalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Multiple layers with navigation
export const MultipleLayers: Story = {
  render: (args) => (
    <CLACalendar 
      settings={{
        displayMode: args.displayMode || 'popup',
        isOpen: args.isOpen ?? true,
        visibleMonths: args.visibleMonths || 2,
        showLayersNavigation: args.showLayersNavigation ?? true,
        showSubmitButton: true,
        defaultLayer: 'Events',
        defaultRange: {
          start: '2024-01-01',
          end: '2024-01-03',
        },
        layers: [
          {
            name: 'Events',
            title: 'Team Events',
            description: 'Company meetings and events',
            visible: true,
            data: {
              events: [
                {
                  date: '2024-01-08',
                  title: 'All Hands Meeting',
                  type: 'meeting',
                  time: '10:00 AM',
                  description: 'Monthly company meeting',
                  color: '#3B82F6',
                },
                {
                  date: '2024-01-15',
                  title: 'Team Lunch',
                  type: 'social',
                  time: '12:00 PM',
                  description: 'Team building lunch',
                  color: '#10B981',
                },
              ],
            },
          },
          {
            name: 'Holidays',
            title: 'Holidays',
            description: 'Company holidays and time off',
            visible: true,
            data: {
              events: [
                {
                  date: '2024-01-01',
                  title: 'New Year\'s Day',
                  type: 'holiday',
                  time: 'All Day',
                  description: 'Public holiday',
                  color: '#EF4444',
                },
                {
                  date: '2024-01-15',
                  title: 'MLK Day',
                  type: 'holiday',
                  time: 'All Day',
                  description: 'Martin Luther King Jr. Day',
                  color: '#EF4444',
                },
              ],
            },
          },
          {
            name: 'Deadlines',
            title: 'Project Deadlines',
            description: 'Important project milestones',
            visible: true,
            data: {
              events: [
                {
                  date: '2024-01-20',
                  title: 'Sprint Review',
                  type: 'deadline',
                  time: '3:00 PM',
                  description: 'End of sprint demonstration',
                  color: '#F59E0B',
                },
                {
                  date: '2024-01-30',
                  title: 'Q1 Planning',
                  type: 'deadline',
                  time: '2:00 PM',
                  description: 'Quarterly planning session',
                  color: '#F59E0B',
                },
              ],
            },
          },
          {
            name: 'Personal',
            title: 'Personal Events',
            description: 'Personal appointments and reminders',
            visible: false, // Start hidden to demonstrate layer toggle
            data: {
              events: [
                {
                  date: '2024-01-12',
                  title: 'Doctor Appointment',
                  type: 'personal',
                  time: '2:30 PM',
                  description: 'Annual checkup',
                  color: '#8B5CF6',
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
    showLayersNavigation: true,
  },
};

// Background colors demonstration
export const BackgroundColors: Story = {
  render: (args) => (
    <CLACalendar 
      settings={{
        displayMode: args.displayMode || 'popup',
        isOpen: args.isOpen ?? true,
        visibleMonths: args.visibleMonths || 2,
        showLayersNavigation: args.showLayersNavigation ?? true,
        showSubmitButton: true,
        defaultLayer: 'Vacations',
        defaultRange: {
          start: '2024-01-01',
          end: '2024-01-03',
        },
        layers: [
          {
            name: 'Vacations',
            title: 'Team Vacations',
            description: 'Planned time off periods',
            visible: true,
            data: {
              background: [
                {
                  startDate: '2024-01-15',
                  endDate: '2024-01-19',
                  color: '#FEF3C7', // Light yellow
                },
                {
                  startDate: '2024-02-05',
                  endDate: '2024-02-09',
                  color: '#DBEAFE', // Light blue
                },
              ],
              events: [
                {
                  date: '2024-01-15',
                  title: 'John - Vacation Start',
                  type: 'vacation',
                  time: 'All Day',
                  description: 'Winter vacation',
                  color: '#F59E0B',
                },
              ],
            },
          },
          {
            name: 'BusyPeriods',
            title: 'Busy Periods',
            description: 'High-intensity work periods',
            visible: true,
            data: {
              background: [
                {
                  startDate: '2024-01-22',
                  endDate: '2024-01-26',
                  color: '#FEE2E2', // Light red
                },
                {
                  startDate: '2024-02-12',
                  endDate: '2024-02-16',
                  color: '#FCE7F3', // Light pink
                },
              ],
              events: [
                {
                  date: '2024-01-22',
                  title: 'Crunch Week',
                  type: 'busy',
                  time: 'All Week',
                  description: 'Release preparation',
                  color: '#DC2626',
                },
              ],
            },
          },
          {
            name: 'Conferences',
            title: 'Conference Season',
            description: 'Industry conferences and events',
            visible: true,
            data: {
              background: [
                {
                  startDate: '2024-02-20',
                  endDate: '2024-02-23',
                  color: '#F3E8FF', // Light purple
                },
              ],
              events: [
                {
                  date: '2024-02-20',
                  title: 'Tech Conference 2024',
                  type: 'conference',
                  time: '9:00 AM',
                  description: 'Annual technology summit',
                  color: '#7C3AED',
                },
                {
                  date: '2024-02-22',
                  title: 'Keynote Speech',
                  type: 'conference',
                  time: '11:00 AM',
                  description: 'CEO keynote presentation',
                  color: '#7C3AED',
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
    showLayersNavigation: true,
  },
  parameters: {
    docs: {
      description: {
        story: `Comprehensive demonstration of background color functionality across multiple layers and date ranges.

**Background Color Features:**
- **Multiple Layers:** Each layer can have its own background color scheme
- **Date Range Highlighting:** Color-coded periods for different purposes
- **Visual Categorization:** Different colors indicate different types of periods

**Layer Configuration:**
${formatLayerInfo([
  {
    name: 'Vacations',
    title: 'Team Vacations',
    data: {
      events: [{ date: '2024-01-15', title: 'John - Vacation Start' }],
      background: [
        { startDate: '2024-01-15', endDate: '2024-01-19', color: '#FEF3C7' },
        { startDate: '2024-02-05', endDate: '2024-02-09', color: '#DBEAFE' }
      ]
    }
  },
  {
    name: 'BusyPeriods',
    title: 'Busy Periods',
    data: {
      events: [{ date: '2024-01-22', title: 'Crunch Week' }],
      background: [
        { startDate: '2024-01-22', endDate: '2024-01-26', color: '#FEE2E2' },
        { startDate: '2024-02-12', endDate: '2024-02-16', color: '#FCE7F3' }
      ]
    }
  },
  {
    name: 'Conferences',
    title: 'Conference Season',
    data: {
      events: [
        { date: '2024-02-20', title: 'Tech Conference 2024' },
        { date: '2024-02-22', title: 'Keynote Speech' }
      ],
      background: [
        { startDate: '2024-02-20', endDate: '2024-02-23', color: '#F3E8FF' }
      ]
    }
  }
])}

**Color Scheme:**
- **Light Yellow (#FEF3C7):** Vacation periods
- **Light Blue (#DBEAFE):** Additional vacation time  
- **Light Red (#FEE2E2):** High-intensity work periods
- **Light Pink (#FCE7F3):** Secondary busy periods
- **Light Purple (#F3E8FF):** Conference and event periods

**Usage:** Use layer navigation tabs to switch between different background color schemes. Background colors are visible on unselected dates.`
      }
    }
  },
};

// Mixed content: events + backgrounds
export const MixedContent: Story = {
  render: (args) => (
    <CLACalendar 
      settings={{
        displayMode: args.displayMode || 'popup',
        isOpen: args.isOpen ?? true,
        visibleMonths: args.visibleMonths || 2,
        showLayersNavigation: args.showLayersNavigation ?? true,
        showSubmitButton: true,
        defaultLayer: 'WorkSchedule',
        defaultRange: {
          start: '2024-02-01',
          end: '2024-02-03',
        },
        layers: [
          {
            name: 'WorkSchedule',
            title: 'Work Schedule',
            description: 'Regular work patterns and special periods',
            visible: true,
            data: {
              background: [
                {
                  startDate: '2024-01-01',
                  endDate: '2024-01-05',
                  color: '#F0FDF4', // Very light green - normal work week
                },
                {
                  startDate: '2024-01-08',
                  endDate: '2024-01-12',
                  color: '#F0FDF4',
                },
                {
                  startDate: '2024-01-29',
                  endDate: '2024-02-02',
                  color: '#FEF3C7', // Light yellow - light work week
                },
              ],
              events: [
                {
                  date: '2024-01-03',
                  title: 'Team Standup',
                  type: 'meeting',
                  time: '9:00 AM',
                  description: 'Daily team synchronization',
                  color: '#059669',
                },
                {
                  date: '2024-01-10',
                  title: 'Sprint Planning',
                  type: 'meeting',
                  time: '10:00 AM',
                  description: 'Plan next sprint work',
                  color: '#059669',
                },
              ],
            },
          },
          {
            name: 'ClientMeetings',
            title: 'Client Meetings',
            description: 'External client interactions',
            visible: true,
            data: {
              events: [
                {
                  date: '2024-01-09',
                  title: 'Client Demo - TechCorp',
                  type: 'client',
                  time: '2:00 PM',
                  description: 'Product demonstration',
                  color: '#2563EB',
                },
                {
                  date: '2024-01-16',
                  title: 'Requirements Review',
                  type: 'client',
                  time: '11:00 AM',
                  description: 'Review new feature requirements',
                  color: '#2563EB',
                },
                {
                  date: '2024-02-06',
                  title: 'Contract Renewal',
                  type: 'client',
                  time: '3:00 PM',
                  description: 'Annual contract discussion',
                  color: '#2563EB',
                },
              ],
            },
          },
          {
            name: 'Maintenance',
            title: 'System Maintenance',
            description: 'Scheduled maintenance windows',
            visible: true,
            data: {
              background: [
                {
                  startDate: '2024-01-27',
                  endDate: '2024-01-28',
                  color: '#FEE2E2', // Light red - maintenance period
                },
              ],
              events: [
                {
                  date: '2024-01-27',
                  title: 'Database Maintenance',
                  type: 'maintenance',
                  time: '11:00 PM',
                  description: 'Scheduled database updates',
                  color: '#DC2626',
                },
                {
                  date: '2024-02-10',
                  title: 'Server Updates',
                  type: 'maintenance',
                  time: '12:00 AM',
                  description: 'Monthly server patches',
                  color: '#DC2626',
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
    showLayersNavigation: true,
  },
};

// Layer visibility demo
export const LayerToggleDemo: Story = {
  render: (args) => (
    <CLACalendar 
      settings={{
        displayMode: args.displayMode || 'popup',
        isOpen: args.isOpen ?? true,
        visibleMonths: args.visibleMonths || 1,
        showLayersNavigation: args.showLayersNavigation ?? true,
        showSubmitButton: true,
        defaultLayer: 'AlwaysVisible',
        defaultRange: {
          start: '2024-01-01',
          end: '2024-01-03',
        },
        layers: [
          {
            name: 'AlwaysVisible',
            title: 'Core Events',
            description: 'Essential events that are always shown',
            visible: true,
            required: true,
            data: {
              events: [
                {
                  date: '2024-01-05',
                  title: 'Important Deadline',
                  type: 'deadline',
                  time: '5:00 PM',
                  description: 'Critical project milestone',
                  color: '#DC2626',
                },
              ],
            },
          },
          {
            name: 'Optional1',
            title: 'Team Events',
            description: 'Team-related activities (toggle me!)',
            visible: true,
            data: {
              background: [
                {
                  startDate: '2024-01-08',
                  endDate: '2024-01-12',
                  color: '#DBEAFE',
                },
              ],
              events: [
                {
                  date: '2024-01-10',
                  title: 'Team Building',
                  type: 'team',
                  time: '2:00 PM',
                  description: 'Quarterly team building activity',
                  color: '#3B82F6',
                },
              ],
            },
          },
          {
            name: 'Optional2',
            title: 'Social Events',
            description: 'Social and informal events (toggle me!)',
            visible: false,
            data: {
              background: [
                {
                  startDate: '2024-01-15',
                  endDate: '2024-01-19',
                  color: '#F3E8FF',
                },
              ],
              events: [
                {
                  date: '2024-01-17',
                  title: 'Happy Hour',
                  type: 'social',
                  time: '5:30 PM',
                  description: 'Monthly team social event',
                  color: '#8B5CF6',
                },
              ],
            },
          },
          {
            name: 'Optional3',
            title: 'Training',
            description: 'Learning and development (toggle me!)',
            visible: false,
            data: {
              events: [
                {
                  date: '2024-01-22',
                  title: 'React Workshop',
                  type: 'training',
                  time: '9:00 AM',
                  description: 'Advanced React patterns workshop',
                  color: '#059669',
                },
                {
                  date: '2024-01-29',
                  title: 'Security Training',
                  type: 'training',
                  time: '1:00 PM',
                  description: 'Cybersecurity awareness session',
                  color: '#059669',
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
    visibleMonths: 1,
    showLayersNavigation: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates layer visibility controls. Toggle different layers on/off using the layer navigation tabs.',
      },
    },
  },
};