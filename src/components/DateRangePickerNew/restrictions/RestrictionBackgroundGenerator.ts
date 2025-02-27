/**
 * RestrictionBackgroundGenerator.ts
 * 
 * This file is responsible for generating visual indicators for date restrictions in the calendar.
 * It works in conjunction with the RestrictionManager and LayerRenderer to provide visual feedback
 * about which dates are restricted or not selectable.
 * 
 * Architecture:
 * - RestrictionManager determines if dates are restricted
 * - RestrictionBackgroundGenerator creates visual styles for these restrictions
 * - LayerRenderer applies these styles to the calendar grid
 * 
 * The background generator supports:
 * 1. Different background colors for restricted dates
 * 2. Visual indicators for non-selectable dates
 * 3. Custom styling based on restriction types
 * 
 * When adding new restriction types:
 * 1. Add the visual representation logic here
 * 2. Update the generateBackground method to handle the new restriction type
 * 3. Ensure the styles are properly applied in LayerRenderer
 */

import { parseISO, isValid, isWithinInterval } from 'date-fns';
import { RestrictionConfig } from './types';
import { BackgroundData } from '../../DateRangePicker.config';

/**
 * Generates background styles for restricted dates in the calendar
 */
export class RestrictionBackgroundGenerator {
  /**
   * Creates an instance of RestrictionBackgroundGenerator
   * @param {RestrictionConfig} config - Configuration object containing restriction rules
   */
  constructor(private config: RestrictionConfig) { }

  /**
   * Generates background style for a specific date based on restrictions
   * @param {Date} date - The date to check for restrictions
   * @returns {string | undefined} CSS background color value or undefined if no restrictions apply
   */
  generateBackground(date: Date): string | undefined {
    if (!this.config?.restrictions) return undefined;

    for (const restriction of this.config.restrictions) {
      if (!restriction.enabled) continue;

      if (restriction.type === 'boundary') {
        const boundaryDate = parseISO(restriction.date);
        if (!isValid(boundaryDate)) continue;

        if (restriction.direction === 'before' && date < boundaryDate) {
          return 'rgba(0, 0, 0, 0.1)';
        } else if (restriction.direction === 'after') {
          const boundaryEndOfDay = new Date(boundaryDate);
          boundaryEndOfDay.setHours(23, 59, 59, 999);
          if (date > boundaryEndOfDay) {
            return 'rgba(0, 0, 0, 0.1)';
          }
        }
      }

      if (restriction.type === 'daterange') {
        for (const range of restriction.ranges) {
          const rangeStart = parseISO(range.start);
          const rangeEnd = parseISO(range.end);

          if (!isValid(rangeStart) || !isValid(rangeEnd)) continue;

          if (isWithinInterval(date, { start: rangeStart, end: rangeEnd })) {
            return 'rgba(0, 0, 0, 0.1)';
          }
        }
      }

      if (restriction.type === 'allowedranges' && restriction.ranges.length > 0) {
        let isAllowed = false;

        for (const range of restriction.ranges) {
          const rangeStart = parseISO(range.start);
          const rangeEnd = parseISO(range.end);

          if (!isValid(rangeStart) || !isValid(rangeEnd)) continue;

          if (isWithinInterval(date, { start: rangeStart, end: rangeEnd })) {
            isAllowed = true;
            break;
          }
        }

        if (!isAllowed) {
          return 'rgba(0, 0, 0, 0.1)';
        }
      }
    }

    return undefined;
  }

  /**
   * Converts restriction configuration into background data for rendering
   * @param {RestrictionConfig} [restrictionConfig] - Configuration object containing restriction rules
   * @returns {BackgroundData[]} Array of background data objects for rendering restricted date ranges
   * @static
   * 
   * @example
   * // Returns array of background data objects like:
   * // [{
   * //   start: "2024-01-01",
   * //   end: "2024-01-15",
   * //   color: "rgba(0, 0, 0, 0.1)"
   * // }]
   */
  static generateBackgroundData(restrictionConfig?: RestrictionConfig): BackgroundData[] {
    if (!restrictionConfig?.restrictions) return [];

    return restrictionConfig.restrictions.flatMap(restriction => {
      if (!restriction.enabled) return [];

      switch (restriction.type) {
        case 'daterange':
          return restriction.ranges
            .filter(range => {
              const start = parseISO(range.start);
              const end = parseISO(range.end);
              return isValid(start) && isValid(end) && start <= end;
            })
            .map(range => ({
              startDate: range.start,
              endDate: range.end,
              color: '#ffe6e6'
            }));

        case 'allowedranges':
          return restriction.ranges
            .filter(range => {
              const start = parseISO(range.start);
              const end = parseISO(range.end);
              return isValid(start) && isValid(end) && start <= end;
            })
            .map(range => [
              {
                startDate: '1900-01-01',
                endDate: range.start,
                color: '#ffe6e6'
              },
              {
                startDate: range.end,
                endDate: '2100-12-31',
                color: '#ffe6e6'
              }
            ]).flat();

        case 'boundary':
          const boundaryDate = parseISO(restriction.date);
          if (!isValid(boundaryDate)) return [];

          return [{
            startDate: restriction.direction === 'before' ? '1900-01-01' : restriction.date,
            endDate: restriction.direction === 'before' ? restriction.date : '2100-12-31',
            color: '#ffe6e6'
          }];

        default:
          return [];
      }
    });
  }
} 