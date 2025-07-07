import { CalendarSettings } from '../../CLACalendar.config';

/**
 * Calculate a font size based on the calendar's base font size setting
 * @param settings The calendar settings object
 * @param sizeType The type of font size to calculate (default, large, small, etc)
 * @returns A string with the calculated font size
 */
export const getFontSize = (
  settings?: CalendarSettings, 
  sizeType: 'base' | 'large' | 'small' | 'extraSmall' = 'base'
): string => {
  // Default base size if not specified in settings
  const baseSize = settings?.baseFontSize || '1rem';

  // Calculate relative sizes based on the base size
  switch (sizeType) {
    case 'large':
      return baseSize.includes('rem') ?
        `${parseFloat(baseSize) * 1.25}rem` :
        baseSize.includes('px') ?
          `${parseFloat(baseSize) * 1.25}px` :
          '1.25rem';
    case 'small':
      return baseSize.includes('rem') ?
        `${parseFloat(baseSize) * 0.875}rem` :
        baseSize.includes('px') ?
          `${parseFloat(baseSize) * 0.875}px` :
          '0.875rem';
    case 'extraSmall':
      return baseSize.includes('rem') ?
        `${parseFloat(baseSize) * 0.75}rem` :
        baseSize.includes('px') ?
          `${parseFloat(baseSize) * 0.75}px` :
          '0.75rem';
    case 'base':
    default:
      return baseSize;
  }
};

/**
 * Check if two dates are in the same month
 * @param date1 First date to compare
 * @param date2 Second date to compare
 * @returns True if dates are in the same month
 */
export const isSameMonth = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth()
  );
};