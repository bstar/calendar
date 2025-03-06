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
  isValid
} from 'date-fns';

// ===== CORE UTILITIES =====

/**
 * Converts a date to UTC, maintaining all components
 * This is useful for normalizing dates from different timezones
 */
export function toUTC(date: Date): Date {
  return new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds()
  ));
}

/**
 * Creates a date object with the specified components in UTC
 */
export function createDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day));
}

/**
 * Gets the current date and time
 */
export function now(): Date {
  return new Date();
}

/**
 * Parses an ISO date string to a Date
 * This is just a passthrough to date-fns parseISO for now
 */
export function parseISO(dateString: string): Date {
  return dateFnsParseISO(dateString);
}

/**
 * Formats a date using the specified format string
 */
export function format(date: Date, formatStr: string): string {
  return dateFnsFormat(date, formatStr);
}

// ===== COMPARISON UTILITIES =====

/**
 * Checks if a date is within an interval (inclusive)
 * This implementation ensures start and end dates are included in the check
 */
export function isWithinInterval(date: Date, interval: { start: Date; end: Date }): boolean {
  // First try the standard date-fns implementation
  try {
    return dateFnsIsWithinInterval(date, interval);
  } catch (e) {
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
    } catch (innerError) {
      // If all else fails, return false rather than breaking the application
      console.error("Error comparing dates:", innerError);
      return false;
    }
  }
}

/**
 * Checks if two dates represent the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return dateFnsIsSameDay(date1, date2);
}

/**
 * Checks if two dates represent the same month and year
 */
export function isSameMonth(date1: Date, date2: Date): boolean {
  return dateFnsIsSameMonth(date1, date2);
}

// ===== CALENDAR UTILITIES =====

/**
 * Gets the start of the month containing the specified date
 */
export function startOfMonth(date: Date): Date {
  return dateFnsStartOfMonth(date);
}

/**
 * Gets the end of the month containing the specified date
 */
export function endOfMonth(date: Date): Date {
  return dateFnsEndOfMonth(date);
}

/**
 * Gets the start of the week containing the specified date
 */
export function startOfWeek(date: Date, options?: { weekStartsOn?: 0|1|2|3|4|5|6 }): Date {
  return dateFnsStartOfWeek(date, options);
}

/**
 * Gets the end of the week containing the specified date
 */
export function endOfWeek(date: Date, options?: { weekStartsOn?: 0|1|2|3|4|5|6 }): Date {
  return dateFnsEndOfWeek(date, options);
}

/**
 * Adds the specified number of days to the date
 */
export function addDays(date: Date, amount: number): Date {
  return dateFnsAddDays(date, amount);
}

/**
 * Adds the specified number of months to the date
 */
export function addMonths(date: Date, amount: number): Date {
  return dateFnsAddMonths(date, amount);
}

/**
 * Gets all days in an interval
 */
export function eachDayOfInterval(interval: { start: Date; end: Date }): Date[] {
  const days: Date[] = [];
  
  // Manual day-by-day iteration to avoid DST issues
  const current = new Date(interval.start);
  const end = new Date(interval.end);
  
  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return days;
}

// For compatibility with existing code
export const isWithinIntervalTZ = isWithinInterval; 