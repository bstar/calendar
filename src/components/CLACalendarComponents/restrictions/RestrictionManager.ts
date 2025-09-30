/**
 * @fileoverview Date restriction system implementation for the calendar component
 * 
 * This file implements the date restriction system for the calendar component.
 * It handles validation of date selections against configured rules and restrictions.
 * 
 * Architecture:
 * - The RestrictionManager is part of a larger date picker system where:
 *   1. RestrictionConfig defines the rules (boundary dates, restricted ranges, allowed ranges, etc.)
 *   2. RestrictionManager validates selections against these rules
 *   3. RestrictionBackgroundGenerator uses these rules to visually indicate restrictions
 *   4. LayerRenderer uses the validation results to control user interactions
 * 
 * The restriction system supports five types of rules:
 * 1. Boundary - Prevents selection before/after a specific date
 * 2. DateRange - Blocks specific date ranges from being selected
 * 3. AllowedRanges - Only permits selections within specified date ranges
 * 4. RestrictedBoundary - Complex rules with min/max dates and restricted ranges
 * 5. Weekday - Blocks specific days of the week (0-6 for Sunday-Saturday)
 * 
 * Each restriction can have its own custom error message and can be individually enabled/disabled.
 * Multiple restrictions can be combined to create complex selection rules.
 * 
 * Implementation:
 * - Each restriction type has its own checker function (e.g., checkBoundaryRestriction)
 * - All checkers follow the same interface: (start: Date, end: Date, restriction: RestrictionType) => string | null
 * - The restrictionCheckers map connects restriction types to their checker functions
 * - All date comparisons use UTC to ensure timezone consistency
 * 
 * Extending with New Restrictions:
 * 1. Add new restriction type to RestrictionType in ./types.ts
 * 2. Create the restriction interface extending BaseRestriction in ./types.ts
 * 3. Add to the Restriction union type in ./types.ts
 * 4. Create a new checker function following the checker interface
 * 5. Add the checker to restrictionCheckers map
 * 6. Update RestrictionBackgroundGenerator to visualize the new restriction (optional)
 * 
 * @module RestrictionManager
 */

