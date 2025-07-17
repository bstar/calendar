import { describe, it, expect } from 'vitest';
import {
  hasAnyBoundaryRestriction,
  isAnchorInAnyBoundary,
  isDateInAnyBoundary,
  isInSameBoundary
} from './DayCell.utils';
import { RestrictionConfig } from '../../../CLACalendarComponents/restrictions/types';

describe('DayCell.utils', () => {
  describe('hasAnyBoundaryRestriction', () => {
    it('should return false when no restrictionConfig provided', () => {
      expect(hasAnyBoundaryRestriction()).toBe(false);
    });

    it('should return false when restrictions array is empty', () => {
      const config: RestrictionConfig = { restrictions: [] };
      expect(hasAnyBoundaryRestriction(config)).toBe(false);
    });

    it('should return false when no restricted_boundary type exists', () => {
      const config: RestrictionConfig = {
        restrictions: [
          { type: 'daterange', enabled: true },
          { type: 'boundary', enabled: true }
        ]
      };
      expect(hasAnyBoundaryRestriction(config)).toBe(false);
    });

    it('should return false when restricted_boundary exists but is disabled', () => {
      const config: RestrictionConfig = {
        restrictions: [
          { type: 'restricted_boundary', enabled: false }
        ]
      };
      expect(hasAnyBoundaryRestriction(config)).toBe(false);
    });

    it('should return true when enabled restricted_boundary exists', () => {
      const config: RestrictionConfig = {
        restrictions: [
          { type: 'restricted_boundary', enabled: true }
        ]
      };
      expect(hasAnyBoundaryRestriction(config)).toBe(true);
    });

    it('should return true when at least one enabled restricted_boundary exists among others', () => {
      const config: RestrictionConfig = {
        restrictions: [
          { type: 'daterange', enabled: true },
          { type: 'restricted_boundary', enabled: false },
          { type: 'restricted_boundary', enabled: true },
          { type: 'boundary', enabled: true }
        ]
      };
      expect(hasAnyBoundaryRestriction(config)).toBe(true);
    });
  });

  describe('isAnchorInAnyBoundary', () => {
    const testDate = new Date('2025-06-15');

    it('should return not in boundary when no restrictionConfig provided', () => {
      const result = isAnchorInAnyBoundary(testDate);
      expect(result).toEqual({
        inBoundary: false,
        boundaryStart: null,
        boundaryEnd: null,
        message: null
      });
    });

    it('should return not in boundary when restrictions array is empty', () => {
      const config: RestrictionConfig = { restrictions: [] };
      const result = isAnchorInAnyBoundary(testDate, config);
      expect(result).toEqual({
        inBoundary: false,
        boundaryStart: null,
        boundaryEnd: null,
        message: null
      });
    });

    it('should return not in boundary when no restricted_boundary type exists', () => {
      const config: RestrictionConfig = {
        restrictions: [
          { type: 'daterange', enabled: true },
          { type: 'boundary', enabled: true }
        ]
      };
      const result = isAnchorInAnyBoundary(testDate, config);
      expect(result.inBoundary).toBe(false);
    });

    it('should return not in boundary when restricted_boundary is disabled', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'restricted_boundary',
            enabled: false,
            ranges: [{
              startDate: '2025-06-01',
              endDate: '2025-06-30'
            }]
          }
        ]
      };
      const result = isAnchorInAnyBoundary(testDate, config);
      expect(result.inBoundary).toBe(false);
    });

    it('should return in boundary when date is within a range', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'restricted_boundary',
            enabled: true,
            ranges: [{
              startDate: '2025-06-01',
              endDate: '2025-06-30',
              message: 'Stay within June'
            }]
          }
        ]
      };
      const result = isAnchorInAnyBoundary(testDate, config);
      expect(result.inBoundary).toBe(true);
      expect(result.boundaryStart).toEqual(new Date('2025-06-01'));
      expect(result.boundaryEnd).toEqual(new Date('2025-06-30'));
      expect(result.message).toBe('Stay within June');
    });

    it('should return default message when range has no message', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'restricted_boundary',
            enabled: true,
            ranges: [{
              startDate: '2025-06-01',
              endDate: '2025-06-30'
            }]
          }
        ]
      };
      const result = isAnchorInAnyBoundary(testDate, config);
      expect(result.message).toBe('Selection must stay within the boundary');
    });

    it('should return not in boundary when date is outside all ranges', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'restricted_boundary',
            enabled: true,
            ranges: [
              {
                startDate: '2025-01-01',
                endDate: '2025-01-31'
              },
              {
                startDate: '2025-12-01',
                endDate: '2025-12-31'
              }
            ]
          }
        ]
      };
      const result = isAnchorInAnyBoundary(testDate, config);
      expect(result.inBoundary).toBe(false);
    });

    it('should check multiple restricted_boundary restrictions', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'restricted_boundary',
            enabled: true,
            ranges: [{
              startDate: '2025-01-01',
              endDate: '2025-01-31'
            }]
          },
          {
            type: 'restricted_boundary',
            enabled: true,
            ranges: [{
              startDate: '2025-06-01',
              endDate: '2025-06-30',
              message: 'June boundary'
            }]
          }
        ]
      };
      const result = isAnchorInAnyBoundary(testDate, config);
      expect(result.inBoundary).toBe(true);
      expect(result.message).toBe('June boundary');
    });

    it('should handle invalid date strings in ranges', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'restricted_boundary',
            enabled: true,
            ranges: [
              {
                startDate: 'invalid-date',
                endDate: '2025-06-30'
              },
              {
                startDate: '2025-06-01',
                endDate: 'also-invalid'
              },
              {
                startDate: '2025-06-01',
                endDate: '2025-06-30'
              }
            ]
          }
        ]
      };
      const result = isAnchorInAnyBoundary(testDate, config);
      // Should skip invalid ranges and find the valid one
      expect(result.inBoundary).toBe(true);
    });

    it('should handle restriction without ranges property', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'restricted_boundary',
            enabled: true
            // No ranges property
          }
        ]
      };
      const result = isAnchorInAnyBoundary(testDate, config);
      expect(result.inBoundary).toBe(false);
    });

    it('should handle boundary dates inclusively', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'restricted_boundary',
            enabled: true,
            ranges: [{
              startDate: '2025-06-15',
              endDate: '2025-06-15'
            }]
          }
        ]
      };
      // Test date is exactly on the boundary
      const result = isAnchorInAnyBoundary(testDate, config);
      expect(result.inBoundary).toBe(true);
    });
  });

  describe('isDateInAnyBoundary', () => {
    const testDate = new Date('2025-06-15');

    it('should return false when no restrictionConfig provided', () => {
      expect(isDateInAnyBoundary(testDate)).toBe(false);
    });

    it('should return false when restrictions array is empty', () => {
      const config: RestrictionConfig = { restrictions: [] };
      expect(isDateInAnyBoundary(testDate, config)).toBe(false);
    });

    it('should return true when date is within a boundary', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'restricted_boundary',
            enabled: true,
            ranges: [{
              startDate: '2025-06-01',
              endDate: '2025-06-30'
            }]
          }
        ]
      };
      expect(isDateInAnyBoundary(testDate, config)).toBe(true);
    });

    it('should return false when date is outside all boundaries', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'restricted_boundary',
            enabled: true,
            ranges: [{
              startDate: '2025-01-01',
              endDate: '2025-01-31'
            }]
          }
        ]
      };
      expect(isDateInAnyBoundary(testDate, config)).toBe(false);
    });

    it('should handle multiple ranges and return true if in any', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'restricted_boundary',
            enabled: true,
            ranges: [
              {
                startDate: '2025-01-01',
                endDate: '2025-01-31'
              },
              {
                startDate: '2025-06-01',
                endDate: '2025-06-30'
              },
              {
                startDate: '2025-12-01',
                endDate: '2025-12-31'
              }
            ]
          }
        ]
      };
      expect(isDateInAnyBoundary(testDate, config)).toBe(true);
    });

    it('should ignore disabled restrictions', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'restricted_boundary',
            enabled: false,
            ranges: [{
              startDate: '2025-06-01',
              endDate: '2025-06-30'
            }]
          }
        ]
      };
      expect(isDateInAnyBoundary(testDate, config)).toBe(false);
    });

    it('should handle invalid dates gracefully', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'restricted_boundary',
            enabled: true,
            ranges: [{
              startDate: 'not-a-date',
              endDate: '2025-06-30'
            }]
          }
        ]
      };
      expect(isDateInAnyBoundary(testDate, config)).toBe(false);
    });
  });

  describe('isInSameBoundary', () => {
    const checkDate = new Date('2025-06-15');
    const boundaryStart = new Date('2025-06-01');
    const boundaryEnd = new Date('2025-06-30');

    it('should return true when date is within boundary', () => {
      expect(isInSameBoundary(checkDate, boundaryStart, boundaryEnd)).toBe(true);
    });

    it('should return true when date equals boundary start', () => {
      const dateOnStart = new Date('2025-06-01');
      expect(isInSameBoundary(dateOnStart, boundaryStart, boundaryEnd)).toBe(true);
    });

    it('should return true when date equals boundary end', () => {
      const dateOnEnd = new Date('2025-06-30');
      expect(isInSameBoundary(dateOnEnd, boundaryStart, boundaryEnd)).toBe(true);
    });

    it('should return false when date is before boundary', () => {
      const beforeDate = new Date('2025-05-31');
      expect(isInSameBoundary(beforeDate, boundaryStart, boundaryEnd)).toBe(false);
    });

    it('should return false when date is after boundary', () => {
      const afterDate = new Date('2025-07-01');
      expect(isInSameBoundary(afterDate, boundaryStart, boundaryEnd)).toBe(false);
    });

    it('should return false when boundaryStart is null', () => {
      expect(isInSameBoundary(checkDate, null, boundaryEnd)).toBe(false);
    });

    it('should return false when boundaryEnd is null', () => {
      expect(isInSameBoundary(checkDate, boundaryStart, null)).toBe(false);
    });

    it('should return false when both boundaries are null', () => {
      expect(isInSameBoundary(checkDate, null, null)).toBe(false);
    });

    it('should handle single-day boundary', () => {
      const singleDayStart = new Date('2025-06-15');
      const singleDayEnd = new Date('2025-06-15');
      expect(isInSameBoundary(checkDate, singleDayStart, singleDayEnd)).toBe(true);
    });
  });
});