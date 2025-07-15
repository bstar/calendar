import React, { CSSProperties } from 'react';
import { RestrictionConfig } from './CLACalendarComponents/restrictions/types';

// Re-export RestrictionConfig for external use
export type { RestrictionConfig };

// Simple configuration interface for basic use cases
export interface SimpleCalendarSettings {
  /** How the calendar should be displayed */
  displayMode?: 'popup' | 'embedded';
  
  /** Number of months to show (1-6) */
  visibleMonths?: number;
  
  /** Calendar selection mode */
  selectionMode?: 'single' | 'range';
  
  /** Default date range to initialize with */
  defaultRange?: { start?: string; end?: string };
  
  /** Callback when user submits a date selection */
  onSubmit?: (startDate: string | null, endDate: string | null) => void;
  
  /** Custom date formatter function */
  dateFormatter?: (date: Date) => string;
  
  /** Whether to show the submit button */
  showSubmitButton?: boolean;
  
  /** Whether to start the week on Sunday (vs Monday) */
  startWeekOnSunday?: boolean;
  
  /** Custom CSS class for the input field */
  inputClassName?: string;
  
  /** Custom styles for the calendar container */
  containerStyle?: React.CSSProperties;
  
  /** Custom styles for the input field */
  inputStyle?: React.CSSProperties;
  
  /** Color theme overrides */
  colors?: Partial<{
    primary: string;
    success: string;
    warning: string;
    danger: string;
    purple: string;
    teal: string;
    orange: string;
    pink: string;
  }>;
  
  /** Event layers to display on the calendar */
  layers?: Layer[];
  
  /** Date restrictions configuration */
  restrictions?: RestrictionConfig;
}

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

// Full calendar settings interface (advanced use cases)
export interface CalendarSettings {
  // Core Settings - now mostly optional with smart defaults
  displayMode?: 'popup' | 'embedded';
  timezone?: string;
  containerStyle?: CSSProperties;
  inputStyle?: React.CSSProperties;
  isOpen?: boolean;
  visibleMonths?: number;
  monthWidth?: number; // Width of each month in pixels
  showMonthHeadings?: boolean;
  baseFontSize?: string; // Base font size for the calendar (e.g. '1rem', '16px')
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'; // Position of the calendar relative to input
  useDynamicPosition?: boolean; // Whether to use dynamic positioning with fallback to position
  
  // Feature Settings - now optional with smart defaults
  selectionMode?: 'single' | 'range';
  showTooltips?: boolean;
  showHeader?: boolean;
  closeOnClickAway?: boolean;
  showSubmitButton?: boolean;
  showFooter?: boolean;
  enableOutOfBoundsScroll?: boolean;
  suppressTooltipsOnSelection?: boolean;
  showSelectionAlert?: boolean;
  startWeekOnSunday?: boolean;
  dateFormatter?: (date: Date) => string; // Custom date formatter function
  dateRangeSeparator?: string; // Custom separator for date ranges (default is " - ")
  defaultRange?: { start: string; end: string }; // Default date range to initialize with
  
  // Layer Settings - now optional with smart defaults
  layers?: Layer[];
  showLayersNavigation?: boolean;
  defaultLayer?: string;
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

  // Background customization
  backgroundColors?: {
    emptyRows?: string;        // Background for empty week rows (default: white)
    monthHeader?: string;      // Background for month headers
    headerContainer?: string;  // Background for the header input container
    dayCells?: string;         // Background for day cells (default: transparent)
    selection?: string;        // Background for selected date range (default: #b1e4e5)
    input?: string;            // Background for input fields (default: white)
  };

  /**
   * Optional: custom className for the calendar input field (the field that toggles the calendar)
   */
  inputClassName?: string;

  /**
   * Optional: onChange handler for the calendar input field
   */
  inputOnChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;

  /**
   * Whether to show the Start/End Date input fields in the header. Defaults to true.
   */
  showDateInputs?: boolean;
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
  border: '1px solid #7dd2d3',
  borderRadius: '6px',
  boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)'
};

// Empty default layers - actual data should be provided by the implementing application
export const DEFAULT_LAYERS: Layer[] = [];

// Core default values that are always safe
const CORE_DEFAULTS = {
  displayMode: 'embedded' as const,
  timezone: 'UTC',
  visibleMonths: 2,
  monthWidth: 500,
  showMonthHeadings: true,
  selectionMode: 'range' as const,
  showTooltips: true,
  showHeader: true,
  closeOnClickAway: true,
  showSubmitButton: false,
  showFooter: true,
  enableOutOfBoundsScroll: true,
  suppressTooltipsOnSelection: false,
  showSelectionAlert: false,
  startWeekOnSunday: false,
  dateRangeSeparator: " - ",
  layers: DEFAULT_LAYERS,
  showLayersNavigation: false, // Changed to false for simpler default
  defaultLayer: '',
  colors: DEFAULT_COLORS,
  position: 'bottom-left' as const,
  useDynamicPosition: true
};

/**
 * Get legacy default settings (for backward compatibility)
 * @deprecated Use createCalendarSettings() for new implementations
 */
export const getDefaultSettings = (): CalendarSettings => ({ ...CORE_DEFAULTS });

/**
 * Create a safe, complete CalendarSettings object from partial settings
 * Handles null/undefined values gracefully with intelligent defaults
 */
