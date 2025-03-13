import React from 'react';
import './bootstrap.min.css';
import './docStyles.css';
import './App.css';
// Import defensive styles for the calendar widget
import './components/DateRangePickerNew/defensive-styles.css';
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
  /**
   * This app demonstrates a calendar widget with defensive CSS to protect
   * it from potential style interference in various environments.
   * 
   * The defensive-styles.css provides a protective layer that ensures:
   * - Proper spacing and layout
   * - Correct font sizing and text styling 
   * - Appropriate z-index stacking
   * - Portal and tooltip visibility
   */
  
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
    visibleMonths: 2, // First calendar shows 2 months
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

  // Create settings for the second calendar with 3 months
  const calendar2Settings = {
    ...baseSettings,
    visibleMonths: 3 // Second calendar shows 3 months
  };

  return (
    <div style={{ 
      padding: '10px', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '40px',
      textAlign: 'left' 
    }}>
      {/* Calendar Instance 1 */}
      <div style={{ position: 'relative', textAlign: 'left' }} className="cla-calendar-wrapper">
        <h3 style={{ textAlign: 'left' }}>Calendar Instance 1 (2 Months)</h3>
        <CLACalendar
          settings={baseSettings}
          onSettingsChange={(newSettings) => console.log('Calendar 1 settings:', newSettings)}
          onSubmit={(start, end) => console.log('Calendar 1 range:', start, end)}
        />
      </div>

      {/* Calendar Instance 2 with 3 months */}
      <div style={{ position: 'relative', textAlign: 'left' }} className="cla-calendar-wrapper">
        <h3 style={{ textAlign: 'left' }}>Calendar Instance 2 (3 Months)</h3>
        <CLACalendar
          settings={calendar2Settings}
          onSettingsChange={(newSettings) => console.log('Calendar 2 settings:', newSettings)}
          onSubmit={(start, end) => console.log('Calendar 2 range:', start, end)}
        />
      </div>

      {/* Spacer to ensure scrollable content */}
      <div style={{ height: '200px' }} />
    </div>
  );
};

export default App;