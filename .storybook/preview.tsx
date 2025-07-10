import type { Preview } from '@storybook/react-vite';
import React from 'react';
import '../src/index.css';
import '../src/components/CLACalendar.css';
import '../src/components/CLACalendarComponents/CalendarComponents.css';
import '../src/components/CLACalendarComponents/defensive-styles.css';

const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: ['Getting Started', 'Examples'],
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ margin: '3rem' }}>
        <Story />
      </div>
    ),
  ],
};

export default preview;