import { LAYER_TYPES } from './DateRangePickerNew/layers/types';

export const DEFAULT_LAYERS = [
  {
    name: 'calendar',
    type: LAYER_TYPES.BASE,
    required: true,
    title: 'Calendar',
    description: 'Basic calendar functionality',
    features: ['base']
  },
  {
    name: 'sample-background',
    type: LAYER_TYPES.BACKGROUND,
    title: 'Sample Background',
    description: 'Example background colors',
    features: ['background'],
    data: {
      background: []  // Will be populated with sample data in App.jsx
    }
  },
  {
    name: 'sample-events',
    type: LAYER_TYPES.EVENTS,
    title: 'Sample Events',
    description: 'Example events',
    features: ['events', 'background'],  // This layer can have both events and background colors
    data: {
      events: [],     // Will be populated with sample data in App.jsx
      background: []  // Optional background data for this layer
    }
  }
];

export const LAYER_FEATURES = {
  base: {
    name: 'Base Calendar',
    description: 'Basic calendar functionality',
    dataSchema: null  // Base layer doesn't need data
  },
  background: {
    name: 'Background Colors',
    description: 'Apply background colors to date ranges',
    dataSchema: {
      type: 'array',
      items: {
        startDate: 'string',  // ISO date
        endDate: 'string',    // ISO date
        color: 'string'       // CSS color
      }
    }
  },
  events: {
    name: 'Events',
    description: 'Display and manage calendar events',
    dataSchema: {
      type: 'array',
      items: {
        date: 'string',       // ISO date
        title: 'string',
        type: 'string',
        time: 'string',
        description: 'string'
      }
    }
  }
};

export const SETTINGS = {
  core: {
    displayMode: {
      id: 'displayMode',
      type: 'select',
      label: 'Display Mode',
      description: 'Show calendar as embedded or popup',
      default: 'popup',
      options: [
        { value: 'popup', label: 'Popup' },
        { value: 'embedded', label: 'Embedded' }
      ],
      width: '120px'
    },
    visibleMonths: {
      id: 'visibleMonths',
      type: 'number',
      label: 'Visible Months',
      description: 'Number of months to display in the calendar (1-6)',
      default: 2,
      min: 1,
      max: 6,
      width: '80px'
    },
    selectionMode: {
      id: 'selectionMode',
      type: 'select',
      label: 'Selection Mode',
      description: 'Choose between single date or date range selection',
      default: 'range',
      options: [
        { value: 'single', label: 'Single' },
        { value: 'range', label: 'Range' }
      ],
      width: '120px'
    },
    singleMonthWidth: {
      id: 'singleMonthWidth',
      type: 'number',
      label: 'Month Width',
      description: 'Width of a single month in pixels (300-800)',
      default: 500,
      min: 300,
      max: 800,
      width: '100px'
    },
    containerStyle: {
      id: 'containerStyle',
      type: 'style-editor',
      label: 'Container Styles',
      description: 'Override container styles (border, shadow, etc)',
      default: null,
      presets: {
        'Default': null,
        'No Border': {
          border: 'none'
        },
        'No Shadow': {
          boxShadow: 'none'
        },
        'Shadow': {
          boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
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
    monthHeadings: {
      id: 'showMonthHeadings',
      type: 'boolean',
      label: 'Show Month Headings',
      description: 'Display month names above each calendar grid',
      default: false
    },
    tooltips: {
      id: 'showTooltips',
      type: 'boolean',
      label: 'Show Tooltips',
      description: 'Show helpful tooltips on hover',
      default: false
    },
    header: {
      id: 'showHeader',
      type: 'boolean',
      label: 'Show Header',
      description: 'Display the header with month navigation',
      default: true
    },
    clickAway: {
      id: 'closeOnClickAway',
      type: 'boolean',
      label: 'Close on Click Away',
      description: 'Close calendar when clicking outside',
      default: false
    },
    submitButton: {
      id: 'showSubmitButton',
      type: 'boolean',
      label: 'Show Submit Button',
      description: 'Display a submit button in footer',
      default: false
    },
    footer: {
      id: 'showFooter',
      type: 'boolean',
      label: 'Show Footer',
      description: 'Display the footer with actions',
      default: true
    },
    outOfBoundsScroll: {
      id: 'enableOutOfBoundsScroll',
      type: 'boolean',
      label: 'Enable Out of Bounds Scroll',
      description: 'Allow month scrolling when dragging outside calendar',
      default: true
    }
  },
  layers: {
    id: 'layers',
    type: 'layer-controls',
    label: 'Calendar Layers',
    description: 'Configure calendar data layers and visualization',
    default: DEFAULT_LAYERS,
    globalControls: {
      defaultLayer: {
        id: 'defaultLayer',
        type: 'select',
        label: 'Default Layer',
        description: 'Select the default active layer',
        default: 'Calendar'
      },
      showLayerControls: {
        id: 'showLayerControls',
        type: 'boolean',
        label: 'Show Layer Controls',
        description: 'Display layer selection controls in calendar',
        default: true
      }
    },
    controls: {
      features: {
        id: 'features',
        type: 'multi-select',
        label: 'Layer Features',
        description: 'The type of functionality for this layer',
        options: Object.entries(LAYER_FEATURES).map(([key, feature]) => ({
          value: key,
          label: feature.name
        })),
        width: '250px'
      },
      title: {
        id: 'title',
        type: 'text',
        label: 'Title',
        description: 'Display name for the layer',
        width: '200px'
      },
      description: {
        type: 'text',
        label: 'Description',
        description: 'Brief description of the layer purpose',
        required: true
      }
    },
    actions: {
      canAdd: true,
      canRemove: true,
      newLayerTemplate: {
        name: 'New Layer',
        type: 'overlay',
        title: 'New Layer',
        description: 'A new calendar layer',
        data: []
      }
    }
  }
};

// Add display mode constraints
export const DISPLAY_MODE_CONSTRAINTS = {
  embedded: {
    // Features that should be forced to specific values in embedded mode
    closeOnClickAway: false,
    enableOutOfBoundsScroll: false,
    showHeader: true, // Always show header in embedded mode
  }
};

// Update getDefaultSettings to handle mode-specific defaults
export const getDefaultSettings = (displayMode = 'popup') => {
  const defaults = {};
  
  // Set base defaults
  Object.values(SETTINGS.core).forEach(setting => {
    defaults[setting.id] = setting.default;
  });
  Object.values(SETTINGS.features).forEach(feature => {
    defaults[feature.id] = feature.default;
  });
  
  // Add layers default
  defaults.layers = DEFAULT_LAYERS;

  // Apply mode-specific constraints
  if (displayMode === 'embedded') {
    Object.entries(DISPLAY_MODE_CONSTRAINTS.embedded).forEach(([key, value]) => {
      defaults[key] = value;
    });
  }

  // Add layer control defaults
  defaults.defaultLayer = SETTINGS.layers.globalControls.defaultLayer.default;
  defaults.showLayerControls = SETTINGS.layers.globalControls.showLayerControls.default;

  return defaults;
};

// Default container styles that can be overridden
export const DEFAULT_CONTAINER_STYLES = {
  border: '1px solid #dee2e6',
  borderRadius: '8px',
  backgroundColor: '#fff',
  boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
}; 