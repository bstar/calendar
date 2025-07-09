export const flatSingleMonthCode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    displayMode: 'embedded',
    visibleMonths: 1,
    containerStyle: {
      boxShadow: 'none',
      borderRadius: '0',
      border: '1px solid #d1d5db'
    },
    defaultRange: {
      start: '2024-01-15',
      end: '2024-01-20',
    },
  }}
  _onSettingsChange={() => {}}
/>`;

export const fourMonthViewCode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    displayMode: 'embedded',
    visibleMonths: 4,
    containerStyle: {
      boxShadow: 'none',
      borderRadius: '0',
      border: '1px solid #d1d5db'
    },
    defaultRange: {
      start: '2024-01-15',
      end: '2024-02-10',
    },
  }}
  _onSettingsChange={() => {}}
/>`;

export const minimalEmbeddedCode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    displayMode: 'embedded',
    visibleMonths: 2,
    selectionMode: 'single',
    showHeader: false,
    showTooltips: false,
    showSubmitButton: false,
    containerStyle: {
      boxShadow: 'none',
      borderRadius: '0',
      border: '1px solid #d1d5db'
    },
    defaultRange: {
      start: '2024-01-15',
      end: '2024-01-15',
    },
  }}
  _onSettingsChange={() => {}}
/>`;

export const compactEmbeddedCode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    displayMode: 'embedded',
    visibleMonths: 1,
    selectionMode: 'single',
    monthWidth: 250,
    showSubmitButton: true,
    containerStyle: {
      boxShadow: 'none',
      borderRadius: '0',
      border: '1px solid #d1d5db'
    },
    defaultRange: {
      start: '2024-01-15',
      end: '2024-01-15',
    },
  }}
  _onSettingsChange={() => {}}
/>`;

export const embeddedWithLayersCode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    displayMode: 'embedded',
    visibleMonths: 2,
    showLayersNavigation: true,
    defaultLayer: 'Events',
    containerStyle: {
      boxShadow: 'none',
      borderRadius: '0',
      border: '1px solid #d1d5db'
    },
    defaultRange: {
      start: '2024-01-08',
      end: '2024-01-12',
    },
    layers: [
      {
        name: 'Events',
        title: 'Events',
        description: 'Company events and meetings',
        visible: true,
        data: {
          events: [
            {
              date: '2024-01-15',
              title: 'Meeting',
              type: 'meeting',
              time: '10:00 AM',
              description: 'Team meeting with layers',
              color: '#3B82F6',
            },
          ],
        },
      },
      {
        name: 'Holidays',
        title: 'Holidays',
        description: 'Holiday calendar events',
        visible: true,
        data: {
          events: [
            {
              date: '2024-01-01',
              title: 'New Year',
              type: 'holiday',
              time: 'All Day',
              description: 'New Year\\'s Day celebration',
              color: '#EF4444',
            },
          ],
        },
      },
    ],
  }}
  _onSettingsChange={() => {}}
/>`;

export const threeMonthNoSubmitCode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    displayMode: 'embedded',
    visibleMonths: 3,
    showSubmitButton: false,
    containerStyle: {
      boxShadow: 'none',
      borderRadius: '0',
      border: '1px solid #d1d5db'
    },
    defaultRange: {
      start: '2024-01-15',
      end: '2024-02-20',
    },
  }}
  _onSettingsChange={() => {}}
/>`;

export const borderlessCode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    displayMode: 'embedded',
    visibleMonths: 1,
    containerStyle: {
      boxShadow: 'none',
      borderRadius: '0',
      border: 'none'
    },
    defaultRange: {
      start: '2024-01-10',
      end: '2024-01-15',
    },
  }}
  _onSettingsChange={() => {}}
/>`;

export const subtleCardCode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    displayMode: 'embedded',
    visibleMonths: 1,
    containerStyle: {
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      backgroundColor: '#ffffff'
    },
    defaultRange: {
      start: '2024-01-15',
      end: '2024-01-20',
    },
  }}
  _onSettingsChange={() => {}}
/>`;

export const formIntegrationCode = `<div style={{ 
  padding: '20px', 
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px'
}}>
  <label style={{ 
    display: 'block', 
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151'
  }}>
    Select Date Range
  </label>
  <CLACalendar 
    settings={{
      ...getDefaultSettings(),
      displayMode: 'embedded',
      visibleMonths: 1,
      showHeader: false,
      showFooter: true,
      showSubmitButton: true,
      containerStyle: {
        boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)',
        border: '2px solid #d1d5db',
        borderRadius: '6px',
        backgroundColor: '#ffffff'
      },
      defaultRange: {
        start: '2024-01-10',
        end: '2024-01-15',
      },
    }}
    onSubmit={(start, end) => {
      console.log('Form submitted with dates:', start, end);
    }}
    _onSettingsChange={() => {}}
  />
</div>`;

