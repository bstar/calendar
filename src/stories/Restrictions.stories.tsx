import React, { useState, useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import CLACalendar from '../components/CLACalendar';
import { calendarArgTypes, defaultArgs } from './shared/storyControls';
import { CalendarStoryWrapper } from './shared/CalendarStoryWrapper';
import { createCalendarSettings } from '../components/CLACalendar.config';
import type { RestrictionConfig } from '../components/CLACalendar.config';

// Helper component to apply diagonal offset for all restriction stories
const DiagonalOffsetWrapper: React.FC<{ args: any; children: React.ReactNode }> = ({ args, children }) => {
  useEffect(() => {
    // Always set the value, using default if not provided
    const offset = args.diagonalColOffset ?? 2;
    document.documentElement.style.setProperty('--diagonal-col-offset', offset + 'px');
    
    // Cleanup on unmount
    return () => {
      document.documentElement.style.removeProperty('--diagonal-col-offset');
    };
  }, [args.diagonalColOffset]);

  return <>{children}</>;
};

const meta: Meta<typeof CLACalendar> = {
  title: 'Restrictions/Stories',
  component: CLACalendar,
  argTypes: calendarArgTypes,
  args: defaultArgs,
  parameters: {
    docs: {
      page: null, // Hide the default docs page since we have a custom Documentation page
      description: {
        component: 'Examples demonstrating the calendar restriction system'
      }
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Boundary Restriction
export const BoundaryRestriction: Story = {
  render: (args) => {
    const BoundaryExample = () => {
      const [submittedDates, setSubmittedDates] = useState<{start: string | null, end: string | null} | null>(null);
      
      const handleSubmit = (start: string | null, end: string | null) => {
        setSubmittedDates({ start, end });
      };
      
      const restrictionConfig: RestrictionConfig = {
        restrictions: [{
          type: 'boundary',
          enabled: true,
          date: '2025-01-01',
          direction: 'before',
          inclusive: false,
          message: 'Please select dates in 2025 or later'
        }, {
          type: 'boundary',
          enabled: true,
          date: '2025-12-31',
          direction: 'after',
          inclusive: true,
          message: 'Please select dates in 2025 or earlier'
        }]
      };
      
      return (
        <div style={{ padding: '20px' }}>
          <h3>Boundary Restrictions</h3>
          <p>This calendar restricts selection to the year 2025 only. Dates before January 1, 2025 and after December 31, 2025 are blocked.</p>
          
          <CLACalendar
            settings={createCalendarSettings({
              ...args,
              displayMode: 'embedded',
              selectionMode: 'range',
              showSubmitButton: true,
              showFooter: true,
              onSubmit: handleSubmit,
              restrictionConfigFactory: () => restrictionConfig
            })}
          />
          
          {submittedDates && (
            <div style={{
              marginTop: '20px',
              padding: '10px',
              backgroundColor: '#f0f8ff',
              borderRadius: '4px',
              border: '1px solid #0366d6'
            }}>
              <strong>Selected Date Range:</strong>
              <div>Start: {submittedDates.start || 'Not selected'}</div>
              <div>End: {submittedDates.end || 'Not selected'}</div>
            </div>
          )}
        </div>
      );
    };
    
    return (
      <DiagonalOffsetWrapper args={args}>
        <BoundaryExample />
      </DiagonalOffsetWrapper>
    );
  }
};

// Weekday Restrictions
export const WeekdayRestrictions: Story = {
  render: (args) => {
    const WeekdayExample = () => {
      const [submittedDates, setSubmittedDates] = useState<{start: string | null, end: string | null} | null>(null);
      const [restrictWeekends, setRestrictWeekends] = useState(true);
      
      const handleSubmit = (start: string | null, end: string | null) => {
        setSubmittedDates({ start, end });
      };
      
      const getRestrictionConfig = (): RestrictionConfig => ({
        restrictions: restrictWeekends ? [{
          type: 'weekday',
          enabled: true,
          days: [0, 6], // Sunday and Saturday
          message: 'Weekends are not available for booking'
        }] : []
      });
      
      return (
        <div style={{ padding: '20px' }}>
          <h3>Weekday Restrictions</h3>
          <p>This example demonstrates restricting specific weekdays. By default, weekends are blocked.</p>
          
          <div style={{ marginBottom: '20px' }}>
            <label>
              <input
                type="checkbox"
                checked={restrictWeekends}
                onChange={(e) => setRestrictWeekends(e.target.checked)}
              />
              {' '}Block weekends (Saturday & Sunday)
            </label>
          </div>
          
          <CLACalendar
            settings={createCalendarSettings({
              ...args,
              displayMode: 'embedded',
              selectionMode: 'range',
              showSubmitButton: true,
              showFooter: true,
              onSubmit: handleSubmit,
              restrictionConfigFactory: getRestrictionConfig
            })}
          />
          
          {submittedDates && (
            <div style={{
              marginTop: '20px',
              padding: '10px',
              backgroundColor: '#f0f8ff',
              borderRadius: '4px',
              border: '1px solid #0366d6'
            }}>
              <strong>Selected Date Range:</strong>
              <div>Start: {submittedDates.start || 'Not selected'}</div>
              <div>End: {submittedDates.end || 'Not selected'}</div>
            </div>
          )}
        </div>
      );
    };
    
    return (
      <DiagonalOffsetWrapper args={args}>
        <WeekdayExample />
      </DiagonalOffsetWrapper>
    );
  }
};

// Date Range Restrictions
export const DateRangeRestrictions: Story = {
  render: (args) => {
    const DateRangeExample = () => {
      const [submittedDates, setSubmittedDates] = useState<{start: string | null, end: string | null} | null>(null);
      
      const handleSubmit = (start: string | null, end: string | null) => {
        setSubmittedDates({ start, end });
      };
      
      const restrictionConfig: RestrictionConfig = {
        restrictions: [{
          type: 'daterange',
          enabled: true,
          ranges: [
            {
              startDate: '2025-07-01',
              endDate: '2025-07-07',
              message: 'Company retreat - office closed'
            },
            {
              startDate: '2025-07-04',
              endDate: '2025-07-04',
              message: 'Independence Day holiday'
            },
            {
              startDate: '2025-08-15',
              endDate: '2025-08-20',
              message: 'System maintenance period'
            },
            {
              startDate: '2025-12-24',
              endDate: '2025-12-26',
              message: 'Christmas holidays'
            },
            {
              startDate: '2025-12-31',
              endDate: '2026-01-01',
              message: 'New Year holidays'
            }
          ],
          message: 'This period is not available'
        }]
      };
      
      return (
        <div style={{ padding: '20px' }}>
          <h3>Date Range Restrictions</h3>
          <p>Specific date ranges are blocked for holidays, maintenance, and other events. Hover over restricted dates to see the reason.</p>
          
          <div style={{
            marginBottom: '20px',
            padding: '10px',
            backgroundColor: '#fff3cd',
            borderRadius: '4px',
            border: '1px solid #ffeaa7'
          }}>
            <strong>Blocked Periods:</strong>
            <ul style={{ margin: '5px 0 0 20px' }}>
              <li>July 1-7: Company retreat</li>
              <li>July 4: Independence Day</li>
              <li>August 15-20: System maintenance</li>
              <li>December 24-26: Christmas holidays</li>
              <li>December 31 - January 1: New Year</li>
            </ul>
          </div>
          
          <CLACalendar
            settings={createCalendarSettings({
              ...args,
              displayMode: 'embedded',
              selectionMode: 'range',
              showSubmitButton: true,
              showFooter: true,
              onSubmit: handleSubmit,
              restrictionConfigFactory: () => restrictionConfig
            })}
          />
          
          {submittedDates && (
            <div style={{
              marginTop: '20px',
              padding: '10px',
              backgroundColor: '#f0f8ff',
              borderRadius: '4px',
              border: '1px solid #0366d6'
            }}>
              <strong>Selected Date Range:</strong>
              <div>Start: {submittedDates.start || 'Not selected'}</div>
              <div>End: {submittedDates.end || 'Not selected'}</div>
            </div>
          )}
        </div>
      );
    };
    
    return (
      <DiagonalOffsetWrapper args={args}>
        <DateRangeExample />
      </DiagonalOffsetWrapper>
    );
  }
};

// Allowed Ranges Restriction
export const AllowedRangesRestriction: Story = {
  render: (args) => {
    const AllowedRangesExample = () => {
      const [submittedDates, setSubmittedDates] = useState<{start: string | null, end: string | null} | null>(null);
      
      const handleSubmit = (start: string | null, end: string | null) => {
        setSubmittedDates({ start, end });
      };
      
      const restrictionConfig: RestrictionConfig = {
        restrictions: [{
          type: 'allowedranges',
          enabled: true,
          ranges: [
            {
              startDate: '2025-07-01',
              endDate: '2025-07-31',
              message: 'Summer availability'
            },
            {
              startDate: '2025-12-15',
              endDate: '2025-12-31',
              message: 'Winter holiday season'
            },
            {
              startDate: '2025-03-01',
              endDate: '2025-03-15',
              message: 'Spring break period'
            }
          ],
          message: 'Please select dates within the available periods'
        }]
      };
      
      return (
        <div style={{ padding: '20px' }}>
          <h3>Allowed Ranges (Whitelist)</h3>
          <p>Only specific date ranges are available for selection. This is useful for seasonal availability or limited booking windows.</p>
          
          <div style={{
            marginBottom: '20px',
            padding: '10px',
            backgroundColor: '#d4edda',
            borderRadius: '4px',
            border: '1px solid #c3e6cb'
          }}>
            <strong>Available Periods:</strong>
            <ul style={{ margin: '5px 0 0 20px' }}>
              <li>March 1-15: Spring break period</li>
              <li>July 1-31: Summer availability</li>
              <li>December 15-31: Winter holiday season</li>
            </ul>
          </div>
          
          <CLACalendar
            settings={createCalendarSettings({
              ...args,
              displayMode: 'embedded',
              selectionMode: 'range',
              showSubmitButton: true,
              showFooter: true,
              onSubmit: handleSubmit,
              restrictionConfigFactory: () => restrictionConfig
            })}
          />
          
          {submittedDates && (
            <div style={{
              marginTop: '20px',
              padding: '10px',
              backgroundColor: '#f0f8ff',
              borderRadius: '4px',
              border: '1px solid #0366d6'
            }}>
              <strong>Selected Date Range:</strong>
              <div>Start: {submittedDates.start || 'Not selected'}</div>
              <div>End: {submittedDates.end || 'Not selected'}</div>
            </div>
          )}
        </div>
      );
    };
    
    return (
      <DiagonalOffsetWrapper args={args}>
        <AllowedRangesExample />
      </DiagonalOffsetWrapper>
    );
  }
};

// Multiple Restrictions Combined
export const MultipleRestrictionsCombined: Story = {
  render: (args) => {
    const MultipleRestrictionsExample = () => {
      const [submittedDates, setSubmittedDates] = useState<{start: string | null, end: string | null} | null>(null);
      
      const handleSubmit = (start: string | null, end: string | null) => {
        setSubmittedDates({ start, end });
      };
      
      const restrictionConfig: RestrictionConfig = {
        restrictions: [
          {
            type: 'boundary',
            enabled: true,
            date: '2025-07-01',
            direction: 'before',
            message: 'Bookings open July 1st, 2025'
          },
          {
            type: 'boundary',
            enabled: true,
            date: '2025-12-31',
            direction: 'after',
            message: 'Cannot book beyond 2025'
          },
          {
            type: 'weekday',
            enabled: true,
            days: [0, 6],
            message: 'Service not available on weekends'
          },
          {
            type: 'daterange',
            enabled: true,
            ranges: [
              {
                startDate: '2025-07-04',
                endDate: '2025-07-04',
                message: 'Closed for Independence Day'
              },
              {
                startDate: '2025-09-01',
                endDate: '2025-09-01',
                message: 'Closed for Labor Day'
              },
              {
                startDate: '2025-11-27',
                endDate: '2025-11-28',
                message: 'Closed for Thanksgiving'
              },
              {
                startDate: '2025-12-24',
                endDate: '2025-12-26',
                message: 'Closed for Christmas'
              }
            ]
          }
        ]
      };
      
      return (
        <div style={{ padding: '20px' }}>
          <h3>Multiple Restrictions Combined</h3>
          <p>This example combines multiple restriction types to create complex availability rules.</p>
          
          <div style={{
            marginBottom: '20px',
            padding: '10px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            border: '1px solid #dee2e6'
          }}>
            <strong>Active Restrictions:</strong>
            <ul style={{ margin: '5px 0 0 20px' }}>
              <li>Booking window: July 1 - December 31, 2025</li>
              <li>Business days only (no weekends)</li>
              <li>Closed on major holidays</li>
            </ul>
          </div>
          
          <CLACalendar
            settings={createCalendarSettings({
              ...args,
              displayMode: 'embedded',
              selectionMode: 'range',
              showSubmitButton: true,
              showFooter: true,
              onSubmit: handleSubmit,
              restrictionConfigFactory: () => restrictionConfig
            })}
          />
          
          {submittedDates && (
            <div style={{
              marginTop: '20px',
              padding: '10px',
              backgroundColor: '#f0f8ff',
              borderRadius: '4px',
              border: '1px solid #0366d6'
            }}>
              <strong>Selected Date Range:</strong>
              <div>Start: {submittedDates.start || 'Not selected'}</div>
              <div>End: {submittedDates.end || 'Not selected'}</div>
            </div>
          )}
        </div>
      );
    };
    
    return (
      <DiagonalOffsetWrapper args={args}>
        <MultipleRestrictionsExample />
      </DiagonalOffsetWrapper>
    );
  }
};

// Dynamic Restrictions
export const DynamicRestrictions: Story = {
  render: (args) => {
    const DynamicRestrictionsExample = () => {
      const [submittedDates, setSubmittedDates] = useState<{start: string | null, end: string | null} | null>(null);
      const [maxDays, setMaxDays] = useState(30);
      const [blockPastDates, setBlockPastDates] = useState(true);
      const [blockWeekends, setBlockWeekends] = useState(false);
      
      const handleSubmit = (start: string | null, end: string | null) => {
        setSubmittedDates({ start, end });
      };
      
      const getRestrictionConfig = (): RestrictionConfig => {
        const restrictions: RestrictionConfig['restrictions'] = [];
        
        if (blockPastDates) {
          const today = new Date();
          const todayStr = today.toISOString().split('T')[0];
          restrictions.push({
            type: 'boundary',
            enabled: true,
            date: todayStr,
            direction: 'before',
            inclusive: false,
            message: 'Cannot select past dates'
          });
        }
        
        // Max days in future
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + maxDays);
        const maxDateStr = maxDate.toISOString().split('T')[0];
        restrictions.push({
          type: 'boundary',
          enabled: true,
          date: maxDateStr,
          direction: 'after',
          message: `Cannot book more than ${maxDays} days in advance`
        });
        
        if (blockWeekends) {
          restrictions.push({
            type: 'weekday',
            enabled: true,
            days: [0, 6],
            message: 'Weekends are not available'
          });
        }
        
        return { restrictions };
      };
      
      return (
        <div style={{ padding: '20px' }}>
          <h3>Dynamic Restrictions</h3>
          <p>Adjust the settings below to see how restrictions can be dynamically configured.</p>
          
          <div style={{
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            border: '1px solid #dee2e6'
          }}>
            <div style={{ marginBottom: '10px' }}>
              <label>
                Maximum days in advance:{' '}
                <input
                  type="number"
                  min="7"
                  max="365"
                  value={maxDays}
                  onChange={(e) => setMaxDays(parseInt(e.target.value) || 30)}
                  style={{ width: '60px' }}
                />
              </label>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>
                <input
                  type="checkbox"
                  checked={blockPastDates}
                  onChange={(e) => setBlockPastDates(e.target.checked)}
                />
                {' '}Block past dates
              </label>
            </div>
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={blockWeekends}
                  onChange={(e) => setBlockWeekends(e.target.checked)}
                />
                {' '}Block weekends
              </label>
            </div>
          </div>
          
          <CLACalendar
            settings={createCalendarSettings({
              ...args,
              displayMode: 'embedded',
              selectionMode: 'range',
              showSubmitButton: true,
              showFooter: true,
              onSubmit: handleSubmit,
              restrictionConfigFactory: getRestrictionConfig
            })}
          />
          
          {submittedDates && (
            <div style={{
              marginTop: '20px',
              padding: '10px',
              backgroundColor: '#f0f8ff',
              borderRadius: '4px',
              border: '1px solid #0366d6'
            }}>
              <strong>Selected Date Range:</strong>
              <div>Start: {submittedDates.start || 'Not selected'}</div>
              <div>End: {submittedDates.end || 'Not selected'}</div>
            </div>
          )}
        </div>
      );
    };
    
    return (
      <DiagonalOffsetWrapper args={args}>
        <DynamicRestrictionsExample />
      </DiagonalOffsetWrapper>
    );
  }
};

// Business Days Only Pattern
export const BusinessDaysOnly: Story = {
  render: (args) => {
    const BusinessDaysExample = () => {
      const [submittedDates, setSubmittedDates] = useState<{start: string | null, end: string | null} | null>(null);
      
      const handleSubmit = (start: string | null, end: string | null) => {
        setSubmittedDates({ start, end });
      };
      
      // Get current year holidays
      const currentYear = new Date().getFullYear();
      
      const restrictionConfig: RestrictionConfig = {
        restrictions: [
          {
            type: 'weekday',
            enabled: true,
            days: [0, 6], // Block weekends
            message: 'Please select a business day (Monday-Friday)'
          },
          {
            type: 'daterange',
            enabled: true,
            ranges: [
              // US Federal Holidays (observed dates)
              {
                startDate: `${currentYear}-01-01`,
                endDate: `${currentYear}-01-01`,
                message: "New Year's Day"
              },
              {
                startDate: `${currentYear}-01-15`,
                endDate: `${currentYear}-01-15`,
                message: "Martin Luther King Jr. Day"
              },
              {
                startDate: `${currentYear}-02-19`,
                endDate: `${currentYear}-02-19`,
                message: "Presidents' Day"
              },
              {
                startDate: `${currentYear}-05-27`,
                endDate: `${currentYear}-05-27`,
                message: "Memorial Day"
              },
              {
                startDate: `${currentYear}-07-04`,
                endDate: `${currentYear}-07-04`,
                message: "Independence Day"
              },
              {
                startDate: `${currentYear}-09-02`,
                endDate: `${currentYear}-09-02`,
                message: "Labor Day"
              },
              {
                startDate: `${currentYear}-10-14`,
                endDate: `${currentYear}-10-14`,
                message: "Columbus Day"
              },
              {
                startDate: `${currentYear}-11-11`,
                endDate: `${currentYear}-11-11`,
                message: "Veterans Day"
              },
              {
                startDate: `${currentYear}-11-28`,
                endDate: `${currentYear}-11-29`,
                message: "Thanksgiving Holiday"
              },
              {
                startDate: `${currentYear}-12-24`,
                endDate: `${currentYear}-12-25`,
                message: "Christmas Holiday"
              }
            ],
            message: 'Federal holiday - office closed'
          }
        ]
      };
      
      return (
        <div style={{ padding: '20px' }}>
          <h3>Business Days Only</h3>
          <p>Common pattern for business applications: only weekdays are selectable, with federal holidays blocked.</p>
          
          <div style={{
            marginBottom: '20px',
            padding: '10px',
            backgroundColor: '#e3f2fd',
            borderRadius: '4px',
            border: '1px solid #90caf9'
          }}>
            <strong>💼 Business Hours Calendar</strong>
            <div style={{ marginTop: '5px', fontSize: '14px' }}>
              • Open Monday - Friday
              <br />
              • Closed weekends and federal holidays
            </div>
          </div>
          
          <CLACalendar
            settings={createCalendarSettings({
              ...args,
              displayMode: 'embedded',
              selectionMode: 'range',
              showSubmitButton: true,
              showFooter: true,
              onSubmit: handleSubmit,
              restrictionConfigFactory: () => restrictionConfig
            })}
          />
          
          {submittedDates && (
            <div style={{
              marginTop: '20px',
              padding: '10px',
              backgroundColor: '#f0f8ff',
              borderRadius: '4px',
              border: '1px solid #0366d6'
            }}>
              <strong>Selected Business Days:</strong>
              <div>Start: {submittedDates.start || 'Not selected'}</div>
              <div>End: {submittedDates.end || 'Not selected'}</div>
            </div>
          )}
        </div>
      );
    };
    
    return (
      <DiagonalOffsetWrapper args={args}>
        <BusinessDaysExample />
      </DiagonalOffsetWrapper>
    );
  }
};

// Restricted Boundary Example
export const RestrictedBoundaryExample: Story = {
  render: (args) => {
    const RestrictedBoundaryDemo = () => {
      const [submittedDates, setSubmittedDates] = useState<{start: string | null, end: string | null} | null>(null);
      
      const handleSubmit = (start: string | null, end: string | null) => {
        setSubmittedDates({ start, end });
      };
      
      const restrictionConfig: RestrictionConfig = {
        restrictions: [{
          type: 'restricted_boundary',
          enabled: true,
          minDate: '2025-01-01',
          maxDate: '2025-12-31',
          ranges: [
            {
              startDate: '2025-06-01',
              endDate: '2025-08-31',
              restricted: false, // This range is allowed
              message: 'Summer season - Peak availability',
              exceptions: [
                {
                  startDate: '2025-07-04',
                  endDate: '2025-07-04',
                  message: 'Closed for Independence Day'
                },
                {
                  startDate: '2025-08-10',
                  endDate: '2025-08-16',
                  message: 'Annual maintenance week'
                }
              ]
            },
            {
              startDate: '2025-12-15',
              endDate: '2025-12-31',
              restricted: false, // This range is allowed
              message: 'Holiday season availability',
              exceptions: [
                {
                  startDate: '2025-12-24',
                  endDate: '2025-12-26',
                  message: 'Closed for Christmas'
                }
              ]
            }
          ],
          message: 'Outside of operating seasons'
        }]
      };
      
      return (
        <div style={{ padding: '20px' }}>
          <h3>Restricted Boundary with Exceptions</h3>
          <p>Complex availability rules with specific operating seasons and exceptions within those seasons.</p>
          
          <div style={{
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#fff3cd',
            borderRadius: '4px',
            border: '1px solid #ffeaa7'
          }}>
            <strong>🏖️ Seasonal Resort Availability</strong>
            <div style={{ marginTop: '10px', fontSize: '14px' }}>
              <strong>Operating Seasons:</strong>
              <ul style={{ margin: '5px 0 0 20px' }}>
                <li>Summer: June 1 - August 31
                  <ul>
                    <li>Except: July 4 (Holiday)</li>
                    <li>Except: August 10-16 (Maintenance)</li>
                  </ul>
                </li>
                <li>Holiday: December 15-31
                  <ul>
                    <li>Except: December 24-26 (Christmas)</li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
          
          <CLACalendar
            settings={createCalendarSettings({
              ...args,
              displayMode: 'embedded',
              selectionMode: 'range',
              showSubmitButton: true,
              showFooter: true,
              onSubmit: handleSubmit,
              restrictionConfigFactory: () => restrictionConfig
            })}
          />
          
          {submittedDates && (
            <div style={{
              marginTop: '20px',
              padding: '10px',
              backgroundColor: '#f0f8ff',
              borderRadius: '4px',
              border: '1px solid #0366d6'
            }}>
              <strong>Selected Date Range:</strong>
              <div>Start: {submittedDates.start || 'Not selected'}</div>
              <div>End: {submittedDates.end || 'Not selected'}</div>
            </div>
          )}
        </div>
      );
    };
    
    return (
      <DiagonalOffsetWrapper args={args}>
        <RestrictedBoundaryDemo />
      </DiagonalOffsetWrapper>
    );
  }
};

// Month Boundary Restriction
export const MonthBoundaryRestriction: Story = {
  render: (args) => {
    const MonthBoundaryExample = () => {
      const [submittedDates, setSubmittedDates] = useState<{start: string | null, end: string | null} | null>(null);
      
      const handleSubmit = (start: string | null, end: string | null) => {
        setSubmittedDates({ start, end });
      };
      
      // Static configuration that shows month boundaries
      const restrictionConfig: RestrictionConfig = {
        restrictions: [{
          type: 'restricted_boundary',
          enabled: true,
          ranges: [
            {
              startDate: '2025-07-01',
              endDate: '2025-07-31',
              restricted: false,
              message: 'July 2025'
            },
            {
              startDate: '2025-08-01',
              endDate: '2025-08-31',
              restricted: false,
              message: 'August 2025'
            },
            {
              startDate: '2025-09-01',
              endDate: '2025-09-30',
              restricted: false,
              message: 'September 2025'
            },
            {
              startDate: '2025-10-01',
              endDate: '2025-10-31',
              restricted: false,
              message: 'October 2025'
            },
            {
              startDate: '2025-11-01',
              endDate: '2025-11-30',
              restricted: false,
              message: 'November 2025'
            },
            {
              startDate: '2025-12-01',
              endDate: '2025-12-31',
              restricted: false,
              message: 'December 2025'
            }
          ],
          message: 'Selection must stay within the same month'
        }]
      };
      
      return (
        <div style={{ padding: '20px' }}>
          <h3>Month Boundary Restriction</h3>
          <p>
            This example demonstrates the calendar's built-in boundary behavior. When you start a selection 
            within a specific month, you can only continue selecting dates within that same month. Try it:
          </p>
          
          <div style={{
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#e3f2fd',
            borderRadius: '4px',
            border: '1px solid #90caf9'
          }}>
            <strong>🗓️ How Month Boundaries Work:</strong>
            <ol style={{ margin: '10px 0 0 20px', fontSize: '14px' }}>
              <li>Start selecting a date in any month (e.g., July 15)</li>
              <li>As you drag to select more dates, you'll see that you can only select within July</li>
              <li>All dates in other months become grayed out automatically</li>
              <li>This happens because the calendar detects your selection started within a boundary</li>
            </ol>
          </div>
          
          <CLACalendar
            settings={createCalendarSettings({
              ...args,
              displayMode: 'embedded',
              selectionMode: 'range',
              showSubmitButton: true,
              showFooter: true,
              onSubmit: handleSubmit,
              restrictionConfigFactory: () => restrictionConfig
            })}
          />
          
          {submittedDates && (
            <div style={{
              marginTop: '20px',
              padding: '10px',
              backgroundColor: '#f0f8ff',
              borderRadius: '4px',
              border: '1px solid #0366d6'
            }}>
              <strong>Selected Date Range:</strong>
              <div>Start: {submittedDates.start || 'Not selected'}</div>
              <div>End: {submittedDates.end || 'Not selected'}</div>
            </div>
          )}
        </div>
      );
    };
    
    return (
      <DiagonalOffsetWrapper args={args}>
        <MonthBoundaryExample />
      </DiagonalOffsetWrapper>
    );
  }
};

// Single Date Selection with Restrictions
export const SingleDateWithRestrictions: Story = {
  render: (args) => {
    const SingleDateExample = () => {
      const [submittedDate, setSubmittedDate] = useState<string | null>(null);
      
      const handleSubmit = (start: string | null) => {
        setSubmittedDate(start);
      };
      
      const restrictionConfig: RestrictionConfig = {
        restrictions: [
          {
            type: 'weekday',
            enabled: true,
            days: [1, 3, 5], // Block Monday, Wednesday, Friday
            message: 'Available on Tuesday, Thursday, and weekends only'
          },
          {
            type: 'boundary',
            enabled: true,
            date: new Date().toISOString().split('T')[0],
            direction: 'before',
            message: 'Please select a future date'
          }
        ]
      };
      
      return (
        <div style={{ padding: '20px' }}>
          <h3>Single Date Selection with Restrictions</h3>
          <p>Appointment scheduling example: Available only on specific days (Tuesday, Thursday, weekends).</p>
          
          <div style={{
            marginBottom: '20px',
            padding: '10px',
            backgroundColor: '#e8f5e9',
            borderRadius: '4px',
            border: '1px solid #a5d6a7'
          }}>
            <strong>📅 Appointment Availability</strong>
            <div style={{ marginTop: '5px', fontSize: '14px' }}>
              • Tuesday & Thursday: Regular appointments
              <br />
              • Saturday & Sunday: Weekend appointments
              <br />
              • No appointments on Monday, Wednesday, or Friday
            </div>
          </div>
          
          <CLACalendar
            settings={createCalendarSettings({
              ...args,
              displayMode: 'embedded',
              selectionMode: 'single',
              showSubmitButton: true,
              showFooter: true,
              onSubmit: handleSubmit,
              restrictionConfigFactory: () => restrictionConfig
            })}
          />
          
          {submittedDate && (
            <div style={{
              marginTop: '20px',
              padding: '10px',
              backgroundColor: '#f0f8ff',
              borderRadius: '4px',
              border: '1px solid #0366d6'
            }}>
              <strong>Selected Appointment Date:</strong>
              <div>{submittedDate}</div>
            </div>
          )}
        </div>
      );
    };
    
    return (
      <DiagonalOffsetWrapper args={args}>
        <SingleDateExample />
      </DiagonalOffsetWrapper>
    );
  }
};