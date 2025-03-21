import {
  parseISO as dateFnsParseISO,
  isWithinInterval as dateFnsIsWithinInterval,
  format as dateFnsFormat,
  isSameDay as dateFnsIsSameDay,
  isSameMonth as dateFnsIsSameMonth,
  startOfMonth as dateFnsStartOfMonth,
  endOfMonth as dateFnsEndOfMonth,
  startOfWeek as dateFnsStartOfWeek,
  endOfWeek as dateFnsEndOfWeek,
  addDays as dateFnsAddDays,
  addMonths as dateFnsAddMonths,
  isValid as _isValid
} from 'date-fns';

// Default timezone
export const DEFAULT_TIMEZONE = 'UTC';

// ===== CORE UTILITIES =====

/**
 * Converts a date to UTC, maintaining all components
 * This is useful for normalizing dates from different timezones
 */
export const toUTC = (date: Date): Date => {
  return new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds()
  ));
};

/**
 * Creates a date object with the specified components in UTC
 */
export const createDate = (year: number, month: number, day: number): Date => {
  return new Date(Date.UTC(year, month, day));
};

/**
 * Creates a date object with the specified components in UTC
 * Alias for createDate for explicit UTC naming
 */
export const createUTCDate = (year: number, month: number, day: number): Date => {
  return createDate(year, month, day);
};

/**
 * Gets the current date and time
 */
export const now = (): Date => {
  return new Date();
};

/**
 * Gets the current date and time in UTC
 */
export const nowUTC = (): Date => {
  const now = new Date();
  return toUTC(now);
};

/**
 * Parses an ISO date string to a Date
 */
export const parseISO = (dateString: string): Date => {
  return dateFnsParseISO(dateString);
};

/**
 * Parses an ISO date string to a UTC Date
 */
export const parseISOUTC = (dateString: string): Date => {
  const parsed = dateFnsParseISO(dateString);
  return toUTC(parsed);
};

/**
 * Formats a date using the specified format string
 */
export const format = (date: Date, formatStr: string): string => {
  return dateFnsFormat(date, formatStr);
};

/**
 * Formats a UTC date using the specified format string
 */
export const formatUTC = (date: Date, formatStr: string): string => {
  // Create a copy with UTC methods to avoid modifying the original date
  const utcDate = toUTC(date);
  return dateFnsFormat(utcDate, formatStr);
};

// ===== COMPARISON UTILITIES =====

/**
 * Checks if a date is within an interval (inclusive)
 * This implementation ensures start and end dates are included in the check
 */
export const isWithinInterval = (date: Date, interval: { start: Date; end: Date }): boolean => {
  try {
    return dateFnsIsWithinInterval(date, interval);
  } catch {
    // If something goes wrong (like invalid dates), we'll handle it more carefully
    // Extract year/month/day for clean comparison
    try {
      // Create "clean" date objects with just the date part, no time
      const cleanDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );

      const cleanStart = new Date(
        interval.start.getFullYear(),
        interval.start.getMonth(),
        interval.start.getDate()
      );

      const cleanEnd = new Date(
        interval.end.getFullYear(),
        interval.end.getMonth(),
        interval.end.getDate()
      );

      // Compare only the date portion, ensuring the end date is fully inclusive
      return cleanDate >= cleanStart && cleanDate <= cleanEnd;
    } catch {
      // If all else fails, return false rather than breaking the application
      return false;
    }
  }
};

/**
 * Checks if a date is within an interval using UTC components (inclusive)
 * This ensures consistent results regardless of the local timezone
 */
export const isWithinIntervalUTC = (date: Date, interval: { start: Date; end: Date }): boolean => {
  try {
    // Use UTC methods to ensure timezone consistency
    const cleanDate = createUTCDate(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate()
    );

    const cleanStart = createUTCDate(
      interval.start.getUTCFullYear(),
      interval.start.getUTCMonth(),
      interval.start.getUTCDate()
    );

    const cleanEnd = createUTCDate(
      interval.end.getUTCFullYear(),
      interval.end.getUTCMonth(),
      interval.end.getUTCDate()
    );

    // Compare only the date portion, ensuring the end date is fully inclusive
    return cleanDate >= cleanStart && cleanDate <= cleanEnd;
  } catch {
    return false;
  }
};

/**
 * Checks if two dates represent the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return dateFnsIsSameDay(date1, date2);
};

/**
 * Checks if two dates represent the same day in UTC
 */
export const isSameDayUTC = (date1: Date, date2: Date): boolean => {
  return date1.getUTCFullYear() === date2.getUTCFullYear() &&
    date1.getUTCMonth() === date2.getUTCMonth() &&
    date1.getUTCDate() === date2.getUTCDate();
};

/**
 * Checks if two dates represent the same month and year
 */
export const isSameMonth = (date1: Date, date2: Date): boolean => {
  return dateFnsIsSameMonth(date1, date2);
};

/**
 * Checks if two dates represent the same month and year in UTC
 */
