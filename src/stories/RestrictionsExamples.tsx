import React, { useState, useMemo } from 'react';
import CLACalendar from '../components/CLACalendar';
import { createCalendarSettings } from '../components/CLACalendar.config';
import type { RestrictionConfig } from '../components/CLACalendar.config';

// Shared styles
const submittedDatesStyle = {
  marginTop: '20px',
  padding: '10px',
  backgroundColor: '#f0f8ff',
  borderRadius: '4px',
  border: '1px solid #0366d6'
};

// Memoized restriction configurations
const boundaryRestrictionConfig: RestrictionConfig = {
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

const weekdayRestrictionConfig: RestrictionConfig = {
  restrictions: [{
    type: 'weekday',
    enabled: true,
    days: [0, 6],
    message: 'Weekends are not available for booking'
  }]
};

const dateRangeRestrictionConfig: RestrictionConfig = {
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
        startDate: '2025-08-15',
        endDate: '2025-08-20',
        message: 'System maintenance period'
      },
      {
        startDate: '2025-12-24',
        endDate: '2025-12-26',
        message: 'Christmas holidays'
      }
    ],
    message: 'This period is not available'
  }]
};

const allowedRangesRestrictionConfig: RestrictionConfig = {
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
      }
    ],
    message: 'Please select dates within the available periods'
  }]
};

const businessDaysRestrictionConfig: RestrictionConfig = {
  restrictions: [
    {
      type: 'weekday',
      enabled: true,
      days: [0, 6],
      message: 'Please select a business day (Monday-Friday)'
    },
    {
      type: 'daterange',
      enabled: true,
      ranges: [
        {
          startDate: '2025-07-04',
          endDate: '2025-07-04',
          message: 'Independence Day'
        },
        {
          startDate: '2025-09-01',
          endDate: '2025-09-01',
          message: 'Labor Day'
        },
        {
          startDate: '2025-11-27',
          endDate: '2025-11-28',
          message: 'Thanksgiving Holiday'
        },
        {
          startDate: '2025-12-24',
          endDate: '2025-12-25',
          message: 'Christmas Holiday'
        }
      ],
      message: 'Federal holiday - office closed'
    }
  ]
};

const complexRestrictionConfig: RestrictionConfig = {
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

// Optimized to only include 3 months for better performance
const monthBoundaryRestrictionConfig: RestrictionConfig = {
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
      }
    ],
    message: 'Selection must stay within the same month'
  }]
};

// Base calendar settings
const baseSettings = {
  displayMode: 'embedded' as const,
  selectionMode: 'range' as const,
  visibleMonths: 2,
  monthWidth: 500,
  showSubmitButton: true,
  showFooter: true,
  position: 'bottom-left' as const,
  useDynamicPosition: true,
  showHeader: true,
  showTooltips: true,
  showLayersNavigation: false,
  showDateInputs: true,
  closeOnClickAway: true,
  startWeekOnSunday: false,
  timezone: 'UTC',
  dateRangeSeparator: ' - '
};

export const BoundaryExample: React.FC = () => {
  const [submittedDates, setSubmittedDates] = useState<{start: string | null, end: string | null} | null>(null);
  
  const handleSubmit = (start: string | null, end: string | null) => {
    setSubmittedDates({ start, end });
  };
  
  const settings = useMemo(() => createCalendarSettings({
    ...baseSettings,
    onSubmit: handleSubmit,
    restrictionConfigFactory: () => boundaryRestrictionConfig
  }), []);
  
  return (
    <div style={{ padding: '20px' }}>
      <CLACalendar settings={settings} />
      
      {submittedDates && (
        <div style={submittedDatesStyle}>
          <strong>Selected Date Range:</strong>
          <div>Start: {submittedDates.start || 'Not selected'}</div>
          <div>End: {submittedDates.end || 'Not selected'}</div>
        </div>
      )}
    </div>
  );
};

export const WeekdayExample: React.FC = () => {
  const [submittedDates, setSubmittedDates] = useState<{start: string | null, end: string | null} | null>(null);
  
  const handleSubmit = (start: string | null, end: string | null) => {
    setSubmittedDates({ start, end });
  };
  
  const settings = useMemo(() => createCalendarSettings({
    ...baseSettings,
    onSubmit: handleSubmit,
    restrictionConfigFactory: () => weekdayRestrictionConfig
  }), []);
  
  return (
    <div style={{ padding: '20px' }}>
      <CLACalendar settings={settings} />
      
      {submittedDates && (
        <div style={submittedDatesStyle}>
          <strong>Selected Date Range:</strong>
          <div>Start: {submittedDates.start || 'Not selected'}</div>
          <div>End: {submittedDates.end || 'Not selected'}</div>
        </div>
      )}
    </div>
  );
};

export const DateRangeExample: React.FC = () => {
  const [submittedDates, setSubmittedDates] = useState<{start: string | null, end: string | null} | null>(null);
  
  const handleSubmit = (start: string | null, end: string | null) => {
    setSubmittedDates({ start, end });
  };
  
  const settings = useMemo(() => createCalendarSettings({
    ...baseSettings,
    onSubmit: handleSubmit,
    restrictionConfigFactory: () => dateRangeRestrictionConfig
  }), []);
  
  return (
    <div style={{ padding: '20px' }}>
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
          <li>August 15-20: System maintenance</li>
          <li>December 24-26: Christmas holidays</li>
        </ul>
      </div>
      
      <CLACalendar settings={settings} />
      
      {submittedDates && (
        <div style={submittedDatesStyle}>
          <strong>Selected Date Range:</strong>
          <div>Start: {submittedDates.start || 'Not selected'}</div>
          <div>End: {submittedDates.end || 'Not selected'}</div>
        </div>
      )}
    </div>
  );
};

