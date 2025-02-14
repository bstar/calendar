export const SETTINGS = {
  core: {
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
      default: true
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
      default: true
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
  }
};

// Helper to get default settings
export const getDefaultSettings = () => {
  const defaults = {};
  Object.values(SETTINGS.core).forEach(setting => {
    defaults[setting.id] = setting.default;
  });
  Object.values(SETTINGS.features).forEach(feature => {
    defaults[feature.id] = feature.default;
  });
  return defaults;
}; 