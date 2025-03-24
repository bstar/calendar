import React, { CSSProperties } from 'react';
import { RestrictionConfig } from './DateRangePickerNew/restrictions/types';

export type LAYER_TYPES = 'base' | 'overlay';

interface _LayerFeature {
  name: string;
  description: string;
  dataSchema: null | {
    type: string;
    items: Record<string, string>;
  };
}

interface SettingOption {
  value: string;
  label: string;
}

interface BaseSetting {
  id: string;
  type: string;
  label: string;
  description: string;
  width?: string;
}

interface SelectSetting extends BaseSetting {
  type: 'select';
  default: string;
  options: SettingOption[];
}

interface NumberSetting extends BaseSetting {
  type: 'number';
  default: number;
  min: number;
  max: number;
}

interface BooleanSetting extends BaseSetting {
  type: 'boolean';
  default: boolean;
}

interface StyleSetting extends BaseSetting {
  type: 'style-editor';
  default: null | ExtendedCSSProperties;
  presets: Record<string, null | ExtendedCSSProperties>;
}

interface LayerControlSetting extends BaseSetting {
  type: 'layer-controls';
  default: Layer[];
  globalControls: {
    defaultLayer: {
      id: string;
      type: string;
      label: string;
      description: string;
      default: string;
    };
    showLayerControls: {
      id: string;
      type: string;
      label: string;
      description: string;
      default: boolean;
    };
  };
  controls: {
    features: {
      id: string;
      type: string;
      label: string;
      description: string;
      options: SettingOption[];
      width: string;
    };
    title: {
      id: string;
      type: string;
      label: string;
      description: string;
      width: string;
    };
    description: {
      type: string;
      label: string;
      description: string;
      required: boolean;
    };
  };
  actions: {
    canAdd: boolean;
    canRemove: boolean;
    newLayerTemplate: Omit<Layer, 'features'> & { data: unknown[] };
  };
}

type Setting = SelectSetting | NumberSetting | BooleanSetting | StyleSetting | LayerControlSetting;

interface _Settings {
  core: Record<string, Setting>;
  features: Record<string, BooleanSetting>;
  layers: LayerControlSetting;
  formatting: Record<string, Setting>;
}

// Update Event type for layer events
export interface Event {
  date: string;
  title: string;
  type: string;
  time: string;
  description: string;
  color?: string;
}

// Update EventData to match Event type
export interface EventData extends Event {
  type: string;
}

// Update Layer interface to match LayerRenderer requirements
export interface Layer {
  name: string;
  title: string;
  description: string;
  required?: boolean;
  visible?: boolean;
  data?: LayerData;
  color?: string;
  enabled?: boolean;
  events?: EventData[];
}

export interface LayerData {
  events?: EventData[];
  background?: BackgroundData[];
}

export interface BackgroundData {
  startDate: string;
  endDate: string;
  color: string;
}

// Calendar Settings Types
export interface CalendarSettings {
  // Core Settings
  displayMode: 'popup' | 'embedded';
  timezone: string;
  containerStyle?: CSSProperties;
  inputStyle?: React.CSSProperties;
  isOpen?: boolean;
  visibleMonths: number;
  singleMonthWidth: number;
  showMonthHeadings: boolean;
  baseFontSize?: string; // Base font size for the calendar (e.g. '1rem', '16px')
  
  // Feature Settings
  selectionMode: 'single' | 'range';
  showTooltips: boolean;
  showHeader: boolean;
  closeOnClickAway: boolean;
  showSubmitButton: boolean;
  showFooter: boolean;
  enableOutOfBoundsScroll: boolean;
  suppressTooltipsOnSelection: boolean;
  showSelectionAlert: boolean;
  startWeekOnSunday: boolean;
  dateFormatter?: (date: Date) => string; // Custom date formatter function
  dateRangeSeparator?: string; // Custom separator for date ranges (default is " - ")
  defaultRange?: { start: string; end: string }; // Default date range to initialize with
  
  // Layer Settings
  layers: Layer[];
  showLayersNavigation: boolean;
  defaultLayer: string;
  restrictionConfig?: RestrictionConfig;
  
  // Color Settings
  colors?: {
    primary?: string;    // Default blue
    success?: string;    // Default green
    warning?: string;    // Default yellow
    danger?: string;     // Default red
    purple?: string;
    teal?: string;
    orange?: string;
    pink?: string;
  };
}

