/**
 * @fileoverview Visual indicator generator for date restrictions in the calendar
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
 * 4. RestrictedBoundary - Complex rules with min/max dates and restricted ranges
 * 5. Weekday - Blocks specific days of the week
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
 * 
 * @module RestrictionBackgroundGenerator
 * }]
 *
 * 2. Individual Date Styling:
 * const generator = new RestrictionBackgroundGenerator(config);
 * const background = generator.generateBackground(date);
 * Returns: 'rgba(0, 0, 0, 0.1)' or undefined  // Grey overlay for restricted dates
 */

import { parseISO, isWithinInterval, format } from '../../../utils/DateUtils';
import { isValid } from 'date-fns';
import { RestrictionConfig, BoundaryRestriction, DateRangeRestriction, RestrictedBoundaryRestriction, AllowedRangesRestriction, WeekdayRestriction } from './types';
import { BackgroundData } from '../../CLACalendar.config';
import { isValidDateString, hasValidDateStrings } from './utils';

export class RestrictionBackgroundGenerator {
  /**
   * Creates an instance of RestrictionBackgroundGenerator
   * @param {RestrictionConfig} config - Configuration object containing restriction rules
   */
  constructor(private config: RestrictionConfig) { }

  /**
   * Handler for boundary type restrictions
   * @param {Date} date - Date to check
   * @param {BoundaryRestriction} restriction - Boundary restriction configuration
   * @returns {string | undefined} Background color if restricted, undefined if allowed
   * @private
   */
  private handleBoundaryRestriction(date: Date, restriction: BoundaryRestriction): string | undefined {
    if (!isValidDateString(restriction.date)) return undefined;
    
    const boundaryDate = parseISO(restriction.date);
    if (!isValid(boundaryDate)) return undefined;

    // Compare dates at the day level, ignoring time
    // Convert both dates to YYYY-MM-DD strings for comparison
    const dateStr = format(date, 'yyyy-MM-dd');
    const boundaryStr = format(boundaryDate, 'yyyy-MM-dd');

    if (restriction.direction === 'before' && dateStr < boundaryStr) {
      return 'rgba(0, 0, 0, 0.1)';
    } else if (restriction.direction === 'after' && dateStr > boundaryStr) {
      return 'rgba(0, 0, 0, 0.1)';
    }
    return undefined;
  }

  /**
   * Handler for daterange type restrictions
   * @param {Date} date - Date to check
   * @param {DateRangeRestriction} restriction - Date range restriction configuration
   * @returns {string | undefined} Background color if restricted, undefined if allowed
   * @private
   */
  private handleDateRangeRestriction(date: Date, restriction: DateRangeRestriction): string | undefined {
    for (const range of restriction.ranges) {
      // Skip if range doesn't have valid date strings
      if (!hasValidDateStrings(range)) continue;
      
      const rangeStart = parseISO(range.startDate);
      const rangeEnd = parseISO(range.endDate);

      if (!isValid(rangeStart) || !isValid(rangeEnd)) continue;

      if (isWithinInterval(date, { start: rangeStart, end: rangeEnd })) {
        return 'rgba(0, 0, 0, 0.1)';
      }
    }
    return undefined;
  }

  /**
   * Handler for restricted boundary type restrictions
   * @param {Date} date - Date to check
   * @param {RestrictedBoundaryRestriction} restriction - Restricted boundary configuration
   * @returns {string | undefined} Background color if restricted, undefined if allowed
   * @private
   */
  private handleRestrictedBoundaryRestriction(date: Date, restriction: RestrictedBoundaryRestriction): string | undefined {
    for (const range of restriction.ranges) {
      // Skip if range doesn't have valid date strings
      if (!hasValidDateStrings(range)) continue;
      
      const rangeStart = parseISO(range.startDate);
      const rangeEnd = parseISO(range.endDate);

      if (!isValid(rangeStart) || !isValid(rangeEnd)) continue;

      if (isWithinInterval(date, { start: rangeStart, end: rangeEnd })) {
        return 'rgba(0, 0, 0, 0.1)';
      }
    }
    return undefined;
  }

  /**
   * Handler for allowed ranges type restrictions
   * @param {Date} date - Date to check
   * @param {AllowedRangesRestriction} restriction - Allowed ranges restriction configuration
   * @returns {string | undefined} Background color if restricted, undefined if allowed
   * @private
   */
  private handleAllowedRangesRestriction(date: Date, restriction: AllowedRangesRestriction): string | undefined {
    if (!restriction.ranges.length) return undefined;

    const isAllowed = restriction.ranges.some(range => {
      if (!hasValidDateStrings(range)) return false;
      
      const rangeStart = parseISO(range.startDate);
      const rangeEnd = parseISO(range.endDate);

      if (!isValid(rangeStart) || !isValid(rangeEnd)) return false;

      return isWithinInterval(date, { start: rangeStart, end: rangeEnd });
    });

    return isAllowed ? undefined : 'rgba(0, 0, 0, 0.1)';
  }

