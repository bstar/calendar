/**
 * Comprehensive Storybook argTypes for CLACalendar component
 * Uses a simpler approach with basic controls that map to CalendarSettings
 */

export const CLACalendarArgTypes = {
  // Core Display Settings
  displayMode: {
    control: { type: 'select' },
    options: ['embedded', 'popup'],
    description: 'How the calendar should be displayed',
    table: { category: 'Core Settings' },
  },
  isOpen: {
    control: 'boolean',
    description: 'Whether the calendar is open (for popup mode)',
    table: { category: 'Core Settings' },
  },
  visibleMonths: {
    control: { type: 'range', min: 1, max: 6 },
    description: 'Number of months to display',
    table: { category: 'Core Settings' },
  },
  monthWidth: {
    control: { type: 'range', min: 200, max: 600 },
    description: 'Width of each month in pixels',
    table: { category: 'Core Settings' },
  },
  showMonthHeadings: {
    control: 'boolean',
    description: 'Whether to show month headings in the calendar grid',
    table: { category: 'Core Settings' },
  },
  
  // Selection Settings
  selectionMode: {
    control: { type: 'select' },
    options: ['single', 'range'],
    description: 'Date selection mode',
    table: { category: 'Selection Settings' },
  },
  startWeekOnSunday: {
    control: 'boolean',
    description: 'Whether to start the week on Sunday (vs Monday)',
    table: { category: 'Selection Settings' },
  },
  
  // UI Feature Settings
  showHeader: {
    control: 'boolean',
    description: 'Whether to show the calendar header with navigation',
    table: { category: 'UI Features' },
  },
  showFooter: {
    control: 'boolean',
    description: 'Whether to show the calendar footer with action buttons',
    table: { category: 'UI Features' },
  },
  showSubmitButton: {
    control: 'boolean',
    description: 'Whether to show the submit button',
    table: { category: 'UI Features' },
  },
  showTooltips: {
    control: 'boolean',
    description: 'Whether to show tooltips on calendar items',
    table: { category: 'UI Features' },
  },
  showLayersNavigation: {
    control: 'boolean',
    description: 'Whether to show layer navigation tabs',
    table: { category: 'UI Features' },
  },
  
  // Interaction Settings
  closeOnClickAway: {
    control: 'boolean',
    description: 'Whether to close calendar when clicking outside (popup mode)',
    table: { category: 'Interaction Settings' },
  },
  enableOutOfBoundsScroll: {
    control: 'boolean',
    description: 'Whether to enable scrolling when mouse is out of bounds during selection',
    table: { category: 'Interaction Settings' },
  },
  suppressTooltipsOnSelection: {
    control: 'boolean',
    description: 'Whether to hide tooltips during date selection',
    table: { category: 'Interaction Settings' },
  },
  showSelectionAlert: {
    control: 'boolean',
    description: 'Whether to show alerts when restricted dates are selected',
    table: { category: 'Interaction Settings' },
  },
  
  // Timezone Settings
  timezone: {
    control: { type: 'select' },
    options: ['UTC', 'local', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo'],
    description: 'Timezone for date calculations and display',
    table: { category: 'Advanced Settings' },
  },
  
  // Position Settings (for popup mode)
  position: {
    control: { type: 'select' },
    options: ['bottom-right', 'bottom-left', 'top-right', 'top-left'],
    description: 'Position of the calendar relative to input (popup mode)',
    table: { category: 'Advanced Settings' },
  },
  useDynamicPosition: {
    control: 'boolean',
    description: 'Whether to use dynamic positioning with fallback',
    table: { category: 'Advanced Settings' },
  },
  
  // Date Format Settings
  dateRangeSeparator: {
    control: 'text',
    description: 'Separator for date ranges (e.g., " - ", " to ")',
    table: { category: 'Advanced Settings' },
  },
  
  // Font Settings
  baseFontSize: {
    control: { type: 'select' },
    options: ['0.75rem', '0.875rem', '1rem', '1.125rem', '1.25rem', '14px', '16px', '18px'],
    description: 'Base font size for the calendar',
    table: { category: 'Advanced Settings' },
  },
};

/**
 * Default args that work well for most stories
 */
export const CLACalendarDefaultArgs = {
  // Core Display Settings
  displayMode: 'popup' as const,
  isOpen: true,
  visibleMonths: 2,
  monthWidth: 400,
  showMonthHeadings: false,
  
  // Selection Settings
  selectionMode: 'range' as const,
  startWeekOnSunday: false,
  
  // UI Feature Settings
  showHeader: true,
  showFooter: true,
  showSubmitButton: true,
  showTooltips: true,
  showLayersNavigation: false,
  
  // Interaction Settings
  closeOnClickAway: true,
  enableOutOfBoundsScroll: true,
  suppressTooltipsOnSelection: false,
  showSelectionAlert: true,
  
  // Timezone Settings
  timezone: 'UTC' as const,
  
  // Position Settings
  position: 'bottom-right' as const,
  useDynamicPosition: true,
  
  // Date Format Settings
  dateRangeSeparator: ' - ',
  
  // Font Settings
  baseFontSize: '1rem',
};

/**
 * Helper function to map Storybook args to CalendarSettings
 * This ensures consistent mapping across all stories
 */
export const mapArgsToSettings = (args: any): Partial<import('../CLACalendar.config').CalendarSettings> => {
  return {
    // Core Display Settings
    displayMode: args.displayMode,
    isOpen: args.isOpen,
    visibleMonths: args.visibleMonths,
    monthWidth: args.monthWidth,
    showMonthHeadings: args.showMonthHeadings,
    
    // Selection Settings
    selectionMode: args.selectionMode,
    startWeekOnSunday: args.startWeekOnSunday,
    
    // UI Feature Settings
    showHeader: args.showHeader,
    showFooter: args.showFooter,
    showSubmitButton: args.showSubmitButton,
    showTooltips: args.showTooltips,
    showLayersNavigation: args.showLayersNavigation,
    
    // Interaction Settings
    closeOnClickAway: args.closeOnClickAway,
    enableOutOfBoundsScroll: args.enableOutOfBoundsScroll,
    suppressTooltipsOnSelection: args.suppressTooltipsOnSelection,
    showSelectionAlert: args.showSelectionAlert,
    
    // Timezone Settings
    timezone: args.timezone,
    
    // Position Settings
    position: args.position,
    useDynamicPosition: args.useDynamicPosition,
    
    // Date Format Settings
    dateRangeSeparator: args.dateRangeSeparator,
    
    // Font Settings
    baseFontSize: args.baseFontSize,
    
    // Container styling for embedded widgets
    containerStyle: args.containerStyle,
  };
};

/**
 * Subset of controls specifically for embedded widget stories
 */
export const EmbeddedWidgetArgTypes = {
  visibleMonths: CLACalendarArgTypes.visibleMonths,
  selectionMode: CLACalendarArgTypes.selectionMode,
  showSubmitButton: CLACalendarArgTypes.showSubmitButton,
  showHeader: CLACalendarArgTypes.showHeader,
  showFooter: CLACalendarArgTypes.showFooter,
  showTooltips: CLACalendarArgTypes.showTooltips,
  showLayersNavigation: CLACalendarArgTypes.showLayersNavigation,
  monthWidth: CLACalendarArgTypes.monthWidth,
  startWeekOnSunday: CLACalendarArgTypes.startWeekOnSunday,
};

/**
 * Default args for embedded widget stories
 */
export const EmbeddedWidgetDefaultArgs = {
  visibleMonths: 1,
  selectionMode: 'range' as const,
  showSubmitButton: false,
  showHeader: true,
  showFooter: false,
  showTooltips: true,
  showLayersNavigation: false,
  monthWidth: 400,
  startWeekOnSunday: false,
};

/**
 * Subset of controls for restriction stories
 */
export const RestrictionArgTypes = {
  displayMode: CLACalendarArgTypes.displayMode,
  isOpen: CLACalendarArgTypes.isOpen,
  visibleMonths: CLACalendarArgTypes.visibleMonths,
  showSelectionAlert: CLACalendarArgTypes.showSelectionAlert,
  startWeekOnSunday: CLACalendarArgTypes.startWeekOnSunday,
  showTooltips: CLACalendarArgTypes.showTooltips,
  showHeader: CLACalendarArgTypes.showHeader,
  showFooter: CLACalendarArgTypes.showFooter,
};

/**
 * Default args for restriction stories  
 */
export const RestrictionDefaultArgs = {
  displayMode: 'popup' as const,
  isOpen: true,
  visibleMonths: 2,
  showSelectionAlert: true,
  startWeekOnSunday: false,
  showTooltips: true,
  showHeader: true,
  showFooter: true,
};