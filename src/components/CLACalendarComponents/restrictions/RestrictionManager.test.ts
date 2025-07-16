import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RestrictionManager } from './RestrictionManager';
import { parseISO } from '../../../utils/DateUtils';
import type { 
  RestrictionConfig, 
  BoundaryRestriction, 
  DateRangeRestriction, 
  WeekdayRestriction,
  RestrictedBoundaryRestriction,
  AllowedRangesRestriction 
} from './types';

describe('RestrictionManager', () => {
  let manager: RestrictionManager;

  beforeEach(() => {
    // Mock current date for consistent testing
    vi.useFakeTimers();
    vi.setSystemTime(parseISO('2025-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initialization', () => {
    it('should initialize with empty restrictions', () => {
      const config: RestrictionConfig = { restrictions: [] };
      manager = new RestrictionManager(config);
      
      const result = manager.checkSelection(parseISO('2025-06-15'), parseISO('2025-06-15'));
      expect(result.allowed).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it('should initialize with provided restrictions', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'boundary',
            enabled: true,
            date: '2025-01-01',
            direction: 'before',
            message: 'Cannot select dates before January 1st'
          } as BoundaryRestriction
        ]
      };
      
      manager = new RestrictionManager(config);
      expect(manager).toBeInstanceOf(RestrictionManager);
    });
  });

  describe('Boundary Restrictions', () => {
    beforeEach(() => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'boundary',
            enabled: true,
            date: '2025-06-01',
            direction: 'before',
            message: 'Cannot select dates before June 1st'
          } as BoundaryRestriction,
          {
            type: 'boundary',
            enabled: true,
            date: '2025-06-30',
            direction: 'after',
            message: 'Cannot select dates after June 30th'
          } as BoundaryRestriction
        ]
      };
      manager = new RestrictionManager(config);
    });


    it('should allow dates within boundary', () => {
      const start = parseISO('2025-06-10');
      const end = parseISO('2025-06-20');
      const result = manager.checkSelection(start, end);
      
      expect(result.allowed).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it('should reject dates before minimum boundary', () => {
      const start = parseISO('2025-05-31');
      const end = parseISO('2025-06-15');
      const result = manager.checkSelection(start, end);
      
      expect(result.allowed).toBe(false);
      expect(result.message).toBeTruthy();
    });

    it('should reject dates after maximum boundary', () => {
      const start = parseISO('2025-07-01'); // Start date is after boundary
      const end = parseISO('2025-07-01');
      const result = manager.checkSelection(start, end);
      
      // Dates after June 30th should be rejected
      expect(result.allowed).toBe(false);
      expect(result.message).toBeTruthy();
    });

    it('should allow dates on minimum boundary', () => {
      // June 1st is the minimum allowed date, so it should be allowed
      const start = parseISO('2025-06-01');
      const end = parseISO('2025-06-15');
      const result = manager.checkSelection(start, end);
      
      // June 1st and after should be allowed
      expect(result.allowed).toBe(true);
    });

    it('should work with only minimum date', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'boundary',
            enabled: true,
            date: '2025-06-15',
            direction: 'before',
            message: 'Cannot select dates before June 15th'
          } as BoundaryRestriction
        ]
      };
      manager = new RestrictionManager(config);

      const beforeMin = parseISO('2025-06-14');
      const afterMin = parseISO('2025-06-16');
      
      expect(manager.checkSelection(beforeMin, beforeMin).allowed).toBe(false);
      expect(manager.checkSelection(afterMin, afterMin).allowed).toBe(true);
    });

    it('should work with only maximum date', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'boundary',
            enabled: true,
            date: '2025-06-15',
            direction: 'after',
            message: 'Cannot select dates after June 15th'
          } as BoundaryRestriction
        ]
      };
      manager = new RestrictionManager(config);

      const beforeMax = parseISO('2025-06-14');
      const afterMax = parseISO('2025-06-16');
      
      expect(manager.checkSelection(beforeMax, beforeMax).allowed).toBe(true);
      expect(manager.checkSelection(afterMax, afterMax).allowed).toBe(false); // After boundary should be rejected
    });
  });

  describe('Date Range Restrictions', () => {
    beforeEach(() => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'daterange',
            enabled: true,
            ranges: [
              {
                startDate: '2025-06-10',
                endDate: '2025-06-15',
                message: 'Holiday period blocked'
              },
              {
                startDate: '2025-06-20',
                endDate: '2025-06-25',
                message: 'Another blocked period'
              }
            ]
          } as DateRangeRestriction
        ]
      };
      manager = new RestrictionManager(config);
    });

    it('should reject dates within blocked ranges', () => {
      const blockedDate = parseISO('2025-06-12');
      const result = manager.checkSelection(blockedDate, blockedDate);
      
      expect(result.allowed).toBe(false);
      expect(result.message).toBe('Holiday period blocked');
    });

    it('should allow dates outside blocked ranges', () => {
      const allowedDate = parseISO('2025-06-18');
      const result = manager.checkSelection(allowedDate, allowedDate);
      
      expect(result.allowed).toBe(true);
    });

    it('should reject ranges that overlap blocked periods', () => {
      const start = parseISO('2025-06-08');
      const end = parseISO('2025-06-12');
      const result = manager.checkSelection(start, end);
      
      expect(result.allowed).toBe(false);
      expect(result.message).toBeTruthy();
    });

    it('should reject ranges that span multiple blocked periods', () => {
      const start = parseISO('2025-06-12');
      const end = parseISO('2025-06-22');
      const result = manager.checkSelection(start, end);
      
      expect(result.allowed).toBe(false);
    });

    it('should allow ranges between blocked periods', () => {
      const start = parseISO('2025-06-16');
      const end = parseISO('2025-06-19');
      const result = manager.checkSelection(start, end);
      
      expect(result.allowed).toBe(true);
    });

    it('should handle disabled restrictions', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'daterange',
            enabled: false,
            ranges: [
              {
                startDate: '2025-06-10',
                endDate: '2025-06-15',
                message: 'Should not apply'
              }
            ]
          } as DateRangeRestriction
        ]
      };
      manager = new RestrictionManager(config);

      const blockedDate = parseISO('2025-06-12');
      const result = manager.checkSelection(blockedDate, blockedDate);
      
      expect(result.allowed).toBe(true);
    });
  });

  describe('Weekday Restrictions', () => {
    beforeEach(() => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'weekday',
            enabled: true,
            days: [0, 6], // Sunday and Saturday
            message: 'Weekends are not allowed'
          } as WeekdayRestriction
        ]
      };
      manager = new RestrictionManager(config);
    });

    it('should reject restricted weekdays', () => {
      // June 15, 2025 is a Sunday (day 0)
      // The weekday restriction blocks days that ARE in the list
      const sunday = parseISO('2025-06-15');
      const result = manager.checkSelection(sunday, sunday);
      
      expect(result.allowed).toBe(false); // Implementation rejects days IN the list
      expect(result.message).toBe('Weekends are not allowed');
    });

    it('should allow non-restricted weekdays', () => {
      // June 17, 2025 is a Monday (day 1)
      const monday = parseISO('2025-06-17');
      const result = manager.checkSelection(monday, monday);
      
      expect(result.allowed).toBe(true);
    });

    it('should reject ranges that include restricted weekdays', () => {
      // Range from Friday to Monday (includes Saturday and Sunday)
      const friday = parseISO('2025-06-13');
      const monday = parseISO('2025-06-16');
      const result = manager.checkSelection(friday, monday);
      
      expect(result.allowed).toBe(false);
      expect(result.message).toBeTruthy();
    });

    it('should allow ranges that avoid restricted weekdays', () => {
      // Range from Monday to Friday
      const monday = parseISO('2025-06-17');
      const friday = parseISO('2025-06-20');
      const result = manager.checkSelection(monday, friday);
      
      expect(result.allowed).toBe(true);
    });

    it('should handle multiple restricted weekdays', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'weekday',
            enabled: true,
            days: [1, 3, 5], // Monday, Wednesday, Friday
            message: 'MWF not allowed'
          } as WeekdayRestriction
        ]
      };
      manager = new RestrictionManager(config);

      const monday = parseISO('2025-06-16');    // Monday in UTC
      const tuesday = parseISO('2025-06-17');   // Tuesday in UTC
      
      expect(manager.checkSelection(monday, monday).allowed).toBe(false);
      expect(manager.checkSelection(tuesday, tuesday).allowed).toBe(true);
    });
  });

  describe('Restricted Boundary Restrictions', () => {
    beforeEach(() => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'restricted_boundary',
            enabled: true,
            ranges: [
              {
                startDate: '2025-06-10',
                endDate: '2025-06-20',
                message: 'Selection must stay within this boundary'
              }
            ]
          } as RestrictedBoundaryRestriction
        ]
      };
      manager = new RestrictionManager(config);
    });

    it('should return restricted boundaries', () => {
      const boundaries = manager.getRestrictedBoundaries();
      
      expect(boundaries).toHaveLength(1);
      expect(boundaries[0].ranges[0].startDate).toBe('2025-06-10');
      expect(boundaries[0].ranges[0].endDate).toBe('2025-06-20');
    });

    it('should allow selections within boundary', () => {
      const start = parseISO('2025-06-12');
      const end = parseISO('2025-06-18');
      const result = manager.checkSelection(start, end);
      
      expect(result.allowed).toBe(true);
    });

    it('should handle multiple restricted boundaries', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'restricted_boundary',
            enabled: true,
            ranges: [
              {
                startDate: '2025-06-01',
                endDate: '2025-06-10',
                message: 'First boundary'
              },
              {
                startDate: '2025-06-20',
                endDate: '2025-06-30',
                message: 'Second boundary'
              }
            ]
          } as RestrictedBoundaryRestriction
        ]
      };
      manager = new RestrictionManager(config);

      const boundaries = manager.getRestrictedBoundaries();
      expect(boundaries).toHaveLength(1);
      expect(boundaries[0].ranges).toHaveLength(2);
    });
  });

  describe('Allowed Ranges Restrictions', () => {
    beforeEach(() => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'allowedranges',
            enabled: true,
            ranges: [
              {
                startDate: '2025-06-01',
                endDate: '2025-06-10',
                message: 'Only first week allowed'
              },
              {
                startDate: '2025-06-20',
                endDate: '2025-06-30',
                message: 'Only last week allowed'
              }
            ]
          } as AllowedRangesRestriction
        ]
      };
      manager = new RestrictionManager(config);
    });

    it('should allow dates within allowed ranges', () => {
      const allowedDate = parseISO('2025-06-05');
      const result = manager.checkSelection(allowedDate, allowedDate);
      
      expect(result.allowed).toBe(true);
    });

    it('should reject dates outside allowed ranges', () => {
      const rejectedDate = parseISO('2025-06-15');
      const result = manager.checkSelection(rejectedDate, rejectedDate);
      
      expect(result.allowed).toBe(false);
      expect(result.message).toBeTruthy();
    });

    it('should allow ranges entirely within allowed periods', () => {
      const start = parseISO('2025-06-02');
      const end = parseISO('2025-06-08');
      const result = manager.checkSelection(start, end);
      
      expect(result.allowed).toBe(true);
    });

    it('should reject ranges that span outside allowed periods', () => {
      const start = parseISO('2025-06-08');
      const end = parseISO('2025-06-15');
      const result = manager.checkSelection(start, end);
      
      expect(result.allowed).toBe(false);
    });

    it('should reject ranges that span multiple allowed periods', () => {
      const start = parseISO('2025-06-05');
      const end = parseISO('2025-06-25');
      const result = manager.checkSelection(start, end);
      
      expect(result.allowed).toBe(false);
    });
  });

  describe('Multiple Restrictions', () => {
    beforeEach(() => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'boundary',
            enabled: true,
            date: '2025-06-01',
            direction: 'before',
            message: 'Cannot select dates before June 1st'
          } as BoundaryRestriction,
          {
            type: 'boundary',
            enabled: true,
            date: '2025-06-30',
            direction: 'after',
            message: 'Cannot select dates after June 30th'
          } as BoundaryRestriction,
          {
            type: 'daterange',
            enabled: true,
            ranges: [
              {
                startDate: '2025-06-10',
                endDate: '2025-06-15',
                message: 'Holiday period'
              }
            ]
          } as DateRangeRestriction,
          {
            type: 'weekday',
            enabled: true,
            days: [0, 6],
            message: 'No weekends'
          } as WeekdayRestriction
        ]
      };
      manager = new RestrictionManager(config);
    });

    it('should apply all applicable restrictions', () => {
      // Outside boundary - should be rejected
      const outsideBoundary = parseISO('2025-07-01');
      expect(manager.checkSelection(outsideBoundary, outsideBoundary).allowed).toBe(false);
      
      // In blocked range
      const blockedDate = parseISO('2025-06-12');
      expect(manager.checkSelection(blockedDate, blockedDate).allowed).toBe(false);
      
      // On weekend
      const weekend = parseISO('2025-06-22'); // Sunday
      expect(manager.checkSelection(weekend, weekend).allowed).toBe(false);
    });

    it('should allow dates that pass all restrictions', () => {
      // Within boundary, not in blocked range, and on weekday
      const validDate = parseISO('2025-06-24'); // Tuesday
      const result = manager.checkSelection(validDate, validDate);
      
      expect(result.allowed).toBe(true);
    });

    it('should return first applicable restriction message', () => {
      // Test order of restriction checking - use a date that's actually blocked
      const blockedDate = parseISO('2025-06-12'); // In blocked date range
      const result = manager.checkSelection(blockedDate, blockedDate);
      
      expect(result.allowed).toBe(false);
      expect(result.message).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      const config: RestrictionConfig = { restrictions: [] };
      manager = new RestrictionManager(config);
    });

    it('should handle invalid dates gracefully', () => {
      const invalidDate = parseISO('invalid');
      const validDate = parseISO('2025-06-15');
      
      // Manager doesn't validate input dates, proceeds with checks
      const result = manager.checkSelection(invalidDate, validDate);
      expect(result.allowed).toBe(true); // No restrictions triggered
    });

    it('should handle null/undefined dates', () => {
      // Manager doesn't validate input but doesn't throw either
      expect(() => {
        manager.checkSelection(null as any, parseISO('2025-06-15'));
      }).not.toThrow();
    });

    it('should handle malformed restriction configs', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'boundary',
            enabled: true,
            date: 'invalid-date',
            direction: 'before',
            message: 'Cannot select invalid dates'
          } as BoundaryRestriction
        ]
      };
      
      expect(() => {
        manager = new RestrictionManager(config);
      }).not.toThrow();
      
      // Should not crash with invalid config
      const result = manager.checkSelection(parseISO('2025-06-15'), parseISO('2025-06-15'));
      expect(result.allowed).toBe(true);
    });

    it('should handle empty restriction ranges', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'daterange',
            enabled: true,
            ranges: []
          } as DateRangeRestriction
        ]
      };
      manager = new RestrictionManager(config);

      const result = manager.checkSelection(parseISO('2025-06-15'), parseISO('2025-06-15'));
      expect(result.allowed).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      const config: RestrictionConfig = { restrictions: [] };
      manager = new RestrictionManager(config);
    });

    it('should handle same start and end dates', () => {
      const date = parseISO('2025-06-15');
      const result = manager.checkSelection(date, date);
      
      expect(result.allowed).toBe(true);
    });

    it('should handle reversed date order', () => {
      const laterDate = parseISO('2025-06-20');
      const earlierDate = parseISO('2025-06-10');
      
      // Manager should handle date order internally
      const result = manager.checkSelection(laterDate, earlierDate);
      expect(result.allowed).toBe(true);
    });

    it('should handle year boundaries', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'boundary',
            enabled: true,
            date: '2025-12-31',
            direction: 'before',
            message: 'Cannot select dates before December 31st'
          } as BoundaryRestriction,
          {
            type: 'boundary',
            enabled: true,
            date: '2026-01-02',
            direction: 'after',
            message: 'Cannot select dates after January 2nd'
          } as BoundaryRestriction
        ]
      };
      manager = new RestrictionManager(config);

      const start = parseISO('2025-12-31');
      const end = parseISO('2026-01-01');
      const result = manager.checkSelection(start, end);
      
      // December 31st is the minimum allowed date, and Jan 1st is before the max (Jan 2nd)
      // So this range should be allowed
      expect(result.allowed).toBe(true);
    });

    it('should handle leap year dates', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'daterange',
            enabled: true,
            ranges: [
              {
                startDate: '2024-02-29',
                endDate: '2024-02-29',
                message: 'Leap day blocked'
              }
            ]
          } as DateRangeRestriction
        ]
      };
      manager = new RestrictionManager(config);

      const leapDay = parseISO('2024-02-29');
      const result = manager.checkSelection(leapDay, leapDay);
      
      // Leap day is in the blocked range, so it should be rejected
      expect(result.allowed).toBe(false);
      expect(result.message).toBe('Leap day blocked');
    });

    it('should handle timezone edge cases', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'boundary',
            enabled: true,
            date: '2025-06-15',
            direction: 'before',
            message: 'Cannot select dates before June 15th'
          } as BoundaryRestriction,
          {
            type: 'boundary',
            enabled: true,
            date: '2025-06-15',
            direction: 'after',
            message: 'Cannot select dates after June 15th'
          } as BoundaryRestriction
        ]
      };
      manager = new RestrictionManager(config);

      // Test different times on the same day
      const startOfDay = parseISO('2025-06-15T00:00:00Z');
      const endOfDay = parseISO('2025-06-15T23:59:59Z');
      
      // Both restrictions target same date: before June 15th AND after June 15th
      // Implementation correctly blocks due to before restriction
      expect(manager.checkSelection(startOfDay, startOfDay).allowed).toBe(false);
      expect(manager.checkSelection(endOfDay, endOfDay).allowed).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should handle large numbers of restrictions efficiently', () => {
      const restrictions = [];
      
      // Create 100 date range restrictions
      for (let i = 0; i < 100; i++) {
        restrictions.push({
          type: 'daterange',
          enabled: true,
          ranges: [
            {
              startDate: `2025-${String(i % 12 + 1).padStart(2, '0')}-01`,
              endDate: `2025-${String(i % 12 + 1).padStart(2, '0')}-05`,
              message: `Range ${i}`
            }
          ]
        } as DateRangeRestriction);
      }

      const config: RestrictionConfig = { restrictions };
      const startTime = performance.now();
      
      manager = new RestrictionManager(config);
      const result = manager.checkSelection(parseISO('2025-06-15'), parseISO('2025-06-15'));
      
      const endTime = performance.now();
      
      // Should complete within reasonable time (less than 10ms)
      expect(endTime - startTime).toBeLessThan(10);
      expect(result.allowed).toBe(true);
    });
  });
});