import { parseISO } from '../../../utils/DateUtils';
import { isValid } from 'date-fns';
import { isWithinInterval } from '../../../utils/DateUtils';
import { RestrictionConfig, BoundaryRestriction, DateRangeRestriction, RestrictedBoundaryRestriction, AllowedRangesRestriction, WeekdayRestriction } from './types';
import { isValidDateString, hasValidDateStrings } from './utils';

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
   * @param {BoundaryRestriction} restriction - Boundary restriction configuration
   * @returns {string | null} Error message if restriction is violated, null otherwise
   * @private
   */
  private checkBoundaryRestriction(start: Date, end: Date, restriction: BoundaryRestriction): string | null {
    // Skip if date is not a valid string
    if (!isValidDateString(restriction.date)) return null;
    
    const boundaryDate = parseISO(restriction.date);
    if (!isValid(boundaryDate)) return null;

    if (restriction.direction === 'before') {
      // Enforce minimum: entire selection must be on/after boundaryDate
      if (start < boundaryDate || end < boundaryDate) {
        return restriction.message || 'Selection before boundary date is not allowed';
      }
    } else {
      // Enforce maximum: entire selection must be on/before boundary end-of-day (UTC)
      const boundaryEndOfDay = new Date(Date.UTC(
        boundaryDate.getUTCFullYear(),
        boundaryDate.getUTCMonth(),
        boundaryDate.getUTCDate(),
        23, 59, 59, 999
      ));
      if (start > boundaryEndOfDay || end > boundaryEndOfDay) {
        return restriction.message || 'Selection after boundary date is not allowed';
      }
    }
    return null;
  }

  /**
   * Checks if a selection overlaps with restricted date ranges
   * @param {Date} start - Start date of the selection
   * @param {Date} end - End date of the selection
   * @param {DateRangeRestriction} restriction - Date range restriction configuration
   * @returns {string | null} Error message if restriction is violated, null otherwise
   * @private
   */
  private checkDateRangeRestriction(start: Date, end: Date, restriction: DateRangeRestriction): string | null {
    for (const range of restriction.ranges) {
      // Skip if range doesn't have valid date strings
      if (!hasValidDateStrings(range)) continue;
      
      const rangeStart = parseISO(range.startDate);
      const rangeEnd = parseISO(range.endDate);

      if (!isValid(rangeStart) || !isValid(rangeEnd)) continue;

      // Detect four scenarios that would cause a restriction violation:

      // 1. Selection start is inside a restricted range
      const startInRange = isWithinInterval(start, { start: rangeStart, end: rangeEnd });

      // 2. Selection end is inside a restricted range
      const endInRange = isWithinInterval(end, { start: rangeStart, end: rangeEnd });

      // 3. Restricted range start is inside the selection
      const restrictionStartInSelection = isWithinInterval(rangeStart, { start, end });

      // 4. Restricted range end is inside the selection
      const restrictionEndInSelection = isWithinInterval(rangeEnd, { start, end });

      // Any of these scenarios means the selection overlaps with a restricted range
      if (startInRange || endInRange || restrictionStartInSelection || restrictionEndInSelection) {
        return range.message || 'Selection includes restricted dates';
      }
    }
    return null;
  }

  /**
   * Checks if a selection overlaps with restricted boundary ranges
   * @param {Date} start - Start date of the selection
   * @param {Date} end - End date of the selection
   * @param {RestrictedBoundaryRestriction} restriction - Restricted boundary configuration
   * @returns {string | null} Error message if restriction is violated, null otherwise
   * @private
   */
  private checkRestrictedBoundaryRestriction(start: Date, end: Date, restriction: RestrictedBoundaryRestriction): string | null {
    for (const range of restriction.ranges) {
      // Skip if range doesn't have valid date strings
      if (!hasValidDateStrings(range)) continue;
      
      const rangeStart = parseISO(range.startDate);
      const rangeEnd = parseISO(range.endDate);

      if (!isValid(rangeStart) || !isValid(rangeEnd)) continue;

      // First check if selection STARTED within this range
      const selectionStartedInRange = isWithinInterval(start, { start: rangeStart, end: rangeEnd });

      // If selection didn't start in this range, no restriction applies
      if (!selectionStartedInRange) continue;

      // If selection started in range, it must stay within the range bounds
      if (end < rangeStart || end > rangeEnd) {
        return range.message || 'When selecting from within a restricted boundary, selection must stay within the boundary';
      }
    }
    return null;
  }

  /**
   * Checks if a selection is outside allowed date ranges
   * @param {Date} start - Start date of the selection
   * @param {Date} end - End date of the selection
   * @param {AllowedRangesRestriction} restriction - Allowed ranges restriction configuration
   * @returns {string | null} Error message if restriction is violated, null otherwise
   * @private
   */
  private checkAllowedRangesRestriction(start: Date, end: Date, restriction: AllowedRangesRestriction): string | null {
    if (!restriction.ranges.length) return null;

    let isAllowed = false;
    const message = restriction.ranges[0]?.message || 'Selection must be within allowed ranges';

    for (const range of restriction.ranges) {
      // Skip if range doesn't have valid date strings
      if (!hasValidDateStrings(range)) continue;
      
      const rangeStart = parseISO(range.startDate);
      const rangeEnd = parseISO(range.endDate);

      if (!isValid(rangeStart) || !isValid(rangeEnd)) continue;

      const startAllowed = isWithinInterval(start, { start: rangeStart, end: rangeEnd });
      const endAllowed = isWithinInterval(end, { start: rangeStart, end: rangeEnd });

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
   * @param {WeekdayRestriction} restriction - Weekday restriction configuration
   * @returns {string | null} Error message if restriction is violated, null otherwise
   * @private
   */
  private checkWeekdayRestriction(start: Date, end: Date, restriction: WeekdayRestriction): string | null {
    // Check if either start or end date falls on a restricted weekday
    const startDay = start.getUTCDay();
    const endDay = end.getUTCDay();
    
    if (restriction.days.includes(startDay) || restriction.days.includes(endDay)) {
      return restriction.message || 'Selection includes restricted weekdays';
    }
    
    // For date ranges, check if any day in between is restricted
    if (start < end) {
      const current = new Date(start);
      while (current <= end) {
        if (restriction.days.includes(current.getUTCDay())) {
          return restriction.message || 'Selection includes restricted weekdays';
        }
        current.setUTCDate(current.getUTCDate() + 1);
      }
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
   * Returns an array of restricted boundary restrictions
   * @returns {RestrictedBoundaryRestriction[]} Array of restricted boundary configurations
   */
  getRestrictedBoundaries(): RestrictedBoundaryRestriction[] {
    return this.config.restrictions.filter(
      r => r.type === 'restricted_boundary' && r.enabled
    ) as RestrictedBoundaryRestriction[];
  }

  /**
   * Checks if a date range selection is allowed based on configured restrictions
   * @param {Date} start - Start date of the selection
   * @param {Date} end - End date of the selection
   * @param {Date} [anchorDate] - Optional anchor date (where the selection actually started)
   * @returns {{ allowed: boolean; message?: string }} Object indicating if selection is allowed and any error message
   */
  checkSelection(start: Date, end: Date, anchorDate?: Date): { allowed: boolean; message?: string } {
    if (!this.config?.restrictions) return { allowed: true };

    const messages: string[] = [];

    for (const restriction of this.config.restrictions) {
      if (!restriction.enabled) continue;

      const checker = this.restrictionCheckers[restriction.type];
      if (checker) {
        // For restricted_boundary, we need special handling with anchor date
        if (restriction.type === 'restricted_boundary' && anchorDate) {
          const message = this.checkRestrictedBoundaryRestriction(anchorDate, end, restriction);
          if (message) messages.push(message);
        } else {
          const message = checker(start, end, restriction);
          if (message) messages.push(message);
        }
      }
    }

    return messages.length > 0
      ? { allowed: false, message: messages.join('\n') }
      : { allowed: true };
  }
} 