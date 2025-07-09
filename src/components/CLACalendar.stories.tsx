import type { Meta, StoryObj } from '@storybook/react';
import { CLACalendar } from './CLACalendar';
import { CalendarSettings } from './CLACalendar.config';
import { generateStoryDocs, formatLayerInfo, formatRestrictionInfo } from './utils/storybook-docs';
import { CLACalendarArgTypes, CLACalendarDefaultArgs, mapArgsToSettings } from './utils/storybook-argtypes';

const meta = {
  title: 'Calendar/CLACalendar',
  component: CLACalendar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'CLACalendar is a flexible date range picker component for React with drag selection support.',
      },
    },
  },
  argTypes: CLACalendarArgTypes as any, // Type assertion to allow our custom argTypes
} satisfies Meta<typeof CLACalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  render: (args) => (
    <CLACalendar 
      key="default-story"
      settings={mapArgsToSettings(args)}
    />
  ),
  args: CLACalendarDefaultArgs as any, // Type assertion for Storybook args compatibility
  parameters: {
    ...generateStoryDocs(
      'Default Calendar',
      'Basic calendar configuration with popup display and range selection. This is the most common setup for the CLACalendar component.',
      'basic',
      'All standard features are enabled including header, footer, tooltips, and submit button.'
    ),
  },
};

// Simple Calendar story
export const Simple: Story = {
  render: (args) => (
    <CLACalendar 
      key="simple-story"
      settings={mapArgsToSettings(args)}
      onSubmit={(start, end) => {
        console.log('Date range selected:', { start, end });
      }}
    />
  ),
  args: {
    ...CLACalendarDefaultArgs,
    visibleMonths: 1,
  } as any, // Type assertion for Storybook args compatibility
};

// Single date selection
export const SingleSelection: Story = {
  render: (args) => (
    <CLACalendar 
      key="single-selection-story"
      settings={mapArgsToSettings(args)}
    />
  ),
  args: {
    ...CLACalendarDefaultArgs,
    visibleMonths: 1,
    selectionMode: 'single',
  } as any, // Type assertion for Storybook args compatibility
  parameters: {
    ...generateStoryDocs(
      'Single Date Selection',
      'Calendar configured for single date selection instead of date ranges. Perfect for appointment booking or single-date events.',
      'singleDate',
      'Click any date to select it. Only one date can be selected at a time.'
    ),
  },
};

// Multiple months
export const MultipleMonths: Story = {
  render: (args) => (
    <CLACalendar 
      key="multiple-months-story"
      settings={mapArgsToSettings(args)}
    />
  ),
  args: {
    ...CLACalendarDefaultArgs,
    visibleMonths: 3,
  } as any, // Type assertion for Storybook args compatibility
};

// With custom colors
export const CustomColors: Story = {
  render: (args) => (
    <CLACalendar 
      key="custom-colors-story"
      settings={{
        ...mapArgsToSettings(args),
        containerStyle: {
          backgroundColor: 'rgb(254, 243, 226)',  // Consistent background throughout
          border: '2px solid #D97706',  // Warm amber border
          borderRadius: '6px',          // Keep default border radius
          boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)'  // Keep default shadow
        },
        backgroundColors: {
          emptyRows: 'rgb(254, 243, 226)',        // Same color for empty rows
          monthHeader: 'rgb(254, 243, 226)',      // Same color for month headers
          headerContainer: 'rgb(254, 243, 226)',  // Same color for input container
          dayCells: 'rgb(254, 243, 226)',         // Same color for day cells
          selection: '#F59E0B',                   // Warm amber for selection
          input: 'rgb(254, 243, 226)'             // Same color for input fields
        },
        defaultRange: {
          start: '2024-01-10',
          end: '2024-01-15'
        },
        colors: {
          primary: '#8B5CF6',   // Purple
          success: '#10B981',   // Green
          warning: '#F59E0B',   // Orange
          danger: '#EF4444',    // Red
        },
        layers: [
          {
            name: 'Calendar',
            title: 'Custom Styled Calendar',
            description: 'Calendar with custom color scheme and background highlights',
            visible: true,
            data: {
              background: [
                {
                  startDate: '2024-01-05',
                  endDate: '2024-01-07',
                  color: '#DDD6FE' // Light purple
                },
                {
                  startDate: '2024-01-20',
                  endDate: '2024-01-25',
                  color: '#FED7AA' // Light orange
                }
              ],
              events: [
                {
                  date: '2024-01-06',
                  title: 'Design Review',
                  type: 'other',
                  color: '#8B5CF6',
                  time: '10:00 AM',
                  description: 'Monthly design review meeting'
                },
                {
                  date: '2024-01-22',
                  title: 'Launch Event',
                  type: 'other',
                  color: '#FB923C',
                  time: '2:00 PM',
                  description: 'Product launch celebration'
                }
              ]
            }
          }
        ]
      }}
    />
  ),
  args: {
    ...CLACalendarDefaultArgs,
    showLayersNavigation: false,
    showTooltips: true,
    displayMode: 'embedded',
    visibleMonths: 1,
    showMonthHeadings: true,  // Enable to show month header background
  } as any,
  parameters: {
    docs: {
      description: {
        story: `Demonstrates a consistent custom background color (rgb(254, 243, 226)) with custom selection and border colors.

**Visual Changes:**
- **Consistent Background:** Light beige (rgb(254, 243, 226)) throughout all calendar areas
- **Container Border:** Warm amber border (2px solid #D97706) instead of default blue
- **Selection Color:** Warm amber (#F59E0B) for selected date ranges
- **Day Cells:** Same background color for all day cells
- **Empty Row Backgrounds:** Same color for weeks with no days
- **Month Headers:** Same background color when showMonthHeadings is true
- **Header Input Container:** Same background for the date input area

**Background Color Options:**
- \`backgroundColors.dayCells\` - Sets the background for day cells
- \`backgroundColors.emptyRows\` - Sets the background for empty week rows
- \`backgroundColors.monthHeader\` - Sets the background for month name headers
- \`backgroundColors.headerContainer\` - Sets the background for the date input container
- \`backgroundColors.selection\` - Sets the background for selected date ranges (warm amber #F59E0B)
- \`backgroundColors.input\` - Sets the background for input fields

**Note:** This story demonstrates how to achieve a fully consistent background color throughout the calendar by setting all background properties to the same value.`
      }
    }
  }
};

