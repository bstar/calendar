// Layer story code examples
export const multipleLayersCode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    monthWidth: 600,
    showSubmitButton: true,
    showLayersNavigation: true,
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
            // ... more events
          ],
          background: [
            {
              startDate: '2024-01-08',
              endDate: '2024-01-10',
              color: 'rgba(59, 130, 246, 0.1)',
            },
          ],
        },
      },
      // ... more layers
    ],
  }}
  _onSettingsChange={() => {}}
/>`;

export const backgroundHighlightsCode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    monthWidth: 600,
    showSubmitButton: true,
    showLayersNavigation: true,
    defaultLayer: 'Sprints',
    defaultRange: {
      start: '2024-02-01',
      end: '2024-02-15',
    },
    layers: [
      {
        name: 'Sprints',
        title: 'Sprint Schedule',
        description: 'Two-week development sprints',
        visible: true,
        color: '#6366F1',
        data: {
          events: [
            {
              date: '2024-02-01',
              title: 'Sprint 23 Start',
              type: 'milestone',
              time: '9:00 AM',
              description: 'Planning & kickoff',
              color: '#6366F1',
            },
            {
              date: '2024-02-14',
              title: 'Sprint 23 End',
              type: 'milestone',
              time: '5:00 PM',
              description: 'Review & retrospective',
              color: '#6366F1',
            },
          ],
          background: [
            {
              startDate: '2024-02-01',
              endDate: '2024-02-14',
              color: 'rgba(99, 102, 241, 0.1)',
            },
          ],
        },
      },
      {
        name: 'Availability',
        title: 'Team Availability',
        description: 'Out of office and busy periods',
        visible: true,
        color: '#EC4899',
        data: {
          events: [],
          background: [
            {
              startDate: '2024-02-05',
              endDate: '2024-02-07',
              color: 'rgba(236, 72, 153, 0.15)',
            },
          ],
        },
      },
    ],
  }}
  _onSettingsChange={() => {}}
/>`;

export const singleLayerCode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    monthWidth: 600,
    showSubmitButton: true,
    showLayersNavigation: false, // Hide navigation for single layer
    layers: [
      {
        name: 'Calendar',
        title: 'My Calendar',
        description: 'Personal schedule',
        visible: true,
        data: {
          events: [
            {
              date: '2024-01-10',
              title: 'Doctor Appointment',
              type: 'appointment',
              time: '10:00 AM',
              description: 'Annual checkup',
              color: '#0EA5E9',
            },
            {
              date: '2024-01-12',
              title: 'Team Lunch',
              type: 'social',
              time: '12:30 PM',
              description: 'Monthly team gathering',
              color: '#10B981',
            },
            {
              date: '2024-01-18',
              title: 'Project Deadline',
              type: 'deadline',
              time: '5:00 PM',
              description: 'Final deliverable due',
              color: '#F59E0B',
            },
          ],
        },
      },
    ],
  }}
  _onSettingsChange={() => {}}
/>`;

// Restriction story code examples
export const weekdayRestrictionsCode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    monthWidth: 600,
    visibleMonths: 2,
    showSubmitButton: true,
    showSelectionAlert: true,
    defaultRange: {
      start: '2024-01-08',
      end: '2024-01-10',
    },
  }}
  restrictionConfigFactory={() => ({
    restrictions: [
      {
        type: 'weekday',
        enabled: true,
        days: [0, 6], // Sunday and Saturday
        message: 'Weekend bookings are not available. Please select a weekday.',
      },
    ],
  })}
  _onSettingsChange={() => {}}
/>`;

export const dateRangeRestrictionsCode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    monthWidth: 600,
    visibleMonths: 3,
    showSubmitButton: true,
    showSelectionAlert: true,
    defaultRange: {
      start: '2024-02-01',
      end: '2024-02-05',
    },
    layers: [
      {
        name: 'Holidays',
        title: 'Holiday Calendar',
        description: 'Company holidays and blackout dates',
        visible: true,
        data: {
          events: [
            {
              date: '2024-02-14',
              title: "Valentine's Day",
              type: 'holiday',
              time: 'All day',
              description: 'Office closed',
              color: '#EF4444',
            },
            {
              date: '2024-02-19',
              title: "President's Day",
              type: 'holiday',
              time: 'All day',
              description: 'Federal holiday',
              color: '#EF4444',
            },
          ],
        },
      },
    ],
  }}
  restrictionConfigFactory={() => ({
    restrictions: [
      {
        type: 'daterange',
        enabled: true,
        ranges: [
          {
            startDate: '2024-02-10',
            endDate: '2024-02-14',
            message: "Valentine's week - Fully booked",
          },
          {
            startDate: '2024-02-19',
            endDate: '2024-02-21',
            message: "President's Day holiday period",
          },
          {
            startDate: '2024-03-01',
            endDate: '2024-03-03',
            message: 'Annual conference - Team unavailable',
          },
        ],
      },
    ],
  })}
  _onSettingsChange={() => {}}
/>`;

export const dynamicRestrictionsCode = `const [restrictionType, setRestrictionType] = React.useState('business');

const getRestrictions = () => {
  switch (restrictionType) {
    case 'business':
      return {
        restrictions: [
          {
            type: 'weekday',
            enabled: true,
            days: [0, 6],
            message: 'Business hours: Monday-Friday only',
          },
        ],
      };
    case 'maintenance':
      return {
        restrictions: [
          {
            type: 'daterange',
            enabled: true,
            ranges: [
              {
                startDate: '2024-01-15',
                endDate: '2024-01-17',
                message: 'Scheduled maintenance window',
              },
              {
                startDate: '2024-02-01',
                endDate: '2024-02-03',
                message: 'System upgrade period',
              },
            ],
          },
        ],
      };
    case 'custom':
      return {
        restrictions: [
          {
            type: 'weekday',
            enabled: true,
            days: [3], // Wednesday
            message: 'Wednesdays reserved for team meetings',
          },
          {
            type: 'boundary',
            enabled: true,
            direction: 'after',
            date: '2024-02-15',
            inclusive: false,
            message: 'Bookings only available until Feb 15',
          },
        ],
      };
    default:
      return { restrictions: [] };
  }
};

