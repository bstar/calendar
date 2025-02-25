import { CSSProperties } from 'react';

export type LAYER_TYPES = 'base' | 'overlay';

interface LayerFeature {
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
    newLayerTemplate: Omit<Layer, 'features'> & { data: any[] };
  };
}

type Setting = SelectSetting | NumberSetting | BooleanSetting | StyleSetting | LayerControlSetting;

interface Settings {
  core: Record<string, Setting>;
  features: Record<string, BooleanSetting>;
  layers: LayerControlSetting;
}

// Simplify Layer type - remove base/overlay distinction
export interface Layer {
  name: string;
  title: string;
  description: string;
  data?: LayerData;
  required?: boolean;
  visible?: boolean;
  features?: string[];
}

export interface LayerData {
  events?: EventData[];
  background?: BackgroundData[];
}

export interface EventData {
  date: string;
  title: string;
  type: string;
  time: string;
  description: string;
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
  containerStyle?: CSSProperties;
  isOpen?: boolean;
  visibleMonths: number;
  singleMonthWidth: number;
  showMonthHeadings: boolean;
  
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
  
  // Layer Settings
  layers: Layer[];
  showLayersNavigation: boolean;
  defaultLayer: string;
}

// Control Types for App.tsx
export interface SettingControl {
  id: string;
  type: 'boolean' | 'number' | 'select' | 'style-editor' | 'text';
  label: string;
  description: string;
  default: any;
  options?: SettingOption[];
  min?: number;
  max?: number;
  width?: string;
  presets?: Record<string, any>;
  required?: boolean;
}

export interface SettingsConfig {
  core: Record<string, SettingControl>;
  features: Record<string, SettingControl>;
  layers: {
    controls: Record<string, SettingControl>;
    actions: {
      canAdd: boolean;
      canRemove: boolean;
      newLayerTemplate: Omit<Layer, 'features'> & { data: any[] };
    };
  };
}

// Default Settings
export const DEFAULT_CONTAINER_STYLES: CSSProperties = {
  backgroundColor: '#fff',
  border: '1px solid #dee2e6',
  borderRadius: '6px',
  boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)'
};

// Update DEFAULT_LAYERS to use simplified type
export const DEFAULT_LAYERS: Layer[] = [
  {
    name: 'Calendar',
    title: 'Calendar',
    description: 'Basic calendar functionality',
    required: true  // First layer is required
  }
];

export const getDefaultSettings = (): CalendarSettings => ({
  displayMode: 'embedded',
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
  showSelectionAlert: true,
  layers: DEFAULT_LAYERS,
  showLayersNavigation: true,
  defaultLayer: 'Calendar'
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
      default: true
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
      canRemove: (layer: Layer) => !layer.required,  // Only prevent removing required layer
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

export const LAYER_FEATURES: Record<string, LayerFeature> = {
  base: {
    name: 'Base Calendar',
    description: 'Basic calendar functionality',
    dataSchema: null
  },
  background: {
    name: 'Background Colors',
    description: 'Apply background colors to date ranges',
    dataSchema: {
      type: 'array',
      items: {
        startDate: 'string',
        endDate: 'string',
        color: 'string'
      }
    }
  },
  events: {
    name: 'Events',
    description: 'Display and manage calendar events',
    dataSchema: {
      type: 'array',
      items: {
        date: 'string',
        title: 'string',
        type: 'string',
        time: 'string',
        description: 'string'
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

// Add Event type for layer events
export interface Event {
  date: string;
  title: string;
  type: 'work' | 'other';
  time: string;
  description: string;
}

// Update EventData to match Event type
export interface EventData extends Omit<Event, 'type'> {
  type: string; // Keep this flexible for backward compatibility
}

// Update the styles type
export interface TableStyles {
  width: string;
  borderCollapse: BorderCollapse;
  fontSize: string;
}

export interface TableHeaderStyles {
  backgroundColor: string;
  padding: string;
  textAlign: TextAlign;
  borderBottom: string;
}

// Add type for the selected presets state
export interface SelectedPresets {
  [key: string]: boolean;
} 