export const dashboardWidgetCode = `<div style={{ 
  backgroundColor: '#f3f4f6',
  padding: '20px',
  borderRadius: '8px'
}}>
  <h3 style={{ 
    margin: '0 0 16px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827'
  }}>
    📅 Upcoming Schedule
  </h3>
  <CLACalendar 
    settings={{
      ...getDefaultSettings(),
      displayMode: 'embedded',
      visibleMonths: 2,
      showHeader: true,
      showFooter: false,
      showSubmitButton: false,
      containerStyle: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: 'none',
        borderRadius: '6px',
        backgroundColor: '#ffffff'
      },
      defaultRange: {
        start: '2024-01-15',
        end: '2024-01-20',
      },
      layers: [{
        name: 'Schedule',
        title: 'My Schedule',
        visible: true,
        data: {
          events: [
            {
              date: '2024-01-16',
              title: 'Design Review',
              type: 'meeting',
              time: '2:00 PM',
              description: 'Q1 design review',
              color: '#6366F1',
            },
            {
              date: '2024-01-18',
              title: 'Sprint Planning',
              type: 'meeting',
              time: '10:00 AM',
              description: 'Sprint 24 planning',
              color: '#10B981',
            },
          ],
          background: [
            {
              startDate: '2024-01-15',
              endDate: '2024-01-19',
              color: 'rgba(99, 102, 241, 0.1)',
            },
          ],
        },
      }],
    }}
    _onSettingsChange={() => {}}
  />
</div>`;

export const yearRoundCalendarCode = `// Year-round calendar with month nicknames
const YearRoundCalendar = () => {
  const [visibleMonths, setVisibleMonths] = React.useState<Date[]>([]);
  
  // Month nicknames for display
  const monthNicknames = {
    0: 'New Beginnings Month',
    1: 'Love is in the Air Month', 
    2: 'Spring Awakening Month',
    3: 'Bloom and Blossom Month',
    4: 'Mothers and Flowers Month',
    5: 'Summer Kickoff Month',
    6: 'Hotter than Hell Month',
    7: 'Dog Days Month',
    8: 'Back to School Month',
    9: 'Spooky Season Month',
    10: 'Gratitude and Turkey Month',
    11: 'Winter Wonderland Month'
  };

  // Background colors for each month
  const monthBackgrounds = {
    0: '#E8F4FD', 1: '#FCE4EC', 2: '#E8F5E8', 3: '#FFF3E0',
    4: '#F3E5F5', 5: '#FFFDE7', 6: '#FFEBEE', 7: '#E1F5FE',
    8: '#F1F8E9', 9: '#FF6D00', 10: '#D7CCC8', 11: '#E3F2FD'
  };

  // Create background layers for all months
  const yearBackgrounds = Array.from({ length: 12 }, (_, monthIndex) => {
    const year = 2024;
    const startDate = new Date(year, monthIndex, 1);
    const endDate = new Date(year, monthIndex + 1, 0);
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      color: monthBackgrounds[monthIndex]
    };
  });

  return (
    <div style={{ padding: '20px' }}>
      {/* Month nickname display */}
      <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f8fafc' }}>
        <h4>Currently Viewing:</h4>
        {visibleMonths.map(date => (
          <div key={date.getMonth()}>
            <strong>{date.toLocaleString('default', { month: 'long' })}</strong>
            {' - '}
            <em>{monthNicknames[date.getMonth()]}</em>
          </div>
        ))}
      </div>

      {/* Calendar with year-round backgrounds */}
      <CLACalendar 
        settings={{
          ...getDefaultSettings(),
          displayMode: 'embedded',
          visibleMonths: 3,
          containerStyle: {
            boxShadow: 'none',
            borderRadius: '0',
            border: '1px solid #d1d5db'
          },
          layers: [{
            name: 'MonthColors',
            title: 'Month Backgrounds',
            visible: true,
            data: { background: yearBackgrounds }
          }]
        }}
        onMonthChange={setVisibleMonths}
        _onSettingsChange={() => {}}
      />
    </div>
  );
};`;