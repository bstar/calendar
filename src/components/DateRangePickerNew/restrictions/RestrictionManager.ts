/**
 * RestrictionManager.ts
 * 
 * This file implements the date restriction system for the calendar component.
 * It handles validation of date selections against configured rules and restrictions.
 * 
 * Architecture:
 * - The RestrictionManager is part of a larger date picker system where:
 *   1. RestrictionConfig defines the rules (boundary dates, restricted ranges, allowed ranges)
 *   2. RestrictionManager validates selections against these rules
 *   3. RestrictionBackgroundGenerator uses these rules to visually indicate restrictions
 *   4. LayerRenderer uses the validation results to control user interactions
 * 
 * The restriction system supports three types of rules:
 * 1. Boundary - Prevents selection before/after a specific date
 * 2. DateRange - Blocks specific date ranges from being selected
 * 3. AllowedRanges - Only permits selections within specified date ranges
 * 
 * Each restriction can have its own custom error message and can be individually enabled/disabled.
 * Multiple restrictions can be combined to create complex selection rules.
 * 
 * Implementation:
 * - Each restriction type has its own checker function (e.g., checkBoundaryRestriction)
 * - All checkers follow the same interface: (start: Date, end: Date, restriction: any) => string | null
 * - The restrictionCheckers map connects restriction types to their checker functions
 * 
 * Extending with New Restrictions:
 * 1. Add new restriction type to RestrictionConfig type in ./types.ts
 * 2. Create a new checker function following the checker interface
 * 3. Add the checker to restrictionCheckers map
 * 4. Update RestrictionBackgroundGenerator to visualize the new restriction
 * 
 * Example of adding a "weekday" restriction:
 * 
 * // 1. Add to types.ts
 * type RestrictionType = ... | 'weekday';
 * interface WeekdayRestriction extends BaseRestriction {
 *   type: 'weekday';
 *   days: number[]; // 0-6 for Sunday-Saturday
 * }
 * 
 * // 2. Create checker function
 * private checkWeekdayRestriction(start: Date, end: Date, restriction: any): string | null {
 *   const day = start.getDay();
 *   if (!restriction.days.includes(day)) {
 *     return restriction.message || 'Invalid weekday selected';
 *   }
 *   return null;
 * }
 * 
 * // 3. Add to restrictionCheckers
 * private restrictionCheckers = {
 *   ...
 *   weekday: this.checkWeekdayRestriction.bind(this)
 * };
 */

import { parseISO, isValid, isWithinInterval } from 'date-fns';
import { RestrictionConfig } from './types';

/**
 * Manages date selection restrictions for the calendar
 * @class RestrictionManager
 */
export class RestrictionManager {
  /**
   * Creates an instance of RestrictionManager
   * @param {RestrictionConfig} config - Configuration object containing restriction rules
   */
  constructor(private config: RestrictionConfig) { }

  /**
   * Checks if a selection violates boundary date restrictions
   * @param {Date} start - Start date of the selection
   * @param {Date} end - End date of the selection
   * @param {any} restriction - Boundary restriction configuration
   * @returns {string | null} Error message if restriction is violated, null otherwise
   * @private
   */
  private checkBoundaryRestriction(start: Date, end: Date, restriction: any): string | null {
    const boundaryDate = parseISO(restriction.date);
    if (!isValid(boundaryDate)) return null;

    if (restriction.direction === 'before') {
      if (start < boundaryDate) {
        return restriction.message || 'Selection before boundary date is not allowed';
      }
    } else {
      const boundaryEndOfDay = new Date(boundaryDate);
      boundaryEndOfDay.setHours(23, 59, 59, 999);
      if (start > boundaryEndOfDay) {
        return restriction.message || 'Selection after boundary date is not allowed';
      }
    }
    return null;
  }

