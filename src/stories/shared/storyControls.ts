/**
 * @fileoverview Shared Storybook controls configuration for calendar stories
 * 
 * This file centralizes the ArgTypes configuration used across all calendar
 * stories to ensure consistency in the Storybook controls panel. It defines:
 * 
 * - Control types and options for each calendar setting
 * - Descriptions and default values
 * - Category groupings for better organization
 * - Comprehensive coverage of all calendar features
 * 
 * By using these shared controls, all stories present a uniform interface
 * for testing and demonstrating calendar functionality.
 * 
 * @module storyControls
 */

import type { ArgTypes } from '@storybook/react';

/**
 * Shared controls configuration for all calendar stories
 * This ensures consistent controls across all stories
 */
export const calendarArgTypes: ArgTypes = {
  // Display settings
  displayMode: {
    control: 'radio',
    options: ['embedded', 'popup'],
    description: 'How the calendar is displayed',
    table: {
      category: 'Display',
      defaultValue: { summary: 'embedded' }
    }
  },
  visibleMonths: {
    control: { type: 'range', min: 1, max: 12, step: 1 },
    description: 'Number of months to display',
    table: {
      category: 'Display',
      defaultValue: { summary: 2 }
    }
  },
  monthWidth: {
    control: { type: 'range', min: 252, max: 1200, step: 10 },
    description: 'Width of each month in pixels (minimum 252px for 36px cells)',
    table: {
      category: 'Display',
      defaultValue: { summary: 300 }
    }
  },
  
  // Selection settings
  selectionMode: {
    control: 'radio',
    options: ['single', 'range'],
    description: 'Date selection mode',
    table: {
      category: 'Selection',
      defaultValue: { summary: 'range' }
    }
  },
  
  // Positioning (for popup mode)
  position: {
    control: 'select',
    options: ['bottom-left', 'bottom-right', 'top-left', 'top-right'],
    description: 'Popup position relative to input',
    table: {
      category: 'Positioning',
      defaultValue: { summary: 'bottom-left' }
    },
    if: { arg: 'displayMode', eq: 'popup' }
  },
  useDynamicPosition: {
    control: 'boolean',
    description: 'Automatically adjust position based on viewport',
    table: {
      category: 'Positioning',
      defaultValue: { summary: true }
    },
    if: { arg: 'displayMode', eq: 'popup' }
  },
  
  // Features
  showHeader: {
    control: 'boolean',
    description: 'Show calendar header',
    table: {
      category: 'Features',
      defaultValue: { summary: true }
    }
  },
  showFooter: {
    control: 'boolean',
    description: 'Show calendar footer',
    table: {
      category: 'Features',
      defaultValue: { summary: true }
    }
  },
  showSubmitButton: {
    control: 'boolean',
    description: 'Show submit button in footer',
    table: {
      category: 'Features',
      defaultValue: { summary: true }
    }
  },
  showTooltips: {
    control: 'boolean',
    description: 'Show hover tooltips',
    table: {
      category: 'Features',
      defaultValue: { summary: true }
    }
  },
  showLayersNavigation: {
    control: 'boolean',
    description: 'Show layer toggle controls',
    table: {
      category: 'Features',
      defaultValue: { summary: false }
    }
  },
  showDateInputs: {
    control: 'boolean',
    description: 'Show date input fields',
    table: {
      category: 'Features',
      defaultValue: { summary: true }
    }
  },
  
  // Behavior
  closeOnClickAway: {
    control: 'boolean',
    description: 'Close popup when clicking outside',
    table: {
      category: 'Behavior',
      defaultValue: { summary: true }
    },
    if: { arg: 'displayMode', eq: 'popup' }
  },
  startWeekOnSunday: {
    control: 'boolean',
    description: 'Start week on Sunday (vs Monday)',
    table: {
      category: 'Behavior',
      defaultValue: { summary: false }
    }
  },
  
  // Colors
  primaryColor: {
    control: 'color',
    description: 'Primary theme color',
    table: {
      category: 'Colors',
      defaultValue: { summary: '#0366d6' }
    }
  },
  successColor: {
    control: 'color',
    description: 'Success/selected color',
    table: {
      category: 'Colors',
      defaultValue: { summary: '#28a745' }
    }
  },
  warningColor: {
    control: 'color',
    description: 'Warning color',
    table: {
      category: 'Colors',
      defaultValue: { summary: '#f6c23e' }
    }
  },
  dangerColor: {
    control: 'color',
    description: 'Danger/error color',
    table: {
      category: 'Colors',
      defaultValue: { summary: '#dc3545' }
    }
  },
  
  // Advanced
  timezone: {
    control: 'text',
    description: 'Timezone for date operations',
    table: {
      category: 'Advanced',
      defaultValue: { summary: 'UTC' }
    }
  },
  dateRangeSeparator: {
    control: 'text',
    description: 'Separator for date ranges',
    table: {
      category: 'Advanced',
      defaultValue: { summary: ' - ' }
    }
  },
  baseFontSize: {
    control: 'text',
    description: 'Base font size (e.g. "1rem", "16px")',
    table: {
      category: 'Advanced',
      defaultValue: { summary: '1rem' }
    }
  },
  
  // Diagonal Pattern Control
  diagonalColOffset: {
    control: { type: 'range', min: 0, max: 10, step: 0.5 },
    description: 'Column Y-offset for diagonal restriction pattern alignment',
    table: {
      category: 'Advanced',
      defaultValue: { summary: 2 }
    }
  }
};

