import React, { useState } from 'react';
import './bootstrap.min.css';
import './docStyles.css';
import CLACalendar from './components/CLACalendar';
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
  // Simple state to track selected dates
  const [selectedDates, setSelectedDates] = useState('');
  
  // Create the restriction config with proper typing
  const restrictionConfig: RestrictionConfig = {
    restrictions: [
      {
        type: 'restricted_boundary',
        enabled: true,
        ranges: uniquePeriodRanges.map(period => ({
          start: period.start,
          end: period.end,
          message: period.message
        }))
      } as RestrictedBoundaryRestriction
    ]
  };
  
  // Create events for the end dates of each period
  const periodEndEvents = uniquePeriodRanges.map(period => ({
    date: period.end,
    title: `PERIOD END`,
    type: "deadline",
    time: "23:59",
    description: `End of Period ${period.period} (ID: ${period.periodId})`,
    color: "#f3832d",
    important: true
  }));
  
  // Hard-coded settings with only boundary ranges based on period dates
  const settings = {
    displayMode: "popup" as const, // Use popup mode for the internal input field
    timezone: "UTC",
    visibleMonths: 2,
    singleMonthWidth: 500,
    showMonthHeadings: true,
    selectionMode: "range" as const,
    showTooltips: true,
    showHeader: true,
    closeOnClickAway: false,
    showSubmitButton: true,
    showFooter: true,
    enableOutOfBoundsScroll: true,
    suppressTooltipsOnSelection: false,
    showSelectionAlert: true,
    startWeekOnSunday: false,
    initialMonth: new Date(),
    isOpen: false, // Auto-open the calendar
    // Input field styling
    inputStyle: {
      padding: '10px 15px',
      height: '42px',
      width: '300px',
      border: '1px solid #c0c4cc',
      borderRadius: '4px',
      fontSize: '14px',
      lineHeight: '1.5',
      color: '#444',
      backgroundColor: '#eee',
      boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
      transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out'
    },
    layers: [
      {
        name: "Calendar",
        title: "Base Calendar",
        description: "Basic calendar functionality",
        required: true,
        visible: true,
        data: {
          events: periodEndEvents,
          background: []
        }
      }
    ],
    showLayersNavigation: false,
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
    },
    restrictionConfig
  };

  // Simple onSubmit handler to capture selected dates
  const handleSubmit = (startDate: string, endDate: string) => {
    // Just store the selected date range as a string
    setSelectedDates(`${startDate} to ${endDate}`);
    console.log('Date submitted:', startDate, endDate);
  };

  // Simple handler for settings changes (required prop)
  const handleSettingsChange = (newSettings: any) => {
    // This is required but we don't need to do anything with it
  };

  return (
    <div className="container mt-5">
      <h1>Calendar Widget Demo</h1>
      
      <div className="calendar-container mt-4">
        <CLACalendar
          settings={settings}
          onSettingsChange={handleSettingsChange}
          onSubmit={handleSubmit}
        />
      </div>
      
      {selectedDates && (
        <div className="mt-3">
          <strong>Selected Dates:</strong> {selectedDates}
        </div>
      )}
    </div>
  );
};

export default App;