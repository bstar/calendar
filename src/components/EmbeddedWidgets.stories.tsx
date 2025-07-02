import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
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

// Year-round calendar with month nicknames
export const YearRoundCalendar: Story = {
  render: () => {
    const [visibleMonths, setVisibleMonths] = React.useState<Date[]>([]);
    
    // Month nicknames for display
    const monthNicknames = {
      0: 'New Beginnings Month',
      1: 'Love is in the Air Month', 
      2: 'Spring Awakening Month',
      3: 'Bloom and Blossom Month',
      4: 'Mothers and Flowers Month',
      5: 'Summer Kickoff Month',
      6: 'Hotter than Hell Month',
      7: 'Dog Days Month',
      8: 'Back to School Month',
      9: 'Spooky Season Month',
      10: 'Gratitude and Turkey Month',
      11: 'Winter Wonderland Month'
    };

    // Background colors for each month
    const monthBackgrounds = {
      0: '#E8F4FD', // January - Light blue
      1: '#FCE4EC', // February - Light pink  
      2: '#E8F5E8', // March - Light green
      3: '#FFF3E0', // April - Light orange
      4: '#F3E5F5', // May - Light purple
      5: '#FFFDE7', // June - Light yellow
      6: '#FFEBEE', // July - Light red
      7: '#E1F5FE', // August - Light cyan
      8: '#F1F8E9', // September - Light lime
      9: '#FF6D00', // October - Orange
      10: '#D7CCC8', // November - Light brown
      11: '#E3F2FD'  // December - Light blue
    };

    // Create background layers for all months of the year
    const yearBackgrounds = Array.from({ length: 12 }, (_, monthIndex) => {
      const year = 2024; // Fixed year for consistent background colors
      const startDate = new Date(year, monthIndex, 1);
      const endDate = new Date(year, monthIndex + 1, 0); // Last day of month
      
      return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        color: monthBackgrounds[monthIndex as keyof typeof monthBackgrounds]
      };
    });

    // Handle month change callback from calendar
    const handleMonthChange = (months: Date[]) => {
      setVisibleMonths(months);
    };

    // Get month indices for display
    const displayedMonths = visibleMonths.map(date => date.getMonth());

    return (
      <div style={{ padding: '20px' }}>
        {/* Month nickname display */}
        <div style={{ 
          marginBottom: '16px',
          padding: '12px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '0'
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>
            Currently Viewing:
          </h4>
          {displayedMonths.map((monthIndex, idx) => (
            <div key={monthIndex} style={{ 
              fontSize: '14px', 
              color: '#4b5563',
              marginBottom: idx < displayedMonths.length - 1 ? '4px' : '0'
            }}>
              <strong>{new Date(2024, monthIndex).toLocaleString('default', { month: 'long' })}</strong>
              {' - '}
              <em>{monthNicknames[monthIndex as keyof typeof monthNicknames]}</em>
            </div>
          ))}
        </div>

        {/* Calendar with year-round backgrounds */}
        <CLACalendar 
          key="year-round"
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
              end: '2024-01-20',
            },
            layers: [
              {
                name: 'MonthColors',
                title: 'Month Backgrounds',
                description: 'Different background color for each month',
                visible: true,
                data: {
                  background: yearBackgrounds
                }
              }
            ]
          }}
          onMonthChange={handleMonthChange}
        />
        
        <div style={{ 
          marginTop: '16px',
          fontSize: '12px',
          color: '#059669',
          fontStyle: 'italic'
        }}>
          ✅ Navigate the months using the header controls - the "Currently Viewing" section updates in real-time!
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Year-round calendar with unique background colors for each month and external month nickname display. Shows how month navigation callbacks could work.',
      },
    },
  },
};