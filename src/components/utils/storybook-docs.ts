/**
 * Storybook Documentation Utilities
 * 
 * Helper functions for extracting, formatting, and displaying
 * calendar configuration data in Storybook stories.
 */

import { CalendarSettings, SimpleCalendarSettings } from '../CLACalendar.config';

/**
 * Extract and format calendar configuration for display
 */
export function formatCalendarConfig(settings: Partial<CalendarSettings>): string {
  // Remove undefined values and format for readability
  const cleanSettings = Object.fromEntries(
    Object.entries(settings).filter(([_, value]) => value !== undefined)
  );

  return JSON.stringify(cleanSettings, null, 2);
}

/**
 * Get configuration documentation for a specific property
 */
export function getConfigDocs(property: keyof CalendarSettings): string {
  const docs: Record<string, string> = {
    displayMode: 'Controls how the calendar is displayed - "popup" shows in an overlay, "embedded" shows inline',
    visibleMonths: 'Number of months to display simultaneously (1-6)',
    selectionMode: 'Date selection behavior - "single" allows one date, "range" allows date ranges',
    isOpen: 'Whether the calendar popup is open (only applies to popup mode)',
    showTooltips: 'Enable/disable tooltip display on calendar items',
    showHeader: 'Show/hide the calendar header with navigation controls',
    showFooter: 'Show/hide the calendar footer with action buttons',
    showSubmitButton: 'Display submit button for confirming selections',
    showLayersNavigation: 'Show layer navigation tabs for switching between data layers',
    startWeekOnSunday: 'Start calendar weeks on Sunday instead of Monday',
    defaultRange: 'Initial date range to select when calendar loads',
    defaultLayer: 'Name of the layer to display by default',
    layers: 'Array of data layers containing events, backgrounds, and other calendar content',
    restrictionConfig: 'Configuration for date restrictions and validation rules',
    colors: 'Color theme customization for calendar elements',
    closeOnClickAway: 'Close popup calendar when clicking outside',
    enableOutOfBoundsScroll: 'Allow scrolling to months outside the visible range',
    suppressTooltipsOnSelection: 'Hide tooltips during date selection',
    showSelectionAlert: 'Show alerts when restricted dates are selected',
    dateFormatter: 'Custom function for formatting date displays',
    dateRangeSeparator: 'Separator string for date range displays (default: " - ")',
    monthWidth: 'Width of each month display in pixels',
    showMonthHeadings: 'Show month/year headings above each month grid'
  };

  return docs[property] || 'No documentation available';
}

/**
 * Generate configuration examples for common use cases
 */
export const configurationExamples = {
  basic: {
    displayMode: 'popup' as const,
    visibleMonths: 1,
    selectionMode: 'range' as const,
    showSubmitButton: true
  },
  
  embedded: {
    displayMode: 'embedded' as const,
    visibleMonths: 2,
    selectionMode: 'range' as const,
    showHeader: true,
    showFooter: false
  },
  
  singleDate: {
    displayMode: 'popup' as const,
    visibleMonths: 1,
    selectionMode: 'single' as const,
    showSubmitButton: true
  },
  
  multiMonth: {
    displayMode: 'embedded' as const,
    visibleMonths: 3,
    selectionMode: 'range' as const,
    showMonthHeadings: true
  },
  
  withLayers: {
    displayMode: 'popup' as const,
    visibleMonths: 2,
    selectionMode: 'range' as const,
    showLayersNavigation: true,
    defaultLayer: 'Events',
    layers: [
      {
        name: 'Events',
        title: 'Calendar Events',
        description: 'Important dates and events',
        visible: true,
        data: {
          events: [
            {
              date: '2024-01-15',
              title: 'Important Meeting',
              type: 'meeting',
              time: '10:00 AM',
              description: 'Team planning session',
              color: '#3B82F6'
            }
          ]
        }
      }
    ]
  },
  
  withRestrictions: {
    displayMode: 'popup' as const,
    visibleMonths: 2,
    selectionMode: 'range' as const,
    showSelectionAlert: true,
    restrictionConfig: {
      restrictions: [
        {
          type: 'weekday' as const,
          enabled: true,
          days: [0, 6], // Block weekends
          message: 'Weekend bookings not allowed'
        }
      ]
    }
  },
  
  customTheme: {
    displayMode: 'popup' as const,
    visibleMonths: 2,
    selectionMode: 'range' as const,
    colors: {
      primary: '#8B5CF6',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444'
    }
  }
};

/**
 * Generate story parameters with configuration documentation
 */
export function generateStoryDocs(
  title: string,
  description: string,
  configType: keyof typeof configurationExamples,
  additionalNotes?: string
) {
  const config = configurationExamples[configType];
  
  return {
    docs: {
      description: {
        story: `${description}

**Configuration Type:** ${configType}

${additionalNotes ? `**Additional Notes:** ${additionalNotes}` : ''}

**Example Configuration:**
\`\`\`json
${JSON.stringify(config, null, 2)}
\`\`\`
`
      }
    }
  };
}

/**
 * Extract layer information for documentation
 */
export function formatLayerInfo(layers?: any[]): string {
  if (!layers || layers.length === 0) {
    return 'No layers configured';
  }

  return layers.map(layer => {
    const eventCount = layer.data?.events?.length || 0;
    const backgroundCount = layer.data?.background?.length || 0;
    
    return `• **${layer.name}** (${layer.title}): ${eventCount} events, ${backgroundCount} backgrounds`;
  }).join('\n');
}

/**
 * Extract restriction information for documentation
 */
export function formatRestrictionInfo(restrictionConfig?: any): string {
  if (!restrictionConfig?.restrictions || restrictionConfig.restrictions.length === 0) {
    return 'No restrictions configured';
  }

  return restrictionConfig.restrictions.map((restriction: any) => {
    const type = restriction.type;
    const enabled = restriction.enabled ? '✅' : '❌';
    
    switch (type) {
      case 'weekday':
        const days = restriction.days?.map((d: number) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ');
        return `• **Weekday Restriction** ${enabled}: Blocks ${days}`;
      case 'daterange':
        const ranges = restriction.ranges?.length || 0;
        return `• **Date Range Restriction** ${enabled}: ${ranges} blocked ranges`;
      case 'boundary':
        return `• **Boundary Restriction** ${enabled}: ${restriction.direction} ${restriction.date}`;
      case 'allowedranges':
        const allowed = restriction.ranges?.length || 0;
        return `• **Allowed Ranges** ${enabled}: ${allowed} allowed ranges only`;
      case 'restricted_boundary':
        const restricted = restriction.ranges?.length || 0;
        return `• **Restricted Boundary** ${enabled}: ${restricted} restricted ranges`;
      default:
        return `• **${type}** ${enabled}`;
    }
  }).join('\n');
}