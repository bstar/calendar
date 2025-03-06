import {
  setTimezone,
  parseISO,
  format,
  createDate,
  isSameDay,
  isSameMonth,
  addDays,
  addMonths,
  eachDayOfInterval,
  isWithinInterval,
} from '../DateUtils';

/**
 * Tests for timezone handling in DateUtils
 * 
 * These tests verify:
 * 1. The "day off" bug with different timezones
 * 2. How our timezone-aware functions prevent the issue
 * 3. Consistent behavior across all date operations
 */
describe('Timezone handling in DateUtils', () => {
  // Store original timezone for cleanup
  const originalTimezone = process.env.TZ;
  
  afterEach(() => {
    // Reset timezone setting after each test
    setTimezone('UTC');
    
    // If we modified the process.env.TZ, restore it
    if (originalTimezone) {
      process.env.TZ = originalTimezone;
    } else {
      delete process.env.TZ;
    }
  });

  // ----- TIMEZONE CONFIGURATION TESTS -----
  
  describe('setTimezone', () => {
    it('should set the timezone to UTC by default', () => {
      // This is the default, but let's verify it
      setTimezone('UTC');
      
      // Create a date at midnight in UTC
      const utcMidnight = createDate(2023, 0, 15); // Jan 15, 2023 00:00:00 UTC
      
      // Format it - should be Jan 15
      expect(format(utcMidnight, 'yyyy-MM-dd')).toBe('2023-01-15');
    });
    
    it('should handle "local" timezone by using the system timezone', () => {
      // Mock a specific timezone for consistent testing
      process.env.TZ = 'America/New_York'; // UTC-5
      
      setTimezone('local');
      
      // Create a date - this should use the local timezone handling now
      const date = createDate(2023, 0, 15); // Jan 15, 2023
      
      // Even with a different system timezone, our createDate should still 
      // create a date that formats as Jan 15 in the local timezone
      expect(format(date, 'yyyy-MM-dd')).toBe('2023-01-15');
    });
    
    it('should use the specified timezone when provided', () => {
      setTimezone('America/Los_Angeles'); // UTC-8
      
      // Even with a specific timezone set, our date utilities should
      // be consistent in how they display dates
      const date = createDate(2023, 0, 15); // Jan 15, 2023
      expect(format(date, 'yyyy-MM-dd')).toBe('2023-01-15');
    });
  });

  // ----- DATE PARSING/SERIALIZATION TESTS -----
  
  describe('parseISO and format', () => {
    it('demonstrates the "day off" bug with native JavaScript Date', () => {
      // Set system timezone to something different from UTC 
      process.env.TZ = 'America/New_York'; // UTC-5
      
      // An ISO string representing Jan 15, 2023 at 23:30:00 UTC
      const isoString = '2023-01-15T23:30:00.000Z';
      
      // When parsed directly with new Date() in New York timezone:
      const date = new Date(isoString);
      
      // The DATE PART will be Jan 15 in UTC but Jan 15 18:30:00 in NY
      // This is correct behavior for JS Date, but not what most users expect
      
      // Using native methods, it's Jan 15 (UTC day part)
      expect(date.getUTCDate()).toBe(15);
      
      // But due to timezone offset, it's Jan 15 in local time too
      // If the time were closer to midnight, it could have been Jan 16
      expect(date.getDate()).toBe(15);
    });
    
    it('prevents the "day off" bug when using UTC timezone', () => {
      // Set system timezone to something different from UTC
      process.env.TZ = 'America/New_York'; // UTC-5
      
      // Make sure our utilities use UTC
      setTimezone('UTC');
      
      // An ISO string representing Jan 15, 2023 at 23:30:00 UTC
      const isoString = '2023-01-15T23:30:00.000Z';
      
      // Parse with our timezone-aware method
      const date = parseISO(isoString);
      
      // Using our format method should consistently show Jan 15
      expect(format(date, 'yyyy-MM-dd')).toBe('2023-01-15');
    });
    
    it('demonstrates the "day off" bug with a date near midnight', () => {
      // Set system timezone to something different from UTC 
      process.env.TZ = 'America/New_York'; // UTC-5
      
      // Jan 15, 2023 at 23:59:59 UTC - almost midnight
      const almostMidnightUTC = '2023-01-15T23:59:59.000Z';
      
      // When parsed directly in New York timezone:
      const date = new Date(almostMidnightUTC);
      
      // In UTC, it's Jan 15
      expect(date.getUTCDate()).toBe(15);
      
      // But in New York time, it's Jan 15 18:59:59
      expect(date.getDate()).toBe(15);
      
      // MIDNIGHT TEST
      const midnightUTC = '2023-01-16T00:00:00.000Z';
      const midnightDate = new Date(midnightUTC);
      
      // In UTC, it's Jan 16
      expect(midnightDate.getUTCDate()).toBe(16);
      
      // But in New York time, it's Jan 15 19:00:00
      expect(midnightDate.getDate()).toBe(15);
      
      // THIS IS THE "DAY OFF" BUG
      // The date is displayed as Jan 15 in NY but Jan 16 in UTC!
    });
    
    it('prevents the "day off" bug with dates near midnight', () => {
      // Set system timezone to something different from UTC
      process.env.TZ = 'America/New_York'; // UTC-5
      
      // Our utilities should handle this consistently regardless of timezone
      setTimezone('UTC');
      
      // Jan 15, 2023 at 23:59:59 UTC - almost midnight
      const almostMidnightUTC = '2023-01-15T23:59:59.000Z';
      const parsedAlmostMidnight = parseISO(almostMidnightUTC);
      
      // It should format as Jan 15
      expect(format(parsedAlmostMidnight, 'yyyy-MM-dd')).toBe('2023-01-15');
      
      // MIDNIGHT TEST
      const midnightUTC = '2023-01-16T00:00:00.000Z';
      const parsedMidnight = parseISO(midnightUTC);
      
      // It should format as Jan 16
      expect(format(parsedMidnight, 'yyyy-MM-dd')).toBe('2023-01-16');
    });
  });

  // ----- DATE COMPARISON TESTS -----
  
  describe('date comparison functions', () => {
    it('demonstrates issues with isSameDay across timezones', () => {
      // Set timezone to New York
      process.env.TZ = 'America/New_York'; // UTC-5
      
      // Jan 15, 2023 at 23:30:00 UTC (18:30:00 in NY)
      const date1 = new Date('2023-01-15T23:30:00.000Z');
      
      // Jan 16, 2023 at 00:30:00 UTC (19:30:00 in NY)
      const date2 = new Date('2023-01-16T00:30:00.000Z');
      
      // Using JS Date: In UTC, these are different days
      expect(date1.getUTCDate()).not.toBe(date2.getUTCDate());
      
      // But in New York, they're the same day
      expect(date1.getDate()).toBe(date2.getDate());
    });
    
    it('provides consistent isSameDay comparison with UTC', () => {
      setTimezone('UTC');
      
      // Jan 15, 2023 at 23:30:00 UTC
      const date1 = parseISO('2023-01-15T23:30:00.000Z');
      
      // Jan 16, 2023 at 00:30:00 UTC
      const date2 = parseISO('2023-01-16T00:30:00.000Z');
      
      // Using our function, these should be different days
      expect(isSameDay(date1, date2)).toBe(false);
    });
    
    it('provides consistent isSameMonth comparison with UTC', () => {
      setTimezone('UTC');
      
      // Jan 31, 2023 at 23:30:00 UTC
      const date1 = parseISO('2023-01-31T23:30:00.000Z');
      
      // Feb 1, 2023 at 00:30:00 UTC
      const date2 = parseISO('2023-02-01T00:30:00.000Z');
      
      // Using our function, these should be different months
      expect(isSameMonth(date1, date2)).toBe(false);
    });
    
    it('demonstrates isWithinInterval consistency', () => {
      setTimezone('UTC');
      
      // Interval: Jan 15 to Jan 20
      const start = createDate(2023, 0, 15);
      const end = createDate(2023, 0, 20);
      
      // Date to test: Jan 15 at 23:59:59 UTC
      const testDate = parseISO('2023-01-15T23:59:59.999Z');
      
      // It should be within the interval
      expect(isWithinInterval(testDate, { start, end })).toBe(true);
    });
  });

  // ----- DATE MANIPULATION TESTS -----
  
  describe('date manipulation functions', () => {
    it('addDays should maintain date integrity across timezones', () => {
      setTimezone('UTC');
      
      // Start with Jan 15
      const date = createDate(2023, 0, 15);
      
      // Add 10 days - should be Jan 25
      const newDate = addDays(date, 10);
      expect(format(newDate, 'yyyy-MM-dd')).toBe('2023-01-25');
    });
    
    it('addMonths should maintain date integrity across timezones', () => {
      setTimezone('UTC');
      
      // Start with Jan 15
      const date = createDate(2023, 0, 15);
      
      // Add 3 months - should be Apr 15
      const newDate = addMonths(date, 3);
      expect(format(newDate, 'yyyy-MM-dd')).toBe('2023-04-15');
    });
    
    it('addMonths handles month end edge cases correctly', () => {
      setTimezone('UTC');
      
      // Start with Jan 31
      const jan31 = createDate(2023, 0, 31);
      
      // Add 1 month - should be Feb 28 (2023 is not leap year)
      const feb = addMonths(jan31, 1);
      expect(format(feb, 'yyyy-MM-dd')).toBe('2023-02-28');
    });
    
    it('eachDayOfInterval should return the correct number of days', () => {
      setTimezone('UTC');
      
      // Start with Jan 15
      const start = createDate(2023, 0, 15);
      // End with Jan 20
      const end = createDate(2023, 0, 20);
      
      // Should include both ends, so 6 days
      const days = eachDayOfInterval({ start, end });
      expect(days.length).toBe(6);
      expect(format(days[0], 'yyyy-MM-dd')).toBe('2023-01-15');
      expect(format(days[5], 'yyyy-MM-dd')).toBe('2023-01-20');
    });
  });

  // ----- REAL-WORLD SCENARIOS -----
  
  describe('real-world scenarios', () => {
    it('handles a multi-day selection around month boundaries', () => {
      setTimezone('UTC');
      
      // Simulate a date range selection from Jan 30 to Feb 2
      const startDate = createDate(2023, 0, 30);
      const endDate = createDate(2023, 1, 2);
      
      // Get all days in interval
      const daysInRange = eachDayOfInterval({ start: startDate, end: endDate });
      
      // Should include 4 days: Jan 30, 31, Feb 1, 2
      expect(daysInRange.length).toBe(4);
      
      // First day should be Jan 30
      expect(format(daysInRange[0], 'yyyy-MM-dd')).toBe('2023-01-30');
      
      // Last day should be Feb 2
      expect(format(daysInRange[3], 'yyyy-MM-dd')).toBe('2023-02-02');
    });
    
    it('simulates saving and loading a date selection', () => {
      // User selects a date range in UTC
      setTimezone('UTC');
      
      // Simulate selection: Jan 15-20, 2023
      const startDate = createDate(2023, 0, 15);
      const endDate = createDate(2023, 0, 20);
      
      // Save the dates as ISO strings (as would happen in a real app)
      const savedStart = startDate.toISOString();
      const savedEnd = endDate.toISOString();
      
      // Now user views the data in a different timezone
      setTimezone('America/New_York');
      
      // Load the saved dates
      const loadedStart = parseISO(savedStart);
      const loadedEnd = parseISO(savedEnd);
      
      // Format them - they should still show as Jan 15-20
      expect(format(loadedStart, 'yyyy-MM-dd')).toBe('2023-01-15');
      expect(format(loadedEnd, 'yyyy-MM-dd')).toBe('2023-01-20');
    });
    
    it('handles date near DST changes correctly', () => {
      // March 12, 2023 was the start of DST in the US
      setTimezone('America/New_York');
      
      // March 11, 2023 at 23:30:00 (before DST)
      const beforeDST = parseISO('2023-03-11T23:30:00.000Z');
      
      // March 12, 2023 at 03:30:00 (after DST started)
      const afterDST = parseISO('2023-03-12T03:30:00.000Z');
      
      // Format them - they should be on different days
      expect(format(beforeDST, 'yyyy-MM-dd')).toBe('2023-03-11');
      expect(format(afterDST, 'yyyy-MM-dd')).toBe('2023-03-12');
      
      // They should not be the same day
      expect(isSameDay(beforeDST, afterDST)).toBe(false);
    });
  });
}); 