/**
 * Default args that match the calendar's default settings
 */
export const defaultArgs = {
  displayMode: 'embedded',
  visibleMonths: 2,
  monthWidth: 300,
  selectionMode: 'range',
  position: 'bottom-left',
  useDynamicPosition: true,
  showHeader: true,
  showFooter: true,
  showSubmitButton: true,
  showTooltips: true,
  showLayersNavigation: false,
  showDateInputs: true,
  closeOnClickAway: true,
  startWeekOnSunday: false,
  primaryColor: '#0366d6',
  successColor: '#28a745',
  warningColor: '#f6c23e',
  dangerColor: '#dc3545',
  timezone: 'UTC',
  dateRangeSeparator: ' - ',
  baseFontSize: '1rem',
  diagonalColOffset: 2
};

/**
 * Helper to convert story args to calendar settings
 */
export function argsToSettings(args: any) {
  const settings: any = {
    displayMode: args.displayMode,
    visibleMonths: args.visibleMonths,
    monthWidth: args.monthWidth,
    selectionMode: args.selectionMode,
    position: args.position,
    useDynamicPosition: args.useDynamicPosition,
    showHeader: args.showHeader,
    showFooter: args.showFooter,
    showSubmitButton: args.showSubmitButton,
    showTooltips: args.showTooltips,
    showLayersNavigation: args.showLayersNavigation,
    showDateInputs: args.showDateInputs,
    closeOnClickAway: args.closeOnClickAway,
    startWeekOnSunday: args.startWeekOnSunday,
    timezone: args.timezone,
    dateRangeSeparator: args.dateRangeSeparator,
    baseFontSize: args.baseFontSize,
    colors: {
      primary: args.primaryColor,
      success: args.successColor,
      warning: args.warningColor,
      danger: args.dangerColor
    }
  };
  
  // Include any additional properties that might be passed for edge cases
  if (args.defaultRange !== undefined) {
    settings.defaultRange = args.defaultRange;
  }
  if (args.layers !== undefined) {
    settings.layers = args.layers;
  }
  if (args.dateFormatter !== undefined) {
    settings.dateFormatter = args.dateFormatter;
  }
  if (args.colors !== undefined && typeof args.colors === 'object') {
    settings.colors = args.colors;
  }
  
  return settings;
}