// Control Types for App.tsx
export interface SettingControl {
  id: string;
  type: 'boolean' | 'number' | 'select' | 'style-editor' | 'text';
  label: string;
  description: string;
  default: unknown;
  options?: SettingOption[];
  min?: number;
  max?: number;
  width?: string;
  presets?: Record<string, unknown>;
  required?: boolean;
}

export interface SettingsConfig {
  core: Record<string, SettingControl>;
  features: Record<string, SettingControl>;
  layers: {
    controls: Record<string, SettingControl>;
    actions: {
      canAdd: boolean;
      canRemove: ((layer: Layer) => boolean) | boolean;
      newLayerTemplate: Omit<Layer, 'features'> & { data: unknown[] };
    };
  };
  formatting: Record<string, SettingControl>;
}

// Default colors that can be overridden
export const DEFAULT_COLORS = {
  primary: '#0366d6',    // Blue
  success: '#28a745',    // Green
  warning: '#f6c23e',    // Yellow
  danger: '#dc3545',     // Red
  purple: '#6f42c1',
  teal: '#20c997',
  orange: '#fd7e14',
  pink: '#e83e8c'
};

// Default container styles
export const DEFAULT_CONTAINER_STYLES: CSSProperties = {
  backgroundColor: '#fff',
  border: '1px solid #dee2e6',
  borderRadius: '6px',
  boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)'
};

// Empty default layers - actual data should be provided by the implementing application
export const DEFAULT_LAYERS: Layer[] = [];

export const getDefaultSettings = (): CalendarSettings => ({
  displayMode: 'embedded',
  timezone: 'UTC',
  visibleMonths: 2,
  singleMonthWidth: 500,
  showMonthHeadings: true,
  selectionMode: 'range',
  showTooltips: true,
  showHeader: true,
  closeOnClickAway: true,
  showSubmitButton: false,
  showFooter: true,
  enableOutOfBoundsScroll: true,
  suppressTooltipsOnSelection: false,
  showSelectionAlert: false,
  startWeekOnSunday: false,
  dateFormatter: undefined,
  dateRangeSeparator: " - ",
  defaultRange: undefined,
  layers: DEFAULT_LAYERS,
  showLayersNavigation: true,
  defaultLayer: '',
  colors: DEFAULT_COLORS
});

// Update layer validation to ensure at least one layer
export const validateLayers = (layers: Layer[]): boolean => {
  return layers.length >= 1 && layers.some(layer => layer.required);
};

