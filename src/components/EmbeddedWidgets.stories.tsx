import type { Meta, StoryObj } from '@storybook/react';
import { CLACalendar } from './CLACalendar';
import type { CalendarSettings } from './CLACalendar.config';

const meta = {
  title: 'Calendar/Embedded Widgets',
  component: CLACalendar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Clean embedded calendar examples with no drop shadows, rounded corners, or popup styling.',
      },
    },
  },
} satisfies Meta<typeof CLACalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Flat embedded - single month
export const FlatSingleMonth: Story = {
  render: () => (
    <CLACalendar 
      key="flat-single"
      settings={{
        displayMode: 'embedded',
        visibleMonths: 1,
        selectionMode: 'range',
        showSubmitButton: false,
        showHeader: true,
        showFooter: false,
        containerStyle: {
          boxShadow: 'none',
          borderRadius: '0',
          border: '1px solid #d1d5db'
        },
        defaultRange: {
          start: '2024-01-15',
          end: '2024-01-20',
        },
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Single month embedded calendar with rigid corners, subtle border, and no drop shadow.',
      },
    },
  },
};

// Four month view
export const FourMonthView: Story = {
  render: () => (
    <CLACalendar 
      key="four-month"
      settings={{
        displayMode: 'embedded',
        visibleMonths: 4,
        selectionMode: 'range',
        showSubmitButton: true,
        showHeader: true,
        showFooter: false,
        containerStyle: {
          boxShadow: 'none',
          borderRadius: '0',
          border: '1px solid #d1d5db'
        },
        defaultRange: {
          start: '2024-01-15',
          end: '2024-02-10',
        },
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Four month embedded view with rigid corners and clean borders.',
      },
    },
  },
};

// No header or footer
export const MinimalEmbedded: Story = {
  render: () => (
    <CLACalendar 
      key="minimal"
      settings={{
        displayMode: 'embedded',
        visibleMonths: 2,
        selectionMode: 'single',
        showSubmitButton: false,
        showHeader: false,
        showFooter: false,
        containerStyle: {
          boxShadow: 'none',
          borderRadius: '0',
          border: '1px solid #d1d5db'
        },
        defaultRange: {
          start: '2024-01-15',
          end: '2024-01-15',
        },
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Ultra-minimal embedded calendar with rigid corners and no UI chrome.',
      },
    },
  },
};

// Compact sidebar size
export const CompactEmbedded: Story = {
  render: () => (
    <CLACalendar 
      key="compact"
      settings={{
        displayMode: 'embedded',
        visibleMonths: 1,
        selectionMode: 'single',
        showSubmitButton: false,
        showHeader: true,
        showFooter: false,
        monthWidth: 250,
        containerStyle: {
          boxShadow: 'none',
          borderRadius: '0',
          border: '1px solid #d1d5db'
        },
        defaultRange: {
          start: '2024-01-15',
          end: '2024-01-15',
        },
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Compact calendar with rigid corners, perfect for sidebar placement.',
      },
    },
  },
};

// With layers embedded
export const EmbeddedWithLayers: Story = {
  render: () => (
    <CLACalendar 
      key="with-layers"
      settings={{
        displayMode: 'embedded',
        visibleMonths: 2,
        selectionMode: 'range',
        showSubmitButton: false,
        showHeader: true,
        showFooter: false,
        showLayersNavigation: true,
        defaultLayer: 'Events',
        containerStyle: {
          boxShadow: 'none',
          borderRadius: '0',
          border: '1px solid #d1d5db'
        },
        defaultRange: {
          start: '2024-01-08',
          end: '2024-01-12',
        },
        layers: [
          {
            name: 'Events',
            title: 'Events',
            visible: true,
            data: {
              events: [
                {
                  date: '2024-01-15',
                  title: 'Meeting',
                  type: 'meeting',
                  time: '10:00 AM',
                  color: '#3B82F6',
                },
              ],
            },
          },
          {
            name: 'Holidays',
            title: 'Holidays',
            visible: true,
            data: {
              events: [
                {
                  date: '2024-01-01',
                  title: 'New Year',
                  type: 'holiday',
                  time: 'All Day',
                  color: '#EF4444',
                },
              ],
            },
          },
        ],
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Embedded calendar with layer navigation, rigid corners, and clean borders.',
      },
    },
  },
};

// Three months with no submit
export const ThreeMonthNoSubmit: Story = {
  render: () => (
    <CLACalendar 
      key="three-month"
      settings={{
        displayMode: 'embedded',
        visibleMonths: 3,
        selectionMode: 'range',
        showSubmitButton: false,
        showHeader: true,
        showFooter: false,
        containerStyle: {
          boxShadow: 'none',
          borderRadius: '0',
          border: '1px solid #d1d5db'
        },
        defaultRange: {
          start: '2024-01-15',
          end: '2024-02-20',
        },
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Three month embedded view with rigid corners and immediate selection feedback.',
      },
    },
  },
};