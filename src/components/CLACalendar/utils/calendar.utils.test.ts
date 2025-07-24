import { describe, it, expect } from 'vitest';
import { getFontSize, isSameMonth } from './calendar.utils';
import { getDefaultSettings } from '../../CLACalendar.config';

describe('calendar.utils', () => {
  describe('getFontSize', () => {
    it('should return default base font size when no settings provided', () => {
      expect(getFontSize(undefined, 'base')).toBe('1rem');
      expect(getFontSize(undefined)).toBe('1rem');
    });

    it('should return base font size from settings', () => {
      const settings = { ...getDefaultSettings(), baseFontSize: '16px' };
      expect(getFontSize(settings, 'base')).toBe('16px');
      expect(getFontSize(settings)).toBe('16px');
    });

    it('should calculate large size for rem units', () => {
      const settings = { ...getDefaultSettings(), baseFontSize: '1rem' };
      expect(getFontSize(settings, 'large')).toBe('1.25rem');
    });

    it('should calculate large size for px units', () => {
      const settings = { ...getDefaultSettings(), baseFontSize: '16px' };
      expect(getFontSize(settings, 'large')).toBe('20px');
    });

    it('should calculate large size for units other than rem/px', () => {
      const settings = { ...getDefaultSettings(), baseFontSize: '1em' };
      expect(getFontSize(settings, 'large')).toBe('1.25rem');
    });

    it('should calculate small size for rem units', () => {
      const settings = { ...getDefaultSettings(), baseFontSize: '1rem' };
      expect(getFontSize(settings, 'small')).toBe('0.875rem');
    });

    it('should calculate small size for px units', () => {
      const settings = { ...getDefaultSettings(), baseFontSize: '16px' };
      expect(getFontSize(settings, 'small')).toBe('14px');
    });

    it('should calculate small size for units other than rem/px', () => {
      const settings = { ...getDefaultSettings(), baseFontSize: '1em' };
      expect(getFontSize(settings, 'small')).toBe('0.875rem');
    });

    it('should calculate extraSmall size for rem units', () => {
      const settings = { ...getDefaultSettings(), baseFontSize: '1rem' };
      expect(getFontSize(settings, 'extraSmall')).toBe('0.75rem');
    });

    it('should calculate extraSmall size for px units', () => {
      const settings = { ...getDefaultSettings(), baseFontSize: '16px' };
      expect(getFontSize(settings, 'extraSmall')).toBe('12px');
    });

    it('should calculate extraSmall size for units other than rem/px', () => {
      const settings = { ...getDefaultSettings(), baseFontSize: '1em' };
      expect(getFontSize(settings, 'extraSmall')).toBe('0.75rem');
    });

    it('should handle decimal base sizes correctly', () => {
      const settings = { ...getDefaultSettings(), baseFontSize: '1.5rem' };
      expect(getFontSize(settings, 'large')).toBe('1.875rem');
      expect(getFontSize(settings, 'small')).toBe('1.3125rem');
      expect(getFontSize(settings, 'extraSmall')).toBe('1.125rem');
    });

    it('should handle invalid sizeType by returning base size', () => {
      const settings = { ...getDefaultSettings(), baseFontSize: '14px' };
      expect(getFontSize(settings, 'invalid' as any)).toBe('14px');
    });
  });

  describe('isSameMonth', () => {
    it('should return true for dates in the same month and year', () => {
      const date1 = new Date('2025-06-15');
      const date2 = new Date('2025-06-20');
      expect(isSameMonth(date1, date2)).toBe(true);
    });

    it('should return false for dates in different months', () => {
      const date1 = new Date('2025-06-15');
      const date2 = new Date('2025-07-15');
      expect(isSameMonth(date1, date2)).toBe(false);
    });

    it('should return false for dates in different years', () => {
      const date1 = new Date('2024-06-15');
      const date2 = new Date('2025-06-15');
      expect(isSameMonth(date1, date2)).toBe(false);
    });

    it('should handle beginning and end of month', () => {
      // Create dates using constructor to ensure consistent behavior
      const date1 = new Date(2025, 0, 1); // Jan 1, 2025
      const date2 = new Date(2025, 0, 31); // Jan 31, 2025
      expect(isSameMonth(date1, date2)).toBe(true);
    });

    it('should handle year boundary', () => {
      const date1 = new Date(2025, 11, 31); // Dec 31, 2025
      const date2 = new Date(2026, 0, 1); // Jan 1, 2026
      expect(isSameMonth(date1, date2)).toBe(false);
    });
  });
});