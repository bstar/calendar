export const fullPlaygroundCode = `import React, { useState } from 'react';
import { CLACalendar } from './CLACalendar';
import { createCalendarSettings } from './CLACalendar.config';

function FullFeaturedCalendar() {
  const [selectedRange, setSelectedRange] = useState<{
    start: string | null, 
    end: string | null
  }>({
    start: null,
    end: null,
  });

  const settings = createCalendarSettings({
    displayMode: 'embedded',
    visibleMonths: 2,
    selectionMode: 'range',
    showSubmitButton: true,
    showHeader: true,
    showFooter: true,
    showTooltips: true,
    startWeekOnSunday: false,
    colors: {
      primary: '#0366d6',
      success: '#28a745',
      warning: '#f6c23e',
      danger: '#dc3545',
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
              color: 'rgba(251, 191, 36, 0.1)',
            },
          ],
        },
      },
    ],
  });

  return (
    <div style={{ padding: '20px' }}>
      <CLACalendar
        settings={settings}
        onSubmit={(start, end) => {
          setSelectedRange({ start, end });
        }}
      />
      {selectedRange.start && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px' 
        }}>
          <strong>Selected Range:</strong>
          <br />
          Start: {selectedRange.start}
          <br />
          End: {selectedRange.end}
        </div>
      )}
    </div>
  );
}`;

export const minimalPlaygroundCode = `import React, { useState } from 'react';
import { CLACalendar } from './CLACalendar';
import { createCalendarSettings } from './CLACalendar.config';

function MinimalCalendar() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const settings = createCalendarSettings({
    displayMode: 'embedded',
    visibleMonths: 1,
    selectionMode: 'single',
    showSubmitButton: true,
    startWeekOnSunday: false,
    showHeader: false,
    showFooter: false,
  });

  return (
    <div style={{ padding: '20px' }}>
      <CLACalendar
        settings={settings}
        onSubmit={(start) => {
          setSelectedDate(start);
        }}
      />
      {selectedDate && (
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: '#e7f3ff', 
          borderRadius: '4px' 
        }}>
          <strong>Selected Date:</strong> {selectedDate}
        </div>
      )}
    </div>
  );
}`;

export const configurationComparisonCode = `<div style={{ 
  display: 'grid', 
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
  gap: '30px' 
}}>
  <div>
    <h4>Default Configuration</h4>
    <CLACalendar 
      settings={createCalendarSettings({})} 
    />
  </div>
  
  <div>
    <h4>Single Date Selection</h4>
    <CLACalendar 
      settings={createCalendarSettings({
        selectionMode: 'single',
        visibleMonths: 1,
        showSubmitButton: true,
      })}
    />
  </div>
  
  <div>
    <h4>Multiple Months View</h4>
    <CLACalendar 
      settings={createCalendarSettings({
        visibleMonths: 3,
        selectionMode: 'range',
        monthWidth: 280,
      })}
    />
  </div>
  
  <div>
    <h4>Custom Purple Theme</h4>
    <CLACalendar 
      settings={createCalendarSettings({
        visibleMonths: 1,
        colors: {
          primary: '#9333EA',
          success: '#059669',
        },
      })}
    />
  </div>
</div>`;

export const performanceTestCode = `// Performance Test - Multiple Calendar Instances
<div style={{ 
  display: 'grid', 
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
  gap: '20px' 
}}>
  {Array.from({ length: 6 }, (_, i) => (
    <div key={i}>
      <h5>Calendar {i + 1}</h5>
      <CLACalendar 
        settings={createCalendarSettings({
          visibleMonths: 1,
          selectionMode: i % 2 === 0 ? 'single' : 'range',
          showHeader: false,
          showFooter: false,
          colors: {
            primary: \`hsl(\${i * 60}, 70%, 50%)\`,
          },
        })}
      />
    </div>
  ))}
</div>`;

export const liveSettingsEditorCode = `import React, { useState } from 'react';
import { CLACalendar } from './CLACalendar';
import { createCalendarSettings } from './CLACalendar.config';

function LiveSettingsEditor() {
  const [showHeader, setShowHeader] = useState(true);
  const [showFooter, setShowFooter] = useState(true);
  const [showTooltips, setShowTooltips] = useState(true);
  const [visibleMonths, setVisibleMonths] = useState(2);
  const [selectionMode, setSelectionMode] = useState<'single' | 'range'>('range');
  const [primaryColor, setPrimaryColor] = useState('#0366d6');

  const settings = createCalendarSettings({
    displayMode: 'embedded',
    visibleMonths,
    selectionMode,
    showHeader,
    showFooter,
    showTooltips,
    showSubmitButton: true,
    colors: {
      primary: primaryColor,
    },
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '30px' }}>
      <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px' }}>
        <h4>Live Settings</h4>
        
        <div style={{ marginBottom: '15px' }}>
          <label>Visible Months: {visibleMonths}</label>
          <input 
            type="range" 
            min="1" 
            max="4" 
            value={visibleMonths}
            onChange={(e) => setVisibleMonths(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Selection Mode</label>
          <select 
            value={selectionMode}
            onChange={(e) => setSelectionMode(e.target.value as 'single' | 'range')}
          >
            <option value="single">Single Date</option>
            <option value="range">Date Range</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Primary Color</label>
          <input 
            type="color" 
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
          />
        </div>

        <label>
          <input 
            type="checkbox" 
            checked={showHeader}
            onChange={(e) => setShowHeader(e.target.checked)}
          />
          Show Header
        </label>

        <label>
          <input 
            type="checkbox" 
            checked={showFooter}
            onChange={(e) => setShowFooter(e.target.checked)}
          />
          Show Footer
        </label>

        <label>
          <input 
            type="checkbox" 
            checked={showTooltips}
            onChange={(e) => setShowTooltips(e.target.checked)}
          />
          Show Tooltips
        </label>
      </div>

      <div>
        <CLACalendar settings={settings} />
      </div>
    </div>
  );
}`;

