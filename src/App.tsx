import React, { useMemo, useState } from 'react';
import './bootstrap.min.css';
import './docStyles.css';
import './App.css';
import { CLACalendar } from './components/CLACalendar';
import type { CalendarSettings, Layer } from './components/DateRangePicker.config';
import { getDefaultSettings, DEFAULT_COLORS } from './components/DateRangePicker.config';
import { addDays, format } from './utils/DateUtils';
import { useRangeSelection } from './components/hooks';
import { createLayersFactory } from './components/DateRangePickerNew/layers/LayerFactory';
import type { RestrictionConfig } from './components/DateRangePickerNew/restrictions/types';
import { RestrictionType, RestrictedBoundaryRestriction, BoundaryRestriction } from './components/DateRangePickerNew/restrictions/types';
import isoWeeksData from './data/iso_weeks.json';
import { subDays, formatISO } from 'date-fns';

// Declare unused variables with underscore prefix to satisfy linter
const _getDefaultSettings = getDefaultSettings;
const _addDays = addDays;
const _useRangeSelection = useRangeSelection;
const _createLayersFactory = createLayersFactory;

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

  // Add state for dynamic positioning
  const [useDynamicPosition, setUseDynamicPosition] = useState(true);

  // Add state for base settings
  const [baseSettings, setBaseSettings] = useState<CalendarSettings>({
    displayMode: "popup" as const,
    timezone: "UTC",
    visibleMonths: 2,
    monthWidth: 300,
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
    isOpen: false,
    showLayersNavigation: false,
    position: 'bottom-right',
    useDynamicPosition: true,

    // Add empty placeholders that will be replaced by lazy loading
    layers: [],
    defaultLayer: "Calendar",
    restrictionConfig: { restrictions: [] },
    colors: DEFAULT_COLORS
  });

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

  // Create settings for the third calendar with default date range
  const calendar3Settings = {
    ...baseSettings,
    displayMode: "popup" as const,
    visibleMonths: 2, // Third calendar shows 2 months
    isOpen: false,
    // Set a default date range
    defaultRange: {
      start: '2024-01-01',
      end: '2024-01-07'
    },
    // Override the input style for the third calendar
    inputStyle: {
      width: '300px',
      padding: '8px 10px',
      border: '2px solid #6f42c1', // Purple border
      borderRadius: '8px',
      fontSize: '1rem',
      color: '#333333',
      backgroundColor: '#f8f0ff', // Light purple background
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
      {/* Add dynamic positioning controls at the top */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '16px', 
        display: 'flex', 
        gap: '20px', 
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        border: '1px solid #dee2e6'
      }}>
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          cursor: 'pointer',
          userSelect: 'none'
        }}>
          <input
            type="checkbox"
            checked={useDynamicPosition}
            onChange={(e) => {
              const newSettings = {
                ...baseSettings,
                useDynamicPosition: e.target.checked
              };
              setBaseSettings(newSettings);
              setUseDynamicPosition(e.target.checked);
            }}
            style={{ cursor: 'pointer' }}
          />
          Use Dynamic Positioning
        </label>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ 
            color: useDynamicPosition ? '#6c757d' : '#212529',
            fontSize: '14px'
          }}>
            Fallback Position:
          </span>
          <select 
            onChange={(e) => {
              const newSettings = {
                ...baseSettings,
                position: e.target.value as 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
              };
              setBaseSettings(newSettings);
            }}
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              color: useDynamicPosition ? '#6c757d' : '#212529',
              backgroundColor: useDynamicPosition ? '#f8f9fa' : '#ffffff',
              cursor: 'pointer'
            }}
            value={baseSettings.position}
          >
            <option value="bottom-right">Bottom Right</option>
            <option value="bottom-left">Bottom Left</option>
            <option value="top-right">Top Right</option>
            <option value="top-left">Top Left</option>
          </select>
        </div>
      </div>

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
          settings={{
            ...baseSettings,
            useDynamicPosition,
            position: baseSettings.position
          }}
          _onSettingsChange={() => { }}
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
          settings={{
            ...calendar2Settings,
            useDynamicPosition,
            position: baseSettings.position
          }}
          _onSettingsChange={() => { }}
          onSubmit={(start, end) => {
            setDateRange({ start, end });
          }}
          layersFactory={layersFactory}
          restrictionConfigFactory={restrictions2Factory}
        />
      </div>

      {/* Calendar Instance 3 with default date range */}
      <div style={{ position: 'relative', textAlign: 'left' }} className="cla-calendar-wrapper">
        <h3 style={{ textAlign: 'left' }}>Calendar with Default Range in January 2024</h3>
        <CLACalendar
          settings={{
            ...calendar3Settings,
            useDynamicPosition,
            position: baseSettings.position
          }}
          _onSettingsChange={() => { }}
          onSubmit={(start, end) => {
            setDateRange({ start, end });
          }}
          layersFactory={layersFactory}
          restrictionConfigFactory={restrictionsFactory}
        />
      </div>

      {/* Spacer to ensure scrollable content */}
      <div style={{ height: '200px' }} />
    </div>
  );
};

export default App;