import React from 'react';
import { CLACalendar } from '../CLACalendar';
import { getDefaultSettings } from '../CLACalendar.config';
import type { CalendarSettings } from '../CLACalendar.config';

// Common argTypes for all calendar stories
export const commonCalendarArgTypes = {
  displayMode: {
    control: { type: 'radio' },
    options: ['popup', 'embedded'],
    description: 'How the calendar is displayed',
    table: {
      type: { summary: '"popup" | "embedded"' },
      defaultValue: { summary: 'popup' },
    },
  },
  selectionMode: {
    control: { type: 'radio' },
    options: ['single', 'range'],
    description: 'Date selection mode',
    table: {
      type: { summary: '"single" | "range"' },
      defaultValue: { summary: 'range' },
    },
  },
  visibleMonths: {
    control: { type: 'number', min: 1, max: 12, step: 1 },
    description: 'Number of months to display',
    table: {
      type: { summary: 'number' },
      defaultValue: { summary: '2' },
    },
  },
  showHeader: {
    control: 'boolean',
    description: 'Show calendar header with date inputs',
    table: {
      type: { summary: 'boolean' },
      defaultValue: { summary: 'true' },
    },
  },
  showFooter: {
    control: 'boolean',
    description: 'Show calendar footer',
    table: {
      type: { summary: 'boolean' },
      defaultValue: { summary: 'true' },
    },
  },
  showSubmitButton: {
    control: 'boolean',
    description: 'Show submit button in footer',
    table: {
      type: { summary: 'boolean' },
      defaultValue: { summary: 'true' },
    },
  },
  showTooltips: {
    control: 'boolean',
    description: 'Show tooltips on hover',
    table: {
      type: { summary: 'boolean' },
      defaultValue: { summary: 'true' },
    },
  },
  startWeekOnSunday: {
    control: 'boolean',
    description: 'Start week on Sunday instead of Monday',
    table: {
      type: { summary: 'boolean' },
      defaultValue: { summary: 'false' },
    },
  },
  primaryColor: {
    control: 'color',
    description: 'Primary theme color',
    table: {
      type: { summary: 'string' },
      defaultValue: { summary: '#0366d6' },
    },
  },
  isOpen: {
    control: 'boolean',
    description: 'Control popup open state (popup mode only)',
    table: {
      type: { summary: 'boolean' },
      defaultValue: { summary: 'true (in Storybook)' },
    },
    if: { arg: 'displayMode', eq: 'popup' },
  },
  position: {
    control: { type: 'select' },
    options: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    description: 'Popup position relative to input field',
    table: {
      type: { summary: '"top-left" | "top-right" | "bottom-left" | "bottom-right"' },
      defaultValue: { summary: 'top-left (in Storybook)' },
    },
    if: { arg: 'displayMode', eq: 'popup' },
  },
};

// Common props interface
export interface CommonCalendarProps {
  displayMode?: 'popup' | 'embedded';
  selectionMode?: 'single' | 'range';
  visibleMonths?: number;
  showHeader?: boolean;
  showFooter?: boolean;
  showSubmitButton?: boolean;
  showTooltips?: boolean;
  startWeekOnSunday?: boolean;
  primaryColor?: string;
  isOpen?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  onSubmit?: (start: string, end: string) => void;
}

// Common calendar implementation component
export const CalendarImplementation: React.FC<CommonCalendarProps & {
  additionalSettings?: Partial<CalendarSettings>;
  containerStyle?: React.CSSProperties;
  storyId?: string;
}> = ({ 
  displayMode = 'popup',
  selectionMode = 'range',
  visibleMonths = 2,
  showHeader = true,
  showFooter = true,
  showSubmitButton = true,
  showTooltips = true,
  startWeekOnSunday = false,
  primaryColor = '#0366d6',
  isOpen = true,
  position = 'top-left',
  onSubmit,
  additionalSettings = {},
  containerStyle = {},
}) => {
  const settings: CalendarSettings = {
    ...getDefaultSettings(),
    displayMode,
    selectionMode,
    visibleMonths,
    showHeader,
    showFooter,
    showSubmitButton,
    showTooltips,
    startWeekOnSunday,
    isOpen: displayMode === 'popup' ? isOpen : undefined,
    position: displayMode === 'popup' ? position : undefined,
    colors: {
      ...getDefaultSettings().colors,
      primary: primaryColor,
    },
    ...additionalSettings, // Allow story-specific overrides
  };

  // Simplified container - let the calendar handle its own positioning
  return (
    <div 
      className="story-calendar-container"
      data-display-mode={displayMode}
      style={{ 
        // Minimal container styles
        minHeight: displayMode === 'popup' ? '400px' : 'auto',
        ...containerStyle
      }}
    >
      <CLACalendar 
        key={`calendar-${displayMode}-${selectionMode}-${visibleMonths}`}
        settings={settings}
        onSubmit={onSubmit || ((start, end) => {
          console.log('Date selected:', { start, end });
        })}
        _onSettingsChange={() => {}}
      />
    </div>
  );
};

// Widget-specific argTypes (subset of common ones)
export const widgetArgTypes = {
  displayMode: commonCalendarArgTypes.displayMode,
  isOpen: commonCalendarArgTypes.isOpen,
  position: commonCalendarArgTypes.position,
};

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