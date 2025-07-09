export const defaultCode = `<CLACalendar 
  settings={getDefaultSettings()}
  _onSettingsChange={() => {}}
/>`;

export const singleSelectionCode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    selectionMode: 'single',
    visibleMonths: 1
  }}
  _onSettingsChange={() => {}}
/>`;

export const multipleMonthsCode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    visibleMonths: 3
  }}
  _onSettingsChange={() => {}}
/>`;

export const embeddedModeCode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    displayMode: 'embedded',
    visibleMonths: 2,
    showSubmitButton: true
  }}
  _onSettingsChange={() => {}}
/>`;

export const customColorsCode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    displayMode: 'embedded',
    visibleMonths: 1,
    showLayersNavigation: false,
    showMonthHeadings: true,
    containerStyle: {
      backgroundColor: 'rgb(254, 243, 226)',
      border: '2px solid #D97706',
      borderRadius: '6px',
      boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)'
    },
    backgroundColors: {
      emptyRows: 'rgb(254, 243, 226)',
      monthHeader: 'rgb(254, 243, 226)',
      headerContainer: 'rgb(254, 243, 226)',
      dayCells: 'rgb(254, 243, 226)',
      selection: '#F59E0B',
      input: 'rgb(254, 243, 226)'
    },
    defaultRange: {
      start: '2024-01-10',
      end: '2024-01-15'
    },
    colors: {
      primary: '#8B5CF6',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
    },
    layers: [/* See full code for layer configuration */]
  }}
  _onSettingsChange={() => {}}
/>`;

export const weekStartSundayCode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    startWeekOnSunday: true,
    visibleMonths: 1
  }}
  _onSettingsChange={() => {}}
/>`;

export const withEventsCode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    showLayersNavigation: true,
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
  _onSettingsChange={() => {}}
/>`;

export const withRestrictionsCode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    visibleMonths: 2
  }}
  restrictionConfigFactory={() => ({
    restrictions: [
      {
        type: 'weekday',
        enabled: true,
        days: [0, 6],
        message: 'Weekends are not available for selection',
      },
      {
        type: 'daterange',
        enabled: true,
        ranges: [
          {
            startDate: '2024-01-15',
            endDate: '2024-01-17',
            message: 'These dates are fully booked',
          },
        ],
      },
    ],
  })}
  _onSettingsChange={() => {}}
/>`;

export const customDateFormatCode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    visibleMonths: 1,
    dateFormatter: (date) => {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    },
    dateRangeSeparator: ' → ',
    defaultRange: {
      start: '2024-01-10',
      end: '2024-01-15',
    },
  }}
  _onSettingsChange={() => {}}
/>`;

export const minimalUICode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    visibleMonths: 1,
    showHeader: false,
    showFooter: false,
    showTooltips: false,
    showLayersNavigation: false
  }}
  _onSettingsChange={() => {}}
/>`;

export const noSubmitButtonCode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    visibleMonths: 1,
    showSubmitButton: false
  }}
  _onSettingsChange={() => {}}
/>`;

export const yearViewCode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    displayMode: 'embedded',
    visibleMonths: 6,
    monthWidth: 300,
    showSubmitButton: false
  }}
  _onSettingsChange={() => {}}
/>`;