import type { Preview } from '@storybook/react';
import React from 'react';
import '../src/index.css';
import '../src/components/CLACalendar.css';
import '../src/components/CLACalendarComponents/CalendarComponents.css';
import '../src/components/CLACalendarComponents/defensive-styles.css';
import './preview.css';

const preview: Preview = {
  parameters: {
    layout: 'padded',
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    options: {
      storySort: {
        method: 'alphabetical',
        order: ['Calendar', ['Interactive Playground', ['Docs', '*']]],
      },
    },
    docs: {
      story: {
        inline: true,
        height: '600px',
      },
      description: {
        component: 'CLACalendar is a flexible date range picker component for React with drag selection support.',
      },
      source: {
        excludeDecorators: true,
        transform: (code: string, storyContext: any) => {
          // Show calendar configuration when available
          if (storyContext.args?.settings || storyContext.story?.args?.settings) {
            const settings = storyContext.args?.settings || storyContext.story?.args?.settings;
            if (settings && typeof settings === 'object') {
              // Merge args into settings for real-time updates
              const dynamicSettings = { ...settings };
              
              // Map Storybook controls to settings
              const controlMappings = {
                displayMode: 'displayMode',
                isOpen: 'isOpen',
                visibleMonths: 'visibleMonths',
                selectionMode: 'selectionMode',
                showSubmitButton: 'showSubmitButton',
                showHeader: 'showHeader',
                showFooter: 'showFooter',
                showTooltips: 'showTooltips',
                showLayersNavigation: 'showLayersNavigation',
                startWeekOnSunday: 'startWeekOnSunday'
              };

              // Apply control values to settings
              Object.entries(controlMappings).forEach(([control, setting]) => {
                if (storyContext.args[control] !== undefined) {
                  dynamicSettings[setting] = storyContext.args[control];
                }
              });

              // Format configuration info
              const layerInfo = dynamicSettings.layers ? 
                `\n// Layer Information:\n// - ${dynamicSettings.layers.length} layer(s) configured\n// - Default layer: ${dynamicSettings.defaultLayer || 'first'}\n// - Navigation: ${dynamicSettings.showLayersNavigation ? 'enabled' : 'disabled'}` : 
                '\n// No layers configured';

              const restrictionInfo = dynamicSettings.restrictionConfig?.restrictions ? 
                `\n// Restrictions: ${dynamicSettings.restrictionConfig.restrictions.length} rule(s) active` : 
                '\n// No restrictions configured';

              return `// Real-time Calendar Configuration (updates with controls)
${JSON.stringify(dynamicSettings, null, 2)}${layerInfo}${restrictionInfo}

// React Component Usage
<CLACalendar
  settings={${JSON.stringify(dynamicSettings, null, 2)}}
  onSubmit={(startDate, endDate) => {
    console.log('Selected:', { startDate, endDate });
  }}
/>`;
            }
          }
          return code;
        },
      },
    },
  },
  argTypes: {
    // Common calendar settings
    displayMode: {
      control: { type: 'select' },
      options: ['embedded', 'popup'],
      description: 'How the calendar should be displayed',
    },
    visibleMonths: {
      control: { type: 'range', min: 1, max: 6 },
      description: 'Number of months to display',
    },
    selectionMode: {
      control: { type: 'select' },
      options: ['single', 'range'],
      description: 'Calendar selection mode',
    },
    startWeekOnSunday: {
      control: 'boolean',
      description: 'Whether to start the week on Sunday (vs Monday)',
    },
    showSubmitButton: {
      control: 'boolean',
      description: 'Whether to show the submit button',
    },
    showTooltips: {
      control: 'boolean',
      description: 'Whether to show tooltips on calendar items',
    },
    showHeader: {
      control: 'boolean',
      description: 'Whether to show the calendar header',
    },
    showFooter: {
      control: 'boolean',
      description: 'Whether to show the calendar footer',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
        <Story />
      </div>
    ),
  ],
};

export default preview;