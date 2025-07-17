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
    showTooltips: true,
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
          { date: '2025-07-21', title: 'Sprint Planning', type: 'meeting', time: '10:00 AM', description: 'Sprint 46 planning session. Review backlog items, estimate story points, and commit to sprint goals. Product owner will prioritize features. Dev team to provide capacity estimates.' },
          { date: '2025-07-23', title: 'Design Review', type: 'meeting', time: '2:00 PM', description: 'UI/UX design review for dashboard v2. Design team presenting 3 concepts based on user research. Discussing accessibility compliance and mobile responsiveness. Feedback needed by EOD.' },
          { date: '2025-07-25', title: 'Retrospective', type: 'meeting', time: '3:00 PM', description: 'Sprint 45 retrospective. Celebrating wins, discussing challenges, and identifying process improvements. Anonymous feedback collected. Action items will be tracked in Jira.' },
          { date: '2025-07-28', title: 'Daily Standup', type: 'meeting', time: '9:00 AM', description: 'Team sync' },
          { date: '2025-07-30', title: 'Tech Talk', type: 'meeting', time: '4:00 PM', description: 'Frontend best practices' },
          { date: '2025-08-01', title: 'Monthly Planning', type: 'meeting', time: '9:00 AM', description: 'August monthly planning and Q3 check-in. Review July metrics, adjust August targets, and align on priorities. Marketing to present campaign results. Engineering to share velocity trends. Budget review included.' },
          { date: '2025-08-04', title: 'Code Review', type: 'meeting', time: '2:00 PM', description: 'Weekly code review session. Focus on authentication service refactor (PR #1234) and new API endpoints (PR #1235-1240). Please review PRs beforehand. Discussing coding standards updates.' },
          { date: '2025-08-06', title: 'Team Retro', type: 'meeting', time: '3:00 PM', description: 'Monthly retrospective' }
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
    showTooltips: true,
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
            { date: '2025-07-04', title: 'Independence Day', type: 'holiday', time: 'All day', description: 'US Federal holiday - All offices closed. No meetings or deadlines scheduled. Emergency support available via on-call rotation.' },
            { date: '2025-07-28', title: 'Summer Bank Holiday', type: 'holiday', time: 'All day', description: 'Company-wide summer break day. Offices closed globally. Automated systems remain operational. Enjoy your day off!' },
            { date: '2025-08-15', title: 'Mid-August Holiday', type: 'holiday', time: 'All day', description: 'Regional holiday observed in EMEA region. US and APAC offices remain open with reduced staffing. Check team calendars for availability.' }
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
            { date: '2025-07-14', title: 'Q3 Planning', type: 'meeting', time: '10:00 AM', description: 'Q3 2025 quarterly planning kickoff. Review Q2 performance metrics, set Q3 OKRs, and align on strategic initiatives. Executive team and all department heads required. Zoom link in calendar invite.' },
            { date: '2025-07-18', title: 'Sprint Review', type: 'meeting', time: '2:00 PM', description: 'Sprint 45 review and demo session. Teams will present completed features including new authentication flow, performance improvements, and mobile UI updates. Stakeholders welcome. Recording available after.' },
            { date: '2025-07-25', title: 'All Hands', type: 'meeting', time: '1:00 PM', description: 'Monthly all-hands meeting. CEO updates, Q2 financials review, new hire introductions, and team achievements. Submit questions via Slido. Catered lunch for in-office attendees.' },
            { date: '2025-08-04', title: 'Design Sprint', type: 'meeting', time: '9:00 AM', description: '3-day design workshop' },
            { date: '2025-08-08', title: 'Tech Sync', type: 'meeting', time: '11:00 AM', description: 'Engineering alignment' },
            { date: '2025-08-12', title: 'Product Review', type: 'meeting', time: '2:00 PM', description: 'Product roadmap review' }
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
            { date: '2025-07-15', title: 'Feature Freeze', type: 'deadline', time: '5:00 PM', description: 'v3.0 Feature Freeze - No new features after 5 PM EST. Only bug fixes and critical security patches allowed. QA team begins full regression testing tomorrow morning.' },
            { date: '2025-07-31', title: 'Release v3.0', type: 'deadline', time: 'EOD', description: 'v3.0 Production Release - Deployment window 6-10 PM EST. Features include new dashboard, improved performance (40% faster), and enhanced security. Rollback plan ready.' },
            { date: '2025-08-01', title: 'Q3 Kickoff', type: 'deadline', time: '9:00 AM', description: 'Quarter starts' },
            { date: '2025-08-15', title: 'Beta Release', type: 'deadline', time: '12:00 PM', description: 'Beta version due' },
            { date: '2025-08-29', title: 'Q2 Report Due', type: 'deadline', time: '5:00 PM', description: 'Quarterly report submission' }
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
    showTooltips: true,
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
          { startDate: '2025-07-14', endDate: '2025-07-25', color: '#e7f5ff' },
          { startDate: '2025-07-28', endDate: '2025-08-08', color: '#fff0f6' },
          { startDate: '2025-08-11', endDate: '2025-08-22', color: '#e7f5ff' }
        ],
        events: [
          { date: '2025-07-14', title: 'Sprint 45 Start', type: 'milestone', time: '9:00 AM', description: 'Sprint 45 begins - Focus areas: OAuth 2.0 implementation, database query optimization, and responsive design fixes. 26 story points committed. Daily standups at 9:15 AM.' },
          { date: '2025-07-25', title: 'Sprint 45 End', type: 'milestone', time: '5:00 PM', description: 'Sprint 45 concludes - Demo at 2 PM, retrospective at 3 PM. Prepare demo environments and gather metrics. Submit peer feedback for sprint awards. Happy hour after!' },
          { date: '2025-07-28', title: 'Sprint 46 Start', type: 'milestone', time: '9:00 AM', description: 'Sprint kickoff' },
          { date: '2025-08-08', title: 'Sprint 46 End', type: 'milestone', time: '5:00 PM', description: 'Sprint 46 completion - 24 of 28 story points delivered. 2 stories carry over to Sprint 47. Velocity trending up! Demo highlights: New search feature and 50% faster page loads. Retro theme: Improving CI/CD pipeline.' },
          { date: '2025-08-11', title: 'Sprint 47 Start', type: 'milestone', time: '9:00 AM', description: 'Sprint kickoff' },
          { date: '2025-08-22', title: 'Sprint 47 End', type: 'milestone', time: '5:00 PM', description: 'Sprint review & retro' }
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
    showTooltips: true,
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
            { startDate: '2025-07-21', endDate: '2025-07-23', color: '#f3f0ff' },
            { startDate: '2025-08-18', endDate: '2025-08-20', color: '#fff5f5' }
          ],
          events: [
            { date: '2025-07-21', title: 'Tech Summit Day 1', type: 'conference', time: '9:00 AM', description: 'Tech Summit 2025 kicks off! Opening keynote by Sarah Chen (CTO) on AI in software development. Followed by tracks on cloud architecture, DevOps, and frontend innovations. Breakfast and lunch provided.' },
            { date: '2025-07-22', title: 'Tech Summit Day 2', type: 'conference', time: '9:00 AM', description: 'Hands-on workshop day. Choose from: Kubernetes mastery, React performance optimization, or Machine Learning basics. Limited to 30 participants per workshop. Bring laptops!' },
            { date: '2025-07-23', title: 'Tech Summit Day 3', type: 'conference', time: '9:00 AM', description: 'Final day featuring lightning talks, panel discussion on future of tech, and closing ceremony. Networking lunch at noon. Conference swag and certificates distributed at 4 PM.' },
            { date: '2025-08-18', title: 'Frontend Conf', type: 'conference', time: '10:00 AM', description: 'Frontend Conference Day 1: React Deep Dive. Sessions include React 19 features, Server Components in production, and performance optimization techniques. Keynote by Dan Abramov. Virtual attendance available.' },
            { date: '2025-08-19', title: 'Frontend Conf', type: 'conference', time: '10:00 AM', description: 'Day 2 - Vue' },
            { date: '2025-08-20', title: 'Frontend Conf', type: 'conference', time: '10:00 AM', description: 'Day 3 - Angular' }
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
            { date: '2025-07-20', title: 'Flight to SF', type: 'travel', time: '6:00 AM', description: 'American Airlines AA 2456 to San Francisco. Depart: JFK Terminal 8 at 6:00 AM. Arrive: SFO at 9:15 AM PST. Seat 14A confirmed. TSA PreCheck available. Uber to hotel booked.' },
            { date: '2025-07-24', title: 'Flight home', type: 'travel', time: '7:00 PM', description: 'Return flight AA 2457 to New York. Depart: SFO at 7:00 PM PST. Arrive: JFK at 3:30 AM EST (red-eye). Remember to check out of hotel by noon. Airport shuttle at 4:30 PM.' },
            { date: '2025-08-17', title: 'Flight to NYC', type: 'travel', time: '8:00 AM', description: 'DL 1234' },
            { date: '2025-08-21', title: 'Flight home', type: 'travel', time: '6:00 PM', description: 'DL 1235' }
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
    showTooltips: true,
    showLayersNavigation: false,
    layers: [{
      name: 'tasks',
      title: 'Task Priorities',
      description: 'Tasks colored by priority',
      visible: true,
      enabled: true,
      data: {
        events: [
          { date: '2025-07-16', title: 'Critical Bug Fix', type: 'task', time: 'ASAP', description: 'URGENT: Payment gateway timeout affecting 15% of transactions. Root cause: Database connection pool exhaustion. Fix deployed to staging. Needs immediate production push. Incident Commander: David Liu.', color: '#dc3545' },
          { date: '2025-07-17', title: 'Feature Review', type: 'task', time: '2:00 PM', description: 'Review PR #123: New user dashboard implementation. Check responsive design, accessibility (WCAG 2.1 AA), and performance benchmarks. Ensure unit test coverage > 80%. Approve by EOD if ready.', color: '#f6c23e' },
          { date: '2025-07-18', title: 'Documentation', type: 'task', time: 'Anytime', description: 'Update API docs', color: '#28a745' },
          { date: '2025-07-22', title: 'Security Patch', type: 'task', time: '10:00 AM', description: 'Apply security updates', color: '#dc3545' },
          { date: '2025-07-24', title: 'Code Refactor', type: 'task', time: 'Afternoon', description: 'Clean up legacy code', color: '#0366d6' },
          { date: '2025-07-29', title: 'Performance Test', type: 'task', time: '11:00 AM', description: 'Load testing', color: '#f6c23e' },
          { date: '2025-07-31', title: 'Deploy Staging', type: 'task', time: '4:00 PM', description: 'Stage deployment', color: '#28a745' },
          { date: '2025-08-05', title: 'API Updates', type: 'task', time: '10:00 AM', description: 'Begin migration of user service from REST to GraphQL. Phase 1: Define schema, implement resolvers for read operations. Maintain backwards compatibility. Documentation in Confluence. Pair with Jennifer.' },
          { date: '2025-08-07', title: 'Security Audit', type: 'task', time: '2:00 PM', description: 'Quarterly audit', color: '#dc3545' }
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
    showTooltips: true,
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
          { startDate: '2025-08-11', endDate: '2025-08-15', color: '#ffe0e6' }
        ],
        events: [
          { date: '2025-08-11', title: 'Sarah OOO', type: 'absence', time: 'All day', description: 'Sarah Johnson (Lead Backend Engineer) - On vacation in Hawaii 🏝️. For urgent backend issues contact Mike Chen. For code reviews, please assign to Tom Williams. Back in office Monday Aug 18.' },
          { date: '2025-08-12', title: 'Sarah OOO', type: 'absence', time: 'All day', description: 'Sarah Johnson (Lead Backend Engineer) - Vacation day 2/5. Still in Hawaii enjoying the beach 🏖️. Coverage: Mike Chen (backend), Tom Williams (code reviews). Do not disturb unless critical.' },
          { date: '2025-08-13', title: 'Sarah OOO', type: 'absence', time: 'All day', description: 'Vacation' },
          { date: '2025-08-14', title: 'Sarah OOO', type: 'absence', time: 'All day', description: 'Vacation' },
          { date: '2025-08-15', title: 'Sarah OOO', type: 'absence', time: 'All day', description: 'Vacation' }
        ]
      }
    }]
  },
  restrictionConfigFactory: () => ({
    restrictions: [{
      type: 'daterange',
      enabled: true,
      ranges: [{
        startDate: '2025-08-11',
        endDate: '2025-08-15',
        message: 'Cannot schedule during team member absence'
      }]
    }]
  }),
  render: (args) => (
    <CalendarStoryWrapper 
      args={args}
      title="Layers with Restrictions"
      description="Team availability layer combined with date restrictions. The highlighted dates show when team members are out and cannot be selected."
      settingsOverrides={{ 
        restrictionConfigFactory: () => ({
          restrictions: [{
            type: 'daterange',
            enabled: true,
            ranges: [{
              startDate: '2025-08-11',
              endDate: '2025-08-15',
              message: 'Cannot schedule meetings - Sarah (Lead Backend Engineer) is on vacation. Please reschedule any backend-related discussions to the following week or contact Mike Chen for urgent matters.'
            }]
          }]
        })
      }}
    />
  )
};

