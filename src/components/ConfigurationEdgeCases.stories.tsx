import type { Meta, StoryObj } from '@storybook/react';
import { CLACalendar, SimpleCalendar } from './CLACalendar';
import { createCalendarSettings, createSimpleCalendarSettings, createMinimalCalendar } from './CLACalendar.config';

const meta = {
  title: 'Calendar/Configuration Edge Cases',
  component: CLACalendar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'This collection demonstrates how the calendar handles various edge cases and null/undefined configurations gracefully.',
      },
    },
  },
} satisfies Meta<typeof CLACalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Null settings
export const NullSettings: Story = {
  render: () => (
    <CLACalendar settings={createCalendarSettings(null as any)} />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Calendar with null settings - should use all defaults gracefully.',
      },
    },
  },
};

// Undefined settings
export const UndefinedSettings: Story = {
  render: () => (
    <CLACalendar settings={createCalendarSettings(undefined)} />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Calendar with undefined settings - should use all defaults gracefully.',
      },
    },
  },
};

// Empty object settings
export const EmptySettings: Story = {
  render: () => (
    <CLACalendar settings={createCalendarSettings({})} />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Calendar with empty settings object - should use all defaults.',
      },
    },
  },
};

// Invalid numeric values
export const InvalidNumbers: Story = {
  render: () => (
    <CLACalendar 
      settings={createCalendarSettings({
        visibleMonths: -5, // Invalid: negative
        monthWidth: 50,   // Invalid: too small
      })} 
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Calendar with invalid numeric values - should sanitize to safe defaults.',
      },
    },
  },
};

// Null arrays
export const NullArrays: Story = {
  render: () => (
    <CLACalendar 
      settings={createCalendarSettings({
        layers: null as any,
      })} 
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Calendar with null layers array - should provide default Calendar layer.',
      },
    },
  },
};

// Empty layers array
export const EmptyLayers: Story = {
  render: () => (
    <CLACalendar 
      settings={createCalendarSettings({
        layers: [],
      })} 
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Calendar with empty layers array - should provide default Calendar layer.',
      },
    },
  },
};

// Mixed null/undefined properties
export const MixedNullProperties: Story = {
  render: () => (
    <CLACalendar 
      settings={createCalendarSettings({
        displayMode: undefined,
        visibleMonths: null as any,
        layers: undefined,
        colors: null as any,
        showHeader: undefined,
      })} 
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Calendar with mixed null/undefined properties - should filter them out and use defaults.',
      },
    },
  },
};

// SimpleCalendar with null config
export const SimpleNullConfig: Story = {
  render: () => (
    <SimpleCalendar config={null as any} />
  ),
  parameters: {
    docs: {
      description: {
        story: 'SimpleCalendar with null config - should work with minimal defaults.',
      },
    },
  },
};

// SimpleCalendar with partial config
export const SimplePartialConfig: Story = {
  render: () => (
    <SimpleCalendar 
      config={{
        visibleMonths: undefined,
        displayMode: null as any,
        selectionMode: 'range',
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'SimpleCalendar with partial config containing nulls - should handle gracefully.',
      },
    },
  },
};

// Minimal calendar helper
export const MinimalCalendarHelper: Story = {
  render: () => (
    <CLACalendar 
      settings={createMinimalCalendar({
        onSubmit: (start, end) => console.log('Selected:', start, end),
        defaultRange: { start: '2024-01-10' },
      })} 
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Using createMinimalCalendar helper for the simplest possible setup.',
      },
    },
  },
};

// Invalid date ranges
export const InvalidDateRange: Story = {
  render: () => (
    <CLACalendar 
      settings={createCalendarSettings({
        defaultRange: {
          start: '2024-01-20',
          end: '2024-01-10', // End before start
        },
      })} 
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Calendar with invalid date range - should handle gracefully.',
      },
    },
  },
};

// Malformed layers
export const MalformedLayers: Story = {
  render: () => (
    <CLACalendar 
      settings={createCalendarSettings({
        layers: [
          null as any,
          {
            name: 'Valid Layer',
            title: 'This layer is valid',
            description: 'Should work fine',
          },
          undefined as any,
          {
            // Missing required fields
            name: '',
          } as any,
        ],
      })} 
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Calendar with malformed layers array containing nulls and invalid objects.',
      },
    },
  },
};

// Extreme values
export const ExtremeValues: Story = {
  render: () => (
    <CLACalendar 
      settings={createCalendarSettings({
        visibleMonths: 999,  // Too high
        monthWidth: -100,    // Negative
        colors: {
          primary: null as any,
          success: '',       // Empty string
          warning: 'invalid-color',
        },
      })} 
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Calendar with extreme/invalid values - should sanitize to safe bounds.',
      },
    },
  },
};