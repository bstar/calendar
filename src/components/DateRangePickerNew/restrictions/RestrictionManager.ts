import { parseISO, isValid, isWithinInterval } from 'date-fns';
import { RestrictionConfig, ReadOnlyRestriction } from './types';

export class RestrictionManager {
  constructor(private config: RestrictionConfig) {}

  checkSelection(start: Date, end: Date): { allowed: boolean; message?: string } {
    if (!this.config?.restrictions) return { allowed: true };

    const messages: string[] = [];
    
    for (const restriction of this.config.restrictions) {
      if (!restriction.enabled) continue;

      // Handle boundary restrictions
      if (restriction.type === 'boundary') {
        const boundaryDate = parseISO(restriction.date);
        if (!isValid(boundaryDate)) continue;

        if (restriction.direction === 'before') {
          if (start < boundaryDate) {
            messages.push(restriction.message || 'Selection before boundary date is not allowed');
          }
        } else {
          // For 'after' direction, check if the date is after the boundary
          const boundaryEndOfDay = new Date(boundaryDate);
          boundaryEndOfDay.setHours(23, 59, 59, 999);
          if (start > boundaryEndOfDay) {
            messages.push(restriction.message || 'Selection after boundary date is not allowed');
          }
        }
      }

      // Handle date range restrictions
      if (restriction.type === 'daterange') {
        for (const range of restriction.ranges) {
          const rangeStart = parseISO(range.start);
          const rangeEnd = parseISO(range.end);
          
          if (!isValid(rangeStart) || !isValid(rangeEnd)) continue;

          if (isWithinInterval(start, { start: rangeStart, end: rangeEnd }) ||
              isWithinInterval(end, { start: rangeStart, end: rangeEnd })) {
            messages.push(range.message || 'Selection includes restricted dates');
          }
        }
      }

      // Handle allowed ranges restrictions
      if (restriction.type === 'allowedranges' && restriction.ranges.length > 0) {
        let isAllowed = false;
        let message = restriction.ranges[0]?.message || 'Selection must be within allowed ranges';
        
        for (const range of restriction.ranges) {
          const rangeStart = parseISO(range.start);
          const rangeEnd = parseISO(range.end);
          
          if (!isValid(rangeStart) || !isValid(rangeEnd)) continue;

          // Check if both start and end dates fall within this allowed range
          const startAllowed = start >= rangeStart && start <= rangeEnd;
          const endAllowed = end >= rangeStart && end <= rangeEnd;
          
          if (startAllowed && endAllowed) {
            isAllowed = true;
            break;
          }
        }

        if (!isAllowed) {
          messages.push(message);
        }
      }
    }

    return messages.length > 0 
      ? { allowed: false, message: messages.join('\n') }
      : { allowed: true };
  }
} 