export const stateManagementCode = `import React, { useState } from 'react';
import { CLACalendar } from './CLACalendar';
import { createCalendarSettings } from './CLACalendar.config';

function CalendarWithHistory() {
  const [selectedDates, setSelectedDates] = useState<
    Array<{start: string | null, end: string | null}>
  >([]);
  const [totalSelections, setTotalSelections] = useState(0);

  const handleSubmit = (start: string | null, end: string | null) => {
    setSelectedDates(prev => [...prev, { start, end }]);
    setTotalSelections(prev => prev + 1);
  };

  const clearHistory = () => {
    setSelectedDates([]);
    setTotalSelections(0);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '30px' }}>
      <div>
        <CLACalendar
          settings={createCalendarSettings({
            displayMode: 'embedded',
            visibleMonths: 2,
            selectionMode: 'range',
            showSubmitButton: true,
          })}
          onSubmit={handleSubmit}
        />
      </div>

      <div style={{ 
        backgroundColor: '#f9fafb', 
        padding: '20px', 
        borderRadius: '8px' 
      }}>
        <h4>Selection History</h4>
        <div>Total Selections: <strong>{totalSelections}</strong></div>
        
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {selectedDates.length === 0 ? (
            <p>No selections yet</p>
          ) : (
            selectedDates.map((range, index) => (
              <div key={index} style={{ 
                marginBottom: '10px', 
                padding: '10px', 
                backgroundColor: '#ffffff',
                borderRadius: '4px' 
              }}>
                <div>#{index + 1}</div>
                <div>{range.start} → {range.end}</div>
              </div>
            ))
          )}
        </div>
        
        {selectedDates.length > 0 && (
          <button onClick={clearHistory}>
            Clear History
          </button>
        )}
      </div>
    </div>
  );
}`;

export const storybookControlsCode = `// Storybook story with interactive controls
export const InteractiveCalendar: Story = {
  render: (args) => {
    const settings = createCalendarSettings({
      displayMode: args.displayMode || 'embedded',
      visibleMonths: args.visibleMonths || 2,
      selectionMode: args.selectionMode || 'range',
      showSubmitButton: args.showSubmitButton || false,
      showHeader: args.showHeader ?? true,
      showFooter: args.showFooter ?? true,
      showTooltips: args.showTooltips ?? true,
      startWeekOnSunday: args.startWeekOnSunday || false,
      colors: {
        primary: args.primaryColor || '#0366d6',
        success: args.successColor || '#28a745',
        warning: args.warningColor || '#f6c23e',
        danger: args.dangerColor || '#dc3545',
      },
    });

    return <CLACalendar settings={settings} />;
  },
  argTypes: {
    displayMode: {
      control: { type: 'select' },
      options: ['embedded', 'popup'],
      description: 'Calendar display mode',
    },
    visibleMonths: {
      control: { type: 'range', min: 1, max: 6 },
      description: 'Number of months to display',
    },
    selectionMode: {
      control: { type: 'select' },
      options: ['single', 'range'],
      description: 'Date selection mode',
    },
    showSubmitButton: {
      control: 'boolean',
      description: 'Show submit button',
    },
    showHeader: {
      control: 'boolean',
      description: 'Show calendar header',
    },
    showFooter: {
      control: 'boolean',
      description: 'Show calendar footer',
    },
    showTooltips: {
      control: 'boolean',
      description: 'Show tooltips on hover',
    },
    startWeekOnSunday: {
      control: 'boolean',
      description: 'Start week on Sunday',
    },
    primaryColor: {
      control: 'color',
      description: 'Primary theme color',
    },
  },
};`;

export const advancedPlaygroundCode = `// Advanced playground with multiple features
const AdvancedPlayground = () => {
  const [settings, setSettings] = useState(createCalendarSettings({
    displayMode: 'embedded',
    visibleMonths: 2,
    selectionMode: 'range',
  }));

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => createCalendarSettings({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div>
      <div className="controls">
        {/* Control panel for all settings */}
      </div>
      <CLACalendar 
        settings={settings}
        _onSettingsChange={setSettings}
      />
    </div>
  );
};`;