// Week starting on Sunday
export const WeekStartSunday: Story = {
  render: (args) => (
    <CLACalendar 
      key="week-start-sunday-story"
      settings={mapArgsToSettings(args)}
    />
  ),
  args: {
    ...CLACalendarDefaultArgs,
    visibleMonths: 1,
    startWeekOnSunday: true,
  } as any, // Type assertion for Storybook args compatibility
};

// With sample events
export const WithEvents: Story = {
  render: (args) => (
    <CLACalendar 
      key="with-events-story"
      settings={{
        ...mapArgsToSettings(args),
        defaultLayer: 'Events',
        defaultRange: {
          start: '2024-01-01',
          end: '2024-01-05',
        },
        layers: [
          {
            name: 'Events',
            title: 'Sample Events',
            description: 'Example events layer',
            visible: true,
            data: {
              events: [
                {
                  date: '2024-01-15',
                  title: 'Team Meeting',
                  type: 'meeting',
                  time: '10:00 AM',
                  description: 'Weekly team sync',
                  color: '#3B82F6',
                },
                {
                  date: '2024-01-20',
                  title: 'Project Deadline',
                  type: 'deadline',
                  time: '5:00 PM',
                  description: 'Sprint deadline',
                  color: '#EF4444',
                },
              ],
              background: [
                {
                  startDate: '2024-01-10',
                  endDate: '2024-01-12',
                  color: '#FEF3C7',
                },
              ],
            },
          },
        ],
      }}
    />
  ),
  args: {
    ...CLACalendarDefaultArgs,
    showLayersNavigation: true,
  } as any, // Type assertion for Storybook args compatibility
  parameters: {
    docs: {
      description: {
        story: `Calendar with sample events and background colors demonstrating layer functionality.

**Features Shown:**
- Layer navigation tabs
- Event markers with tooltips
- Background color ranges
- Interactive event system

**Configuration Details:**
- **Layers:** 1 layer with events and backgrounds
- **Events:** 2 sample events (Team Meeting, Project Deadline)
- **Backgrounds:** 1 highlighted date range (Jan 10-12)
- **Layer Navigation:** Enabled for switching between layers

**Layer Information:**
${formatLayerInfo([
  {
    name: 'Events',
    title: 'Sample Events',
    data: {
      events: [
        { date: '2024-01-15', title: 'Team Meeting' },
        { date: '2024-01-20', title: 'Project Deadline' }
      ],
      background: [
        { startDate: '2024-01-10', endDate: '2024-01-12' }
      ]
    }
  }
])}

**Usage:** Hover over event markers to see detailed tooltips. Background colors indicate special date ranges.`
      }
    }
  },
};

// Minimal configuration
export const Minimal: Story = {
  render: (args) => (
    <CLACalendar 
      key="minimal-story"
      settings={{
        ...mapArgsToSettings(args),
        defaultLayer: 'Calendar',
      }}
    />
  ),
  args: {
    ...CLACalendarDefaultArgs,
    visibleMonths: 1,
  } as any, // Type assertion for Storybook args compatibility
};

