import type { Meta, StoryObj } from '@storybook/react';
import { SimpleCalendar } from './CLACalendar';
import { SimpleCalendarSettings } from './CLACalendar.config';

const meta = {
  title: 'Calendar/SimpleCalendar',
  component: SimpleCalendar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'SimpleCalendar is a wrapper around CLACalendar that provides a simplified API for common use cases.',
      },
    },
  },
  argTypes: {
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
    showSubmitButton: {
      control: 'boolean',
      description: 'Whether to show the submit button',
    },
    startWeekOnSunday: {
      control: 'boolean',
      description: 'Whether to start the week on Sunday (vs Monday)',
    },
  },
} satisfies Meta<typeof SimpleCalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic usage - embedded mode for simplicity
export const Basic: Story = {
  render: (args) => (
    <SimpleCalendar 
      config={{
        displayMode: args.displayMode || 'embedded',
        visibleMonths: args.visibleMonths || 1,
        selectionMode: args.selectionMode || 'range',
        showSubmitButton: args.showSubmitButton ?? true,
        startWeekOnSunday: args.startWeekOnSunday || false,
      }}
    />
  ),
  args: {
    displayMode: 'embedded',
    visibleMonths: 1,
    selectionMode: 'range',
    showSubmitButton: true,
    startWeekOnSunday: false,
  },
};

// With submit handler
export const WithSubmit: Story = {
  render: (args) => (
    <SimpleCalendar 
      config={{
        displayMode: args.displayMode || 'embedded',
        visibleMonths: args.visibleMonths || 1,
        selectionMode: args.selectionMode || 'range',
        showSubmitButton: args.showSubmitButton ?? true,
        startWeekOnSunday: args.startWeekOnSunday || false,
      }}
      onSubmit={(start, end) => {
        alert(`Selected: ${start} to ${end}`);
      }}
    />
  ),
  args: {
    displayMode: 'embedded',
    visibleMonths: 1,
    selectionMode: 'range',
    showSubmitButton: true,
    startWeekOnSunday: false,
  },
};

// Single date selection
export const SingleDate: Story = {
  render: (args) => (
    <SimpleCalendar 
      config={{
        displayMode: args.displayMode || 'embedded',
        visibleMonths: args.visibleMonths || 1,
        selectionMode: args.selectionMode || 'single',
        showSubmitButton: args.showSubmitButton ?? true,
        startWeekOnSunday: args.startWeekOnSunday || false,
      }}
      onSubmit={(start) => {
        alert(`Selected date: ${start}`);
      }}
    />
  ),
  args: {
    displayMode: 'embedded',
    visibleMonths: 1,
    selectionMode: 'single',
    showSubmitButton: true,
    startWeekOnSunday: false,
  },
};

// Multiple months
export const TwoMonths: Story = {
  render: (args) => (
    <SimpleCalendar 
      config={{
        displayMode: args.displayMode || 'embedded',
        visibleMonths: args.visibleMonths || 2,
        selectionMode: args.selectionMode || 'range',
        showSubmitButton: args.showSubmitButton ?? true,
        startWeekOnSunday: args.startWeekOnSunday || false,
      }}
    />
  ),
  args: {
    displayMode: 'embedded',
    visibleMonths: 2,
    selectionMode: 'range',
    showSubmitButton: true,
    startWeekOnSunday: false,
  },
};

// Week starts on Sunday
export const SundayStart: Story = {
  render: (args) => (
    <SimpleCalendar 
      config={{
        displayMode: args.displayMode || 'embedded',
        visibleMonths: args.visibleMonths || 1,
        selectionMode: args.selectionMode || 'range',
        showSubmitButton: args.showSubmitButton ?? true,
        startWeekOnSunday: args.startWeekOnSunday ?? true,
      }}
    />
  ),
  args: {
    displayMode: 'embedded',
    visibleMonths: 1,
    selectionMode: 'range',
    showSubmitButton: true,
    startWeekOnSunday: true,
  },
};

// With default range
export const WithDefaultRange: Story = {
  render: (args) => (
    <SimpleCalendar 
      config={{
        displayMode: args.displayMode || 'embedded',
        visibleMonths: args.visibleMonths || 2,
        selectionMode: args.selectionMode || 'range',
        showSubmitButton: args.showSubmitButton ?? true,
        startWeekOnSunday: args.startWeekOnSunday || false,
        defaultRange: {
          start: '2024-01-15',
          end: '2024-01-20',
        },
      }}
    />
  ),
  args: {
    displayMode: 'embedded',
    visibleMonths: 2,
    selectionMode: 'range',
    showSubmitButton: true,
    startWeekOnSunday: false,
  },
};

// Custom colors
export const CustomTheme: Story = {
  render: (args) => (
    <SimpleCalendar 
      config={{
        displayMode: args.displayMode || 'embedded',
        visibleMonths: args.visibleMonths || 1,
        selectionMode: args.selectionMode || 'range',
        showSubmitButton: args.showSubmitButton ?? true,
        startWeekOnSunday: args.startWeekOnSunday || false,
        colors: {
          primary: '#9333EA',
          success: '#059669',
          warning: '#D97706',
          danger: '#DC2626',
        },
      }}
    />
  ),
  args: {
    displayMode: 'embedded',
    visibleMonths: 1,
    selectionMode: 'range',
    showSubmitButton: true,
    startWeekOnSunday: false,
  },
};

// Custom styles
export const CustomStyles: Story = {
  render: (args) => (
    <SimpleCalendar 
      config={{
        displayMode: args.displayMode || 'embedded',
        visibleMonths: args.visibleMonths || 1,
        selectionMode: args.selectionMode || 'range',
        showSubmitButton: args.showSubmitButton ?? true,
        startWeekOnSunday: args.startWeekOnSunday || false,
        containerStyle: {
          backgroundColor: '#F3F4F6',
          border: '2px solid #6366F1',
          borderRadius: '12px',
          padding: '16px',
        },
        inputStyle: {
          fontSize: '16px',
          padding: '12px',
          borderRadius: '8px',
        },
      }}
    />
  ),
  args: {
    displayMode: 'embedded',
    visibleMonths: 1,
    selectionMode: 'range',
    showSubmitButton: true,
    startWeekOnSunday: false,
  },
};

// Minimal configuration
export const Minimal: Story = {
  render: (args) => (
    <SimpleCalendar 
      config={{
        displayMode: args.displayMode || 'embedded',
        visibleMonths: args.visibleMonths || 1,
        selectionMode: args.selectionMode || 'range',
        showSubmitButton: args.showSubmitButton ?? true,
        startWeekOnSunday: args.startWeekOnSunday || false,
      }}
    />
  ),
  args: {
    displayMode: 'embedded',
    visibleMonths: 1,
    selectionMode: 'range',
    showSubmitButton: true,
    startWeekOnSunday: false,
  },
};

// Null/undefined handling
export const NullConfig: Story = {
  render: () => <SimpleCalendar />,
};

// With custom date formatter
export const CustomFormatter: Story = {
  render: (args) => (
    <SimpleCalendar 
      config={{
        displayMode: args.displayMode || 'embedded',
        visibleMonths: args.visibleMonths || 1,
        selectionMode: args.selectionMode || 'range',
        showSubmitButton: args.showSubmitButton ?? true,
        startWeekOnSunday: args.startWeekOnSunday || false,
        dateFormatter: (date: Date) => {
          return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          });
        },
      }}
    />
  ),
  args: {
    displayMode: 'embedded',
    visibleMonths: 1,
    selectionMode: 'range',
    showSubmitButton: true,
    startWeekOnSunday: false,
  },
};