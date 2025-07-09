export const nullSettingsCode = `<CLACalendar 
  settings={null} 
  _onSettingsChange={() => {}} 
/>`;

export const undefinedSettingsCode = `<CLACalendar 
  settings={undefined} 
  _onSettingsChange={() => {}} 
/>`;

export const emptySettingsCode = `<CLACalendar 
  settings={{}} 
  _onSettingsChange={() => {}} 
/>`;

export const invalidNumbersCode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    visibleMonths: -5, // Invalid: negative
    monthWidth: 50,   // Invalid: too small
  }} 
  _onSettingsChange={() => {}}
/>`;

export const nullArraysCode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    layers: null,
  }} 
  _onSettingsChange={() => {}}
/>`;

export const emptyLayersCode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    layers: [],
  }} 
  _onSettingsChange={() => {}}
/>`;

export const mixedNullPropertiesCode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    displayMode: undefined,
    visibleMonths: null,
    layers: undefined,
    colors: null,
    showHeader: undefined,
  }} 
  _onSettingsChange={() => {}}
/>`;

export const partialConfigCode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    visibleMonths: undefined,
    displayMode: null,
    selectionMode: 'range',
  }}
  _onSettingsChange={() => {}}
/>`;

export const minimalSetupCode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    displayMode: 'embedded',
    defaultRange: { start: '2024-01-10', end: '' },
  }} 
  onSubmit={(start, end) => console.log('Selected:', start, end)}
  _onSettingsChange={() => {}}
/>`;

export const invalidDateRangeCode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    defaultRange: {
      start: '2024-01-20',
      end: '2024-01-10', // End before start
    },
  }} 
  _onSettingsChange={() => {}}
/>`;

export const malformedLayersCode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    layers: [
      null,
      {
        name: 'Valid Layer',
        title: 'This layer is valid',
        description: 'Should work fine',
        visible: true,
      },
      undefined,
      {
        // Missing required fields
        name: '',
      },
    ],
  }} 
  _onSettingsChange={() => {}}
/>`;

export const extremeValuesCode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    visibleMonths: 999,  // Too high
    monthWidth: -100,    // Negative
    colors: {
      primary: null,
      success: '',       // Empty string
      warning: 'invalid-color',
      danger: '#dc3545',
    },
  }} 
  _onSettingsChange={() => {}}
/>`;

export const invalidRestrictionsCode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    visibleMonths: 2,
  }}
  restrictionConfigFactory={() => ({
    restrictions: [
      null,
      {
        type: 'invalid-type',
        enabled: true,
      },
      {
        type: 'weekday',
        enabled: true,
        days: null,
      },
      {
        type: 'daterange',
        enabled: true,
        ranges: [
          null,
          {
            startDate: 'invalid-date',
            endDate: '2024-01-15',
          },
        ],
      },
    ],
  })}
  _onSettingsChange={() => {}}
/>`;

export const conflictingRestrictionsCode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    visibleMonths: 2,
  }}
  restrictionConfigFactory={() => ({
    restrictions: [
      {
        type: 'allowedranges',
        enabled: true,
        ranges: [
          {
            startDate: '2024-01-10',
            endDate: '2024-01-15',
            message: 'Only these dates allowed',
          },
        ],
      },
      {
        type: 'weekday',
        enabled: true,
        days: [1, 2, 3, 4, 5], // Block all weekdays
        message: 'Weekdays not allowed',
      },
    ],
  })}
  _onSettingsChange={() => {}}
/>`;

export const invalidEventDataCode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    layers: [
      {
        name: 'BadEvents',
        title: 'Malformed Events',
        description: 'Events with invalid data',
        visible: true,
        data: {
          events: [
            null,
            {
              date: 'invalid-date',
              title: 'Invalid Date Event',
              type: 'meeting',
            },
            {
              date: '2024-01-15',
              title: null,
              type: '',
            },
            {
              // Missing required fields
              title: 'Missing Date',
            },
          ],
          background: [
            null,
            {
              startDate: '2024-01-20',
              endDate: '2024-01-10', // End before start
              color: 'invalid-color',
            },
            {
              startDate: null,
              endDate: '2024-01-15',
              color: '#FEF3C7',
            },
          ],
        },
      },
    ],
  }} 
  _onSettingsChange={() => {}}
/>`;