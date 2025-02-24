import { parseISO } from 'date-fns';
import { RestrictionConfig, ReadOnlyRestriction } from './types';

export class RestrictionManager {
  private config: RestrictionConfig;

  constructor(config: RestrictionConfig) {
    this.config = config;
  }

  checkSelection(startDate: Date, endDate: Date): {
    allowed: boolean;
    message?: string;
  } {
    for (const restriction of this.config.restrictions) {
      if (!restriction.enabled) continue;

      switch (restriction.type) {
        case 'readonly':
          const result = this.checkReadOnlyRestriction(restriction, startDate, endDate);
          if (!result.allowed) return result;
          break;
        // Add more restriction type checks here
      }
    }

    return { allowed: true };
  }

  private checkReadOnlyRestriction(
    restriction: ReadOnlyRestriction, 
    startDate: Date, 
    endDate: Date
  ): { allowed: boolean; message?: string; } {
    for (const range of restriction.ranges) {
      if (!range.start || !range.end) continue; // Skip incomplete ranges
      const rangeStart = parseISO(range.start);
      const rangeEnd = parseISO(range.end);

      // Skip invalid dates
      if (isNaN(rangeStart.getTime()) || isNaN(rangeEnd.getTime())) continue;

      if (
        (startDate >= rangeStart && startDate <= rangeEnd) ||
        (endDate >= rangeStart && endDate <= rangeEnd) ||
        (startDate <= rangeStart && endDate >= rangeEnd)
      ) {
        return {
          allowed: false,
          message: range.message || 'This date range is read-only'
        };
      }
    }

    return { allowed: true };
  }
} 