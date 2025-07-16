import type { Meta, StoryObj } from '@storybook/react';
import { CLACalendar } from '../components/CLACalendar';
import { calendarArgTypes, defaultArgs } from './shared/storyControls';
import { CalendarStoryWrapper } from './shared/CalendarStoryWrapper';

const meta: Meta<typeof CLACalendar> = {
  title: 'Layers/Stories',
  component: CLACalendar,
  argTypes: calendarArgTypes,
  args: defaultArgs,
  parameters: {
    docs: {
      description: {
        component: 'Layers allow you to display different types of data on the calendar such as events, holidays, and background highlights.'
      }
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic layer with events
export const BasicEventLayer: Story = {
  args: {
    ...defaultArgs,
    showLayersNavigation: true,
    layers: [{
      name: 'meetings',
      title: 'Team Meetings',
      description: 'Recurring team meetings and standups',
      visible: true,
      enabled: true,
      color: '#0366d6',
      data: {
        events: [
          { date: '2025-03-10', title: 'Sprint Planning', type: 'meeting', time: '10:00 AM', description: 'Plan next sprint tasks' },
          { date: '2025-03-12', title: 'Design Review', type: 'meeting', time: '2:00 PM', description: 'Review new UI designs' },
          { date: '2025-03-14', title: 'Retrospective', type: 'meeting', time: '3:00 PM', description: 'Sprint retrospective' },
          { date: '2025-03-17', title: 'Daily Standup', type: 'meeting', time: '9:00 AM', description: 'Team sync' },
          { date: '2025-03-19', title: 'Tech Talk', type: 'meeting', time: '4:00 PM', description: 'Frontend best practices' }
        ]
      }
    }]
  },
  render: (args) => (
    <CalendarStoryWrapper 
      args={args}
      title="Basic Event Layer"
      description="Calendar with a single layer showing team meetings. Toggle the layer on/off using the navigation."
    />
  )
};

// Multiple layers example
export const MultipleLayers: Story = {
  args: {
    ...defaultArgs,
    showLayersNavigation: true,
    defaultLayer: 'holidays',
    layers: [
      {
        name: 'holidays',
        title: 'Public Holidays',
        description: 'Federal holidays and observances',
        visible: true,
        enabled: true,
        required: true,
        color: '#dc3545',
        data: {
          events: [
            { date: '2025-01-01', title: 'New Year\'s Day', type: 'holiday', time: 'All day', description: 'Federal holiday' },
            { date: '2025-01-20', title: 'MLK Day', type: 'holiday', time: 'All day', description: 'Federal holiday' },
            { date: '2025-02-17', title: 'Presidents Day', type: 'holiday', time: 'All day', description: 'Federal holiday' },
            { date: '2025-05-26', title: 'Memorial Day', type: 'holiday', time: 'All day', description: 'Federal holiday' },
            { date: '2025-07-04', title: 'Independence Day', type: 'holiday', time: 'All day', description: 'Federal holiday' }
          ]
        }
      },
      {
        name: 'meetings',
        title: 'Team Meetings',
        description: 'Recurring team meetings',
        visible: true,
        enabled: true,
        color: '#0366d6',
        data: {
          events: [
            { date: '2025-01-06', title: 'Q1 Planning', type: 'meeting', time: '10:00 AM', description: 'Quarterly planning session' },
            { date: '2025-01-13', title: 'Sprint Review', type: 'meeting', time: '2:00 PM', description: 'Demo new features' },
            { date: '2025-01-27', title: 'All Hands', type: 'meeting', time: '1:00 PM', description: 'Company-wide meeting' },
            { date: '2025-02-03', title: 'Design Sprint', type: 'meeting', time: '9:00 AM', description: '3-day design workshop' }
          ]
        }
      },
      {
        name: 'deadlines',
        title: 'Project Deadlines',
        description: 'Important project milestones',
        visible: false,
        enabled: true,
        color: '#f6c23e',
        data: {
          events: [
            { date: '2025-01-15', title: 'Feature Freeze', type: 'deadline', time: '5:00 PM', description: 'Code freeze for v2.0' },
            { date: '2025-01-31', title: 'Release v2.0', type: 'deadline', time: 'EOD', description: 'Production deployment' },
            { date: '2025-02-28', title: 'Q1 Report Due', type: 'deadline', time: '5:00 PM', description: 'Quarterly report submission' }
          ]
        }
      }
    ]
  },
  render: (args) => (
    <CalendarStoryWrapper 
      args={args}
      title="Multiple Layers"
      description="Calendar with three layers: holidays (required), meetings, and deadlines (hidden by default). Use the layer navigation to toggle visibility."
    />
  )
};

// Background highlights layer
export const BackgroundHighlights: Story = {
  args: {
    ...defaultArgs,
    showLayersNavigation: true,
    layers: [{
      name: 'sprints',
      title: 'Sprint Schedule',
      description: 'Two-week sprint cycles',
      visible: true,
      enabled: true,
      color: '#20c997',
      data: {
        background: [
          { startDate: '2025-03-03', endDate: '2025-03-14', color: '#e7f5ff' },
          { startDate: '2025-03-17', endDate: '2025-03-28', color: '#fff0f6' },
          { startDate: '2025-03-31', endDate: '2025-04-11', color: '#e7f5ff' }
        ],
        events: [
          { date: '2025-03-03', title: 'Sprint 23 Start', type: 'milestone', time: '9:00 AM', description: 'Sprint kickoff' },
          { date: '2025-03-14', title: 'Sprint 23 End', type: 'milestone', time: '5:00 PM', description: 'Sprint review & retro' },
          { date: '2025-03-17', title: 'Sprint 24 Start', type: 'milestone', time: '9:00 AM', description: 'Sprint kickoff' },
          { date: '2025-03-28', title: 'Sprint 24 End', type: 'milestone', time: '5:00 PM', description: 'Sprint review & retro' }
        ]
      }
    }]
  },
  render: (args) => (
    <CalendarStoryWrapper 
      args={args}
      title="Background Highlights"
      description="Calendar showing sprint cycles with background colors. Each sprint has a different background color to distinguish them."
    />
  )
};

// Combined events and backgrounds
export const CombinedEventsAndBackgrounds: Story = {
  args: {
    ...defaultArgs,
    showLayersNavigation: true,
    visibleMonths: 2,
    layers: [
      {
        name: 'conferences',
        title: 'Conference Schedule',
        description: 'Tech conferences and workshops',
        visible: true,
        enabled: true,
        color: '#6f42c1',
        data: {
          background: [
            { startDate: '2025-04-14', endDate: '2025-04-18', color: '#f3f0ff' },
            { startDate: '2025-05-05', endDate: '2025-05-07', color: '#fff5f5' }
          ],
          events: [
            { date: '2025-04-14', title: 'ReactConf Day 1', type: 'conference', time: '9:00 AM', description: 'Opening keynote' },
            { date: '2025-04-15', title: 'ReactConf Day 2', type: 'conference', time: '9:00 AM', description: 'Workshops' },
            { date: '2025-04-16', title: 'ReactConf Day 3', type: 'conference', time: '9:00 AM', description: 'Advanced talks' },
            { date: '2025-04-17', title: 'ReactConf Day 4', type: 'conference', time: '9:00 AM', description: 'Community day' },
            { date: '2025-04-18', title: 'ReactConf Day 5', type: 'conference', time: '9:00 AM', description: 'Closing ceremony' },
            { date: '2025-05-05', title: 'GraphQL Summit', type: 'conference', time: '10:00 AM', description: 'Day 1' },
            { date: '2025-05-06', title: 'GraphQL Summit', type: 'conference', time: '10:00 AM', description: 'Day 2' },
            { date: '2025-05-07', title: 'GraphQL Summit', type: 'conference', time: '10:00 AM', description: 'Day 3' }
          ]
        }
      },
      {
        name: 'travel',
        title: 'Travel & Logistics',
        description: 'Flight and hotel bookings',
        visible: true,
        enabled: true,
        color: '#fd7e14',
        data: {
          events: [
            { date: '2025-04-13', title: 'Flight to SF', type: 'travel', time: '6:00 AM', description: 'AA 2456' },
            { date: '2025-04-19', title: 'Flight home', type: 'travel', time: '7:00 PM', description: 'AA 2457' },
            { date: '2025-05-04', title: 'Flight to NYC', type: 'travel', time: '8:00 AM', description: 'DL 1234' },
            { date: '2025-05-08', title: 'Flight home', type: 'travel', time: '6:00 PM', description: 'DL 1235' }
          ]
        }
      }
    ]
  },
  render: (args) => (
    <CalendarStoryWrapper 
      args={args}
      title="Combined Events and Backgrounds"
      description="Conference schedule with background highlights for conference dates, plus a separate travel layer for logistics."
    />
  )
};

// Custom colored events
export const CustomColoredEvents: Story = {
  args: {
    ...defaultArgs,
    showLayersNavigation: false,
    layers: [{
      name: 'tasks',
      title: 'Task Priorities',
      description: 'Tasks colored by priority',
      visible: true,
      enabled: true,
      data: {
        events: [
          { date: '2025-03-10', title: 'Critical Bug Fix', type: 'task', time: 'ASAP', description: 'Production issue', color: '#dc3545' },
          { date: '2025-03-11', title: 'Feature Review', type: 'task', time: '2:00 PM', description: 'Review PR #123', color: '#f6c23e' },
          { date: '2025-03-12', title: 'Documentation', type: 'task', time: 'Anytime', description: 'Update API docs', color: '#28a745' },
          { date: '2025-03-13', title: 'Security Patch', type: 'task', time: '10:00 AM', description: 'Apply security updates', color: '#dc3545' },
          { date: '2025-03-14', title: 'Code Refactor', type: 'task', time: 'Afternoon', description: 'Clean up legacy code', color: '#0366d6' },
          { date: '2025-03-17', title: 'Performance Test', type: 'task', time: '11:00 AM', description: 'Load testing', color: '#f6c23e' },
          { date: '2025-03-18', title: 'Deploy Staging', type: 'task', time: '4:00 PM', description: 'Stage deployment', color: '#28a745' }
        ]
      }
    }]
  },
  render: (args) => (
    <CalendarStoryWrapper 
      args={args}
      title="Custom Colored Events"
      description="Events with custom colors based on priority. Red for critical, yellow for important, green for normal, blue for informational."
    />
  )
};

// Layer with restrictions
export const LayersWithRestrictions: Story = {
  args: {
    ...defaultArgs,
    showLayersNavigation: true,
    layers: [{
      name: 'availability',
      title: 'Team Availability',
      description: 'When team members are out of office',
      visible: true,
      enabled: true,
      color: '#e83e8c',
      data: {
        background: [
          { startDate: '2025-03-24', endDate: '2025-03-28', color: '#ffe0e6' }
        ],
        events: [
          { date: '2025-03-24', title: 'Sarah OOO', type: 'absence', time: 'All day', description: 'Vacation' },
          { date: '2025-03-25', title: 'Sarah OOO', type: 'absence', time: 'All day', description: 'Vacation' },
          { date: '2025-03-26', title: 'Sarah OOO', type: 'absence', time: 'All day', description: 'Vacation' },
          { date: '2025-03-27', title: 'Sarah OOO', type: 'absence', time: 'All day', description: 'Vacation' },
          { date: '2025-03-28', title: 'Sarah OOO', type: 'absence', time: 'All day', description: 'Vacation' }
        ]
      }
    }]
  },
  restrictionConfigFactory: () => ({
    restrictions: [{
      type: 'daterange',
      enabled: true,
      ranges: [{
        startDate: '2025-03-24',
        endDate: '2025-03-28',
        message: 'Cannot schedule during team member absence'
      }]
    }]
  }),
  render: (args) => (
    <CalendarStoryWrapper 
      args={args}
      title="Layers with Restrictions"
      description="Team availability layer combined with date restrictions. The highlighted dates show when team members are out and cannot be selected."
      restrictionConfigFactory={() => ({
        restrictions: [{
          type: 'daterange',
          enabled: true,
          ranges: [{
            startDate: '2025-03-24',
            endDate: '2025-03-28',
            message: 'Cannot schedule during team member absence'
          }]
        }]
      })}
    />
  )
};

// Empty layer state
export const EmptyLayer: Story = {
  args: {
    ...defaultArgs,
    showLayersNavigation: true,
    layers: [{
      name: 'events',
      title: 'Upcoming Events',
      description: 'No events scheduled yet',
      visible: true,
      enabled: true,
      color: '#0366d6',
      data: {
        events: []
      }
    }]
  },
  render: (args) => (
    <CalendarStoryWrapper 
      args={args}
      title="Empty Layer"
      description="Calendar with an empty events layer. This shows how the calendar appears when a layer has no data."
    />
  )
};

// Dynamic layer toggling
export const DynamicLayerToggling: Story = {
  args: {
    ...defaultArgs,
    showLayersNavigation: true,
    visibleMonths: 1,
    layers: [
      {
        name: 'weekends',
        title: 'Weekends',
        description: 'Highlight weekends',
        visible: true,
        enabled: true,
        color: '#20c997',
        data: {
          background: [
            { startDate: '2025-03-01', endDate: '2025-03-02', color: '#e6fcf5' },
            { startDate: '2025-03-08', endDate: '2025-03-09', color: '#e6fcf5' },
            { startDate: '2025-03-15', endDate: '2025-03-16', color: '#e6fcf5' },
            { startDate: '2025-03-22', endDate: '2025-03-23', color: '#e6fcf5' },
            { startDate: '2025-03-29', endDate: '2025-03-30', color: '#e6fcf5' }
          ]
        }
      },
      {
        name: 'workdays',
        title: 'Work Days',
        description: 'Regular business days',
        visible: false,
        enabled: true,
        color: '#0366d6',
        data: {
          background: [
            { startDate: '2025-03-03', endDate: '2025-03-07', color: '#e7f5ff' },
            { startDate: '2025-03-10', endDate: '2025-03-14', color: '#e7f5ff' },
            { startDate: '2025-03-17', endDate: '2025-03-21', color: '#e7f5ff' },
            { startDate: '2025-03-24', endDate: '2025-03-28', color: '#e7f5ff' }
          ]
        }
      },
      {
        name: 'holidays',
        title: 'Holidays',
        description: 'Public holidays',
        visible: true,
        enabled: true,
        color: '#dc3545',
        data: {
          events: [
            { date: '2025-03-17', title: 'St. Patrick\'s Day', type: 'holiday', time: 'All day', description: 'Irish holiday' }
          ]
        }
      }
    ]
  },
  render: (args) => (
    <CalendarStoryWrapper 
      args={args}
      title="Dynamic Layer Toggling"
      description="Toggle between different layer views. Try enabling/disabling weekends, workdays, and holidays to see different perspectives."
    />
  )
};