// Empty layer state
export const EmptyLayer: Story = {
  args: {
    ...defaultArgs,
    showTooltips: true,
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
    showTooltips: true,
    showLayersNavigation: true,
    visibleMonths: 2,
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
            { startDate: '2025-07-05', endDate: '2025-07-06', color: '#e6fcf5' },
            { startDate: '2025-07-12', endDate: '2025-07-13', color: '#e6fcf5' },
            { startDate: '2025-07-19', endDate: '2025-07-20', color: '#e6fcf5' },
            { startDate: '2025-07-26', endDate: '2025-07-27', color: '#e6fcf5' },
            { startDate: '2025-08-02', endDate: '2025-08-03', color: '#e6fcf5' },
            { startDate: '2025-08-09', endDate: '2025-08-10', color: '#e6fcf5' },
            { startDate: '2025-08-16', endDate: '2025-08-17', color: '#e6fcf5' },
            { startDate: '2025-08-23', endDate: '2025-08-24', color: '#e6fcf5' },
            { startDate: '2025-08-30', endDate: '2025-08-31', color: '#e6fcf5' }
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
            { startDate: '2025-07-07', endDate: '2025-07-11', color: '#e7f5ff' },
            { startDate: '2025-07-14', endDate: '2025-07-18', color: '#e7f5ff' },
            { startDate: '2025-07-21', endDate: '2025-07-25', color: '#e7f5ff' },
            { startDate: '2025-07-28', endDate: '2025-08-01', color: '#e7f5ff' },
            { startDate: '2025-08-04', endDate: '2025-08-08', color: '#e7f5ff' },
            { startDate: '2025-08-11', endDate: '2025-08-15', color: '#e7f5ff' },
            { startDate: '2025-08-18', endDate: '2025-08-22', color: '#e7f5ff' },
            { startDate: '2025-08-25', endDate: '2025-08-29', color: '#e7f5ff' }
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
            { date: '2025-07-04', title: 'Independence Day', type: 'holiday', time: 'All day', description: 'US Federal holiday - All offices closed. No meetings or deadlines scheduled. Emergency support available via on-call rotation.' },
            { date: '2025-07-28', title: 'Summer Bank Holiday', type: 'holiday', time: 'All day', description: 'Company-wide summer break day. Offices closed globally. Automated systems remain operational. Enjoy your day off!' },
            { date: '2025-08-15', title: 'Mid-August Holiday', type: 'holiday', time: 'All day', description: 'Regional holiday observed in EMEA region. US and APAC offices remain open with reduced staffing. Check team calendars for availability.' }
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