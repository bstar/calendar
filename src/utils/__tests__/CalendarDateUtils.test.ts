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
 * Tests for calendar-specific timezone handling
 * 
 * These tests focus on real-world calendar scenarios
 * where the "day off" bug can affect date selection and display.
 */
describe('Calendar Range Selection with Timezone Handling', () => {
  const originalTimezone = process.env.TZ;
  
  afterEach(() => {
    // Reset timezone setting after each test
    setTimezone('UTC');
    
    // Restore original timezone
    if (originalTimezone) {
      process.env.TZ = originalTimezone;
    } else {
      delete process.env.TZ;
    }
  });

  /**
   * This simulates what happens in a calendar when:
   * 1. A user in Tokyo selects Jan 15-20
   * 2. The dates are stored in the database as ISO strings
   * 3. A user in New York views the same selection
   * 
   * Without proper timezone handling, the days might shift,
   * especially if selections are near midnight in UTC.
   */
  describe('Cross-timezone range selection', () => {
    it('demonstrates the problem with naive parsing of date ranges', () => {
      // User in Tokyo (UTC+9) selects a date range
      process.env.TZ = 'Asia/Tokyo';
      
      // Late evening on Jan 15 in Tokyo
      // This will be early morning Jan 15 in UTC
      // And still Jan 14 evening in New York
      const tokyoStartDate = new Date(2023, 0, 15, 22, 0); // Jan 15, 10 PM Tokyo time
      
      // Late evening on Jan 20 in Tokyo
      const tokyoEndDate = new Date(2023, 0, 20, 22, 0); // Jan 20, 10 PM Tokyo time
      
      // These get serialized to database as ISO strings
      const startISO = tokyoStartDate.toISOString();
      const endISO = tokyoEndDate.toISOString();
      
      // PROBLEM: When viewed in New York (UTC-5)
      process.env.TZ = 'America/New_York';
      
      // Parse with standard JavaScript Date
      const nyStartDate = new Date(startISO);
      const nyEndDate = new Date(endISO);
      
      // Check the day parts in New York local time
      const nyStartDay = nyStartDate.getDate();
      const nyEndDay = nyEndDate.getDate();
      
      // Get the day parts from the original Tokyo dates
      // when viewed through the lens of UTC (to compare)
      const tokyoStartDayInUTC = new Date(startISO).getUTCDate();
      const tokyoEndDayInUTC = new Date(endISO).getUTCDate();
      
      // This tests whether the "day off" bug has affected our date
      // If Tokyo date was selected on Jan 15, but when viewed in NY it's Jan 14,
      // then we have a day-off problem
      expect(nyStartDay).not.toBe(tokyoStartDayInUTC);
      expect(nyEndDay).not.toBe(tokyoEndDayInUTC);
      
      // This proves the day selection has changed - the bug!
      // What was selected as "Jan 15-20" in Tokyo
      // Appears as "Jan 14-19" in New York
      
      console.log('Tokyo start date (local):', tokyoStartDate.toDateString());
      console.log('New York start date (local):', nyStartDate.toDateString());
    });
    
    it('solves the problem with our timezone-aware functions', () => {
      // Same scenario as above
      // User in Tokyo (UTC+9) selects a date range
      process.env.TZ = 'Asia/Tokyo';
      setTimezone('UTC'); // Use UTC for storage
      
      // Late evening on Jan 15 in Tokyo
      const tokyoStartDate = createDate(2023, 0, 15); // Jan 15 UTC
      const tokyoEndDate = createDate(2023, 0, 20); // Jan 20 UTC
      
      // These get serialized to database as ISO strings
      const startISO = tokyoStartDate.toISOString();
      const endISO = tokyoEndDate.toISOString();
      
      // When viewed in New York (UTC-5)
      process.env.TZ = 'America/New_York';
      setTimezone('UTC'); // Still using UTC for consistency
      
      // Parse with our timezone-aware functions
      const nyStartDate = parseISO(startISO);
      const nyEndDate = parseISO(endISO);
      
      // Format them with our functions to see the day parts
      const nyStartFormatted = format(nyStartDate, 'yyyy-MM-dd');
      const nyEndFormatted = format(nyEndDate, 'yyyy-MM-dd');
      
      // Format the original Tokyo dates for comparison
      const tokyoStartFormatted = format(tokyoStartDate, 'yyyy-MM-dd');
      const tokyoEndFormatted = format(tokyoEndDate, 'yyyy-MM-dd');
      
      // The dates should be the same when formatted!
      expect(nyStartFormatted).toBe(tokyoStartFormatted);
      expect(nyEndFormatted).toBe(tokyoEndFormatted);
      
      // This proves our solution fixes the day-off bug
      // What was selected as "Jan 15-20" in Tokyo
      // Still appears as "Jan 15-20" in New York
    });
  });
  
  /**
   * Test calendar view generation - a common calendar component task
   * that can be affected by timezone issues when generating day grids.
   */
  describe('Calendar month view generation', () => {
    it('demonstrates the problem with native Date when generating month grid', () => {
      // Testing with New York timezone
      process.env.TZ = 'America/New_York'; // UTC-5
      
      // Let's say we want to show February 2023
      const baseDate = new Date(2023, 1, 1); // Feb 1, 2023
      
      // Naive approach: get start of month and end of month
      const naiveStartOfMonth = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
      const naiveEndOfMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
      
      // Then, we'd get start of week containing the first day
      // For simplicity, assume week starts on Sunday (0)
      const startDay = naiveStartOfMonth.getDay(); // Day of week (0-6)
      
      // Calculate the date of the first cell in the grid
      // We go back to include the days from previous month
      const naiveFirstCell = new Date(naiveStartOfMonth);
      naiveFirstCell.setDate(naiveFirstCell.getDate() - startDay);
      
      // If we save this date and then view it in a different timezone,
      // the calendar grid might have different starting dates
      const naiveFirstCellISO = naiveFirstCell.toISOString();
      
      // Now, let's look at this in a different timezone (e.g., Tokyo)
      process.env.TZ = 'Asia/Tokyo'; // UTC+9
      
      // Parse the first cell date in Tokyo timezone
      const tokyoFirstCell = new Date(naiveFirstCellISO);
      
      // Due to the timezone difference, the day could be different
      // This could lead to the calendar grid not aligning correctly
      if (naiveFirstCell.getDate() !== tokyoFirstCell.getDate()) {
        console.log("Misaligned calendar grid detected!");
        console.log("New York first cell:", naiveFirstCell.toDateString());
        console.log("Tokyo first cell:", tokyoFirstCell.toDateString());
      }
      
      // This test could be flaky depending on the specific dates chosen,
      // but it illustrates the potential problem
    });
    
    it('solves the problem with our timezone-aware functions', () => {
      // Testing with different timezones
      setTimezone('UTC'); // Use UTC as our baseline
      
      // Let's say we want to show February 2023
      const baseDate = createDate(2023, 1, 1); // Feb 1, 2023
      
      // Get start of month using our function
      const startOfMonthDate = startOfMonth(baseDate); 
      
      // Get the day of week for the first day (0-6)
      // Need to implement a getDay equivalent or use the native one carefully
      const startDay = new Date(startOfMonthDate).getUTCDay();
      
      // Calculate the first cell - go back by the appropriate number of days
      const firstCell = addDays(startOfMonthDate, -startDay);
      
      // Save the ISO string
      const firstCellISO = firstCell.toISOString();
      
      // Now test with a different timezone
      setTimezone('America/New_York');
      
      // Parse the first cell date with our timezone-aware function
      const nyFirstCell = parseISO(firstCellISO);
      
      // Format both dates to compare just the date parts
      const originalFormatted = format(firstCell, 'yyyy-MM-dd');
      const nyFormatted = format(nyFirstCell, 'yyyy-MM-dd');
      
      // They should be the same date when formatted
      expect(originalFormatted).toBe(nyFormatted);
    });
  });
  
  /**
   * Test the specific issue with ranges that span over a month boundary
   * and have days at the edges of the months.
   */
  describe('Month-spanning range selection', () => {
    it('handles selection crossing month boundaries consistently', () => {
      setTimezone('UTC');
      
      // Create a range from Jan 30 to Feb 3
      const startDate = createDate(2023, 0, 30); // Jan 30
      const endDate = createDate(2023, 1, 3);    // Feb 3
      
      // Get all days in the range
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      
      // Should include 5 days: Jan 30, 31, Feb 1, 2, 3
      expect(days.length).toBe(5);
      
      // Verify each day in the range
      const expectedDates = [
        '2023-01-30', '2023-01-31', 
        '2023-02-01', '2023-02-02', '2023-02-03'
      ];
      
      days.forEach((day, index) => {
        expect(format(day, 'yyyy-MM-dd')).toBe(expectedDates[index]);
      });
      
      // Now let's test the same range but parsed in New York timezone
      setTimezone('America/New_York');
      
      // Convert the dates to ISO strings (as if stored in a database)
      const startISO = startDate.toISOString();
      const endISO = endDate.toISOString();
      
      // Parse with our timezone-aware function
      const nyStartDate = parseISO(startISO);
      const nyEndDate = parseISO(endISO);
      
      // Get all days in the range with NY timezone
      const nyDays = eachDayOfInterval({ start: nyStartDate, end: nyEndDate });
      
      // Should still have 5 days
      expect(nyDays.length).toBe(5);
      
      // Verify each day is still the same in the NY timezone
      nyDays.forEach((day, index) => {
        expect(format(day, 'yyyy-MM-dd')).toBe(expectedDates[index]);
      });
    });
  });
});

/**
 * Simplified implementation of startOfMonth for the test
 * In a real application, this would be imported from DateUtils
 */
function startOfMonth(date: Date): Date {
  // Create a new date with the same year and month, but set day to 1
  return createDate(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    1
  );
} 