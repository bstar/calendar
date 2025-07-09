export const eventTypesGalleryCode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    displayMode: 'embedded',
    visibleMonths: 2,
    showTooltips: true,
    showLayersNavigation: true,
    showSubmitButton: true,
    defaultLayer: 'Meetings',
    defaultRange: {
      start: '2024-01-01',
      end: '2024-01-05',
    },
    layers: [
      {
        name: 'Meetings',
        title: 'Meetings & Calls',
        description: 'Internal and external meetings',
        visible: true,
        data: {
          events: [
            {
              date: '2024-01-03',
              title: 'Daily Standup',
              type: 'meeting',
              time: '9:00 AM',
              description: 'Team synchronization meeting',
              color: '#3B82F6',
            },
            // More meeting events...
          ],
        },
      },
      {
        name: 'Deadlines',
        title: 'Deadlines & Milestones',
        description: 'Project deadlines and important milestones',
        visible: true,
        data: {
          events: [
            {
              date: '2024-01-05',
              title: 'Sprint Planning Complete',
              type: 'deadline',
              time: '5:00 PM',
              description: 'Complete sprint planning',
              color: '#F59E0B',
            },
            // More deadline events...
          ],
        },
      },
      // Additional layers for Learning and Social events
    ],
  }}
  _onSettingsChange={() => {}}
/>`;

export const denseEventCalendarCode = `// Dense calendar with many events
const generateDenseEvents = () => {
  const events = [];
  
  // Week 1
  events.push(
    { date: '2024-01-02', title: 'Project Kickoff', type: 'meeting', time: '9:00 AM', color: '#3B82F6' },
    { date: '2024-01-02', title: 'Design Review', type: 'review', time: '2:00 PM', color: '#8B5CF6' },
    { date: '2024-01-03', title: 'Daily Standup', type: 'meeting', time: '9:15 AM', color: '#3B82F6' },
    { date: '2024-01-03', title: 'Code Review', type: 'review', time: '3:30 PM', color: '#059669' },
    // More events...
  );
  
  return events;
};

<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    displayMode: 'embedded',
    visibleMonths: 1,
    showTooltips: true,
    showLayersNavigation: false,
    layers: [
      {
        name: 'BusyMonth',
        title: 'Busy January',
        description: 'High-density month with many events',
        visible: true,
        data: {
          events: generateDenseEvents(),
        },
      },
    ],
  }}
  _onSettingsChange={() => {}}
/>`;

export const recurringPatternsCode = `// Simulating recurring events
<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    displayMode: 'embedded',
    visibleMonths: 2,
    showTooltips: true,
    showLayersNavigation: true,
    defaultLayer: 'Daily',
    layers: [
      {
        name: 'Daily',
        title: 'Daily Recurring',
        description: 'Events that happen every day',
        visible: true,
        data: {
          events: [
            // Daily standups for weekdays
            { date: '2024-01-02', title: 'Daily Standup', type: 'meeting', time: '9:00 AM', color: '#3B82F6' },
            { date: '2024-01-03', title: 'Daily Standup', type: 'meeting', time: '9:00 AM', color: '#3B82F6' },
            { date: '2024-01-04', title: 'Daily Standup', type: 'meeting', time: '9:00 AM', color: '#3B82F6' },
            // Continue pattern...
          ],
        },
      },
      {
        name: 'Weekly',
        title: 'Weekly Recurring',
        description: 'Events that happen every week',
        visible: true,
        data: {
          events: [
            // Weekly reviews every Friday
            { date: '2024-01-05', title: 'Weekly Review', type: 'review', time: '4:00 PM', color: '#059669' },
            { date: '2024-01-12', title: 'Weekly Review', type: 'review', time: '4:00 PM', color: '#059669' },
            // Weekly 1:1s every Tuesday
            { date: '2024-01-02', title: '1:1 with Manager', type: 'meeting', time: '2:00 PM', color: '#8B5CF6' },
            { date: '2024-01-09', title: '1:1 with Manager', type: 'meeting', time: '2:00 PM', color: '#8B5CF6' },
          ],
        },
      },
      {
        name: 'Monthly',
        title: 'Monthly Recurring',
        description: 'Events that happen monthly',
        visible: true,
        data: {
          events: [
            { date: '2024-01-15', title: 'All Hands Meeting', type: 'meeting', time: '11:00 AM', color: '#DC2626' },
            { date: '2024-02-15', title: 'All Hands Meeting', type: 'meeting', time: '11:00 AM', color: '#DC2626' },
          ],
        },
      },
    ],
  }}
  _onSettingsChange={() => {}}
