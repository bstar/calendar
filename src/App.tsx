import React, { useState } from 'react';
import './bootstrap.min.css';
import './docStyles.css';
import { CLACalendar } from './components/CLACalendar';
import { RestrictionType, RestrictedBoundaryRestriction, RestrictionConfig } from './components/DateRangePickerNew/restrictions/types';
import isoWeeksData from './data/iso_weeks.json';

// Extract unique period ranges from the iso_weeks.json data
const getUniquePeriodRanges = () => {
  const uniquePeriods = new Map();

  isoWeeksData.forEach(week => {
    const key = `${week.periodId}-${week.periodStartDate}-${week.periodEndDate}`;
    if (!uniquePeriods.has(key)) {
      // Format as YYYY-MM-DD strings, keeping the original UTC date
      const startStr = week.periodStartDate.split('T')[0];
      const endStr = week.periodEndDate.split('T')[0];

      uniquePeriods.set(key, {
        periodId: week.periodId,
        period: week.period,
        start: startStr,
        end: endStr,
        message: `Period ${week.period} (ID: ${week.periodId})`
      });
    }
  });

  return Array.from(uniquePeriods.values());
};

const uniquePeriodRanges = getUniquePeriodRanges();

const App: React.FC = () => {
  // State for the font size of the second calendar
  const [fontSize, setFontSize] = useState('1rem');
  
  // Generate period end events from uniquePeriodRanges
  const periodEndEvents = uniquePeriodRanges.map(period => ({
    date: period.end,
    title: `Period ${period.period} End`,
    description: `End of Period ${period.period} (ID: ${period.periodId})`,
    type: "work" as const,
    time: "23:59"
  }));

  // Common settings for both calendar instances
  const baseSettings = {
    displayMode: "popup" as const,
    timezone: "UTC",
    visibleMonths: 3,
    singleMonthWidth: 400,
    showMonthHeadings: true,
    baseFontSize: '1rem',
    selectionMode: "range" as const,
    showTooltips: true,
    showHeader: true,
    closeOnClickAway: true,
    showSubmitButton: true,
    showFooter: true,
    enableOutOfBoundsScroll: true,
    suppressTooltipsOnSelection: false,
    showSelectionAlert: true,
    startWeekOnSunday: false,
    initialMonth: new Date(),
    isOpen: false,
    showLayersNavigation: false,
    restrictionConfig: {
      restrictions: [
        {
          type: 'restricted_boundary' as RestrictionType,
          enabled: true,
          ranges: uniquePeriodRanges.map(period => ({
            start: period.start,
            end: period.end,
            message: period.message
          }))
        } as RestrictedBoundaryRestriction
      ]
    },
    layers: [
      {
        name: "Calendar",
        title: "Base Calendar",
        description: "Basic calendar functionality",
        required: true,
        visible: true,
        data: { 
          events: [
            ...periodEndEvents,
            {
              date: new Date().toISOString(),
              title: "Today's Event",
              description: "Sample event for testing",
              type: "work",
              time: "10:00"
            }
          ],
          background: []
        }
      }
    ],
    defaultLayer: "Calendar",
    colors: {
      primary: "#0366d6",
      success: "#28a745",
      warning: "#f6c23e",
      danger: "#dc3545",
      purple: "#6f42c1",
      teal: "#20c997",
      orange: "#fd7e14",
      pink: "#e83e8c"
    }
  };

  // Create settings for the second calendar with a different font size
  const calendar2Settings = {
    ...baseSettings,
    baseFontSize: fontSize
  };
  
  // Function to change the font size
  const handleChangeFontSize = (size: string) => {
    setFontSize(size);
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '200px' }}>
      {/* Calendar Instance 1 with fixed content underneath */}
      <div style={{ position: 'relative' }}>
        <h3>Calendar Instance 1 (Default Font Size: 1rem)</h3>
        <CLACalendar
          settings={baseSettings}
          onSettingsChange={(newSettings) => console.log('Calendar 1 settings:', newSettings)}
          onSubmit={(start, end) => console.log('Calendar 1 range:', start, end)}
        />
        
        {/* Fixed content under Calendar 1 */}
        <div style={{
          position: 'fixed',
          top: '150px',
          left: '20px',
          right: '20px',
          padding: '20px',
          background: 'white',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          zIndex: 1000
        }}>
          <h4>Fixed Content Under Calendar 1</h4>
          <button style={{ zIndex: 1001 }}>Interactive Button 1</button>
          <div style={{ 
            position: 'sticky', 
            top: '200px',
            padding: '10px',
            background: '#f0f0f0',
            zIndex: 1002
          }}>
            Sticky Element Inside Fixed Content 1
          </div>
        </div>
      </div>

      {/* Calendar Instance 2 with configurable font size */}
      <div style={{ position: 'relative' }}>
        <h3>Calendar Instance 2 (Font Size: {fontSize})</h3>
        <div style={{ marginBottom: '20px' }}>
          <button 
            className="btn btn-primary mr-2" 
            onClick={() => handleChangeFontSize('0.875rem')}
            style={{ marginRight: '10px' }}
          >
            Small (0.875rem)
          </button>
          <button 
            className="btn btn-primary mr-2" 
            onClick={() => handleChangeFontSize('1rem')}
            style={{ marginRight: '10px' }}
          >
            Medium (1rem)
          </button>
          <button 
            className="btn btn-primary mr-2" 
            onClick={() => handleChangeFontSize('1.25rem')}
            style={{ marginRight: '10px' }}
          >
            Large (1.25rem)
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => handleChangeFontSize('1.5rem')}
          >
            Extra Large (1.5rem)
          </button>
        </div>
        <CLACalendar
          settings={calendar2Settings}
          onSettingsChange={(newSettings) => console.log('Calendar 2 settings:', newSettings)}
          onSubmit={(start, end) => console.log('Calendar 2 range:', start, end)}
        />
        
        {/* Fixed content under Calendar 2 */}
        <div style={{
          position: 'fixed',
          top: '400px',
          left: '20px',
          right: '20px',
          padding: '20px',
          background: '#e6f3ff',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          zIndex: 1000
        }}>
          <h4>Fixed Content Under Calendar 2</h4>
          <div style={{ 
            position: 'sticky', 
            top: '450px',
            padding: '10px',
            background: '#d1e8ff',
            zIndex: 1001
          }}>
            Sticky Element Inside Fixed Content 2
          </div>
        </div>
      </div>

      {/* Spacer to ensure scrollable content */}
      <div style={{ height: '1000px' }} />
    </div>
  );
};

export default App;