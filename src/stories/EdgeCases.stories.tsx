import type { Meta, StoryObj } from '@storybook/react';
import { CLACalendar } from '../components/CLACalendar';
import { calendarArgTypes, defaultArgs } from './shared/storyControls';
import { CalendarStoryWrapper } from './shared/CalendarStoryWrapper';
import { getDefaultSettings } from '../components/DateRangePicker.config';

const meta: Meta<typeof CLACalendar> = {
  title: 'Edge Cases/Configuration Stress Tests',
  component: CLACalendar,
  argTypes: calendarArgTypes,
  args: defaultArgs,
  parameters: {
    docs: {
      description: {
        component: 'Testing edge cases and problematic configurations to ensure the calendar handles them gracefully.'
      }
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const NegativeVisibleMonths: Story = {
  name: 'Negative Visible Months',
  args: {
    ...defaultArgs,
    visibleMonths: -5
  },
  render: (args) => (
    <CalendarStoryWrapper 
      args={args}
      title="Negative Visible Months"
      description="Testing with visibleMonths: -5"
    />
  )
};

export const ExcessiveVisibleMonths: Story = {
  name: 'Excessive Visible Months (100)',
  args: {
    ...defaultArgs,
    visibleMonths: 100
  },
  render: (args) => (
    <CalendarStoryWrapper 
      args={args}
      title="Excessive Visible Months"
      description="Testing with visibleMonths: 100"
    />
  )
};

export const ZeroVisibleMonths: Story = {
  name: 'Zero Visible Months',
  args: {
    ...defaultArgs,
    visibleMonths: 0
  },
  render: (args) => (
    <CalendarStoryWrapper 
      args={args}
      title="Zero Visible Months"
      description="Testing with visibleMonths: 0"
    />
  )
};

export const InvalidDateRange: Story = {
  name: 'Invalid Date Range (End Before Start)',
  args: {
    ...defaultArgs,
    defaultRange: {
      start: '2025-12-31',
      end: '2025-01-01'
    }
  },
  render: (args) => (
    <CalendarStoryWrapper 
      args={args}
      title="Invalid Date Range"
      description="End date is before start date"
    />
  )
};

export const MalformedDates: Story = {
  name: 'Malformed Date Strings',
  args: {
    ...defaultArgs,
    defaultRange: {
      start: 'not-a-date',
      end: '2025-13-45'
    }
  },
  render: (args) => (
    <CalendarStoryWrapper 
      args={args}
      title="Malformed Date Strings"
      description="Testing with invalid date formats"
    />
  )
};

export const ConflictingRestrictions: Story = {
  name: 'Conflicting Restrictions',
  render: (args) => {
    const restrictionConfig = {
      restrictions: [
        {
          type: 'boundary' as const,
          enabled: true,
          minDate: '2025-06-01',
          maxDate: '2025-06-30'
        },
        {
          type: 'daterange' as const,
          enabled: true,
          startDate: '2025-06-01',
          endDate: '2025-06-30'
        }
      ]
    };

    return (
      <CalendarStoryWrapper 
        args={args}
        title="Conflicting Restrictions"
        description="Boundary allows June 2025, but daterange blocks the entire month"
        restrictionConfigFactory={() => restrictionConfig}
      />
    );
  }
};

export const NegativeMonthWidth: Story = {
  name: 'Negative Month Width',
  args: {
    ...defaultArgs,
    monthWidth: -500
  },
  render: (args) => (
    <CalendarStoryWrapper 
      args={args}
      title="Negative Month Width"
      description="Testing with monthWidth: -500"
    />
  )
};

export const ExtremelySmallMonthWidth: Story = {
  name: 'Extremely Small Month Width',
  args: {
    ...defaultArgs,
    monthWidth: 10
  },
  render: (args) => (
    <CalendarStoryWrapper 
      args={args}
      title="Extremely Small Month Width"
      description="Testing with monthWidth: 10px"
    />
  )
};

export const InvalidTimezone: Story = {
  name: 'Invalid Timezone',
  args: {
    ...defaultArgs,
    timezone: 'Not/A/Real/Timezone'
  },
  render: (args) => (
    <CalendarStoryWrapper 
      args={args}
      title="Invalid Timezone"
      description="Testing with an invalid timezone string"
    />
  )
};

export const EmptyLayersWithNavigation: Story = {
  name: 'Empty Layers with Navigation Enabled',
  args: {
    ...defaultArgs,
    layers: [],
    showLayersNavigation: true
  },
  render: (args) => (
    <CalendarStoryWrapper 
      args={args}
      title="Empty Layers with Navigation"
      description="Layer navigation enabled but no layers provided"
    />
  )
};

export const DuplicateLayerNames: Story = {
  name: 'Duplicate Layer Names',
  args: {
    ...defaultArgs,
    layers: [
      {
        name: 'duplicate',
        title: 'First Layer',
        description: 'This is the first layer',
        visible: true,
        enabled: true
      },
      {
        name: 'duplicate',
        title: 'Second Layer',
        description: 'This has the same name as the first',
        visible: true,
        enabled: true
      }
    ],
    showLayersNavigation: true
  },
  render: (args) => (
    <CalendarStoryWrapper 
      args={args}
      title="Duplicate Layer Names"
      description="Multiple layers with the same name identifier"
    />
  )
};

export const InvalidColorValues: Story = {
  name: 'Invalid Color Values',
  args: {
    ...defaultArgs,
    colors: {
      primary: 'not-a-color',
      success: '#GGGGGG',
      warning: 'rgb(999, 999, 999)',
      danger: '12345'
    }
  },
  render: (args) => (
    <CalendarStoryWrapper 
      args={args}
      title="Invalid Color Values"
      description="Testing with malformed color values"
    />
  )
};

export const CircularDateFormatter: Story = {
  name: 'Throwing Date Formatter',
  args: {
    ...defaultArgs,
    dateFormatter: (date: Date) => {
      throw new Error('Date formatter error!');
    }
  },
  render: (args) => (
    <CalendarStoryWrapper 
      args={args}
      title="Throwing Date Formatter"
      description="Date formatter function that throws an error"
    />
  )
};

export const NullAndUndefinedValues: Story = {
  name: 'Null and Undefined Values',
  args: {
    ...defaultArgs,
    defaultRange: null as any,
    dateFormatter: undefined,
    colors: null as any
  },
  render: (args) => (
    <CalendarStoryWrapper 
      args={args}
      title="Null and Undefined Values"
      description="Testing with null and undefined for various properties"
    />
  )
};

export const ExtremeFontSize: Story = {
  name: 'Extreme Font Sizes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <CalendarStoryWrapper 
        args={{
          ...defaultArgs,
          baseFontSize: '0.1rem'
        }}
        title="Tiny Font Size"
        description="baseFontSize: 0.1rem"
      />
      <CalendarStoryWrapper 
        args={{
          ...defaultArgs,
          baseFontSize: '5rem'
        }}
        title="Huge Font Size"
        description="baseFontSize: 5rem"
      />
    </div>
  )
};