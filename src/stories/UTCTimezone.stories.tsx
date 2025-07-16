import type { Meta, StoryObj } from '@storybook/react';
import { CLACalendar } from '../components/CLACalendar';
import { calendarArgTypes, defaultArgs } from './shared/storyControls';
import { CalendarStoryWrapper } from './shared/CalendarStoryWrapper';

const meta: Meta<typeof CLACalendar> = {
  title: 'UTC Timezone Handling/Stories',
  component: CLACalendar,
  argTypes: calendarArgTypes,
  args: defaultArgs,
  parameters: {
    docs: {
      description: {
        component: 'Demonstrates how UTC timezone handling prevents the "day off bug" where dates appear on the wrong day due to timezone conversions.'
      }
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story showing UTC prevents day off bug
export const DefaultUTC: Story = {
  args: {
    ...defaultArgs,
    timezone: 'UTC',
    defaultRange: {
      start: '2025-12-25',
      end: '2025-12-26'
    }
  },
  render: (args) => (
    <CalendarStoryWrapper 
      args={args}
      title="UTC Mode (Default) - No Day Off Bug"
      description="December 25th appears correctly on the 25th, regardless of your local timezone. This is because all date operations use UTC."
    />
  )
};

// Show the same date in different timezones
export const TimezoneComparison: Story = {
  args: {
    ...defaultArgs,
    visibleMonths: 1,
    defaultRange: {
      start: '2025-12-25',
      end: '2025-12-25'
    }
  },
  render: (args) => (
    <div>
      <CalendarStoryWrapper 
        args={{ ...args, timezone: 'UTC' }}
        title="UTC Timezone"
        description="December 25th always appears on the 25th"
        showSelectedDate={false}
      />
      <CalendarStoryWrapper 
        args={{ ...args, timezone: 'America/Los_Angeles' }}
        title="Pacific Timezone"
        description="Same date, but could shift if not handled properly"
        showSelectedDate={false}
      />
      <CalendarStoryWrapper 
        args={{ ...args, timezone: 'Asia/Tokyo' }}
        title="Tokyo Timezone"
        description="Significant timezone offset from UTC"
        showSelectedDate={false}
      />
    </div>
  )
};

// Test midnight UTC specifically
export const MidnightUTC: Story = {
  args: {
    ...defaultArgs,
    timezone: 'UTC',
    visibleMonths: 1,
    defaultRange: {
      start: '2025-12-31',
      end: '2026-01-01'
    }
  },
  render: (args) => (
    <CalendarStoryWrapper 
      args={args}
      title="Midnight UTC - Year Boundary"
      description="Testing December 31st to January 1st transition at midnight UTC. Both dates should appear on the correct days."
    />
  )
};

// Test timezone boundaries
export const TimezoneBoundaries: Story = {
  args: {
    ...defaultArgs,
    timezone: 'UTC',
    visibleMonths: 2
  },
  render: (args) => (
    <div>
      <CalendarStoryWrapper 
        args={args}
        title="Timezone Boundary Testing"
        description="Select dates near day boundaries to verify they stay on the correct day"
      />
      <div style={{ 
        marginTop: '20px', 
        padding: '16px', 
        backgroundColor: '#f6f8fa',
        border: '1px solid #d1d5da',
        borderRadius: '6px'
      }}>
        <h4 style={{ marginTop: 0 }}>Test these boundary cases:</h4>
        <ul>
          <li>Select December 31st (near year boundary)</li>
          <li>Select any date and verify it appears correctly</li>
          <li>Create ranges crossing month boundaries</li>
          <li>All dates should remain on their correct calendar days</li>
        </ul>
      </div>
    </div>
  )
};

// Show that date parsing is consistent
export const DateParsingConsistency: Story = {
  args: {
    ...defaultArgs,
    timezone: 'UTC',
    visibleMonths: 1,
    defaultRange: {
      // Using YYYY-MM-DD format as expected by the calendar
      start: '2025-07-04',
      end: '2025-07-04'
    }
  },
  render: (args) => (
    <CalendarStoryWrapper 
      args={args}
      title="ISO Date String Parsing"
      description="July 4th selected in UTC. The date should appear only on July 4th, demonstrating consistent date parsing."
    />
  )
};

// Interactive timezone switcher
export const InteractiveTimezoneSwitcher: Story = {
  args: {
    ...defaultArgs,
    visibleMonths: 1,
    defaultRange: {
      start: '2025-03-15',
      end: '2025-03-17'
    }
  },
  render: (args) => {
    const timezones = [
      { value: 'UTC', label: 'UTC (Default)' },
      { value: 'America/New_York', label: 'New York (EST/EDT)' },
      { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
      { value: 'Europe/London', label: 'London (GMT/BST)' },
      { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
      { value: 'Pacific/Honolulu', label: 'Honolulu (HST)' }
    ];

    return (
      <div>
        <div style={{ marginBottom: '20px' }}>
          <h3>Interactive Timezone Test</h3>
          <p>Change the timezone control in Storybook's controls panel to see how the calendar handles different timezones. The selected dates (March 15-17) should remain consistent.</p>
        </div>
        <CalendarStoryWrapper args={args} />
        <div style={{ 
          marginTop: '20px', 
          padding: '16px', 
          backgroundColor: '#e7f3ff',
          border: '1px solid #0366d6',
          borderRadius: '6px'
        }}>
          <strong>Current Timezone:</strong> {args.timezone}
        </div>
      </div>
    );
  }
};

// Daylight Saving Time edge case
export const DaylightSavingTime: Story = {
  args: {
    ...defaultArgs,
    timezone: 'America/New_York',
    visibleMonths: 1,
    defaultRange: {
      // DST transition in 2025: March 9 at 2 AM
      start: '2025-03-08',
      end: '2025-03-10'
    }
  },
  render: (args) => (
    <CalendarStoryWrapper 
      args={args}
      title="Daylight Saving Time Transition"
      description="March 9, 2025 is when DST begins in New York. The calendar should handle this 23-hour day correctly without date shifting."
    />
  )
};

// Test with full ISO timestamps
export const ISOTimestampHandling: Story = {
  args: {
    ...defaultArgs,
    timezone: 'UTC',
    visibleMonths: 1,
    defaultRange: {
      // Testing with full ISO timestamps including time
      start: '2025-07-03T22:00:00.000Z',  // July 3, 10 PM UTC
      end: '2025-07-04T02:00:00.000Z'     // July 4, 2 AM UTC
    }
  },
  render: (args) => (
    <CalendarStoryWrapper 
      args={args}
      title="Full ISO Timestamp Handling"
      description="Testing how the calendar handles ISO timestamps with time components. This range spans from July 3 10PM to July 4 2AM UTC, which should highlight both July 3rd and 4th."
    />
  )
};