return (
  <div>
    <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f3f4f6', borderRadius: '8px' }}>
      <label style={{ marginRight: '1rem' }}>
        <strong>Restriction Mode:</strong>
      </label>
      <select 
        value={restrictionType} 
        onChange={(e) => setRestrictionType(e.target.value)}
        style={{
          padding: '0.5rem',
          borderRadius: '4px',
          border: '1px solid #ccc',
        }}
      >
        <option value="business">Business Days Only</option>
        <option value="maintenance">Maintenance Windows</option>
        <option value="custom">Custom Rules</option>
      </select>
    </div>
    
    <CLACalendar 
      key={restrictionType}
      settings={{
        ...getDefaultSettings(),
        monthWidth: 600,
        visibleMonths: 2,
        showSubmitButton: true,
        showSelectionAlert: true,
      }}
      restrictionConfigFactory={() => getRestrictions()}
      _onSettingsChange={() => {}}
    />
  </div>
);`;

export const boundaryRestrictionsCode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    monthWidth: 600,
    visibleMonths: 3,
    showSubmitButton: true,
    showSelectionAlert: true,
    defaultRange: {
      start: '2024-01-15',
      end: '2024-01-20',
    },
  }}
  restrictionConfigFactory={() => ({
    restrictions: [
      {
        type: 'boundary',
        enabled: true,
        direction: 'before',
        date: '2024-01-10',
        inclusive: false,
        message: 'Cannot select dates before January 10, 2024',
      },
      {
        type: 'boundary',
        enabled: true,
        direction: 'after',
        date: '2024-02-28',
        inclusive: true,
        message: 'Cannot select dates after February 28, 2024',
      },
    ],
  })}
  _onSettingsChange={() => {}}
/>`;

export const combinedRestrictionsCode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    monthWidth: 600,
    visibleMonths: 3,
    showSubmitButton: true,
    showSelectionAlert: true,
    defaultRange: {
      start: '2024-02-05',
      end: '2024-02-07',
    },
  }}
  restrictionConfigFactory={() => ({
    restrictions: [
      // Block weekends
      {
        type: 'weekday',
        enabled: true,
        days: [0, 6],
        message: 'Weekends are not available for booking',
      },
      // Block specific date ranges
      {
        type: 'daterange',
        enabled: true,
        ranges: [
          {
            startDate: '2024-02-14',
            endDate: '2024-02-14',
            message: "Valentine's Day - Fully booked",
          },
          {
            startDate: '2024-02-19',
            endDate: '2024-02-19',
            message: "President's Day - Office closed",
          },
        ],
      },
      // Set booking window
      {
        type: 'boundary',
        enabled: true,
        direction: 'before',
        date: '2024-02-01',
        inclusive: true,
        message: 'Cannot book before February 1st',
      },
      {
        type: 'boundary',
        enabled: true,
        direction: 'after',
        date: '2024-03-31',
        inclusive: true,
        message: 'Cannot book after March 31st',
      },
    ],
  })}
  _onSettingsChange={() => {}}
/>`;

export const allowedRangesCode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    monthWidth: 600,
    visibleMonths: 2,
    showSubmitButton: true,
    showSelectionAlert: true,
    defaultRange: {
      start: '2024-01-15',
      end: '2024-01-17',
    },
  }}
  restrictionConfigFactory={() => ({
    restrictions: [
      {
        type: 'allowedranges',
        enabled: true,
        ranges: [
          {
            startDate: '2024-01-15',
            endDate: '2024-01-19',
            message: 'Week 3 - Available for booking',
          },
          {
            startDate: '2024-01-29',
            endDate: '2024-02-02',
            message: 'Week 5 - Available for booking',
          },
          {
            startDate: '2024-02-12',
            endDate: '2024-02-16',
            message: 'Week 7 - Available for booking',
          },
        ],
        message: 'Please select from available weeks only',
      },
    ],
  })}
  _onSettingsChange={() => {}}
/>`;

export const restrictedBoundaryCode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    monthWidth: 600,
    visibleMonths: 3,
    showSubmitButton: true,
    showSelectionAlert: true,
    defaultRange: {
      start: '2024-02-12',
      end: '2024-02-14',
    },
  }}
  restrictionConfigFactory={() => ({
    restrictions: [
      {
        type: 'restricted_boundary',
        enabled: true,
        minDate: '2024-01-01',
        maxDate: '2024-03-31',
        ranges: [
          {
            startDate: '2024-01-01',
            endDate: '2024-01-31',
            message: 'January - Limited availability',
            restricted: true,
            exceptions: [
              {
                startDate: '2024-01-15',
                endDate: '2024-01-19',
                message: 'MLK week - Special availability',
              },
            ],
          },
          {
            startDate: '2024-03-01',
            endDate: '2024-03-31',
            message: 'March - Conference season',
            restricted: true,
            exceptions: [
              {
                startDate: '2024-03-11',
                endDate: '2024-03-15',
                message: 'Mid-March opening',
              },
            ],
          },
        ],
        message: 'Complex availability rules apply',
      },
    ],
  })}
  _onSettingsChange={() => {}}
/>`;