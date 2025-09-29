/**
 * Type guard to check if a value is a non-empty string
 */
export function isValidDateString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Type guard to check if a range has valid date strings
 */
export function hasValidDateStrings(range: { startDate?: unknown; endDate?: unknown }): range is { startDate: string; endDate: string } {
  return isValidDateString(range.startDate) && isValidDateString(range.endDate);
}
import type { CalendarSettings } from '../../CLACalendar.config';
import { parseISO, startOfMonth } from '../../../utils/DateUtils';

/**
 * Extract navigation restriction bounds from settings, using UTC and month granularity.
 * Semantics:
 * - 'before' represents the MINIMUM FIRST visible month (inclusive)
 * - 'after' represents the MAXIMUM LAST visible month (inclusive)
 * - If multiple entries exist per direction, pick the most restrictive effective one:
 *   - For 'before': pick the latest (max) month for the first-month bound
 *   - For 'after': pick the earliest (min) month for the last-month bound
 */
export const getNavigationRestrictionDate = (settings: CalendarSettings) => {
  const list = settings?.navigationRestrictions?.restrictions || [];
  const befores = list.filter(r => r?.direction === 'before' && isValidDateString(r?.date));
  const afters = list.filter(r => r?.direction === 'after' && isValidDateString(r?.date));

  // Normalize to startOfMonth UTC for month granularity comparisons
  const normalize = (s: string) => startOfMonth(parseISO(s, 'UTC'));

  // For 'before' (minimum last visible month): choose the max of provided months
  let beforeDate: Date | null = null;
  let beforeMessage = '';
  if (befores.length) {
    befores.sort((a, b) => +normalize(a.date) - +normalize(b.date));
    const picked = befores[befores.length - 1];
    beforeDate = normalize(picked.date);
    beforeMessage = picked.message || '';
  }

  // For 'after' (maximum last visible month): choose the min of provided months
  let afterDate: Date | null = null;
  let afterMessage = '';
  if (afters.length) {
    afters.sort((a, b) => +normalize(a.date) - +normalize(b.date));
    const picked = afters[0];
    afterDate = normalize(picked.date);
    afterMessage = picked.message || '';
  }

  return {
    before: { date: beforeDate, message: beforeMessage },
    after: { date: afterDate, message: afterMessage }
  };
};


