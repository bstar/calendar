import { RestrictionConfig } from '../CLACalendar.types';

export const weekdayRestriction: RestrictionConfig = {
  restrictions: [
    {
      type: 'weekday',
      enabled: true,
      days: [0, 6], // Sunday and Saturday
      message: 'Weekend bookings are not available. Please select a weekday.',
    },
  ],
};

export const dateRangeRestriction: RestrictionConfig = {
  restrictions: [
    {
      type: 'daterange',
      enabled: true,
      ranges: [
        {
          startDate: '2024-02-10',
          endDate: '2024-02-14',
          message: "Valentine's week - Fully booked",
        },
        {
          startDate: '2024-02-19',
          endDate: '2024-02-21',
          message: "President's Day holiday period",
        },
        {
          startDate: '2024-03-01',
          endDate: '2024-03-03',
          message: 'Annual conference - Team unavailable',
        },
      ],
    },
  ],
};

export const boundaryRestriction: RestrictionConfig = {
  restrictions: [
    {
      type: 'boundary',
      enabled: true,
      direction: 'before',
      date: '2024-01-10',
      inclusive: false,
      message: 'Cannot select dates before January 10, 2024',
    },
    {
      type: 'boundary',
      enabled: true,
      direction: 'after',
      date: '2024-02-28',
      inclusive: true,
      message: 'Cannot select dates after February 28, 2024',
    },
  ],
};

export const combinedRestrictions: RestrictionConfig = {
  restrictions: [
    // Block weekends
    {
      type: 'weekday',
      enabled: true,
      days: [0, 6],
      message: 'Weekends are not available for booking',
    },
    // Block specific date ranges
    {
      type: 'daterange',
      enabled: true,
      ranges: [
        {
          startDate: '2024-02-14',
          endDate: '2024-02-14',
          message: "Valentine's Day - Fully booked",
        },
        {
          startDate: '2024-02-19',
          endDate: '2024-02-19',
          message: "President's Day - Office closed",
        },
      ],
    },
    // Set booking window
    {
      type: 'boundary',
      enabled: true,
      direction: 'before',
      date: '2024-02-01',
      inclusive: true,
      message: 'Cannot book before February 1st',
    },
    {
      type: 'boundary',
      enabled: true,
      direction: 'after',
      date: '2024-03-31',
      inclusive: true,
      message: 'Cannot book after March 31st',
    },
  ],
};

export const allowedRangesRestriction: RestrictionConfig = {
  restrictions: [
    {
      type: 'allowedranges',
      enabled: true,
      ranges: [
        {
          startDate: '2024-01-15',
          endDate: '2024-01-19',
          message: 'Week 3 - Available for booking',
        },
        {
          startDate: '2024-01-29',
          endDate: '2024-02-02',
          message: 'Week 5 - Available for booking',
        },
        {
          startDate: '2024-02-12',
          endDate: '2024-02-16',
          message: 'Week 7 - Available for booking',
        },
      ],
      message: 'Please select from available weeks only',
    },
  ],
};

export const restrictedBoundaryRestriction: RestrictionConfig = {
  restrictions: [
    {
      type: 'restricted_boundary',
      enabled: true,
      minDate: '2024-01-01',
      maxDate: '2024-03-31',
      ranges: [
        {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          message: 'January - Limited availability',
          restricted: true,
          exceptions: [
            {
              startDate: '2024-01-15',
              endDate: '2024-01-19',
              message: 'MLK week - Special availability',
            },
          ],
        },
        {
          startDate: '2024-03-01',
          endDate: '2024-03-31',
          message: 'March - Conference season',
          restricted: true,
          exceptions: [
            {
              startDate: '2024-03-11',
              endDate: '2024-03-15',
              message: 'Mid-March opening',
            },
          ],
        },
      ],
      message: 'Complex availability rules apply',
    },
  ],
};

// Dynamic restriction factories
export const createBusinessHoursRestriction = (): RestrictionConfig => ({
  restrictions: [
    {
      type: 'weekday',
      enabled: true,
      days: [0, 6],
      message: 'Business hours: Monday-Friday only',
    },
  ],
});

export const createMaintenanceRestriction = (): RestrictionConfig => ({
  restrictions: [
    {
      type: 'daterange',
      enabled: true,
      ranges: [
        {
          startDate: '2024-01-15',
          endDate: '2024-01-17',
          message: 'Scheduled maintenance window',
        },
        {
          startDate: '2024-02-01',
          endDate: '2024-02-03',
          message: 'System upgrade period',
        },
      ],
    },
  ],
});

export const createCustomRestriction = (): RestrictionConfig => ({
  restrictions: [
    {
      type: 'weekday',
      enabled: true,
      days: [3], // Wednesday
      message: 'Wednesdays reserved for team meetings',
    },
    {
      type: 'boundary',
      enabled: true,
      direction: 'after',
      date: '2024-02-15',
      inclusive: false,
      message: 'Bookings only available until Feb 15',
    },
  ],
});