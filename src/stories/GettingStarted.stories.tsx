import type { Meta, StoryObj } from '@storybook/react';
import { CLACalendar } from '../components/CLACalendar';
import { getDefaultSettings } from '../components/CLACalendar.config';
import type { CalendarSettings } from '../components/CLACalendar.config';

// Common args that all calendar stories will use
const commonArgTypes = {
  displayMode: {
    control: { type: 'radio' },
    options: ['popup', 'embedded'],
    description: 'How the calendar is displayed',
    table: {
      type: { summary: '"popup" | "embedded"' },
      defaultValue: { summary: 'popup' },
    },
  },
  selectionMode: {
    control: { type: 'radio' },
    options: ['single', 'range'],
    description: 'Date selection mode',
    table: {
      type: { summary: '"single" | "range"' },
      defaultValue: { summary: 'range' },
    },
  },
  visibleMonths: {
    control: { type: 'number', min: 1, max: 12, step: 1 },
    description: 'Number of months to display',
    table: {
      type: { summary: 'number' },
      defaultValue: { summary: '2' },
    },
  },
  showHeader: {
    control: 'boolean',
    description: 'Show calendar header with date inputs',
    table: {
      type: { summary: 'boolean' },
      defaultValue: { summary: 'true' },
    },
  },
  showFooter: {
    control: 'boolean',
    description: 'Show calendar footer',
    table: {
      type: { summary: 'boolean' },
      defaultValue: { summary: 'true' },
    },
  },
  showSubmitButton: {
    control: 'boolean',
    description: 'Show submit button in footer',
    table: {
      type: { summary: 'boolean' },
      defaultValue: { summary: 'true' },
    },
  },
  showTooltips: {
    control: 'boolean',
    description: 'Show tooltips on hover',
    table: {
      type: { summary: 'boolean' },
      defaultValue: { summary: 'true' },
    },
  },
  startWeekOnSunday: {
    control: 'boolean',
    description: 'Start week on Sunday instead of Monday',
    table: {
      type: { summary: 'boolean' },
      defaultValue: { summary: 'false' },
    },
  },
  primaryColor: {
    control: 'color',
    description: 'Primary theme color',
    table: {
      type: { summary: 'string' },
      defaultValue: { summary: '#0366d6' },
    },
  },
};

// Common implementation for all stories
const CalendarImplementation = ({ 
  displayMode = 'popup',
  selectionMode = 'range',
  visibleMonths = 2,
  showHeader = true,
  showFooter = true,
  showSubmitButton = true,
  showTooltips = true,
  startWeekOnSunday = false,
  primaryColor = '#0366d6',
  onSubmit,
}: {
  displayMode?: 'popup' | 'embedded';
  selectionMode?: 'single' | 'range';
  visibleMonths?: number;
  showHeader?: boolean;
  showFooter?: boolean;
  showSubmitButton?: boolean;
  showTooltips?: boolean;
  startWeekOnSunday?: boolean;
  primaryColor?: string;
  onSubmit?: (start: string, end: string) => void;
}) => {
  const settings: CalendarSettings = {
    ...getDefaultSettings(),
    displayMode,
    selectionMode,
    visibleMonths,
    showHeader,
    showFooter,
    showSubmitButton,
    showTooltips,
    startWeekOnSunday,
    colors: {
      ...getDefaultSettings().colors,
      primary: primaryColor,
    },
  };

  return (
    <div style={{ minHeight: displayMode === 'popup' ? '400px' : 'auto' }}>
      <CLACalendar 
        settings={settings}
        onSubmit={onSubmit || ((start, end) => {
          console.log('Date selected:', { start, end });
        })}
        _onSettingsChange={() => {}}
      />
    </div>
  );
};

const meta = {
  title: 'Getting Started',
  component: CalendarImplementation,
  parameters: {
    docs: {
      description: {
        component: 'Simple calendar configurations to get you started quickly.',
      },
    },
  },
  argTypes: commonArgTypes,
} satisfies Meta<typeof CalendarImplementation>;

export default meta;
type Story = StoryObj<typeof meta>;

// 1. Basic Calendar - Default configuration
export const BasicCalendar: Story = {
  name: '1. Basic Calendar',
  args: {
    displayMode: 'embedded',
    selectionMode: 'range',
    visibleMonths: 2,
    showHeader: true,
    showFooter: true,
    showSubmitButton: true,
    showTooltips: true,
    startWeekOnSunday: false,
    primaryColor: '#0366d6',
  },
  parameters: {
    docs: {
      description: {
        story: 'Default calendar configuration with date range selection. This is the most common setup.',
      },
    },
  },
};

// 2. Single Date Picker
export const SingleDatePicker: Story = {
  name: '2. Single Date Picker',
  args: {
    displayMode: 'embedded',
    selectionMode: 'single',
    visibleMonths: 1,
    showHeader: true,
    showFooter: true,
    showSubmitButton: true,
    showTooltips: true,
    startWeekOnSunday: false,
    primaryColor: '#0366d6',
  },
  parameters: {
    docs: {
      description: {
        story: 'Calendar configured for single date selection. Perfect for birthdays, appointments, or single events.',
      },
    },
  },
};

// 3. Minimal Calendar
export const MinimalCalendar: Story = {
  name: '3. Minimal Calendar',
  args: {
    displayMode: 'embedded',
    selectionMode: 'range',
    visibleMonths: 1,
    showHeader: false,
    showFooter: false,
    showSubmitButton: false,
    showTooltips: false,
    startWeekOnSunday: false,
    primaryColor: '#0366d6',
  },
  parameters: {
    docs: {
      description: {
        story: 'Minimal calendar with no header or footer. Great for embedded widgets.',
      },
    },
  },
};

// 4. Multi-Month View
export const MultiMonthView: Story = {
  name: '4. Multi-Month View',
  args: {
    displayMode: 'embedded',
    selectionMode: 'range',
    visibleMonths: 3,
    showHeader: true,
    showFooter: true,
    showSubmitButton: true,
    showTooltips: true,
    startWeekOnSunday: false,
    primaryColor: '#0366d6',
  },
  parameters: {
    docs: {
      description: {
        story: 'Calendar showing multiple months at once. Useful for planning ahead or viewing extended periods.',
      },
    },
  },
};

// 5. Custom Themed
export const CustomThemed: Story = {
  name: '5. Custom Themed',
  args: {
    displayMode: 'embedded',
    selectionMode: 'range',
    visibleMonths: 2,
    showHeader: true,
    showFooter: true,
    showSubmitButton: true,
    showTooltips: true,
    startWeekOnSunday: false,
    primaryColor: '#9333ea', // Purple theme
  },
  parameters: {
    docs: {
      description: {
        story: 'Calendar with custom primary color. Change the color control to match your brand.',
      },
    },
  },
};

// 6. Popup Mode
export const PopupMode: Story = {
  name: '6. Popup Mode',
  args: {
    displayMode: 'popup',
    selectionMode: 'range',
    visibleMonths: 2,
    showHeader: true,
    showFooter: true,
    showSubmitButton: true,
    showTooltips: true,
    startWeekOnSunday: false,
    primaryColor: '#0366d6',
  },
  parameters: {
    docs: {
      description: {
        story: 'Calendar in popup mode. Click the input field to open the calendar overlay.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '100px 20px', backgroundColor: '#f3f4f6', minHeight: '500px' }}>
        <p style={{ marginBottom: '20px', color: '#6b7280' }}>
          Click the input field below to open the calendar:
        </p>
        <Story />
      </div>
    ),
  ],
};