export const AllowedRangesExample: React.FC = () => {
  const [submittedDates, setSubmittedDates] = useState<{start: string | null, end: string | null} | null>(null);
  
  const handleSubmit = (start: string | null, end: string | null) => {
    setSubmittedDates({ start, end });
  };
  
  const settings = useMemo(() => createCalendarSettings({
    ...baseSettings,
    onSubmit: handleSubmit,
    restrictionConfigFactory: () => allowedRangesRestrictionConfig
  }), []);
  
  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        marginBottom: '20px',
        padding: '10px',
        backgroundColor: '#d4edda',
        borderRadius: '4px',
        border: '1px solid #c3e6cb'
      }}>
        <strong>Available Periods:</strong>
        <ul style={{ margin: '5px 0 0 20px' }}>
          <li>July 1-31: Summer availability</li>
          <li>December 15-31: Winter holiday season</li>
        </ul>
      </div>
      
      <CLACalendar settings={settings} />
      
      {submittedDates && (
        <div style={submittedDatesStyle}>
          <strong>Selected Date Range:</strong>
          <div>Start: {submittedDates.start || 'Not selected'}</div>
          <div>End: {submittedDates.end || 'Not selected'}</div>
        </div>
      )}
    </div>
  );
};

export const BusinessDaysExample: React.FC = () => {
  const [submittedDates, setSubmittedDates] = useState<{start: string | null, end: string | null} | null>(null);
  
  const handleSubmit = (start: string | null, end: string | null) => {
    setSubmittedDates({ start, end });
  };
  
  const settings = useMemo(() => createCalendarSettings({
    ...baseSettings,
    onSubmit: handleSubmit,
    restrictionConfigFactory: () => businessDaysRestrictionConfig
  }), []);
  
  return (
    <div style={{ padding: '20px' }}>
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
      
      <CLACalendar settings={settings} />
      
      {submittedDates && (
        <div style={submittedDatesStyle}>
          <strong>Selected Business Days:</strong>
          <div>Start: {submittedDates.start || 'Not selected'}</div>
          <div>End: {submittedDates.end || 'Not selected'}</div>
        </div>
      )}
    </div>
  );
};

export const ComplexExample: React.FC = () => {
  const [submittedDates, setSubmittedDates] = useState<{start: string | null, end: string | null} | null>(null);
  
  const handleSubmit = (start: string | null, end: string | null) => {
    setSubmittedDates({ start, end });
  };
  
  const settings = useMemo(() => createCalendarSettings({
    ...baseSettings,
    onSubmit: handleSubmit,
    restrictionConfigFactory: () => complexRestrictionConfig
  }), []);
  
  return (
    <div style={{ padding: '20px' }}>
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
      
      <CLACalendar settings={settings} />
      
      {submittedDates && (
        <div style={submittedDatesStyle}>
          <strong>Selected Date Range:</strong>
          <div>Start: {submittedDates.start || 'Not selected'}</div>
          <div>End: {submittedDates.end || 'Not selected'}</div>
        </div>
      )}
    </div>
  );
};

export const MonthBoundaryExample: React.FC = () => {
  const [submittedDates, setSubmittedDates] = useState<{start: string | null, end: string | null} | null>(null);
  
  const handleSubmit = (start: string | null, end: string | null) => {
    setSubmittedDates({ start, end });
  };
  
  const settings = useMemo(() => createCalendarSettings({
    ...baseSettings,
    onSubmit: handleSubmit,
    restrictionConfigFactory: () => monthBoundaryRestrictionConfig
  }), []);
  
  return (
    <div style={{ padding: '20px' }}>
      <p style={{ marginBottom: '20px', fontSize: '16px' }}>
        📅 Try selecting a date range. Notice how the calendar automatically restricts your selection to stay within the month where you started.
        <br />
        <small style={{ color: '#666' }}>(Showing July-September 2025 for demonstration)</small>
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
        <div style={{ marginTop: '10px', fontSize: '14px', fontStyle: 'italic' }}>
          💡 This is useful for billing periods, monthly reports, or any scenario where selections should not cross month boundaries.
        </div>
      </div>
      
      <CLACalendar settings={settings} />
      
      {submittedDates && (
        <div style={submittedDatesStyle}>
          <strong>Selected Date Range:</strong>
          <div>Start: {submittedDates.start || 'Not selected'}</div>
          <div>End: {submittedDates.end || 'Not selected'}</div>
          <div style={{ marginTop: '5px', fontSize: '14px', color: '#0366d6' }}>
            ✓ Notice how the selection was constrained to a single month
          </div>
        </div>
      )}
    </div>
  );
};

export const SingleDateExample: React.FC = () => {
  const [submittedDate, setSubmittedDate] = useState<string | null>(null);
  
  const handleSubmit = (start: string | null) => {
    setSubmittedDate(start);
  };
  
  // Memoize the restriction config that uses current date
  const restrictionConfig = useMemo(() => ({
    restrictions: [
      {
        type: 'weekday',
        enabled: true,
        days: [1, 3, 5],
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
  }), []);
  
  const settings = useMemo(() => createCalendarSettings({
    ...baseSettings,
    selectionMode: 'single',
    onSubmit: handleSubmit,
    restrictionConfigFactory: () => restrictionConfig
  }), [restrictionConfig]);
  
  return (
    <div style={{ padding: '20px' }}>
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
      
      <CLACalendar settings={settings} />
      
      {submittedDate && (
        <div style={submittedDatesStyle}>
          <strong>Selected Appointment Date:</strong>
          <div>{submittedDate}</div>
        </div>
      )}
    </div>
  );
};