/>`;

export const richEventTooltipsCode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    displayMode: 'embedded',
    visibleMonths: 1,
    showTooltips: true,
    layers: [
      {
        name: 'DetailedEvents',
        title: 'Events with Rich Details',
        description: 'Events with comprehensive information for tooltips',
        visible: true,
        data: {
          events: [
            {
              date: '2024-01-05',
              title: 'Product Strategy Meeting',
              type: 'meeting',
              time: '10:00 AM - 12:00 PM',
              description: 'Comprehensive product strategy session covering Q1 roadmap, competitive analysis, user feedback review, and feature prioritization. Attendees include product managers, engineering leads, and design team. Location: Conference Room A. Pre-reading materials were sent on January 2nd.',
              color: '#3B82F6',
            },
            {
              date: '2024-01-10',
              title: 'Technical Architecture Review',
              type: 'review',
              time: '2:00 PM - 4:00 PM',
              description: 'Deep dive into the proposed microservices architecture for the new user management system. Review includes performance implications, security considerations, database design, API contracts, and deployment strategies.',
              color: '#059669',
            },
            // More events with detailed descriptions...
          ],
        },
      },
    ],
  }}
  _onSettingsChange={() => {}}
/>`;

export const multiLayerVisualizationCode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    displayMode: 'embedded',
    visibleMonths: 2,
    showTooltips: true,
    showLayersNavigation: true,
    showSubmitButton: false,
    defaultLayer: 'Meetings',
    layers: [
      {
        name: 'Meetings',
        title: 'Meetings',
        description: 'All meetings and calls',
        visible: true,
        color: '#3B82F6',
        data: {
          events: [/* meeting events */],
          background: [
            {
              startDate: '2024-01-01',
              endDate: '2024-01-05',
              color: 'rgba(59, 130, 246, 0.1)',
            },
          ],
        },
      },
      {
        name: 'Development',
        title: 'Development',
        description: 'Development activities',
        visible: true,
        color: '#059669',
        data: {
          events: [/* dev events */],
          background: [
            {
              startDate: '2024-01-08',
              endDate: '2024-01-12',
              color: 'rgba(5, 150, 105, 0.1)',
            },
          ],
        },
      },
      {
        name: 'Important',
        title: 'Important Dates',
        description: 'Critical deadlines and milestones',
        visible: true,
        required: true, // Cannot be hidden
        color: '#DC2626',
        data: {
          events: [/* critical events */],
          background: [/* highlight important dates */],
        },
      },
    ],
  }}
  _onSettingsChange={() => {}}
/>`;

export const eventConflictsCode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    displayMode: 'embedded',
    visibleMonths: 1,
    showTooltips: true,
    layers: [
      {
        name: 'ConflictingSchedule',
        title: 'Schedule with Conflicts',
        description: 'Multiple events at the same time',
        visible: true,
        data: {
          events: [
            // January 10 - Triple conflict at 10:00 AM
            {
              date: '2024-01-10',
              title: 'Client Meeting',
              type: 'meeting',
              time: '10:00 AM',
              description: 'Important client presentation - PRIORITY',
              color: '#DC2626',
            },
            {
              date: '2024-01-10',
              title: 'Team Standup',
              type: 'meeting',
              time: '10:00 AM',
              description: 'Daily team sync - Can be rescheduled',
              color: '#3B82F6',
            },
            {
              date: '2024-01-10',
              title: 'Training Session',
              type: 'training',
              time: '10:00 AM',
              description: 'Optional training - Recording available',
              color: '#059669',
            },
            // More conflicting events...
          ],
        },
      },
    ],
  }}
  _onSettingsChange={() => {}}
/>`;

export const colorCodedEventsCode = `// Event colors by type
const eventColorScheme = {
  meeting: '#3B82F6',      // Blue for meetings
  deadline: '#DC2626',     // Red for deadlines
  training: '#059669',     // Green for training
  social: '#8B5CF6',       // Purple for social
  review: '#F59E0B',       // Amber for reviews
  milestone: '#EC4899',    // Pink for milestones
};

<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    displayMode: 'embedded',
    layers: [
      {
        name: 'ColorCoded',
        title: 'Color-Coded Events',
        data: {
          events: events.map(event => ({
            ...event,
            color: eventColorScheme[event.type] || '#6B7280'
          }))
        }
      }
    ]
  }}
  _onSettingsChange={() => {}}
/>`;

export const eventDensityVisualizationCode = `// Visual representation of busy vs quiet periods
<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    displayMode: 'embedded',
    layers: [
      {
        name: 'Density',
        title: 'Schedule Density',
        data: {
          events: [...allEvents],
          background: [
            // Light background for quiet weeks
            { startDate: '2024-01-01', endDate: '2024-01-07', color: 'rgba(34, 197, 94, 0.1)' },
            // Medium background for normal weeks
            { startDate: '2024-01-08', endDate: '2024-01-14', color: 'rgba(251, 191, 36, 0.1)' },
            // Dark background for busy weeks
            { startDate: '2024-01-15', endDate: '2024-01-21', color: 'rgba(239, 68, 68, 0.1)' },
          ]
        }
      }
    ]
  }}
  _onSettingsChange={() => {}}
/>`;