  /**
   * Checks if a selection overlaps with restricted date ranges
   * @param {Date} start - Start date of the selection
   * @param {Date} end - End date of the selection
   * @param {any} restriction - Date range restriction configuration
   * @returns {string | null} Error message if restriction is violated, null otherwise
   * @private
   */
  private checkDateRangeRestriction(start: Date, end: Date, restriction: any): string | null {
    for (const range of restriction.ranges) {
      const rangeStart = parseISO(range.start);
      const rangeEnd = parseISO(range.end);

      if (!isValid(rangeStart) || !isValid(rangeEnd)) continue;

      if (isWithinInterval(start, { start: rangeStart, end: rangeEnd }) ||
          isWithinInterval(end, { start: rangeStart, end: rangeEnd })) {
        return range.message || 'Selection includes restricted dates';
      }
    }
    return null;
  }

  /**
   * Checks if a selection overlaps with restricted boundary ranges
   * @param {Date} start - Start date of the selection
   * @param {Date} end - End date of the selection
   * @param {any} restriction - Restricted boundary configuration
   * @returns {string | null} Error message if restriction is violated, null otherwise
   * @private
   */
  private checkRestrictedBoundaryRestriction(start: Date, end: Date, restriction: any): string | null {
    for (const range of restriction.ranges) {
      const rangeStart = parseISO(range.start);
      const rangeEnd = parseISO(range.end);

      if (!isValid(rangeStart) || !isValid(rangeEnd)) continue;

      if (isWithinInterval(start, { start: rangeStart, end: rangeEnd }) ||
          isWithinInterval(end, { start: rangeStart, end: rangeEnd })) {
        return range.message || 'Selection includes restricted boundary dates';
      }
    }
    return null;
  }

  /**
   * Checks if a selection falls within allowed ranges
   * @param {Date} start - Start date of the selection
   * @param {Date} end - End date of the selection
   * @param {any} restriction - Allowed ranges restriction configuration
   * @returns {string | null} Error message if restriction is violated, null otherwise
   * @private
   */
  private checkAllowedRangesRestriction(start: Date, end: Date, restriction: any): string | null {
    if (!restriction.ranges.length) return null;

    let isAllowed = false;
    const message = restriction.ranges[0]?.message || 'Selection must be within allowed ranges';

    for (const range of restriction.ranges) {
      const rangeStart = parseISO(range.start);
      const rangeEnd = parseISO(range.end);

      if (!isValid(rangeStart) || !isValid(rangeEnd)) continue;

      const startAllowed = start >= rangeStart && start <= rangeEnd;
      const endAllowed = end >= rangeStart && end <= rangeEnd;

      if (startAllowed && endAllowed) {
        isAllowed = true;
        break;
      }
    }

    return isAllowed ? null : message;
  }

  /**
   * Checks if a selection falls on allowed weekdays
   * @param {Date} start - Start date of the selection
   * @param {Date} end - End date of the selection
   * @param {any} restriction - Weekday restriction configuration
   * @returns {string | null} Error message if restriction is violated, null otherwise
   * @private
   */
  private checkWeekdayRestriction(start: Date, end: Date, restriction: any): string | null {
    const day = start.getDay();
    if (!restriction.days.includes(day)) {
      return restriction.message || 'Invalid weekday selected';
    }
    return null;
  }

  /**
   * Map of restriction types to their corresponding checker functions
   * @private
   */
  private restrictionCheckers = {
    boundary: this.checkBoundaryRestriction.bind(this),
    daterange: this.checkDateRangeRestriction.bind(this),
    allowedranges: this.checkAllowedRangesRestriction.bind(this),
    restricted_boundary: this.checkRestrictedBoundaryRestriction.bind(this),
    weekday: this.checkWeekdayRestriction.bind(this)
  };

  /**
   * Checks if a date range selection is allowed based on configured restrictions
   * @param {Date} start - Start date of the selection
   * @param {Date} end - End date of the selection
   * @returns {{ allowed: boolean; message?: string }} Object indicating if selection is allowed and any error message
   */
  checkSelection(start: Date, end: Date): { allowed: boolean; message?: string } {
    if (!this.config?.restrictions) return { allowed: true };

    const messages: string[] = [];

    for (const restriction of this.config.restrictions) {
      if (!restriction.enabled) continue;

      const checker = this.restrictionCheckers[restriction.type];
      if (checker) {
        const message = checker(start, end, restriction);
        if (message) messages.push(message);
      }
    }

    return messages.length > 0
      ? { allowed: false, message: messages.join('\n') }
      : { allowed: true };
  }
} 