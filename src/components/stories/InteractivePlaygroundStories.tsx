import React, { useState } from 'react';
import { CLACalendar } from '../CLACalendar';
import { createCalendarSettings } from '../CLACalendar.config';

// Full Featured Playground Story
export const FullPlaygroundStory = () => {
  const [selectedRange, setSelectedRange] = useState<{start: string | null, end: string | null}>({
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
            {
              date: '2024-02-05',
              title: 'Conference',
              type: 'conference',
              time: '9:00 AM',
              description: 'Tech conference attendance',
              color: '#10B981',
            },
            {
              date: '2024-02-14',
              title: 'Product Launch',
              type: 'milestone',
              time: 'All day',
              description: 'New feature release',
              color: '#F59E0B',
            },
          ],
          background: [
            {
              startDate: '2024-01-10',
              endDate: '2024-01-12',
              color: 'rgba(251, 191, 36, 0.1)',
            },
            {
              startDate: '2024-02-01',
              endDate: '2024-02-07',
              color: 'rgba(59, 130, 246, 0.1)',
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
        _onSettingsChange={() => {}}
      />
      {selectedRange.start && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          fontFamily: 'monospace'
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
};

// Minimal Playground Story
export const MinimalPlaygroundStory = () => {
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
        _onSettingsChange={() => {}}
      />
      {selectedDate && (
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: '#e7f3ff', 
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          <strong>Selected Date:</strong> {selectedDate}
        </div>
      )}
    </div>
  );
};

// Configuration Comparison Story
export const ConfigurationComparisonStory = () => {
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '30px' 
      }}>
        <div>
          <h4 style={{ marginBottom: '15px', color: '#374151' }}>Default Configuration</h4>
          <CLACalendar 
            settings={createCalendarSettings({})} 
            _onSettingsChange={() => {}}
          />
        </div>
        
        <div>
          <h4 style={{ marginBottom: '15px', color: '#374151' }}>Single Date Selection</h4>
          <CLACalendar 
            settings={createCalendarSettings({
              selectionMode: 'single',
              visibleMonths: 1,
              showSubmitButton: true,
            })}
            _onSettingsChange={() => {}}
          />
        </div>
        
        <div>
          <h4 style={{ marginBottom: '15px', color: '#374151' }}>Multiple Months View</h4>
          <CLACalendar 
            settings={createCalendarSettings({
              visibleMonths: 3,
              selectionMode: 'range',
              monthWidth: 280,
            })}
            _onSettingsChange={() => {}}
          />
        </div>
        
        <div>
          <h4 style={{ marginBottom: '15px', color: '#374151' }}>Custom Purple Theme</h4>
          <CLACalendar 
            settings={createCalendarSettings({
              visibleMonths: 1,
              colors: {
                primary: '#9333EA',
                success: '#059669',
                warning: '#F59E0B',
                danger: '#DC2626',
              },
            })}
            _onSettingsChange={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

// Performance Test Story
export const PerformanceTestStory = () => {
  const [renderTime, setRenderTime] = useState<number | null>(null);
  const startTime = performance.now();

  React.useEffect(() => {
    const endTime = performance.now();
    setRenderTime(endTime - startTime);
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
        <strong>Render Time:</strong> {renderTime ? `${renderTime.toFixed(2)}ms` : 'Calculating...'}
      </div>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '20px' 
      }}>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} style={{ 
            border: '1px solid #e5e7eb', 
            padding: '15px', 
            borderRadius: '8px',
            backgroundColor: '#ffffff'
          }}>
            <h5 style={{ marginBottom: '10px', color: '#6b7280' }}>
              Calendar {i + 1} - {i % 2 === 0 ? 'Single' : 'Range'}
            </h5>
            <CLACalendar 
              settings={createCalendarSettings({
                visibleMonths: 1,
                selectionMode: i % 2 === 0 ? 'single' : 'range',
                showHeader: false,
                showFooter: false,
                colors: {
                  primary: `hsl(${i * 60}, 70%, 50%)`,
                },
              })}
              _onSettingsChange={() => {}}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Live Settings Editor Story
export const LiveSettingsEditorStory = () => {
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
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '30px' }}>
        <div style={{ 
          backgroundColor: '#f9fafb', 
          padding: '20px', 
          borderRadius: '8px',
          height: 'fit-content'
        }}>
          <h4 style={{ marginBottom: '20px' }}>Live Settings</h4>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
              Visible Months: {visibleMonths}
            </label>
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
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
              Selection Mode
            </label>
            <select 
              value={selectionMode}
              onChange={(e) => setSelectionMode(e.target.value as 'single' | 'range')}
              style={{ width: '100%', padding: '5px' }}
            >
              <option value="single">Single Date</option>
              <option value="range">Date Range</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
              Primary Color
            </label>
            <input 
              type="color" 
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              style={{ width: '100%', height: '30px' }}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '14px' }}>
              <input 
                type="checkbox" 
                checked={showHeader}
                onChange={(e) => setShowHeader(e.target.checked)}
                style={{ marginRight: '5px' }}
              />
              Show Header
            </label>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '14px' }}>
              <input 
                type="checkbox" 
                checked={showFooter}
                onChange={(e) => setShowFooter(e.target.checked)}
                style={{ marginRight: '5px' }}
              />
              Show Footer
            </label>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '14px' }}>
              <input 
                type="checkbox" 
                checked={showTooltips}
                onChange={(e) => setShowTooltips(e.target.checked)}
                style={{ marginRight: '5px' }}
              />
              Show Tooltips
            </label>
          </div>
        </div>

        <div>
          <CLACalendar
            settings={settings}
            _onSettingsChange={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

// State Management Example Story
export const StateManagementStory = () => {
  const [selectedDates, setSelectedDates] = useState<Array<{start: string | null, end: string | null}>>([]);
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
    <div style={{ padding: '20px' }}>
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
            _onSettingsChange={() => {}}
          />
        </div>

        <div style={{ 
          backgroundColor: '#f9fafb', 
          padding: '20px', 
          borderRadius: '8px',
          height: 'fit-content'
        }}>
          <h4 style={{ marginBottom: '15px' }}>Selection History</h4>
          <div style={{ marginBottom: '15px', fontSize: '14px' }}>
            Total Selections: <strong>{totalSelections}</strong>
          </div>
          
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {selectedDates.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '14px' }}>No selections yet</p>
            ) : (
              selectedDates.map((range, index) => (
                <div key={index} style={{ 
                  marginBottom: '10px', 
                  padding: '10px', 
                  backgroundColor: '#ffffff',
                  borderRadius: '4px',
                  fontSize: '13px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div>#{index + 1}</div>
                  <div style={{ color: '#6b7280' }}>
                    {range.start} → {range.end}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {selectedDates.length > 0 && (
            <button
              onClick={clearHistory}
              style={{
                marginTop: '15px',
                width: '100%',
                padding: '8px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Clear History
            </button>
          )}
        </div>
      </div>
    </div>
  );
};