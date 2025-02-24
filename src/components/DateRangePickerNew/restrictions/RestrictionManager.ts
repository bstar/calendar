import { parseISO } from 'date-fns';
import { RestrictionConfig, ReadOnlyRange } from './types';

export class RestrictionManager {
  private config: RestrictionConfig;

  constructor(config: RestrictionConfig) {
    this.config = config;
  }

  checkSelection(startDate: Date, endDate: Date): {
    allowed: boolean;
    message?: string;
  } {
    if (!this.config.enabled) return { allowed: true };

    for (const range of this.config.readOnlyRanges) {
      const rangeStart = parseISO(range.start);
      const rangeEnd = parseISO(range.end);

      // Check if selection overlaps with any read-only range
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