// Test case: Submit button disabled
export const NoSubmitButton: Story = {
  render: (args) => (
    <CLACalendar 
      key="no-submit-button-story"
      settings={mapArgsToSettings(args)}
    />
  ),
  args: {
    ...CLACalendarDefaultArgs,
    visibleMonths: 1,
    showSubmitButton: false, // Explicitly testing submit OFF
  } as any, // Type assertion for Storybook args compatibility
};

// Embedded mode example
export const EmbeddedMode: Story = {
  render: (args) => (
    <CLACalendar 
      key="embedded-mode-story"
      settings={mapArgsToSettings(args)}
    />
  ),
  args: {
    ...CLACalendarDefaultArgs,
    displayMode: 'embedded',
    visibleMonths: 2,
  } as any,
  parameters: {
    docs: {
      description: {
        story: `Calendar displayed inline within the page layout instead of as a popup.

**Key Differences from Popup Mode:**
- Always visible on the page
- No overlay or backdrop
- Takes up space in document flow
- No open/close behavior
- Ideal for dedicated calendar pages

**Common Use Cases:**
- Dashboard widgets
- Booking pages
- Event management interfaces
- Administrative panels`
      }
    }
  },
};

// Date restrictions example
export const WithRestrictions: Story = {
  render: (args) => (
    <CLACalendar 
      key="with-restrictions-story"
      settings={mapArgsToSettings(args)}
      restrictionConfigFactory={() => ({
        restrictions: [
          {
            type: 'weekday',
            enabled: true,
            days: [0, 6],
            message: 'Weekends are not available for selection',
          },
          {
            type: 'daterange',
            enabled: true,
            ranges: [
              {
                startDate: '2024-01-15',
                endDate: '2024-01-17',
                message: 'These dates are fully booked',
              },
            ],
          },
        ],
      })}
    />
  ),
  args: {
    ...CLACalendarDefaultArgs,
    visibleMonths: 2,
  } as any,
  parameters: {
    docs: {
      description: {
        story: `Calendar with date restrictions showing how to prevent selection of certain dates.

**Restrictions Applied:**
- **Weekends Blocked:** Saturdays and Sundays cannot be selected
- **Specific Dates Blocked:** January 15-17 are marked as unavailable

**Visual Indicators:**
- Restricted dates show diagonal stripe pattern
- Hover over restricted dates to see explanation
- Selection automatically skips restricted dates

**Restriction Information:**
${formatRestrictionInfo([
  {
    type: 'weekday',
    enabled: true,
    days: [0, 6],
    message: 'Weekends are not available for selection',
  },
  {
    type: 'daterange',
    enabled: true,
    ranges: [
      {
        startDate: '2024-01-15',
        endDate: '2024-01-17',
        message: 'These dates are fully booked',
      },
    ],
  },
])}`
      }
    }
  },
};

// Custom date formatting
export const CustomDateFormat: Story = {
  render: (args) => (
    <CLACalendar 
      key="custom-date-format-story"
      settings={{
        ...mapArgsToSettings(args),
        dateFormatter: (date: Date) => {
          return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
        },
        dateRangeSeparator: ' → ',
        defaultRange: {
          start: '2024-01-10',
          end: '2024-01-15',
        },
      }}
    />
  ),
  args: {
    ...CLACalendarDefaultArgs,
    visibleMonths: 1,
  } as any,
  parameters: {
    docs: {
      description: {
        story: `Demonstrates custom date formatting for display.

**Custom Format Features:**
- **Date Format:** "Wed, Jan 10, 2024" style
- **Separator:** Arrow (→) instead of dash
- **Localization:** Uses browser locale for formatting

**Date Formatter Function:**
\`\`\`javascript
dateFormatter: (date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
\`\`\`

**Use Cases:**
- International date formats
- Custom business requirements
- Accessibility improvements
- Brand consistency`
      }
    }
  },
};

// Year view with many months
export const YearView: Story = {
  render: (args) => (
    <CLACalendar 
      key="year-view-story"
      settings={mapArgsToSettings(args)}
    />
  ),
  args: {
    ...CLACalendarDefaultArgs,
    displayMode: 'embedded',
    visibleMonths: 6,
    monthWidth: 300,
    showSubmitButton: false,
  } as any,
  parameters: {
    docs: {
      description: {
        story: `Extended calendar view showing 6 months at once.

**Configuration:**
- **Visible Months:** 6 (half year view)
- **Month Width:** 300px per month
- **Display Mode:** Embedded for better layout
- **Submit Button:** Hidden for cleaner view

**Use Cases:**
- Long-term planning
- Vacation scheduling
- Project timelines
- Academic calendars

**Performance Note:** Showing many months may impact performance on slower devices. Consider reducing visibleMonths for mobile users.`
      }
    }
  },
};