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
export const getNavigationRestrictionDate = (settings) => {
  const beforeRestriction = settings?.navigationRestrictions?.restrictions?.find(
    r => r?.direction === 'before' && r?.date
  );

  const afterRestriction = settings?.navigationRestrictions?.restrictions?.find(
    r => r?.direction === 'after' && r?.date
  );

  return {
    before: beforeRestriction?.date ? {
      date: new Date(beforeRestriction?.date),
      message: beforeRestriction?.message || ''
    } : { date: null, message: '' },

    after: afterRestriction?.date ? {
      date: new Date(afterRestriction?.date),
      message: afterRestriction?.message || ''
    } : { date: null, message: '' }
  };
};


