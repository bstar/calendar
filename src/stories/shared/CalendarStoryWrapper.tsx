import React, { useState } from 'react';
import { CLACalendar } from '../../components/CLACalendar';
import { getDefaultSettings } from '../../components/CLACalendar.config';
import { argsToSettings } from './storyControls';

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