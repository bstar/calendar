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
 * Implementation:
 * The generator uses two handler systems:
 * 1. Instance handlers (restrictionHandlers):
 *    - Process individual dates
 *    - Return background colors for restricted dates
 *    - Used by generateBackground() method
 * 
 * 2. Static handlers (backgroundDataHandlers):
 *    - Process entire date ranges
 *    - Return BackgroundData[] for rendering
 *    - Used by generateBackgroundData() method
 * 
 * Current supported restrictions:
 * 1. Boundary - Prevents selection before/after a specific date
 * 2. DateRange - Blocks specific date ranges from being selected
 * 3. AllowedRanges - Only permits selections within specified date ranges
 * 
 * Extending with new restrictions:
 * 1. Add new restriction type to types.ts
 * 2. Create instance handler for individual date checks
 * 3. Create static handler for background data generation
 * 4. Add both handlers to their respective maps
 * 
 * RestrictionBackgroundGenerator converts restriction configs into visual styles
 * for the calendar UI. It handles two types of visual representations:
 *
 * 1. Background Data (for rendering restricted date ranges):
 * const backgrounds = RestrictionBackgroundGenerator.generateBackgroundData({
 *   restrictions: [{
 *     type: 'daterange',
 *     enabled: true,
 *     ranges: [{ start: '2024-01-01', end: '2024-01-15' }]
 *   }]
 * });
 * Returns: [{
 *   startDate: '2024-01-01',
 *   endDate: '2024-01-15',
 *   color: '#ffe6e6'  // Light red background for restricted ranges
 * }]
 *
 * 2. Individual Date Styling:
 * const generator = new RestrictionBackgroundGenerator(config);
 * const background = generator.generateBackground(date);
 * Returns: 'rgba(0, 0, 0, 0.1)' or undefined  // Grey overlay for restricted dates
 */

import { parseISO, isValid, isWithinInterval } from 'date-fns';
import { RestrictionConfig } from './types';
import { BackgroundData } from '../../DateRangePicker.config';

export class RestrictionBackgroundGenerator {
  /**
   * Creates an instance of RestrictionBackgroundGenerator
   * @param {RestrictionConfig} config - Configuration object containing restriction rules
   */
  constructor(private config: RestrictionConfig) { }

  /**
   * Handler for boundary type restrictions
   * @param {Date} date - Date to check
   * @param {any} restriction - Boundary restriction configuration
   * @returns {string | undefined} Background color if restricted, undefined if allowed
   * @private
   */
  private handleBoundaryRestriction(date: Date, restriction: any): string | undefined {
    const boundaryDate = parseISO(restriction.date);
    if (!isValid(boundaryDate)) return undefined;

    if (restriction.direction === 'before' && date < boundaryDate) {
      return 'rgba(0, 0, 0, 0.1)';
    } else if (restriction.direction === 'after') {
      const boundaryEndOfDay = new Date(boundaryDate);
      boundaryEndOfDay.setHours(23, 59, 59, 999);
      if (date > boundaryEndOfDay) {
        return 'rgba(0, 0, 0, 0.1)';
      }
    }
    return undefined;
  }

  /**
   * Handler for daterange type restrictions
   * @param {Date} date - Date to check
   * @param {any} restriction - Date range restriction configuration
   * @returns {string | undefined} Background color if restricted, undefined if allowed
   * @private
   */
  private handleDateRangeRestriction(date: Date, restriction: any): string | undefined {
    for (const range of restriction.ranges) {
      const rangeStart = parseISO(range.start);
      const rangeEnd = parseISO(range.end);

      if (!isValid(rangeStart) || !isValid(rangeEnd)) continue;

      if (isWithinInterval(date, { start: rangeStart, end: rangeEnd })) {
        return 'rgba(0, 0, 0, 0.1)';
      }
    }
    return undefined;
  }

  /**
   * Handler for allowedranges type restrictions
   * @param {Date} date - Date to check
   * @param {any} restriction - Allowed ranges restriction configuration
   * @returns {string | undefined} Background color if restricted, undefined if allowed
   * @private
   */
  private handleAllowedRangesRestriction(date: Date, restriction: any): string | undefined {
    if (!restriction.ranges.length) return undefined;

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

    return isAllowed ? undefined : 'rgba(0, 0, 0, 0.1)';
  }

  /**
   * Map of restriction types to their handlers
   * @private
   */
  private restrictionHandlers = {
    boundary: this.handleBoundaryRestriction.bind(this),
    daterange: this.handleDateRangeRestriction.bind(this),
    allowedranges: this.handleAllowedRangesRestriction.bind(this)
  };

  /**
   * Generates background style for a specific date based on restrictions
   * @param {Date} date - The date to check for restrictions
   * @returns {string | undefined} CSS background color value or undefined if no restrictions apply
   */
  generateBackground(date: Date): string | undefined {
    if (!this.config?.restrictions) return undefined;

    for (const restriction of this.config.restrictions) {
      if (!restriction.enabled) continue;

      const handler = this.restrictionHandlers[restriction.type];
      if (handler) {
        const background = handler(date, restriction);
        if (background) return background;
      }
    }

    return undefined;
  }

  /**
   * Static handlers for generating background data for each restriction type
   * @private
   */
  private static backgroundDataHandlers = {
    daterange: (restriction: any): BackgroundData[] => {
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
    },

    allowedranges: (restriction: any): BackgroundData[] => {
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
    },

    boundary: (restriction: any): BackgroundData[] => {
      const boundaryDate = parseISO(restriction.date);
      if (!isValid(boundaryDate)) return [];

      return [{
        startDate: restriction.direction === 'before' ? '1900-01-01' : restriction.date,
        endDate: restriction.direction === 'before' ? restriction.date : '2100-12-31',
        color: '#ffe6e6'
      }];
    }
  };

  /**
   * Converts restriction configuration into background data for rendering
   * @param {RestrictionConfig} [restrictionConfig] - Configuration object containing restriction rules
   * @returns {BackgroundData[]} Array of background data objects for rendering restricted date ranges
   * @static
   */
  static generateBackgroundData(restrictionConfig?: RestrictionConfig): BackgroundData[] {
    if (!restrictionConfig?.restrictions) return [];

    return restrictionConfig.restrictions.flatMap(restriction => {
      if (!restriction.enabled) return [];

      const handler = RestrictionBackgroundGenerator.backgroundDataHandlers[restriction.type];
      return handler ? handler(restriction) : [];
    });
  }
} 