export const isSameMonthUTC = (date1: Date, date2: Date): boolean => {
  return date1.getUTCFullYear() === date2.getUTCFullYear() &&
    date1.getUTCMonth() === date2.getUTCMonth();
};

// ===== CALENDAR UTILITIES =====

/**
 * Gets the start of the month containing the specified date
 */
export const startOfMonth = (date: Date): Date => {
  return dateFnsStartOfMonth(date);
};

/**
 * Gets the start of the month containing the specified date in UTC
 */
export const startOfMonthUTC = (date: Date): Date => {
  return createUTCDate(date.getUTCFullYear(), date.getUTCMonth(), 1);
};

/**
 * Gets the end of the month containing the specified date
 */
export const endOfMonth = (date: Date): Date => {
  return dateFnsEndOfMonth(date);
};

/**
 * Gets the end of the month containing the specified date in UTC
 */
export const endOfMonthUTC = (date: Date): Date => {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();

  // Get the last day of the month (day 0 of next month)
  const nextMonthYear = month === 11 ? year + 1 : year;
  const nextMonth = month === 11 ? 0 : month + 1;

  return createUTCDate(nextMonthYear, nextMonth, 0);
};

/**
 * Gets the start of the week containing the specified date
 */
export const startOfWeek = (date: Date, options?: { weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6 }): Date => {
  return dateFnsStartOfWeek(date, options);
};

/**
 * Gets the start of the week containing the specified date in UTC
 */
export const startOfWeekUTC = (date: Date, options?: { weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6 }): Date => {
  const weekStartsOn = options?.weekStartsOn ?? 0;
  const dayOfWeek = date.getUTCDay();
  const diff = (dayOfWeek < weekStartsOn ? 7 : 0) + dayOfWeek - weekStartsOn;

  return createUTCDate(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate() - diff
  );
};

/**
 * Gets the end of the week containing the specified date
 */
export const endOfWeek = (date: Date, options?: { weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6 }): Date => {
  return dateFnsEndOfWeek(date, options);
};

/**
 * Gets the end of the week containing the specified date in UTC
 */
export const endOfWeekUTC = (date: Date, options?: { weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6 }): Date => {
  const start = startOfWeekUTC(date, options);
  return createUTCDate(
    start.getUTCFullYear(),
    start.getUTCMonth(),
    start.getUTCDate() + 6
  );
};

/**
 * Adds the specified number of days to the date
 */
export const addDays = (date: Date, amount: number): Date => {
  return dateFnsAddDays(date, amount);
};

/**
 * Adds the specified number of days to the date in UTC
 */
export const addDaysUTC = (date: Date, amount: number): Date => {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + amount);
  return result;
};

/**
 * Adds the specified number of months to the date
 */
export const addMonths = (date: Date, amount: number): Date => {
  return dateFnsAddMonths(date, amount);
};

/**
 * Adds the specified number of months to the date in UTC
 */
export const addMonthsUTC = (date: Date, amount: number): Date => {
  // First create a new date with the same UTC components
  const result = new Date(date.getTime());

  // Get current UTC components
  const year = result.getUTCFullYear();
  const month = result.getUTCMonth();
  const day = result.getUTCDate();

  // Calculate new month and year
  const newMonth = month + amount;
  const yearDelta = Math.floor(newMonth / 12);
  const adjustedMonth = ((newMonth % 12) + 12) % 12; // Ensure it's 0-11

  // Set new date - using UTC methods
  result.setUTCFullYear(year + yearDelta);
  result.setUTCMonth(adjustedMonth);

  // Handle potential issues with month boundaries (e.g., Jan 31 + 1 month)
  // If the day got changed (e.g., Jan 31 -> Feb 28), set it to the last day of the target month
  if (result.getUTCDate() !== day) {
    // Go back to the last day of the previous month
    result.setUTCDate(0);
  }

  return result;
};

/**
 * Gets all days in an interval
 */
export const eachDayOfInterval = (interval: { start: Date; end: Date }): Date[] => {
  const days: Date[] = [];

  // Manual day-by-day iteration to avoid DST issues
  const current = new Date(interval.start);
  const end = new Date(interval.end);

  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
};

/**
 * Gets all days in an interval in UTC
 */
export const eachDayOfIntervalUTC = (interval: { start: Date; end: Date }): Date[] => {
  const days: Date[] = [];

  // Create clean dates for consistent UTC iteration
  const startDate = createUTCDate(
    interval.start.getUTCFullYear(),
    interval.start.getUTCMonth(),
    interval.start.getUTCDate()
  );

  const endDate = createUTCDate(
    interval.end.getUTCFullYear(),
    interval.end.getUTCMonth(),
    interval.end.getUTCDate()
  );

  // Manual day-by-day iteration using UTC methods to avoid DST issues
  const current = new Date(startDate);
  while (current <= endDate) {
    days.push(new Date(current));
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return days;
};

// For compatibility with existing code
export const isWithinIntervalTZ = isWithinIntervalUTC; 