// Update SETTINGS to remove type distinction
export const SETTINGS: SettingsConfig = {
  core: {
    displayMode: {
      id: 'displayMode',
      type: 'select',
      label: 'Display Mode',
      description: 'How the calendar should be displayed',
      default: 'embedded',
      options: [
        { value: 'popup', label: 'Popup' },
        { value: 'embedded', label: 'Embedded' }
      ]
    },
    timezone: {
      id: 'timezone',
      type: 'select',
      label: 'Timezone',
      description: 'Override the default timezone (UTC)',
      default: 'UTC',
      options: [
        { value: 'UTC', label: 'UTC (Default)' },
        { value: 'local', label: 'Browser Local Time' },
        { value: 'America/New_York', label: 'Eastern Time (ET)' },
        { value: 'America/Chicago', label: 'Central Time (CT)' },
        { value: 'America/Denver', label: 'Mountain Time (MT)' },
        { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
        { value: 'Europe/London', label: 'London (GMT)' },
        { value: 'Europe/Paris', label: 'Central European Time (CET)' },
        { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
        { value: 'Pacific/Auckland', label: 'New Zealand Time (NZT)' }
      ]
    },
    visibleMonths: {
      id: 'visibleMonths',
      type: 'number',
      label: 'Visible Months',
      description: 'Number of months to display',
      default: 2,
      min: 1,
      max: 6
    },
    singleMonthWidth: {
      id: 'singleMonthWidth',
      type: 'number',
      label: 'Month Width',
      description: 'Width of a single month in pixels',
      default: 500,
      min: 200,
      max: 800
    },
    containerStyle: {
      id: 'containerStyle',
      type: 'style-editor',
      label: 'Container Style',
      description: 'Customize the calendar container appearance',
      default: DEFAULT_CONTAINER_STYLES,
      presets: {
        'Default': null,
        'No Shadow': {
          boxShadow: 'none'
        },
        'Rounded Corners': {
          borderRadius: '12px'
        },
        'Rigid Corners': {
          borderRadius: '0'
        }
      }
    }
  },
  features: {
    showLayersNavigation: {
      id: 'showLayersNavigation',
      type: 'boolean',
      label: 'Show Layers Navigation',
      description: 'Display layers navigation panel in the calendar',
      default: true
    },
    showMonthHeadings: {
      id: 'showMonthHeadings',
      type: 'boolean',
      label: 'Show Month Headings',
      description: 'Display month names above each month',
      default: true
    },
    showTooltips: {
      id: 'showTooltips',
      type: 'boolean',
      label: 'Show Tooltips',
      description: 'Enable tooltips on calendar items',
      default: true
    },
    showHeader: {
      id: 'showHeader',
      type: 'boolean',
      label: 'Show Header',
      description: 'Display the calendar header',
      default: true
    },
    showFooter: {
      id: 'showFooter',
      type: 'boolean',
      label: 'Show Footer',
      description: 'Display the calendar footer',
      default: true
    },
    showSubmitButton: {
      id: 'showSubmitButton',
      type: 'boolean',
      label: 'Show Submit Button',
      description: 'Display a submit button in the footer',
      default: false
    },
    closeOnClickAway: {
      id: 'closeOnClickAway',
      type: 'boolean',
      label: 'Close on Click Away',
      description: 'Close the calendar when clicking outside',
      default: true
    },
    enableOutOfBoundsScroll: {
      id: 'enableOutOfBoundsScroll',
      type: 'boolean',
      label: 'Enable Out of Bounds Scroll',
      description: 'Allow scrolling months when dragging to edge',
      default: true
    },
    suppressTooltipsOnSelection: {
      id: 'suppressTooltipsOnSelection',
      type: 'boolean',
      label: 'Suppress Tooltips on Selection',
      description: 'Hide tooltips while selecting dates',
      default: false
    },
    showSelectionAlert: {
      id: 'showSelectionAlert',
      type: 'boolean',
      label: 'Show Selection Alert',
      description: 'Display alert when selection is restricted',
      default: false
    },
    startWeekOnSunday: {
      id: 'startWeekOnSunday',
      type: 'boolean',
      label: 'Start Week on Sunday',
      description: 'Set Sunday as the first day of the week',
      default: false
    }
  },
  formatting: {
    dateFormatter: {
      id: 'dateFormatter',
      type: 'text',
      label: 'Date Formatter',
      description: 'Custom function to format dates (provide as code string, will be handled programmatically)',
      default: undefined // Default to undefined (use built-in formatter)
    },
    dateRangeSeparator: {
      id: 'dateRangeSeparator',
      type: 'text',
      label: 'Date Range Separator',
      description: 'Text to separate start and end dates in a range (e.g., " - " or " to ")',
      default: " - "
    }
  },
  layers: {
    controls: {
      name: {
        id: 'name',
        type: 'text',
        label: 'Layer Name',
        description: 'Unique identifier for the layer',
        required: true,
        default: ''
      },
      title: {
        id: 'title',
        type: 'text',
        label: 'Display Title',
        description: 'User-friendly name for the layer',
        required: true,
        default: ''
      },
      description: {
        id: 'description',
        type: 'text',
        label: 'Description',
        description: 'Brief description of the layer purpose',
        required: true,
        default: ''
      }
    },
    actions: {
      canAdd: true,
      canRemove: ((layer: Layer) => !layer.required) as ((layer: Layer) => boolean),
      newLayerTemplate: {
        name: '',
        title: '',
        description: '',
        data: [],
        required: false
      }
    }
  }
};

interface DisplayModeConstraints {
  closeOnClickAway: boolean;
  enableOutOfBoundsScroll: boolean;
  showHeader: boolean;
}

export const DISPLAY_MODE_CONSTRAINTS: Record<string, DisplayModeConstraints> = {
  embedded: {
    closeOnClickAway: false,
    enableOutOfBoundsScroll: false,
    showHeader: true
  }
};

// Add type for CSS properties with hover states
export interface ExtendedCSSProperties extends CSSProperties {
  '&:hover'?: CSSProperties;
  '&:focus'?: CSSProperties;
}

// Add these type definitions
type _BorderCollapse = 'collapse' | 'separate';
type _TextAlign = 'left' | 'center' | 'right';

// Update the actions type to allow a function
export interface LayerActions {
  canAdd: boolean;
  canRemove: boolean | ((layer: Layer) => boolean);
  newLayerTemplate: Omit<Layer, 'features'> & { data: unknown[] };
} 