  /**
   * Handler for weekday type restrictions
   * @param {Date} date - Date to check
   * @param {WeekdayRestriction} restriction - Weekday restriction configuration
   * @returns {string | undefined} Background color if restricted, undefined if allowed
   * @private
   */
  private handleWeekdayRestriction(date: Date, restriction: WeekdayRestriction): string | undefined {
    const dayOfWeek = date.getDay();
    if (restriction.days && restriction.days.includes(dayOfWeek)) {
      return 'rgba(0, 0, 0, 0.1)';
    }
    return undefined;
  }

  /**
   * Map of restriction types to their handlers
   * @private
   */
  private restrictionHandlers = {
    boundary: this.handleBoundaryRestriction.bind(this),
    daterange: this.handleDateRangeRestriction.bind(this),
    allowedranges: this.handleAllowedRangesRestriction.bind(this),
    weekday: this.handleWeekdayRestriction.bind(this),
    restricted_boundary: this.handleRestrictedBoundaryRestriction.bind(this)
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
    /**
     * Handler to generate background data for daterange type restrictions
     * @param {DateRangeRestriction} restriction - Date range restriction configuration
     * @returns {BackgroundData[]} Array of background data for rendering
     */
    daterange: (restriction: DateRangeRestriction): BackgroundData[] => {
      return restriction.ranges
        .filter(range => {
          if (!hasValidDateStrings(range)) return false;
          const start = parseISO(range.startDate);
          const end = parseISO(range.endDate);
          return isValid(start) && isValid(end) && start <= end;
        })
        .map(range => ({
          startDate: range.startDate,
          endDate: range.endDate,
          color: '#ffe6e6'
        }));
    },

    /**
     * Handler to generate background data for allowed ranges type restrictions
     * @param {AllowedRangesRestriction} restriction - Allowed ranges restriction configuration
     * @returns {BackgroundData[]} Array of background data for rendering
     */
    allowedranges: (restriction: AllowedRangesRestriction): BackgroundData[] => {
      return restriction.ranges
        .filter(range => {
          if (!hasValidDateStrings(range)) return false;
          const start = parseISO(range.startDate);
          const end = parseISO(range.endDate);
          return isValid(start) && isValid(end) && start <= end;
        })
        .map(range => [
          {
            startDate: '1900-01-01',
            endDate: range.startDate,
            color: '#ffe6e6'
          },
          {
            startDate: range.endDate,
            endDate: '2100-12-31',
            color: '#ffe6e6'
          }
        ]).flat();
    },

    /**
     * Handler to generate background data for boundary type restrictions
     * @param {BoundaryRestriction} restriction - Boundary restriction configuration
     * @returns {BackgroundData[]} Array of background data for rendering
     */
    boundary: (restriction: BoundaryRestriction): BackgroundData[] => {
      if (!isValidDateString(restriction.date)) return [];
      
      const boundaryDate = parseISO(restriction.date);
      if (!isValid(boundaryDate)) return [];

      return [{
        startDate: restriction.direction === 'before' ? '1900-01-01' : restriction.date,
        endDate: restriction.direction === 'before' ? restriction.date : '2100-12-31',
        color: '#ffe6e6'
      }];
    },

    /**
     * Handler to generate background data for restricted boundary type restrictions
     * @param {RestrictedBoundaryRestriction} restriction - Restricted boundary configuration
     * @returns {BackgroundData[]} Array of background data for rendering
     */
    restricted_boundary: (_restriction: RestrictedBoundaryRestriction): BackgroundData[] => {
      // Return empty array since restricted boundary is only enforced during selection
      return [];
    },

    /**
     * Handler to generate background data for weekday type restrictions
     * @param {WeekdayRestriction} restriction - Weekday restriction configuration
     * @returns {BackgroundData[]} Array of background data for rendering
     */
    weekday: (_restriction: WeekdayRestriction): BackgroundData[] => {
      // Weekday restrictions are handled per-date, not as ranges
      return [];
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

      // Type-safe handler selection based on restriction type
      switch (restriction.type) {
        case 'daterange':
          return RestrictionBackgroundGenerator.backgroundDataHandlers.daterange(restriction as DateRangeRestriction);
        case 'allowedranges':
          return RestrictionBackgroundGenerator.backgroundDataHandlers.allowedranges(restriction as AllowedRangesRestriction);
        case 'boundary':
          return RestrictionBackgroundGenerator.backgroundDataHandlers.boundary(restriction as BoundaryRestriction);
        case 'restricted_boundary':
          return RestrictionBackgroundGenerator.backgroundDataHandlers.restricted_boundary(restriction as RestrictedBoundaryRestriction);
        case 'weekday':
          return RestrictionBackgroundGenerator.backgroundDataHandlers.weekday(restriction as WeekdayRestriction);
        default:
          return [];
      }
    });
  }
} 