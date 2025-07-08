import type { Meta, StoryObj } from '@storybook/react';
import CLACalendar from './CLACalendar';
import { getDefaultSettings } from './CLACalendar.config';

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
    <CLACalendar settings={null as any} _onSettingsChange={() => {}} />
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
    <CLACalendar settings={undefined as any} _onSettingsChange={() => {}} />
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
    <CLACalendar settings={{} as any} _onSettingsChange={() => {}} />
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
      settings={{
        ...getDefaultSettings(),
        visibleMonths: -5, // Invalid: negative
        monthWidth: 50,   // Invalid: too small
      }} 
      _onSettingsChange={() => {}}
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
      settings={{
        ...getDefaultSettings(),
        layers: null as any,
      }} 
      _onSettingsChange={() => {}}
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
      settings={{
        ...getDefaultSettings(),
        layers: [],
      }} 
      _onSettingsChange={() => {}}
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
      settings={{
        ...getDefaultSettings(),
        displayMode: undefined,
        visibleMonths: null as any,
        layers: undefined,
        colors: null as any,
        showHeader: undefined,
      }} 
      _onSettingsChange={() => {}}
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

// Calendar with null config passed directly
export const NullConfigDirect: Story = {
  render: () => (
    <CLACalendar 
      settings={null as any}
      _onSettingsChange={() => {}}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Calendar with null config passed directly - should work with minimal defaults.',
      },
    },
  },
};

// Calendar with partial config
export const PartialConfig: Story = {
  render: () => (
    <CLACalendar 
      settings={{
        ...getDefaultSettings(),
        visibleMonths: undefined,
        displayMode: null as any,
        selectionMode: 'range',
      }}
      _onSettingsChange={() => {}}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Calendar with partial config containing nulls - should handle gracefully.',
      },
    },
  },
};

// Minimal calendar setup
export const MinimalSetup: Story = {
  render: () => (
    <CLACalendar 
      settings={{
        ...getDefaultSettings(),
        displayMode: 'embedded',
        defaultRange: { start: '2024-01-10', end: '' },
      }} 
      onSubmit={(start, end) => console.log('Selected:', start, end)}
      _onSettingsChange={() => {}}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Minimal calendar setup with just the essentials.',
      },
    },
  },
};

// Invalid date ranges
export const InvalidDateRange: Story = {
  render: () => (
    <CLACalendar 
      settings={{
        ...getDefaultSettings(),
        defaultRange: {
          start: '2024-01-20',
          end: '2024-01-10', // End before start
        },
      }} 
      _onSettingsChange={() => {}}
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
      settings={{
        ...getDefaultSettings(),
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
      }} 
      _onSettingsChange={() => {}}
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
      settings={{
        ...getDefaultSettings(),
        visibleMonths: 999,  // Too high
        monthWidth: -100,    // Negative
        colors: {
          primary: null as any,
          success: '',       // Empty string
          warning: 'invalid-color',
          danger: '#dc3545',
        },
      }} 
      _onSettingsChange={() => {}}
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