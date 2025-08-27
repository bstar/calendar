/**
 * @fileoverview Getting Started stories for the CLA Calendar component
 * 
 * This file contains the introductory Storybook stories that demonstrate
 * basic usage patterns and common configurations of the CLA Calendar:
 * 
 * - Basic embedded calendar with date range selection
 * - Popup calendar with single date selection
 * - Multiple month displays
 * - Custom themed calendars
 * - Various selection modes and behaviors
 * 
 * These stories serve as a starting point for developers learning to use
 * the calendar component, showcasing the most common use cases.
 * 
 * @module GettingStarted.stories
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CLACalendar } from '../components/CLACalendar';
import { calendarArgTypes, defaultArgs } from './shared/storyControls';
import { CalendarStoryWrapper } from './shared/CalendarStoryWrapper';

const meta = {
  title: 'Getting Started/Stories',
  component: CLACalendar,
  argTypes: calendarArgTypes,
  args: defaultArgs,
  parameters: {
    layout: 'padded',
    controls: { expanded: true },
    docs: {
      description: {
        component: 'Interactive calendar examples with full control panel. Adjust the controls to see how different settings affect the calendar behavior.'
      }
    }
  }
} satisfies Meta<typeof CLACalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic embedded calendar
export const BasicCalendar: Story = {
  name: 'Basic Calendar',
  args: {
    displayMode: 'embedded',
    visibleMonths: 2,
    selectionMode: 'range'
  },
  render: (args) => (
    <CalendarStoryWrapper 
      args={args}
      title="Basic Embedded Calendar"
      description="A simple calendar with default settings. Select a date range by clicking and dragging."
    />
  ),
};

// Popup calendar
export const PopupCalendar: Story = {
  name: 'Popup Calendar',
  args: {
    displayMode: 'popup',
    selectionMode: 'single',
    visibleMonths: 1,
    position: 'bottom-left',
    useDynamicPosition: true,
    closeOnClickAway: true
  },
  render: (args) => (
    <CalendarStoryWrapper 
      args={args}
      title="Popup Calendar"
      description="Click the input below to open the calendar. Try changing the position and dynamic positioning settings in the controls."
      containerStyle={{ padding: '50px' }}
    />
  ),
};

// Interactive sandbox with all controls
export const InteractiveSandbox: Story = {
  name: 'Interactive Sandbox',
  args: defaultArgs,
  parameters: {
    docs: {
      description: {
        story: 'Full interactive sandbox with all controls. Experiment with different combinations of settings to see how they work together.'
      }
    }
  },
  render: (args) => (
    <CalendarStoryWrapper 
      args={args}
      title="Interactive Calendar Sandbox"
      description="Use the controls panel to experiment with all calendar settings. This is the best way to explore the full capabilities of the calendar component."
    />
  ),
};

// Single date selection example
export const SingleDateSelection: Story = {
  name: 'Single Date Selection',
  args: {
    ...defaultArgs,
    selectionMode: 'single',
    visibleMonths: 1,
    showSubmitButton: true
  },
  render: (args) => (
    <CalendarStoryWrapper 
      args={args}
      title="Single Date Selection"
      description="Calendar configured for selecting a single date. Notice how the UI adapts for single selection mode."
    />
  ),
};

// Multiple months example
export const MultipleMonths: Story = {
  name: 'Multiple Months Display',
  args: {
    ...defaultArgs,
    visibleMonths: 3,
    monthWidth: 400
  },
  render: (args) => (
    <CalendarStoryWrapper 
      args={args}
      title="Multiple Months Display"
      description="Display multiple months side by side. Adjust the visibleMonths and monthWidth controls to see different layouts."
    />
  ),
};

// Custom themed calendar
export const CustomTheme: Story = {
  name: 'Custom Theme',
  args: {
    ...defaultArgs,
    primaryColor: '#8B5CF6',
    successColor: '#10B981',
    warningColor: '#F59E0B',
    dangerColor: '#EF4444',
    baseFontSize: '0.875rem'
  },
  render: (args) => (
    <CalendarStoryWrapper 
      args={args}
      title="Custom Themed Calendar"
      description="Calendar with custom colors and styling. Use the color controls to create your own theme."
    />
  ),
};

// Dynamic positioning demo
export const DynamicPositioning: Story = {
  name: 'Dynamic Positioning',
  args: {
    ...defaultArgs,
    displayMode: 'popup',
    visibleMonths: 2,
    useDynamicPosition: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates how the calendar automatically repositions itself to stay within the viewport. Try opening the calendar near the edges of the screen.'
      }
    }
  },
  render: (args) => (
    <div style={{ 
      height: '400px', 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '20px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <CalendarStoryWrapper 
          args={args}
          title="Top Left"
          showSelectedDate={false}
          containerStyle={{ padding: '10px' }}
        />
        <CalendarStoryWrapper 
          args={args}
          title="Top Right"
          showSelectedDate={false}
          containerStyle={{ padding: '10px' }}
        />
      </div>
      
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h4>Dynamic Positioning Demo</h4>
        <p>The calendar will automatically reposition to stay visible</p>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <CalendarStoryWrapper 
          args={args}
          title="Bottom Left"
          showSelectedDate={false}
          containerStyle={{ padding: '10px' }}
        />
        <CalendarStoryWrapper 
          args={args}
          title="Bottom Right"
          showSelectedDate={false}
          containerStyle={{ padding: '10px' }}
        />
      </div>
    </div>
  ),
};

// Footer button customization
export const FooterButtonControl: Story = {
  name: 'Footer Button Control',
  args: {
    ...defaultArgs,
    displayMode: 'embedded',
    visibleMonths: 2,
    showFooter: true,
    showSubmitButton: true,
    showClearButton: false,
    footerButtonAlignment: 'flex-end'
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates control over footer buttons. You can independently show/hide the Submit and Clear buttons and control their alignment. Try different combinations of showClearButton, showSubmitButton, and footerButtonAlignment in the controls.'
      }
    }
  },
  render: (args) => (
    <CalendarStoryWrapper 
      args={args}
      title="Footer Button Control"
      description="This example shows the calendar with only the Submit button visible, aligned to the right. Try toggling buttons and changing the alignment."
    />
  ),
};

// Footer button alignment showcase
export const FooterButtonAlignment: Story = {
  name: 'Footer Button Alignment',
  args: {
    ...defaultArgs,
    displayMode: 'embedded',
    visibleMonths: 1,
    showFooter: true,
    showSubmitButton: true,
    showClearButton: true,
    footerButtonAlignment: 'center'
  },
  parameters: {
    docs: {
      description: {
        story: 'Showcases different footer button alignment options. Use the controls to try: space-between (default), flex-start (left), flex-end (right), center, and space-around.'
      }
    }
  },
  render: (args) => (
    <CalendarStoryWrapper 
      args={args}
      title="Footer Button Alignment"
      description="Buttons are currently center-aligned. Try different footerButtonAlignment values and button visibility combinations."
    />
  ),
};