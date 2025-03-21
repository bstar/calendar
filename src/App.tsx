import React, { useMemo, useState } from 'react';
import './bootstrap.min.css';
import './docStyles.css';
import './App.css';
// Import defensive styles for the calendar widget
import './components/DateRangePickerNew/defensive-styles.css';
import { CLACalendar } from './components/CLACalendar';
import { RestrictionType, RestrictedBoundaryRestriction, RestrictionConfig, BoundaryRestriction } from './components/DateRangePickerNew/restrictions/types';
import isoWeeksData from './data/iso_weeks.json';
import { subDays, formatISO, format } from 'date-fns';

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
  
  // Add state for the selected date range
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({
    start: null,
    end: null
  });

  // Common settings for both calendar instances - without expensive computation
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
    
    // Add empty placeholders that will be replaced by lazy loading
    layers: [],
    defaultLayer: "Calendar",
    restrictionConfig: { restrictions: [] },
    
    // MM/DD/YYYY format with padded zeros (produces "02/23/2025 to 02/23/2025" for a range)
    dateFormatter: (date: Date) => {
      // Pad numbers with leading zeros
      const pad = (num: number): string => String(num).padStart(2, '0');
      
      const month = pad(date.getMonth() + 1); // getMonth() is 0-indexed
      const day = pad(date.getDate());
      const year = date.getFullYear();
      
      return `${month}/${day}/${year}`;
    },
    // Custom separator for date ranges
    dateRangeSeparator: " to ",
    // Custom styling for the input field
    inputStyle: {
      // You can override any CSS properties here
      width: '250px',
      padding: '10px 12px',
      border: '2px solid #0366d6',
      borderRadius: '4px',
      fontSize: '1rem',
      color: '#333333',
      backgroundColor: '#f8f9fa',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      cursor: 'pointer',
    },
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

  // Create lazy factory function for layers
  const createLayersFactory = () => {
    return () => {
      // Get unique period ranges - only executed when calendar is opened
      const uniquePeriodRanges = getUniquePeriodRanges();
      
      // Generate period end events from uniquePeriodRanges - only executed when calendar is opened
      const periodEndEvents = uniquePeriodRanges.map(period => ({
        date: period.end,
        title: `Period ${period.period} End`,
        description: `End of Period ${period.period} (ID: ${period.periodId})`,
        type: "work" as const,
        time: "23:59"
      }));
      
      // Create and return the layers - important to use the same layer name ("Calendar") as defaultLayer
      return [
        {
          name: "Calendar", // Must match the defaultLayer in settings
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
      ];
    };
  };
  
  // Create lazy factory function for restrictions
  const createRestrictionsFactory = () => {
    return () => {
      // Get unique period ranges - only executed when calendar is opened
      const uniquePeriodRanges = getUniquePeriodRanges();
      
      return {
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
      };
    };
  };
  
  // Create lazy factory function for restrictions for second calendar
  const createRestrictions2Factory = () => {
    return () => {
      return {
        restrictions: [
          {
            type: 'boundary' as const,
            enabled: true,
            direction: 'before' as const,
            // Subtract one day from current date using date-fns
            date: formatISO(subDays(new Date(), 1)),
            message: "Cannot select dates before today"
          } as BoundaryRestriction
        ]
      };
    };
  };

  // Create settings for the second calendar with 3 months
  const calendar2Settings = {
    ...baseSettings,
    visibleMonths: 3, // Second calendar shows 3 months
    // Override the input style for the second calendar
    inputStyle: {
      width: '300px',
      padding: '8px 10px',
      border: '2px solid #28a745', // Green border
      borderRadius: '8px',
      fontSize: '1rem',
      color: '#333333',
      backgroundColor: '#f0fff0', // Light green background
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      cursor: 'pointer',
    }
  };

  // Memoize the factory functions to avoid recreating them on every render
  const layersFactory = useMemo(() => createLayersFactory(), []);
  const restrictionsFactory = useMemo(() => createRestrictionsFactory(), []);
  const restrictions2Factory = useMemo(() => createRestrictions2Factory(), []);

  return (
    <div style={{ 
      padding: '10px', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '40px',
      textAlign: 'left' 
    }}>
      {/* Display the selected range */}
      <div style={{
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        border: '1px solid #dee2e6',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Selected Date Range</h4>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'auto 1fr',
          gap: '8px 16px',
          fontSize: '14px',
          color: '#666'
        }}>
          <div style={{ fontWeight: 500 }}>Start Date:</div>
          <div>{dateRange.start ? format(new Date(dateRange.start), 'MMMM d, yyyy') : 'Not selected'}</div>
          <div style={{ fontWeight: 500 }}>End Date:</div>
          <div>{dateRange.end ? format(new Date(dateRange.end), 'MMMM d, yyyy') : 'Not selected'}</div>
        </div>
      </div>

      {/* Calendar Instance 1 */}
      <div style={{ position: 'relative', textAlign: 'left' }} className="cla-calendar-wrapper">
        <h3 style={{ textAlign: 'left' }}>Calendar Instance 1 (2 Months)</h3>
        <CLACalendar
          settings={baseSettings}
          onSettingsChange={() => {}}
          onSubmit={(start, end) => {
            setDateRange({ start, end });
          }}
          layersFactory={layersFactory}
          restrictionConfigFactory={restrictionsFactory}
        />
      </div>

      {/* Calendar Instance 2 with 3 months */}
      <div style={{ position: 'relative', textAlign: 'left' }} className="cla-calendar-wrapper">
        <h3 style={{ textAlign: 'left' }}>Calendar Instance 2 (3 Months)</h3>
        <CLACalendar
          settings={calendar2Settings}
          onSettingsChange={() => {}}
          onSubmit={(start, end) => {
            setDateRange({ start, end });
          }}
          layersFactory={layersFactory}
          restrictionConfigFactory={restrictions2Factory}
        />
      </div>

      {/* Spacer to ensure scrollable content */}
      <div style={{ height: '200px' }} />
    </div>
  );
};

export default App;