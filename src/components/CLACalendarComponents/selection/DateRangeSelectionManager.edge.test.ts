import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DateRangeSelectionManager } from './DateRangeSelectionManager';
import { RestrictionConfig } from '../restrictions/types';
import { createDate } from '../../../utils/DateUtils';

describe('DateRangeSelectionManager - Edge Cases', () => {
  let manager: DateRangeSelectionManager;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Restricted Boundary Edge Cases', () => {
    beforeEach(() => {
      const restrictionConfig: RestrictionConfig = {
        restrictions: [
          {
            type: 'restricted_boundary',
            enabled: true,
            ranges: [
              {
                startDate: '2025-06-10',
                endDate: '2025-06-20',
                message: 'Must stay within June 10-20'
              },
              {
                startDate: '2025-07-01',
                endDate: '2025-07-10',
                message: 'Must stay within July 1-10'
              }
            ]
          }
        ]
      };
      manager = new DateRangeSelectionManager(restrictionConfig, 'range', true);
    });

    it('should handle backward selection hitting boundary start', () => {
      // Start within the June boundary
      const anchorDate = createDate(2025, 5, 15); // June 15
      const startResult = manager.startSelection(anchorDate);
      
      // Try to select before the boundary
      const beforeBoundary = createDate(2025, 5, 5); // June 5
      const updateResult = manager.updateSelection(startResult.range, beforeBoundary);
      
      expect(updateResult.success).toBe(true);
      expect(updateResult.range.start).toBe('2025-06-10'); // Limited to boundary start
      expect(updateResult.range.end).toBe('2025-06-15');
      expect(updateResult.range.isBackwardSelection).toBe(true);
      expect(updateResult.message).toBe('Must stay within June 10-20');
    });

    it('should handle forward selection hitting boundary end', () => {
      // Start within the June boundary
      const anchorDate = createDate(2025, 5, 15); // June 15
      const startResult = manager.startSelection(anchorDate);
      
      // Try to select after the boundary
      const afterBoundary = createDate(2025, 5, 25); // June 25
      const updateResult = manager.updateSelection(startResult.range, afterBoundary);
      
      expect(updateResult.success).toBe(true);
      expect(updateResult.range.start).toBe('2025-06-15');
      expect(updateResult.range.end).toBe('2025-06-20'); // Limited to boundary end
      expect(updateResult.range.isBackwardSelection).toBe(false);
      expect(updateResult.message).toBe('Must stay within June 10-20');
    });

    it('should check anchor date in multiple boundaries', () => {
      // Test with anchor in the second boundary
      const anchorDate = createDate(2025, 6, 5); // July 5
      const startResult = manager.startSelection(anchorDate);
      
      const beforeBoundary = createDate(2025, 5, 25); // June 25
      const updateResult = manager.updateSelection(startResult.range, beforeBoundary);
      
      expect(updateResult.success).toBe(true);
      expect(updateResult.range.start).toBe('2025-07-01'); // Limited to July boundary start
      expect(updateResult.range.end).toBe('2025-07-05');
    });

    it('should handle disabled boundary restrictions', () => {
      const restrictionConfig: RestrictionConfig = {
        restrictions: [
          {
            type: 'restricted_boundary',
            enabled: false, // Disabled
            ranges: [
              {
                startDate: '2025-06-10',
                endDate: '2025-06-20',
                message: 'Should not apply'
              }
            ]
          }
        ]
      };
      manager = new DateRangeSelectionManager(restrictionConfig, 'range');
      
      const anchorDate = createDate(2025, 5, 15);
      const startResult = manager.startSelection(anchorDate);
      
      const outsideBoundary = createDate(2025, 5, 5);
      const updateResult = manager.updateSelection(startResult.range, outsideBoundary);
      
      expect(updateResult.success).toBe(true);
      expect(updateResult.range.start).toBe('2025-06-05'); // Not limited
    });

    it('should handle invalid boundary dates', () => {
      const restrictionConfig: RestrictionConfig = {
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
          }
        ]
      };
      manager = new DateRangeSelectionManager(restrictionConfig, 'range');
      
      const date = createDate(2025, 5, 15);
      const result = manager.canSelectDate(date);
      
      expect(result.allowed).toBe(true); // Should ignore invalid boundaries
    });
  });

  describe('Selection with Blocked Ranges', () => {
    beforeEach(() => {
      const restrictionConfig: RestrictionConfig = {
        restrictions: [
          {
            type: 'daterange',
            enabled: true,
            ranges: [
              {
                startDate: '2025-06-10',
                endDate: '2025-06-12',
                message: 'Blocked period 1'
              },
              {
                startDate: '2025-06-18',
                endDate: '2025-06-20',
                message: 'Blocked period 2'
              }
            ]
          }
        ]
      };
      manager = new DateRangeSelectionManager(restrictionConfig, 'range');
    });

    it('should stop backward selection at blocked range', () => {
      // Start after blocked range
      const anchorDate = createDate(2025, 5, 15); // June 15
      const startResult = manager.startSelection(anchorDate);
      
      // Try to extend backward through blocked range
      const beforeBlocked = createDate(2025, 5, 8); // June 8
      const updateResult = manager.updateSelection(startResult.range, beforeBlocked);
      
      expect(updateResult.success).toBe(true);
      expect(updateResult.range.start).toBe('2025-06-13'); // Stopped after blocked range
      expect(updateResult.range.end).toBe('2025-06-15');
      expect(updateResult.message).toBe('Blocked period 1');
    });

    it('should stop forward selection at blocked range', () => {
      // Start before blocked range
      const anchorDate = createDate(2025, 5, 15); // June 15
      const startResult = manager.startSelection(anchorDate);
      
      // Try to extend forward through blocked range
      const afterBlocked = createDate(2025, 5, 22); // June 22
      const updateResult = manager.updateSelection(startResult.range, afterBlocked);
      
      expect(updateResult.success).toBe(true);
      expect(updateResult.range.start).toBe('2025-06-15');
      expect(updateResult.range.end).toBe('2025-06-17'); // Stopped before blocked range
      expect(updateResult.message).toBe('Blocked period 2');
    });

    it('should handle selection when no valid dates found backward', () => {
      // Create a scenario where the anchor is immediately after a blocked range
      const anchorDate = createDate(2025, 5, 13); // June 13 (right after blocked 10-12)
      const startResult = manager.startSelection(anchorDate);
      
      // Try to select into the blocked range
      const inBlocked = createDate(2025, 5, 11); // June 11 (in blocked range)
      const updateResult = manager.updateSelection(startResult.range, inBlocked);
      
      expect(updateResult.success).toBe(false);
      expect(updateResult.range.start).toBe('2025-06-13');
      expect(updateResult.range.end).toBe('2025-06-13');
      expect(updateResult.range.isBackwardSelection).toBe(true);
    });

    it('should handle selection when no valid dates found forward', () => {
      // Create a scenario where the anchor is immediately before a blocked range
      const anchorDate = createDate(2025, 5, 17); // June 17 (right before blocked 18-20)
      const startResult = manager.startSelection(anchorDate);
      
      // Try to select into the blocked range
      const inBlocked = createDate(2025, 5, 19); // June 19 (in blocked range)
      const updateResult = manager.updateSelection(startResult.range, inBlocked);
      
      expect(updateResult.success).toBe(false);
      expect(updateResult.range.start).toBe('2025-06-17');
      expect(updateResult.range.end).toBe('2025-06-17');
      expect(updateResult.range.isBackwardSelection).toBe(false);
    });
  });

  describe('Complex Restriction Scenarios', () => {
    it('should handle boundary within restricted boundary forward', () => {
      const restrictionConfig: RestrictionConfig = {
        restrictions: [
          {
            type: 'restricted_boundary',
            enabled: true,
            ranges: [
              {
                startDate: '2025-06-01',
                endDate: '2025-06-30',
                message: 'June boundary'
              }
            ]
          },
          {
            type: 'daterange',
            enabled: true,
            ranges: [
              {
                startDate: '2025-06-20',
                endDate: '2025-06-25',
                message: 'Blocked within boundary'
              }
            ]
          }
        ]
      };
      manager = new DateRangeSelectionManager(restrictionConfig, 'range');
      
      const anchorDate = createDate(2025, 5, 15);
      const startResult = manager.startSelection(anchorDate);
      
      // Try to extend past blocked range but within boundary
      const pastBlocked = createDate(2025, 5, 27);
      const updateResult = manager.updateSelection(startResult.range, pastBlocked);
      
      expect(updateResult.success).toBe(true);
      expect(updateResult.range.end).toBe('2025-06-19'); // Stopped before blocked range
    });

    it('should handle boundary within restricted boundary backward', () => {
      const restrictionConfig: RestrictionConfig = {
        restrictions: [
          {
            type: 'restricted_boundary',
            enabled: true,
            ranges: [
              {
                startDate: '2025-06-01',
                endDate: '2025-06-30',
                message: 'June boundary'
              }
            ]
          },
          {
            type: 'daterange',
            enabled: true,
            ranges: [
              {
                startDate: '2025-06-05',
                endDate: '2025-06-10',
                message: 'Blocked within boundary'
              }
            ]
          }
        ]
      };
      manager = new DateRangeSelectionManager(restrictionConfig, 'range');
      
      const anchorDate = createDate(2025, 5, 15);
      const startResult = manager.startSelection(anchorDate);
      
      // Try to extend past blocked range but within boundary
      const beforeBlocked = createDate(2025, 5, 3);
      const updateResult = manager.updateSelection(startResult.range, beforeBlocked);
      
      expect(updateResult.success).toBe(true);
      expect(updateResult.range.start).toBe('2025-06-11'); // Stopped after blocked range
    });
  });

  describe('Single Selection Mode Edge Cases', () => {
    beforeEach(() => {
      const restrictionConfig: RestrictionConfig = {
        restrictions: [
          {
            type: 'daterange',
            enabled: true,
            ranges: [
              {
                startDate: '2025-06-10',
                endDate: '2025-06-15',
                message: 'Blocked dates'
              }
            ]
          }
        ]
      };
      manager = new DateRangeSelectionManager(restrictionConfig, 'single');
    });

    it('should handle restricted single date update', () => {
      const validDate = createDate(2025, 5, 8);
      const startResult = manager.startSelection(validDate);
      
      const restrictedDate = createDate(2025, 5, 12); // In blocked range
      const updateResult = manager.updateSelection(startResult.range, restrictedDate);
      
      expect(updateResult.success).toBe(false);
      expect(updateResult.range).toEqual(startResult.range);
      expect(updateResult.message).toBe('Blocked dates');
    });
  });

  describe('Invalid Range Scenarios', () => {
    beforeEach(() => {
      manager = new DateRangeSelectionManager(undefined, 'range');
    });

    it('should handle canSelectRange with both dates invalid', () => {
      const invalidDate1 = new Date('invalid1');
      const invalidDate2 = new Date('invalid2');
      
      const result = manager.canSelectRange(invalidDate1, invalidDate2);
      
      expect(result.allowed).toBe(false);
      expect(result.message).toBe('Invalid date range');
    });

    it('should handle canSelectRange with end date invalid', () => {
      const validDate = createDate(2025, 5, 15);
      const invalidDate = new Date('invalid');
      
      const result = manager.canSelectRange(validDate, invalidDate);
      
      expect(result.allowed).toBe(false);
      expect(result.message).toBe('Invalid date range');
    });
  });

  describe('Anchor Date Edge Cases', () => {
    it('should use start date when anchorDate is missing', () => {
      manager = new DateRangeSelectionManager(undefined, 'range');
      
      // Create a range without anchorDate
      const range = {
        start: '2025-06-15',
        end: null,
        anchorDate: null
      };
      
      const newDate = createDate(2025, 5, 20);
      const updateResult = manager.updateSelection(range, newDate);
      
      expect(updateResult.success).toBe(true);
      expect(updateResult.range.anchorDate).toBe('2025-06-15');
    });
  });

  describe('Restriction Message Handling', () => {
    it('should provide default message when restriction has no message', () => {
      const restrictionConfig: RestrictionConfig = {
        restrictions: [
          {
            type: 'restricted_boundary',
            enabled: true,
            ranges: [
              {
                startDate: '2025-06-10',
                endDate: '2025-06-20'
                // No message provided
              }
            ]
          }
        ]
      };
      manager = new DateRangeSelectionManager(restrictionConfig, 'range');
      
      const anchorDate = createDate(2025, 5, 15);
      const startResult = manager.startSelection(anchorDate);
      
      const outsideBoundary = createDate(2025, 5, 25);
      const updateResult = manager.updateSelection(startResult.range, outsideBoundary);
      
      expect(updateResult.message).toBe('Selection must stay within the boundary');
    });
  });
});