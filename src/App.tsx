import React from 'react';
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
    visibleMonths: 2,
    singleMonthWidth: 400,
    showMonthHeadings: true,
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

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '200px' }}>
      {/* Calendar Instance 1 with fixed content underneath */}
      <div style={{ position: 'relative' }}>
        <h3>Calendar Instance 1</h3>
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

      {/* Calendar Instance 2 with fixed content underneath */}
      <div style={{ position: 'relative' }}>
        <h3>Calendar Instance 2</h3>
        <CLACalendar
          settings={baseSettings}
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