export function createCalendarSettings(userSettings: Partial<CalendarSettings> = {}): CalendarSettings {
  // Handle null/undefined userSettings
  const safeUserSettings = userSettings || {};
  
  // Create base settings with null-safe merging
  const settings: CalendarSettings = {
    ...CORE_DEFAULTS,
    // Safely merge user settings, filtering out null/undefined values
    ...Object.fromEntries(
      Object.entries(safeUserSettings).filter(([_, value]) => value !== null && value !== undefined)
    ),
  };
  
  // Ensure arrays are never null/undefined and filter out malformed layers
  if (!Array.isArray(settings.layers)) {
    settings.layers = [];
  }
  
  // Filter out null/undefined/invalid layers
  const validLayers = settings.layers.filter((layer): layer is Layer => {
    return layer != null && 
           typeof layer === 'object' && 
           typeof layer.name === 'string' && 
           layer.name.length > 0 &&
           typeof layer.title === 'string' &&
           typeof layer.description === 'string';
  });
  
  // If no valid layers, provide default layer
  if (validLayers.length === 0) {
    settings.layers = [{
      name: 'Calendar',
      title: 'Base Calendar',
      description: 'Default calendar layer',
      required: true,
      visible: true,
      data: {
        events: [],
        background: []
      }
    }];
  } else {
    settings.layers = validLayers;
  }
  
  // Ensure defaultLayer is set if not provided
  if (!settings.defaultLayer && settings.layers.length > 0) {
    settings.defaultLayer = settings.layers[0].name;
  }
  
  // Ensure colors object exists
  settings.colors = {
    ...DEFAULT_COLORS,
    ...(settings.colors || {})
  };
  
  // Validate and sanitize numeric values
  if (typeof settings.visibleMonths !== 'number' || settings.visibleMonths < 1 || settings.visibleMonths > 6) {
    settings.visibleMonths = 2;
  }
  
  if (typeof settings.monthWidth !== 'number' || settings.monthWidth < 200 || settings.monthWidth > 800) {
    settings.monthWidth = 500;
  }
  
  return settings;
}

/**
 * Convert SimpleCalendarSettings to full CalendarSettings
 * This provides a simple API while maintaining full functionality
 */
export function createSimpleCalendarSettings(simpleSettings: SimpleCalendarSettings = {}): CalendarSettings {
  const safeSettings = simpleSettings || {};
  
  // Ensure we always have at least a basic Calendar layer
  const defaultCalendarLayer: Layer = {
    name: 'Calendar',
    title: 'Base Calendar',
    description: 'Default calendar layer',
    required: true,
    visible: true,
    data: {
      events: [],
      background: []
    }
  };
  
  // Use provided layers or default to basic calendar layer
  const layers = Array.isArray(safeSettings.layers) && safeSettings.layers.length > 0 
    ? safeSettings.layers 
    : [defaultCalendarLayer];
  
  // Map simple settings to full settings
  const fullSettings: Partial<CalendarSettings> = {
    displayMode: safeSettings.displayMode,
    visibleMonths: safeSettings.visibleMonths,
    selectionMode: safeSettings.selectionMode,
    defaultRange: safeSettings.defaultRange,
    dateFormatter: safeSettings.dateFormatter,
    showSubmitButton: safeSettings.showSubmitButton,
    startWeekOnSunday: safeSettings.startWeekOnSunday,
    inputClassName: safeSettings.inputClassName,
    containerStyle: safeSettings.containerStyle,
    inputStyle: safeSettings.inputStyle,
    colors: safeSettings.colors,
    layers: layers,
    restrictionConfig: safeSettings.restrictions,
    defaultLayer: 'Calendar' // Ensure we have a default layer
  };
  
  return createCalendarSettings(fullSettings);
}

/**
 * Validate and sanitize calendar settings
 * Returns an object with validation results and sanitized settings
 */
export function validateCalendarSettings(settings: Partial<CalendarSettings>) {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for common issues
  if (settings.layers && !Array.isArray(settings.layers)) {
    errors.push('layers must be an array');
  }
  
  if (settings.visibleMonths && (settings.visibleMonths < 1 || settings.visibleMonths > 6)) {
    warnings.push('visibleMonths should be between 1 and 6');
  }
  
  if (settings.defaultRange) {
    const { start, end } = settings.defaultRange;
    if (start && end && new Date(start) > new Date(end)) {
      errors.push('defaultRange start date must be before end date');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitizedSettings: createCalendarSettings(settings)
  };
}

// Update layer validation to handle null/empty gracefully
export const validateLayers = (layers: Layer[] | null | undefined): boolean => {
  if (!Array.isArray(layers) || layers.length === 0) {
    return true; // Empty layers are valid (calendar works without layers)
  }
  return layers.length >= 1;
};

/**
 * Safe layer access helpers
 */
export const getActiveLayers = (layers: Layer[] | null | undefined): Layer[] => {
  if (!Array.isArray(layers)) return [];
  return layers.filter(layer => layer && layer.visible !== false);
};

export const findLayerByName = (layers: Layer[] | null | undefined, name: string): Layer | undefined => {
  if (!Array.isArray(layers) || !name) return undefined;
  return layers.find(layer => layer && layer.name === name);
};

/**
 * Helper function to create a minimal calendar configuration
 * Perfect for simple use cases where you just need basic functionality
 */
export function createMinimalCalendar(config: {
  onSubmit?: (start: string | null, end: string | null) => void;
  defaultRange?: { start?: string; end?: string };
  displayMode?: 'popup' | 'embedded';
} = {}): CalendarSettings {
  return createCalendarSettings({
    displayMode: config.displayMode || 'embedded',
    showSubmitButton: !!config.onSubmit,
    defaultRange: config.defaultRange,
    visibleMonths: 1, // Minimal setup uses 1 month
    showLayersNavigation: false,
    showHeader: true,
    showFooter: !!config.onSubmit,
  });
}

// Legacy SETTINGS configuration (maintained for backward compatibility)
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
    monthWidth: {
      id: 'monthWidth',
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