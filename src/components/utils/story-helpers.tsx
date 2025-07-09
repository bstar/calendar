import React from 'react';
import { CLACalendar } from '../CLACalendar';
import { getDefaultSettings } from '../CLACalendar.config';

// Common story wrapper for consistent styling
export const StoryContainer: React.FC<{ children: React.ReactNode; minHeight?: string }> = ({ 
  children, 
  minHeight = '550px' 
}) => (
  <div style={{ minHeight }}>
    {children}
  </div>
);

// Base calendar props used across stories
export const baseCalendarSettings = {
  ...getDefaultSettings(),
  monthWidth: 600,
  showSubmitButton: true,
};

// Helper to create calendar with common settings
export const CalendarStory: React.FC<{
  settings?: any;
  restrictionConfigFactory?: () => any;
  layersFactory?: () => any;
  onSettingsChange?: (settings: any) => void;
}> = ({ 
  settings = baseCalendarSettings, 
  restrictionConfigFactory,
  layersFactory,
  onSettingsChange = () => {}
}) => (
  <CLACalendar
    settings={settings}
    restrictionConfigFactory={restrictionConfigFactory}
    layersFactory={layersFactory}
    _onSettingsChange={onSettingsChange}
  />
);

// Story parameter helper for consistent code display
export const createStoryParameters = (code: string) => ({
  docs: {
    source: {
      code,
    },
  },
});

// Format code examples consistently
export const formatCodeExample = (componentName: string, props: Record<string, any>) => {
  const propsString = Object.entries(props)
    .map(([key, value]) => {
      if (typeof value === 'string') {
        return `  ${key}="${value}"`;
      } else if (typeof value === 'function') {
        return `  ${key}={${value.toString()}}`;
      } else {
        return `  ${key}={${JSON.stringify(value, null, 2).split('\n').join('\n  ')}}`;
      }
    })
    .join('\n');
  
  return `<${componentName}\n${propsString}\n/>`;
};