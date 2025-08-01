/**
 * @fileoverview Shared wrapper component for Storybook calendar stories
 * 
 * This component provides a consistent wrapper for all calendar stories,
 * handling common functionality such as:
 * 
 * - State management for selected dates
 * - Conversion of Storybook args to calendar settings
 * - Display of selected date feedback
 * - Optional title and description rendering
 * - Container styling and layout
 * 
 * Using this wrapper ensures all stories have consistent behavior and
 * presentation, making it easier to test and demonstrate calendar features.
 * 
 * @module CalendarStoryWrapper
 */

import React, { useState } from 'react';
import { CLACalendar } from '../../components/CLACalendar';
import { getDefaultSettings } from '../../components/CLACalendar.config';
import { argsToSettings } from './storyControls';

/**
 * Props for the CalendarStoryWrapper component
 * @interface CalendarStoryWrapperProps
 * @property args - Storybook args to be converted to calendar settings
 * @property title - Optional title to display above the calendar
 * @property description - Optional description text
 * @property showSelectedDate - Whether to show selected date feedback (default: true)
 * @property containerStyle - Additional styles for the container
 * @property settingsOverrides - Direct settings overrides that bypass args conversion
 */
interface CalendarStoryWrapperProps {
  args: any;
  title?: string;
  description?: string;
  showSelectedDate?: boolean;
  containerStyle?: React.CSSProperties;
  settingsOverrides?: any;
}

/**
 * Common wrapper component for calendar stories
 * Handles state management and displays selected dates
 */
export const CalendarStoryWrapper: React.FC<CalendarStoryWrapperProps> = ({
  args,
  title,
  description,
  showSelectedDate = true,
  containerStyle = {},
  settingsOverrides = {}
}) => {
  const [selectedDates, setSelectedDates] = useState<{
    start: string | null;
    end: string | null;
  }>({ start: null, end: null });

  const handleSubmit = (start: string | null, end: string | null) => {
    setSelectedDates({
      start: start,
      end: end || start
    });
  };

  const settings = {
    ...getDefaultSettings(),
    ...argsToSettings(args),
    onSubmit: handleSubmit,
    ...settingsOverrides
  };

  return (
    <div style={{ 
      padding: '20px',
      ...containerStyle 
    }}>
      {title && <h3>{title}</h3>}
      {description && <p style={{ color: '#666', marginBottom: '20px' }}>{description}</p>}
      
      <CLACalendar 
        settings={settings}
        _onSettingsChange={() => {}}
      />
      
      {showSelectedDate && selectedDates.start && (
        <div style={{ 
          marginTop: '20px', 
          padding: '12px', 
          backgroundColor: '#f0f9ff',
          border: '1px solid #0366d6',
          borderRadius: '6px',
          color: '#0366d6'
        }}>
          <strong>Selected:</strong> {
            settings.selectionMode === 'single' 
              ? selectedDates.start
              : `${selectedDates.start} ${settings.dateRangeSeparator || ' - '} ${selectedDates.end}`
          }
        </div>
      )}
    </div>
  );
};