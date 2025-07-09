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