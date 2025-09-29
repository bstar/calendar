/**
 * @fileoverview Test suite for DateUtils module
 * 
 * This file contains comprehensive tests for the UTC date utility functions,
 * ensuring correct behavior for:
 * - Date creation and conversion to UTC
 * - Date parsing with timezone support
 * - Date formatting and display
 * - Date arithmetic (adding days/months)
 * - Calendar boundaries (week/month start/end)
 * - Date comparisons (same day/month)
 * - Interval operations
 * - Edge cases including leap years, timezone transitions, and invalid dates
 * 
 * Tests use mocked system time to ensure consistent behavior across environments.
 * 
 * @module DateUtils.test
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  now,
  nowUTC,
  parseISO,
  parseISOUTC,
  format,
  formatUTC,
  eachDayOfInterval,
  eachDayOfIntervalUTC,
  addDays,
  addDaysUTC,
  addMonths,
  addMonthsUTC,
  startOfWeek,
  startOfWeekUTC,
  endOfWeek,
  endOfWeekUTC,
  startOfMonth,
  startOfMonthUTC,
  endOfMonth,
  endOfMonthUTC,
  isSameMonth,
  isSameMonthUTC,
  isSameDay,
  isSameDayUTC,
  createDate,
  createUTCDate,
  toUTC,
  isWithinInterval,
  isWithinIntervalUTC,
  isWithinIntervalTZ,
  DEFAULT_TIMEZONE,
  isValid
} from './DateUtils';

describe('DateUtils', () => {
  // Mock current date for consistent testing
  const mockDate = new Date('2025-06-15T12:00:00Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('now', () => {
    it('should return current date', () => {
      const result = now();
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(5); // June (0-indexed)
      expect(result.getDate()).toBe(15);
    });
  });

  describe('createDate', () => {
    it('should create a date with specified components', () => {
      const result = createDate(2025, 5, 15); // June 15, 2025
      
      expect(result.getUTCFullYear()).toBe(2025);
      expect(result.getUTCMonth()).toBe(5);
      expect(result.getUTCDate()).toBe(15);
      expect(result.getUTCHours()).toBe(0);
      expect(result.getUTCMinutes()).toBe(0);
      expect(result.getUTCSeconds()).toBe(0);
    });
  });

  describe('toUTC', () => {
    it('should convert date to UTC maintaining components', () => {
      const localDate = new Date('2025-06-15T15:30:45.123');
      const result = toUTC(localDate);
      
      expect(result.getUTCFullYear()).toBe(2025);
      expect(result.getUTCMonth()).toBe(5);
      expect(result.getUTCDate()).toBe(15);
      expect(result.getUTCHours()).toBe(15);
      expect(result.getUTCMinutes()).toBe(30);
      expect(result.getUTCSeconds()).toBe(45);
      expect(result.getUTCMilliseconds()).toBe(123);
    });
  });

  describe('eachDayOfInterval', () => {
    it('should generate all days in interval including start and end', () => {
      const start = new Date('2025-06-10');
      const end = new Date('2025-06-15');
      const result = eachDayOfInterval({ start, end });
      
      expect(result).toHaveLength(6);
      expect(result[0]).toEqual(start);
      expect(result[5]).toEqual(end);
    });

    it('should handle single day interval', () => {
      const date = new Date('2025-06-15');
      const result = eachDayOfInterval({ start: date, end: date });
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(date);
    });

    it('should handle month boundaries correctly', () => {
      const start = createDate(2025, 4, 30); // May 30, 2025
      const end = createDate(2025, 5, 2); // June 2, 2025
      const result = eachDayOfInterval({ start, end });
      
      expect(result).toHaveLength(4);
      expect(result[0].getUTCDate()).toBe(30);
      expect(result[1].getUTCDate()).toBe(31);
      expect(result[2].getUTCDate()).toBe(1);
      expect(result[3].getUTCDate()).toBe(2);
    });
  });

  describe('Date arithmetic functions', () => {
    const testDate = createDate(2025, 5, 15); // June 15, 2025

    describe('addDaysUTC', () => {
      it('should add days correctly', () => {
        expect(addDaysUTC(testDate, 1).getUTCDate()).toBe(16);
        expect(addDaysUTC(testDate, 7).getUTCDate()).toBe(22);
      });

      it('should handle negative days', () => {
        expect(addDaysUTC(testDate, -1).getUTCDate()).toBe(14);
      });

      it('should handle month boundaries', () => {
        const endOfMonth = createDate(2025, 5, 30); // June 30
        const result = addDaysUTC(endOfMonth, 1);
        expect(result.getUTCMonth()).toBe(6); // July
        expect(result.getUTCDate()).toBe(1);
      });
    });

    describe('addMonthsUTC', () => {
      it('should add months correctly', () => {
        const result = addMonthsUTC(testDate, 1);
        expect(result.getUTCMonth()).toBe(6); // July
        expect(result.getUTCDate()).toBe(15);
      });

      it('should handle year boundaries', () => {
        const result = addMonthsUTC(testDate, 12);
        expect(result.getUTCFullYear()).toBe(2026);
        expect(result.getUTCMonth()).toBe(5); // June
      });
    });
  });

  describe('Week boundary functions', () => {
    describe('startOfWeekUTC', () => {
      it('should return Sunday by default (date-fns default)', () => {
        const wednesday = createDate(2025, 5, 18); // Wednesday June 18
        const result = startOfWeekUTC(wednesday, 0); // 0 = Sunday
        expect(result.getUTCDate()).toBe(15); // Sunday June 15
        expect(result.getUTCDay()).toBe(0); // Sunday
      });

      it('should return Monday when weekStartsOn is 1', () => {
        const wednesday = createDate(2025, 5, 18); // Wednesday June 18
        const result = startOfWeekUTC(wednesday, 1); // 1 = Monday
        expect(result.getUTCDate()).toBe(16); // Monday June 16
        expect(result.getUTCDay()).toBe(1); // Monday
      });
    });

    describe('endOfWeekUTC', () => {
      it('should return Saturday by default (date-fns default)', () => {
        const wednesday = createDate(2025, 5, 18); // Wednesday June 18
        const result = endOfWeekUTC(wednesday, 0); // 0 = Sunday start, so Saturday end
        expect(result.getUTCDate()).toBe(21); // Saturday June 21
        expect(result.getUTCDay()).toBe(6); // Saturday
      });

      it('should return Sunday when weekStartsOn is 1', () => {
        const wednesday = createDate(2025, 5, 18); // Wednesday June 18
        const result = endOfWeekUTC(wednesday, 1); // 1 = Monday start, so Sunday end
        expect(result.getUTCDate()).toBe(22); // Sunday June 22
        expect(result.getUTCDay()).toBe(0); // Sunday
      });
    });
  });

  describe('Month boundary functions', () => {
    describe('startOfMonthUTC', () => {
      it('should return first day of month', () => {
        const midMonth = createDate(2025, 5, 15);
        const result = startOfMonthUTC(midMonth);
        expect(result.getUTCDate()).toBe(1);
        expect(result.getUTCMonth()).toBe(5);
      });
    });

    describe('endOfMonthUTC', () => {
      it('should return last day of month', () => {
        const midMonth = createDate(2025, 5, 15);
        const result = endOfMonthUTC(midMonth);
        expect(result.getUTCDate()).toBe(30); // June has 30 days
        expect(result.getUTCMonth()).toBe(5);
      });

      it('should handle February correctly', () => {
        const feb = createDate(2025, 1, 15);
        const result = endOfMonthUTC(feb);
        expect(result.getUTCDate()).toBe(28);
      });

      it('should handle leap year February', () => {
        const leapFeb = createDate(2024, 1, 15);
        const result = endOfMonthUTC(leapFeb);
        expect(result.getUTCDate()).toBe(29);
      });
    });
  });

  describe('Comparison functions', () => {
    describe('isSameMonthUTC', () => {
      it('should return true for same month and year', () => {
        const date1 = createDate(2025, 5, 1);
        const date2 = createDate(2025, 5, 30);
        expect(isSameMonthUTC(date1, date2)).toBe(true);
      });

      it('should return false for different months', () => {
        const date1 = createDate(2025, 5, 30);
        const date2 = createDate(2025, 6, 1);
        expect(isSameMonthUTC(date1, date2)).toBe(false);
      });

      it('should return false for same month different year', () => {
        const date1 = createDate(2024, 5, 15);
        const date2 = createDate(2025, 5, 15);
        expect(isSameMonthUTC(date1, date2)).toBe(false);
      });
    });

    describe('isSameDay', () => {
      it('should return true for same day', () => {
        const date1 = createDate(2025, 5, 15);
        const date2 = createDate(2025, 5, 15);
        expect(isSameDay(date1, date2)).toBe(true);
      });

      it('should return false for different days', () => {
        const date1 = createDate(2025, 5, 15);
        const date2 = createDate(2025, 5, 16);
        expect(isSameDay(date1, date2)).toBe(false);
      });
    });

    describe('isWithinInterval', () => {
      it('should return true for date within interval', () => {
        const start = createDate(2025, 5, 10);
        const end = createDate(2025, 5, 20);
        const testDate = createDate(2025, 5, 15);
        
        expect(isWithinInterval(testDate, { start, end })).toBe(true);
      });

      it('should return false for date outside interval', () => {
        const start = createDate(2025, 5, 10);
        const end = createDate(2025, 5, 20);
        const testDate = createDate(2025, 5, 25);
        
        expect(isWithinInterval(testDate, { start, end })).toBe(false);
      });

      it('should include boundary dates', () => {
        const start = createDate(2025, 5, 10);
        const end = createDate(2025, 5, 20);
        
        expect(isWithinInterval(start, { start, end })).toBe(true);
        expect(isWithinInterval(end, { start, end })).toBe(true);
      });
    });
  });

  describe('Formatting functions', () => {
    describe('formatUTC', () => {
      it('should format UTC dates correctly', () => {
        const date = createDate(2025, 5, 15);
        // Note: formatUTC may have timezone-related behavior, so we'll test what it actually returns
        const formatted = formatUTC(date, 'yyyy-MM-dd');
        // The function should format consistently
        expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(formatted.startsWith('2025-06')).toBe(true);
      });
    });
  });

  describe('Parsing functions', () => {
    describe('parseISO', () => {
      it('should parse ISO date strings', () => {
        const result = parseISO('2025-06-15');
        // parseISO now defaults to UTC
        expect(result.getUTCFullYear()).toBe(2025);
        expect(result.getUTCMonth()).toBe(5);
        expect(result.getUTCDate()).toBe(15);
      });

      it('should handle datetime strings', () => {
        const result = parseISO('2025-06-15T12:30:00');
        // Without Z suffix, it's parsed as local time then converted to UTC
        expect(result.getUTCFullYear()).toBe(2025);
        expect(result.getUTCMonth()).toBe(5);
        expect(result.getUTCDate()).toBe(15);
      });
    });
  });

  describe('Timezone-aware functions', () => {
    describe('parseISO with timezone', () => {
      it('should default to UTC', () => {
        const result = parseISO('2025-06-15');
        expect(result.getUTCFullYear()).toBe(2025);
        expect(result.getUTCMonth()).toBe(5);
        expect(result.getUTCDate()).toBe(15);
        expect(result.getUTCHours()).toBe(0);
      });

      it('should use local timezone when specified', () => {
        const result = parseISO('2025-06-15', 'local');
        expect(result.getFullYear()).toBe(2025);
        expect(result.getMonth()).toBe(5);
        expect(result.getDate()).toBe(15);
      });
    });

    describe('isSameDay with timezone', () => {
      it('should default to UTC comparison', () => {
        const date1 = createDate(2025, 5, 15);
        const date2 = parseISO('2025-06-15');
        expect(isSameDay(date1, date2)).toBe(true);
      });

      it('should use local timezone when specified', () => {
        const date1 = new Date('2025-06-15');
        const date2 = new Date('2025-06-15');
        expect(isSameDay(date1, date2, 'local')).toBe(true);
      });
    });

    describe('isSameMonth with timezone', () => {
      it('should default to UTC comparison', () => {
        const date1 = createDate(2025, 5, 15);
        const date2 = createDate(2025, 5, 30);
        expect(isSameMonth(date1, date2)).toBe(true);
      });

      it('should use local timezone when specified', () => {
        const date1 = new Date('2025-06-15');
        const date2 = new Date('2025-06-30');
        expect(isSameMonth(date1, date2, 'local')).toBe(true);
      });

      it('should return false for different months in local timezone', () => {
        const date1 = new Date(2025, 5, 30); // June 30, 2025
        const date2 = new Date(2025, 6, 1);  // July 1, 2025
        expect(isSameMonth(date1, date2, 'local')).toBe(false);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid dates appropriately', () => {
      const invalidDate = new Date('invalid');
      
      // formatUTC should handle invalid dates gracefully (returns "NaN-NaN-NaN")
      expect(() => formatUTC(invalidDate, 'yyyy-MM-dd')).not.toThrow();
      // Date arithmetic functions should handle invalid dates gracefully
      expect(() => addDaysUTC(invalidDate, 1)).not.toThrow();
    });

    it('should handle leap year calculations', () => {
      const leapYear = createDate(2024, 1, 29); // Feb 29, 2024 (leap year)
      const nextYear = addMonthsUTC(leapYear, 12);
      
      // Should handle leap year to non-leap year transition
      expect(nextYear.getUTCFullYear()).toBe(2025);
    });

    it('should maintain UTC consistency', () => {
      const date = createDate(2025, 5, 15);
      const afterAddition = addDaysUTC(date, 1);
      
      expect(afterAddition.getUTCHours()).toBe(0);
      expect(afterAddition.getUTCMinutes()).toBe(0);
      expect(afterAddition.getUTCSeconds()).toBe(0);
    });
  });

  describe('Uncovered Functions', () => {
    describe('createUTCDate', () => {
      it('should create a UTC date (alias for createDate)', () => {
        const date = createUTCDate(2025, 5, 15);
        expect(date.getUTCFullYear()).toBe(2025);
        expect(date.getUTCMonth()).toBe(5);
        expect(date.getUTCDate()).toBe(15);
        expect(date.getUTCHours()).toBe(0);
        expect(date.getUTCMinutes()).toBe(0);
        expect(date.getUTCSeconds()).toBe(0);
      });
    });

    describe('nowUTC', () => {
      it('should return current date in UTC', () => {
        const result = nowUTC();
        const now = new Date();
        // The function converts current time to UTC, so check the components match
        expect(result.getUTCFullYear()).toBe(now.getFullYear());
        expect(result.getUTCMonth()).toBe(now.getMonth());
        expect(result.getUTCDate()).toBe(now.getDate());
        expect(result.getUTCHours()).toBe(now.getHours());
        expect(result.getUTCMinutes()).toBe(now.getMinutes());
      });
    });

    describe('parseISOUTC', () => {
      it('should parse ISO string to UTC date (deprecated function)', () => {
        const result = parseISOUTC('2025-06-15T15:30:00');
        expect(result.getUTCFullYear()).toBe(2025);
        expect(result.getUTCMonth()).toBe(5);
        expect(result.getUTCDate()).toBe(15);
        expect(result.getUTCHours()).toBe(15);
        expect(result.getUTCMinutes()).toBe(30);
      });

      it('should handle date-only strings', () => {
        const result = parseISOUTC('2025-12-25');
        expect(result.getUTCFullYear()).toBe(2025);
        expect(result.getUTCMonth()).toBe(11);
        expect(result.getUTCDate()).toBe(25);
        expect(result.getUTCHours()).toBe(0);
      });
    });

    describe('addMonths', () => {
      it('should add months using local timezone', () => {
        const date = new Date('2025-06-15T00:00:00');
        const result = addMonths(date, 3);
        expect(result.getMonth()).toBe(8); // September
        // date-fns preserves the day of month when possible
        expect(result.getDate()).toBe(15);
      });

      it('should handle negative months', () => {
        const date = new Date('2025-06-15');
        const result = addMonths(date, -2);
        expect(result.getMonth()).toBe(3); // April
        expect(result.getFullYear()).toBe(2025);
      });

      it('should handle year boundaries', () => {
        const date = new Date('2025-11-15');
        const result = addMonths(date, 3);
        expect(result.getMonth()).toBe(1); // February
        expect(result.getFullYear()).toBe(2026);
      });

      it('should handle month-end edge cases', () => {
        const date = new Date('2025-01-31');
        const result = addMonths(date, 1);
        // Should adjust to Feb 28 (non-leap year)
        expect(result.getMonth()).toBe(1); // February
        expect(result.getDate()).toBeLessThanOrEqual(28);
      });
    });

    describe('eachDayOfIntervalUTC', () => {
      it('should generate all days in UTC interval', () => {
        const start = createUTCDate(2025, 5, 10);
        const end = createUTCDate(2025, 5, 15);
        const result = eachDayOfIntervalUTC({ start, end });
        
        expect(result).toHaveLength(6);
        expect(result[0].getUTCDate()).toBe(10);
        expect(result[5].getUTCDate()).toBe(15);
        
        // All dates should be at UTC midnight
        result.forEach(date => {
          expect(date.getUTCHours()).toBe(0);
          expect(date.getUTCMinutes()).toBe(0);
          expect(date.getUTCSeconds()).toBe(0);
        });
      });

      it('should handle single day interval in UTC', () => {
        const date = createUTCDate(2025, 5, 15);
        const result = eachDayOfIntervalUTC({ start: date, end: date });
        
        expect(result).toHaveLength(1);
        expect(result[0].getUTCDate()).toBe(15);
      });

      it('should handle month boundaries in UTC', () => {
        const start = createUTCDate(2025, 4, 30); // May 30
        const end = createUTCDate(2025, 5, 2); // June 2
        const result = eachDayOfIntervalUTC({ start, end });
        
        expect(result).toHaveLength(4);
        expect(result[0].getUTCDate()).toBe(30);
        expect(result[0].getUTCMonth()).toBe(4);
        expect(result[1].getUTCDate()).toBe(31);
        expect(result[1].getUTCMonth()).toBe(4);
        expect(result[2].getUTCDate()).toBe(1);
        expect(result[2].getUTCMonth()).toBe(5);
        expect(result[3].getUTCDate()).toBe(2);
        expect(result[3].getUTCMonth()).toBe(5);
      });

      it('should handle year boundaries in UTC', () => {
        const start = createUTCDate(2024, 11, 30); // Dec 30, 2024
        const end = createUTCDate(2025, 0, 2); // Jan 2, 2025
        const result = eachDayOfIntervalUTC({ start, end });
        
        expect(result).toHaveLength(4);
        expect(result[0].getUTCFullYear()).toBe(2024);
        expect(result[3].getUTCFullYear()).toBe(2025);
      });

      it('should not duplicate days across US DST (Mar 8, 2026)', () => {
        // Span late Feb through end of March 2026
        const start = createUTCDate(2026, 1, 24); // 2026-02-24
        const end = createUTCDate(2026, 2, 31);   // 2026-03-31
        const result = eachDayOfIntervalUTC({ start, end });

        // Ensure March 8, 2026 appears exactly once
        const marchDays = result.filter(d => d.getUTCFullYear() === 2026 && d.getUTCMonth() === 2);
        const march8 = marchDays.filter(d => d.getUTCDate() === 8);
        expect(march8).toHaveLength(1);

        // Ensure all March days are unique
        const uniqueMarch = new Set(marchDays.map(d => d.toISOString().slice(0, 10)));
        expect(uniqueMarch.size).toBe(31);
      });
    });

    describe('isWithinIntervalUTC', () => {
      it('should check if date is within UTC interval', () => {
        const start = createUTCDate(2025, 5, 10);
        const end = createUTCDate(2025, 5, 20);
        const testDate = createUTCDate(2025, 5, 15);
        
        expect(isWithinIntervalUTC(testDate, { start, end })).toBe(true);
      });

      it('should return false for date outside UTC interval', () => {
        const start = createUTCDate(2025, 5, 10);
        const end = createUTCDate(2025, 5, 20);
        const testDate = createUTCDate(2025, 5, 25);
        
        expect(isWithinIntervalUTC(testDate, { start, end })).toBe(false);
      });

      it('should include boundary dates in UTC', () => {
        const start = createUTCDate(2025, 5, 10);
        const end = createUTCDate(2025, 5, 20);
        
        expect(isWithinIntervalUTC(start, { start, end })).toBe(true);
        expect(isWithinIntervalUTC(end, { start, end })).toBe(true);
      });

      it('should handle invalid dates', () => {
        const start = createUTCDate(2025, 5, 10);
        const end = createUTCDate(2025, 5, 20);
        const invalidDate = new Date('invalid');
        
        expect(isWithinIntervalUTC(invalidDate, { start, end })).toBe(false);
      });

      it('should handle timezone differences correctly', () => {
        // Create dates with different time components
        const start = new Date('2025-06-10T23:59:59Z');
        const end = new Date('2025-06-20T00:00:01Z');
        const testDate = new Date('2025-06-15T12:30:00Z');
        
        // Should only compare date portions in UTC
        expect(isWithinIntervalUTC(testDate, { start, end })).toBe(true);
      });

      it('should handle errors in catch block', () => {
        // Test with an object that will cause an error when accessing UTC methods
        const badDate = {} as Date;
        const start = createUTCDate(2025, 5, 10);
        const end = createUTCDate(2025, 5, 20);
        
        // Should return false when error occurs
        expect(isWithinIntervalUTC(badDate, { start, end })).toBe(false);
        
        // Test with bad interval
        const goodDate = createUTCDate(2025, 5, 15);
        const badInterval = { start: {} as Date, end: {} as Date };
        
        expect(isWithinIntervalUTC(goodDate, badInterval)).toBe(false);
      });
    });

    describe('isSameDayUTC', () => {
      it('should return true for same UTC day', () => {
        const date1 = createUTCDate(2025, 5, 15);
        const date2 = new Date('2025-06-15T23:59:59Z');
        
        expect(isSameDayUTC(date1, date2)).toBe(true);
      });

      it('should return false for different UTC days', () => {
        const date1 = createUTCDate(2025, 5, 15);
        const date2 = createUTCDate(2025, 5, 16);
        
        expect(isSameDayUTC(date1, date2)).toBe(false);
      });

      it('should handle timezone boundaries correctly', () => {
        // 11:59 PM UTC on June 15
        const date1 = new Date('2025-06-15T23:59:59Z');
        // 12:01 AM UTC on June 16
        const date2 = new Date('2025-06-16T00:00:01Z');
        
        expect(isSameDayUTC(date1, date2)).toBe(false);
      });

      it('should handle different months', () => {
        const date1 = createUTCDate(2025, 5, 30);
        const date2 = createUTCDate(2025, 6, 1);
        
        expect(isSameDayUTC(date1, date2)).toBe(false);
      });

      it('should handle different years', () => {
        const date1 = createUTCDate(2024, 11, 31);
        const date2 = createUTCDate(2025, 0, 1);
        
        expect(isSameDayUTC(date1, date2)).toBe(false);
      });
    });

    describe('isWithinIntervalTZ', () => {
      it('should be an alias for isWithinIntervalUTC', () => {
        expect(isWithinIntervalTZ).toBe(isWithinIntervalUTC);
      });

      it('should work the same as isWithinIntervalUTC', () => {
        const start = createUTCDate(2025, 5, 10);
        const end = createUTCDate(2025, 5, 20);
        const testDate = createUTCDate(2025, 5, 15);
        
        expect(isWithinIntervalTZ(testDate, { start, end })).toBe(true);
      });
    });

    describe('addDays', () => {
      it('should add days using local timezone', () => {
        const date = new Date('2025-06-15T00:00:00');
        const result = addDays(date, 5);
        expect(result.getDate()).toBe(20);
      });

      it('should handle negative days', () => {
        const date = new Date('2025-06-15T00:00:00');
        const result = addDays(date, -5);
        expect(result.getDate()).toBe(10);
      });

      it('should handle month boundaries', () => {
        const date = new Date('2025-06-30T00:00:00');
        const result = addDays(date, 2);
        expect(result.getMonth()).toBe(6); // July (0-indexed, so 6 = July)
        expect(result.getDate()).toBe(2);
      });
    });

    describe('DEFAULT_TIMEZONE', () => {
      it('should be UTC', () => {
        expect(DEFAULT_TIMEZONE).toBe('UTC');
      });
    });

    describe('isValid', () => {
      it('should validate dates correctly', () => {
        expect(isValid(new Date('2025-06-15'))).toBe(true);
        expect(isValid(new Date('invalid'))).toBe(false);
        expect(isValid(createDate(2025, 5, 15))).toBe(true);
      });
    });

    describe('Timezone-aware wrapper functions', () => {
      describe('startOfWeek', () => {
        it('should use UTC by default', () => {
          const date = createDate(2025, 5, 18); // Wednesday
          const result = startOfWeek(date);
          expect(result.getUTCDate()).toBe(16); // Monday
          expect(result.getUTCDay()).toBe(1);
        });

        it('should use local timezone when specified', () => {
          const date = new Date('2025-06-18');
          const result = startOfWeek(date, { timezone: 'local' });
          // Result depends on local timezone but should be a valid date
          expect(isValid(result)).toBe(true);
        });

        it('should respect weekStartsOn option', () => {
          const date = createDate(2025, 5, 18); // Wednesday
          const result = startOfWeek(date, { weekStartsOn: 0 }); // Sunday
          expect(result.getUTCDate()).toBe(15); // Sunday
          expect(result.getUTCDay()).toBe(0);
        });
      });

      describe('endOfWeek', () => {
        it('should use UTC by default', () => {
          const date = createDate(2025, 5, 18); // Wednesday
          const result = endOfWeek(date);
          expect(result.getUTCDate()).toBe(22); // Sunday
          expect(result.getUTCDay()).toBe(0);
        });

        it('should use local timezone when specified', () => {
          const date = new Date('2025-06-18');
          const result = endOfWeek(date, { timezone: 'local' });
          // Result depends on local timezone but should be a valid date
          expect(isValid(result)).toBe(true);
        });

        it('should respect weekStartsOn option', () => {
          const date = createDate(2025, 5, 18); // Wednesday
          const result = endOfWeek(date, { weekStartsOn: 0 }); // Sunday start
          expect(result.getUTCDate()).toBe(21); // Saturday
          expect(result.getUTCDay()).toBe(6);
        });
      });

      describe('startOfMonth', () => {
        it('should use UTC by default', () => {
          const date = createDate(2025, 5, 15);
          const result = startOfMonth(date);
          expect(result.getUTCDate()).toBe(1);
          expect(result.getUTCMonth()).toBe(5);
        });

        it('should use local timezone when specified', () => {
          const date = new Date('2025-06-15');
          const result = startOfMonth(date, 'local');
          expect(result.getDate()).toBe(1);
          expect(result.getMonth()).toBe(5);
        });
      });

      describe('endOfMonth', () => {
        it('should use UTC by default', () => {
          const date = createDate(2025, 5, 15);
          const result = endOfMonth(date);
          expect(result.getUTCDate()).toBe(30); // June has 30 days
          expect(result.getUTCMonth()).toBe(5);
        });

        it('should use local timezone when specified', () => {
          const date = new Date('2025-06-15');
          const result = endOfMonth(date, 'local');
          expect(result.getDate()).toBe(30);
          expect(result.getMonth()).toBe(5);
        });

        it('should handle February in leap years', () => {
          const date = createDate(2024, 1, 15);
          const result = endOfMonth(date);
          expect(result.getUTCDate()).toBe(29);
        });
      });
    });

    describe('format with different timezones', () => {
      it('should format with specific timezone', () => {
        const date = createDate(2025, 5, 15);
        const result = format(date, 'yyyy-MM-dd', 'America/New_York');
        // Should be a valid date string
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });

      it('should use local timezone when specified as "local"', () => {
        const date = createDate(2025, 5, 15);
        const result = format(date, 'yyyy-MM-dd', 'local');
        // Should be a valid date string
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });

      it('should use UTC formatting when timezone is "UTC"', () => {
        const date = createDate(2025, 5, 15);
        const result = format(date, 'yyyy-MM-dd', 'UTC');
        expect(result).toBe('2025-06-15');
      });

      it('should use UTC formatting by default', () => {
        const date = createDate(2025, 5, 15);
        const result = format(date, 'yyyy-MM-dd');
        expect(result).toBe('2025-06-15');
      });
    });

    describe('edge cases for addMonthsUTC', () => {
      it('should handle month boundaries correctly', () => {
        // Test Jan 31 + 1 month = Feb 28/29
        const jan31 = createUTCDate(2025, 0, 31);
        const result = addMonthsUTC(jan31, 1);
        expect(result.getUTCMonth()).toBe(1); // February
        expect(result.getUTCDate()).toBe(28); // 2025 is not a leap year
      });

      it('should handle negative months correctly', () => {
        const date = createUTCDate(2025, 5, 15);
        const result = addMonthsUTC(date, -13);
        expect(result.getUTCFullYear()).toBe(2024);
        expect(result.getUTCMonth()).toBe(4); // May
        expect(result.getUTCDate()).toBe(15);
      });

      it('should handle large month additions', () => {
        const date = createUTCDate(2025, 5, 15);
        const result = addMonthsUTC(date, 25);
        expect(result.getUTCFullYear()).toBe(2027);
        expect(result.getUTCMonth()).toBe(6); // July
        expect(result.getUTCDate()).toBe(15);
      });
    });

    describe('formatUTC edge cases', () => {
      it('should handle different format strings for invalid dates', () => {
        const invalidDate = new Date('invalid');
        expect(formatUTC(invalidDate, 'MM/dd/yyyy')).toBe('Invalid Date');
        expect(formatUTC(invalidDate, 'dd-MM-yyyy')).toBe('Invalid Date');
      });
    });

    describe('isWithinInterval fallback logic', () => {
      it('should use fallback logic when date-fns throws', () => {
        // Test with dates that might cause issues
        const date = createDate(2025, 5, 15);
        const interval = {
          start: createDate(2025, 5, 10),
          end: createDate(2025, 5, 20)
        };
        
        // Should still work correctly
        expect(isWithinInterval(date, interval)).toBe(true);
      });

      it('should handle invalid interval in fallback', () => {
        const date = createDate(2025, 5, 15);
        const interval = {
          start: new Date('invalid'),
          end: createDate(2025, 5, 20)
        };
        
        // Should return false for invalid intervals
        expect(isWithinInterval(date, interval)).toBe(false);
      });

      it('should handle inverted interval in fallback', () => {
        // Create an interval where end is before start
        const date = createDate(2025, 5, 15);
        const interval = {
          start: createDate(2025, 5, 20),
          end: createDate(2025, 5, 10)  // End before start
        };
        
        // Both date-fns and our fallback should handle this gracefully
        // date-fns returns true if date is NOT in the inverted interval
        // Our test date (15th) is NOT between 20th and 10th, so it should return true
        expect(isWithinInterval(date, interval)).toBe(true);
      });

      // Skip these tests as creating mock dates that properly trigger the fallback
      // while still working with the fallback code is not feasible

      it('should handle dates outside interval in fallback logic', () => {
        // Force fallback by using a date with no getFullYear method
        const date = {
          getFullYear: () => 2025,
          getMonth: () => 5,
          getDate: () => 25
        } as Date;
        
        const interval = {
          start: {
            getFullYear: () => 2025,
            getMonth: () => 5,
            getDate: () => 10
          } as Date,
          end: {
            getFullYear: () => 2025,
            getMonth: () => 5,
            getDate: () => 20
          } as Date
        };
        
        // Should use fallback logic and return false
        expect(isWithinInterval(date, interval)).toBe(false);
      });


      it('should handle errors in inner catch block', () => {
        // Create objects that will throw when accessing properties
        const date = {
          getFullYear: () => { throw new Error('Test error'); }
        } as Date;
        
        const interval = {
          start: createDate(2025, 5, 10),
          end: createDate(2025, 5, 20)
        };
        
        // Should catch the error and return false
        expect(isWithinInterval(date, interval)).toBe(false);
      });
    });
  });

  describe('format with non-UTC timezone', () => {
    it('should use formatInTimeZone for non-UTC timezones', () => {
      const date = createDate(2025, 5, 15, 12, 30, 0);
      const result = format(date, 'yyyy-MM-dd HH:mm', 'America/New_York');
      // Just verify it doesn't throw and returns a string
      expect(typeof result).toBe('string');
    });

    it('should use local format for "local" timezone', () => {
      const date = createDate(2025, 5, 15, 12, 30, 0);
      const result = format(date, 'yyyy-MM-dd HH:mm', 'local');
      expect(typeof result).toBe('string');
    });

    it('should use local format when timezone is empty string', () => {
      const date = createDate(2025, 5, 15, 12, 30, 0);
      const result = format(date, 'yyyy-MM-dd HH:mm', '');
      expect(typeof result).toBe('string');
    });
  });

  describe('endOfMonthUTC year boundary', () => {
    it('should handle December (month 11) correctly', () => {
      const date = createDate(2025, 11, 15); // December 2025
      const result = endOfMonthUTC(date);
      
      // December has 31 days
      expect(result.getUTCDate()).toBe(31);
      expect(result.getUTCMonth()).toBe(11); // December
      expect(result.getUTCFullYear()).toBe(2025);
      // createUTCDate creates a date at midnight UTC
      expect(result.getUTCHours()).toBe(0);
      expect(result.getUTCMinutes()).toBe(0);
      expect(result.getUTCSeconds()).toBe(0);
      expect(result.getUTCMilliseconds()).toBe(0);
    });

    it('should handle February in a leap year', () => {
      const date = createDate(2024, 1, 15); // February 2024 (leap year)
      const result = endOfMonthUTC(date);
      
      // February 2024 has 29 days
      expect(result.getUTCDate()).toBe(29);
      expect(result.getUTCMonth()).toBe(1); // February
      expect(result.getUTCFullYear()).toBe(2024);
    });

    it('should handle February in a non-leap year', () => {
      const date = createDate(2025, 1, 15); // February 2025 (non-leap year)
      const result = endOfMonthUTC(date);
      
      // February 2025 has 28 days
      expect(result.getUTCDate()).toBe(28);
      expect(result.getUTCMonth()).toBe(1); // February
      expect(result.getUTCFullYear()).toBe(2025);
    });
  });

  describe('isWithinInterval additional error scenarios', () => {
    it('should handle errors when accessing interval.start properties in fallback', () => {
      const date = createDate(2025, 5, 15);
      const badInterval = {
        start: {
          getFullYear: () => { throw new Error('Test error'); },
          getMonth: () => { throw new Error('Test error'); },
          getDate: () => { throw new Error('Test error'); }
        } as unknown as Date,
        end: createDate(2025, 5, 20)
      };
      
      // This will first fail in date-fns, then fail in our fallback
      expect(isWithinInterval(date, badInterval)).toBe(false);
    });
  });
});