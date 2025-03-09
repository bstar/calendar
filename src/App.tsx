import React, { useState, useEffect } from 'react';
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
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{ startDate: string; endDate: string } | null>(null);
  const [visualizeBoundaries, setVisualizeBoundaries] = useState(false);
  
  // Create boundary background data for visualization
  const boundaryBackgroundData = visualizeBoundaries ? uniquePeriodRanges.map(period => ({
    startDate: period.start,
    endDate: period.end,
    color: 'rgba(255, 193, 7, 0.3)' // Yellow highlight
  })) : [];
  
  // Create events for the end dates of each period
  const periodEndEvents = uniquePeriodRanges.map(period => ({
    date: period.end,
    title: `PERIOD END`, // Capitalized for emphasis
    type: "deadline", // "deadline" might be a reserved type that gets special treatment
    time: "23:59",
    description: `End of Period ${period.period} (ID: ${period.periodId})`,
    color: "#f3832d", // Specific orange color requested
    important: true, // Flag for importance
    priority: "high" // Additional priority flag
  }));
  
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
  
  // Hard-coded settings with only boundary ranges based on period dates
  const settings = {
    displayMode: "popup" as const,
    timezone: "UTC",
    visibleMonths: 2,
    singleMonthWidth: 500,
    showMonthHeadings: true,
    selectionMode: "range" as const,
    showTooltips: true,
    showHeader: true,
    closeOnClickAway: false,
    showSubmitButton: false,
    showFooter: true,
    enableOutOfBoundsScroll: true,
    suppressTooltipsOnSelection: false,
    showSelectionAlert: false,
    startWeekOnSunday: false,
    initialMonth: new Date('2024-11-01'),
    layers: [
      {
        name: "Calendar",
        title: "Base Calendar",
        description: "Basic calendar functionality",
        required: true,
        visible: true,
        data: {
          events: periodEndEvents,
          background: boundaryBackgroundData
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

  const handleSettingsChange = (newSettings: any) => {
    console.log('Settings changed:', newSettings);
    // In a real app, you would probably update your state here
  };

  return (
    <div className="container mt-5">
      <h1>Calendar Widget Demo</h1>
      
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Select date range"
              value={selectedRange ? `${selectedRange.startDate} - ${selectedRange.endDate}` : ''}
              onClick={() => setIsCalendarVisible(true)}
              readOnly
            />
            <div className="input-group-append">
              <button 
                className="btn btn-outline-secondary" 
                type="button"
                onClick={() => setIsCalendarVisible(true)}
              >
                Select Dates
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <button 
            className="btn btn-sm btn-warning" 
            onClick={() => setVisualizeBoundaries(!visualizeBoundaries)}
          >
            {visualizeBoundaries ? 'Hide Boundaries' : 'Highlight Boundaries'}
          </button>
        </div>
      </div>
      
      {isCalendarVisible && (
        <div className="calendar-container mb-4">
          <CLACalendar
            settings={settings}
            onSettingsChange={handleSettingsChange}
          />
        </div>
      )}
      
      {selectedRange && (
        <div className="alert alert-success">
          <strong>Selected Range:</strong> {selectedRange.startDate} to {selectedRange.endDate}
        </div>
      )}
    </div>
  );
};

export default App;