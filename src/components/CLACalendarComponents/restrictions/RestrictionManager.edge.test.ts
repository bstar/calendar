import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RestrictionManager } from './RestrictionManager';
import { parseISO, createDate } from '../../../utils/DateUtils';
import type { 
  RestrictionConfig, 
  BoundaryRestriction, 
  DateRangeRestriction, 
  WeekdayRestriction,
  RestrictedBoundaryRestriction,
  AllowedRangesRestriction 
} from './types';

describe('RestrictionManager - Edge Cases', () => {
  let manager: RestrictionManager;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Restricted Boundary Edge Cases', () => {
    it('should handle selection that starts outside restricted boundary', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'restricted_boundary',
            enabled: true,
            ranges: [
              {
                startDate: '2025-06-10',
                endDate: '2025-06-20',
                message: 'Must stay within boundary when starting inside'
              }
            ]
          } as RestrictedBoundaryRestriction
        ]
      };
      manager = new RestrictionManager(config);

      // Selection starts outside the boundary - no restriction should apply
      const start = parseISO('2025-06-05');
      const end = parseISO('2025-06-25');
      const result = manager.checkSelection(start, end);
      
      expect(result.allowed).toBe(true); // No restriction when starting outside
    });

    it('should enforce boundary when selection starts inside', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'restricted_boundary',
            enabled: true,
            ranges: [
              {
                startDate: '2025-06-10',
                endDate: '2025-06-20',
                message: 'Must stay within boundary'
              }
            ]
          } as RestrictedBoundaryRestriction
        ]
      };
      manager = new RestrictionManager(config);

      // Selection starts inside but ends outside
      const start = parseISO('2025-06-15');
      const end = parseISO('2025-06-25');
      const result = manager.checkSelection(start, end);
      
      expect(result.allowed).toBe(false);
      expect(result.message).toBe('Must stay within boundary');
    });

    it('should handle selection ending before boundary start', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'restricted_boundary',
            enabled: true,
            ranges: [
              {
                startDate: '2025-06-10',
                endDate: '2025-06-20',
                message: 'Must stay within boundary'
              }
            ]
          } as RestrictedBoundaryRestriction
        ]
      };
      manager = new RestrictionManager(config);

      // Selection starts inside but ends before boundary start
      const start = parseISO('2025-06-15');
      const end = parseISO('2025-06-05');
      const result = manager.checkSelection(start, end);
      
      expect(result.allowed).toBe(false);
      expect(result.message).toBe('Must stay within boundary');
    });

    it('should handle invalid boundary dates', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'restricted_boundary',
            enabled: true,
            ranges: [
              {
                startDate: 'invalid-date',
                endDate: '2025-06-20',
                message: 'Invalid boundary'
              }
            ]
          } as RestrictedBoundaryRestriction
        ]
      };
      manager = new RestrictionManager(config);

      const result = manager.checkSelection(parseISO('2025-06-15'), parseISO('2025-06-18'));
      expect(result.allowed).toBe(true); // Should skip invalid ranges
    });

    it('should handle multiple boundary ranges', () => {
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
                startDate: '2025-06-15',
                endDate: '2025-06-20',
                message: 'Second boundary'
              }
            ]
          } as RestrictedBoundaryRestriction
        ]
      };
      manager = new RestrictionManager(config);

      // Selection in first boundary trying to extend beyond
      const result1 = manager.checkSelection(parseISO('2025-06-05'), parseISO('2025-06-12'));
      expect(result1.allowed).toBe(false);
      expect(result1.message).toBe('First boundary');

      // Selection in second boundary staying within
      const result2 = manager.checkSelection(parseISO('2025-06-16'), parseISO('2025-06-18'));
      expect(result2.allowed).toBe(true);
    });

    it('should return disabled boundaries as empty array', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'restricted_boundary',
            enabled: false,
            ranges: [
              {
                startDate: '2025-06-10',
                endDate: '2025-06-20',
                message: 'Disabled boundary'
              }
            ]
          } as RestrictedBoundaryRestriction
        ]
      };
      manager = new RestrictionManager(config);

      const boundaries = manager.getRestrictedBoundaries();
      expect(boundaries).toHaveLength(0);
    });

    it('should filter non-boundary restrictions from getRestrictedBoundaries', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'boundary',
            enabled: true,
            date: '2025-06-01',
            direction: 'before'
          } as BoundaryRestriction,
          {
            type: 'restricted_boundary',
            enabled: true,
            ranges: [{
              startDate: '2025-06-10',
              endDate: '2025-06-20'
            }]
          } as RestrictedBoundaryRestriction,
          {
            type: 'daterange',
            enabled: true,
            ranges: []
          } as DateRangeRestriction
        ]
      };
      manager = new RestrictionManager(config);

      const boundaries = manager.getRestrictedBoundaries();
      expect(boundaries).toHaveLength(1);
      expect(boundaries[0].type).toBe('restricted_boundary');
    });
  });

  describe('Allowed Ranges Edge Cases', () => {
    it('should handle empty allowed ranges', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'allowedranges',
            enabled: true,
            ranges: []
          } as AllowedRangesRestriction
        ]
      };
      manager = new RestrictionManager(config);

      // Empty ranges means nothing is allowed
      const result = manager.checkSelection(parseISO('2025-06-15'), parseISO('2025-06-15'));
      expect(result.allowed).toBe(true); // Empty ranges are ignored
    });

    it('should handle selection partially within allowed range', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'allowedranges',
            enabled: true,
            ranges: [
              {
                startDate: '2025-06-10',
                endDate: '2025-06-20',
                message: 'Must be within allowed range'
              }
            ]
          } as AllowedRangesRestriction
        ]
      };
      manager = new RestrictionManager(config);

      // Start inside, end outside
      const result1 = manager.checkSelection(parseISO('2025-06-15'), parseISO('2025-06-25'));
      expect(result1.allowed).toBe(false);
      expect(result1.message).toBe('Must be within allowed range');

      // Start outside, end inside
      const result2 = manager.checkSelection(parseISO('2025-06-05'), parseISO('2025-06-15'));
      expect(result2.allowed).toBe(false);
    });

    it('should use first range message when no allowed ranges match', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'allowedranges',
            enabled: true,
            ranges: [
              {
                startDate: '2025-06-01',
                endDate: '2025-06-05',
                message: 'First range message'
              },
              {
                startDate: '2025-06-10',
                endDate: '2025-06-15',
                message: 'Second range message'
              }
            ]
          } as AllowedRangesRestriction
        ]
      };
      manager = new RestrictionManager(config);

      const result = manager.checkSelection(parseISO('2025-06-20'), parseISO('2025-06-25'));
      expect(result.allowed).toBe(false);
      expect(result.message).toBe('First range message');
    });

    it('should handle invalid dates in allowed ranges', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'allowedranges',
            enabled: true,
            ranges: [
              {
                startDate: 'invalid-start',
                endDate: '2025-06-20'
              },
              {
                startDate: '2025-06-25',
                endDate: 'invalid-end'
              },
              {
                startDate: '2025-06-10',
                endDate: '2025-06-15',
                message: 'Valid range'
              }
            ]
          } as AllowedRangesRestriction
        ]
      };
      manager = new RestrictionManager(config);

      // Should only consider valid range
      const result = manager.checkSelection(parseISO('2025-06-12'), parseISO('2025-06-14'));
      expect(result.allowed).toBe(true);
    });

    it('should handle default message when no range has message', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'allowedranges',
            enabled: true,
            ranges: [
              {
                startDate: '2025-06-01',
                endDate: '2025-06-05'
                // No message
              }
            ]
          } as AllowedRangesRestriction
        ]
      };
      manager = new RestrictionManager(config);

      const result = manager.checkSelection(parseISO('2025-06-10'), parseISO('2025-06-15'));
      expect(result.allowed).toBe(false);
      expect(result.message).toBe('Selection must be within allowed ranges');
    });
  });

  describe('Weekday Restriction Edge Cases', () => {
    it('should handle single day selection on restricted weekday', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'weekday',
            enabled: true,
            days: [1], // Monday
            message: 'Mondays not allowed'
          } as WeekdayRestriction
        ]
      };
      manager = new RestrictionManager(config);

      // June 16, 2025 is a Monday
      const monday = parseISO('2025-06-16');
      const result = manager.checkSelection(monday, monday);
      
      expect(result.allowed).toBe(false);
      expect(result.message).toBe('Mondays not allowed');
    });

    it('should check all days in range for weekday restrictions', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'weekday',
            enabled: true,
            days: [3], // Wednesday
            message: 'No Wednesdays'
          } as WeekdayRestriction
        ]
      };
      manager = new RestrictionManager(config);

      // Range that includes a Wednesday
      const start = parseISO('2025-06-16'); // Monday
      const end = parseISO('2025-06-20'); // Friday
      const result = manager.checkSelection(start, end);
      
      expect(result.allowed).toBe(false);
      expect(result.message).toBe('No Wednesdays');
    });

    it('should handle empty weekday list', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'weekday',
            enabled: true,
            days: [],
            message: 'No days restricted'
          } as WeekdayRestriction
        ]
      };
      manager = new RestrictionManager(config);

      const result = manager.checkSelection(parseISO('2025-06-15'), parseISO('2025-06-20'));
      expect(result.allowed).toBe(true);
    });

    it('should handle all weekdays restricted', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'weekday',
            enabled: true,
            days: [0, 1, 2, 3, 4, 5, 6], // All days
            message: 'No days allowed'
          } as WeekdayRestriction
        ]
      };
      manager = new RestrictionManager(config);

      const result = manager.checkSelection(parseISO('2025-06-15'), parseISO('2025-06-15'));
      expect(result.allowed).toBe(false);
      expect(result.message).toBe('No days allowed');
    });

    it('should use default message when none provided', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'weekday',
            enabled: true,
            days: [0, 6] // Weekends
            // No message
          } as WeekdayRestriction
        ]
      };
      manager = new RestrictionManager(config);

      const sunday = parseISO('2025-06-15');
      const result = manager.checkSelection(sunday, sunday);
      
      expect(result.allowed).toBe(false);
      expect(result.message).toBe('Selection includes restricted weekdays');
    });
  });

  describe('Boundary Restriction Edge Cases', () => {
    it('should handle after boundary with precise timestamps', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'boundary',
            enabled: true,
            date: '2025-06-15',
            direction: 'after',
            message: 'Cannot select after June 15'
          } as BoundaryRestriction
        ]
      };
      manager = new RestrictionManager(config);

      // June 15 should be allowed
      const june15 = parseISO('2025-06-15');
      expect(manager.checkSelection(june15, june15).allowed).toBe(true);
      
      // July 1st (clearly after) should be rejected
      const july1 = parseISO('2025-07-01');
      expect(manager.checkSelection(july1, july1).allowed).toBe(false);
    });

    it('should handle invalid boundary date string', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'boundary',
            enabled: true,
            date: '', // Empty string
            direction: 'before',
            message: 'Invalid boundary'
          } as BoundaryRestriction
        ]
      };
      manager = new RestrictionManager(config);

      const result = manager.checkSelection(parseISO('2025-06-15'), parseISO('2025-06-15'));
      expect(result.allowed).toBe(true); // Should skip invalid date
    });

    it('should use default messages for boundary restrictions', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'boundary',
            enabled: true,
            date: '2025-06-15',
            direction: 'before'
            // No message
          } as BoundaryRestriction,
          {
            type: 'boundary',
            enabled: true,
            date: '2025-06-20',
            direction: 'after'
            // No message
          } as BoundaryRestriction
        ]
      };
      manager = new RestrictionManager(config);

      const beforeResult = manager.checkSelection(parseISO('2025-06-10'), parseISO('2025-06-10'));
      expect(beforeResult.allowed).toBe(false);
      expect(beforeResult.message).toBe('Selection before boundary date is not allowed');

      const afterResult = manager.checkSelection(parseISO('2025-06-25'), parseISO('2025-06-25'));
      expect(afterResult.allowed).toBe(false);
      expect(afterResult.message).toBe('Selection after boundary date is not allowed');
    });
  });

  describe('Date Range Restriction Edge Cases', () => {
    it('should detect selection start in restricted range', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'daterange',
            enabled: true,
            ranges: [
              {
                startDate: '2025-06-10',
                endDate: '2025-06-15',
                message: 'Blocked range'
              }
            ]
          } as DateRangeRestriction
        ]
      };
      manager = new RestrictionManager(config);

      // Start in blocked range, end outside
      const result = manager.checkSelection(parseISO('2025-06-12'), parseISO('2025-06-20'));
      expect(result.allowed).toBe(false);
      expect(result.message).toBe('Blocked range');
    });

    it('should detect selection end in restricted range', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'daterange',
            enabled: true,
            ranges: [
              {
                startDate: '2025-06-10',
                endDate: '2025-06-15',
                message: 'Blocked range'
              }
            ]
          } as DateRangeRestriction
        ]
      };
      manager = new RestrictionManager(config);

      // Start outside, end in blocked range
      const result = manager.checkSelection(parseISO('2025-06-05'), parseISO('2025-06-12'));
      expect(result.allowed).toBe(false);
      expect(result.message).toBe('Blocked range');
    });

    it('should detect restricted range completely within selection', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'daterange',
            enabled: true,
            ranges: [
              {
                startDate: '2025-06-12',
                endDate: '2025-06-14',
                message: 'Small blocked range'
              }
            ]
          } as DateRangeRestriction
        ]
      };
      manager = new RestrictionManager(config);

      // Selection encompasses entire blocked range
      const result = manager.checkSelection(parseISO('2025-06-10'), parseISO('2025-06-20'));
      expect(result.allowed).toBe(false);
      expect(result.message).toBe('Small blocked range');
    });

    it('should use default message when none provided', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'daterange',
            enabled: true,
            ranges: [
              {
                startDate: '2025-06-10',
                endDate: '2025-06-15'
                // No message
              }
            ]
          } as DateRangeRestriction
        ]
      };
      manager = new RestrictionManager(config);

      const result = manager.checkSelection(parseISO('2025-06-12'), parseISO('2025-06-12'));
      expect(result.allowed).toBe(false);
      expect(result.message).toBe('Selection includes restricted dates');
    });
  });

  describe('Unknown Restriction Types', () => {
    it('should ignore unknown restriction types', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'unknown_type' as any,
            enabled: true,
            someProperty: 'value'
          } as any
        ]
      };
      manager = new RestrictionManager(config);

      const result = manager.checkSelection(parseISO('2025-06-15'), parseISO('2025-06-15'));
      expect(result.allowed).toBe(true); // Unknown types are ignored
    });
  });

  describe('Multiple Restriction Messages', () => {
    it('should concatenate multiple restriction messages', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'boundary',
            enabled: true,
            date: '2025-06-20',
            direction: 'before',
            message: 'Too early'
          } as BoundaryRestriction,
          {
            type: 'weekday',
            enabled: true,
            days: [0],
            message: 'No Sundays'
          } as WeekdayRestriction
        ]
      };
      manager = new RestrictionManager(config);

      // June 15 is both before boundary AND a Sunday
      const sunday = parseISO('2025-06-15');
      const result = manager.checkSelection(sunday, sunday);
      
      expect(result.allowed).toBe(false);
      expect(result.message).toBe('Too early\nNo Sundays');
    });
  });

  describe('Config Edge Cases', () => {
    it('should handle null config', () => {
      manager = new RestrictionManager(null as any);
      
      const result = manager.checkSelection(parseISO('2025-06-15'), parseISO('2025-06-15'));
      expect(result.allowed).toBe(true);
    });

    it('should handle undefined restrictions array', () => {
      manager = new RestrictionManager({ restrictions: undefined as any });
      
      const result = manager.checkSelection(parseISO('2025-06-15'), parseISO('2025-06-15'));
      expect(result.allowed).toBe(true);
    });

    it('should handle config with null restrictions', () => {
      const config: RestrictionConfig = {
        restrictions: [null as any, undefined as any]
      };
      manager = new RestrictionManager(config);
      
      // Should throw or handle gracefully
      expect(() => {
        manager.checkSelection(parseISO('2025-06-15'), parseISO('2025-06-15'));
      }).toThrow();
    });
  });
});