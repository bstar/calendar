import { describe, it, expect } from 'vitest';
import { RestrictionManager } from './RestrictionManager';
import { createDate } from '../../../utils/DateUtils';

describe('RestrictionManager - Restricted Boundary with Anchor Date', () => {
  it('should allow selection from October (no boundary) to September (has boundary)', () => {
    const config = {
      restrictions: [{
        type: 'restricted_boundary' as const,
        enabled: true,
        ranges: [
          {
            startDate: '2025-08-01',
            endDate: '2025-08-31',
            message: 'August boundary'
          },
          {
            startDate: '2025-09-01',
            endDate: '2025-09-30',
            message: 'September boundary'
          }
          // Note: October has NO boundary defined
        ]
      }]
    };

    const manager = new RestrictionManager(config);
    
    // Selecting from October 15 (anchor, no boundary) backward to September 20 (has boundary)
    const anchorDate = createDate(2025, 9, 15); // October 15
    const targetDate = createDate(2025, 8, 20); // September 20
    
    // Without anchor date (old behavior) - would incorrectly restrict
    const resultWithoutAnchor = manager.checkSelection(targetDate, anchorDate);
    
    // With anchor date (new behavior) - should allow since anchor is not in a boundary
    const resultWithAnchor = manager.checkSelection(targetDate, anchorDate, anchorDate);
    
    // The key difference: with anchor date, it should be allowed
    expect(resultWithAnchor.allowed).toBe(true);
    expect(resultWithAnchor.message).toBeUndefined();
  });

  it('should restrict selection when starting within a boundary', () => {
    const config = {
      restrictions: [{
        type: 'restricted_boundary' as const,
        enabled: true,
        ranges: [
          {
            startDate: '2025-09-01',
            endDate: '2025-09-30',
            message: 'September boundary - must stay within'
          }
        ]
      }]
    };

    const manager = new RestrictionManager(config);
    
    // Selecting from September 15 (anchor, in boundary) to October 5 (outside boundary)
    const anchorDate = createDate(2025, 8, 15); // September 15
    const targetDate = createDate(2025, 9, 5);  // October 5
    
    // With anchor date in boundary, selection must stay within boundary
    const result = manager.checkSelection(anchorDate, targetDate, anchorDate);
    
    expect(result.allowed).toBe(false);
    expect(result.message).toContain('September boundary - must stay within');
  });

  it('should allow backward selection within the same boundary', () => {
    const config = {
      restrictions: [{
        type: 'restricted_boundary' as const,
        enabled: true,
        ranges: [
          {
            startDate: '2025-09-01',
            endDate: '2025-09-30',
            message: 'September boundary'
          }
        ]
      }]
    };

    const manager = new RestrictionManager(config);
    
    // Selecting from September 20 backward to September 10 (both in same boundary)
    const anchorDate = createDate(2025, 8, 20); // September 20
    const targetDate = createDate(2025, 8, 10); // September 10
    
    const result = manager.checkSelection(targetDate, anchorDate, anchorDate);
    
    expect(result.allowed).toBe(true);
    expect(result.message).toBeUndefined();
  });
});