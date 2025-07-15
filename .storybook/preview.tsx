import type { Preview } from '@storybook/react-vite';
import React from 'react';
import '../src/index.css';
import '../src/components/CLACalendar.css';
import '../src/components/CLACalendarComponents/CalendarComponents.css';
import '../src/components/CLACalendarComponents/defensive-styles.css';
import './story-container.css';
import './preview.css';

const preview: Preview = {
  parameters: {
    layout: 'padded', // Use padded layout for consistent spacing
    docs: {
      inlineStories: true, // Enable inline rendering for better control integration
    },
    controls: {
      expanded: true, // Show all controls by default
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: ['Welcome', 'Getting Started', 'Examples', 'Features', 'Playground'],
      },
    },
  },
  decorators: [
    (Story) => {
      // Minimal decorator - let stories handle their own layout
      return <Story />;
    },
  ],
};

export default preview;