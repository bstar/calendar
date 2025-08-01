/**
 * @fileoverview Date range selection manager for the calendar component
 * 
 * This class manages the date selection logic for both single date and date range
 * selection modes. It handles:
 * - Validation of date selections against restrictions
 * - Range expansion for restricted dates
 * - Backward selection support (selecting from future to past)
 * - Integration with the RestrictionManager for date validation
 * - Smart range adjustment to skip over restricted dates
 * 
 * The manager ensures that selected dates comply with all active restrictions
 * and provides feedback when selections are invalid.
 * 
 * @module DateRangeSelectionManager
 */

import { isValid, isBefore, isAfter, addDays } from 'date-fns';
import { format, parseISO } from '../../../utils/DateUtils';
import { RestrictionManager } from '../restrictions/RestrictionManager';
import { RestrictionConfig } from '../restrictions/types';

/**
 * Represents a date range selection
 * @interface DateRange
 * @property start - Start date in YYYY-MM-DD format or null
 * @property end - End date in YYYY-MM-DD format or null
 * @property isBackwardSelection - Whether the selection was made from future to past
 * @property anchorDate - The original anchor point of the selection
 */
export interface DateRange {
  start: string | null;
  end: string | null;
  // Add a field to track if this is a backward selection
  isBackwardSelection?: boolean;
  // Store the original anchor point
  anchorDate?: string | null;
}

/**
 * Manages date selection logic with restriction validation
 * @class DateRangeSelectionManager
 */
export class DateRangeSelectionManager {
  private restrictionManager: RestrictionManager;
  private selectionMode: 'single' | 'range';
  private showSelectionAlert: boolean;

  constructor(
    restrictionConfig?: RestrictionConfig,
    selectionMode: 'single' | 'range' = 'range',
    showSelectionAlert: boolean = false
  ) {
    this.restrictionManager = new RestrictionManager(restrictionConfig ?? { restrictions: [] });
    this.selectionMode = selectionMode;
    this.showSelectionAlert = showSelectionAlert;
  }

  /**
   * Check if a date can be selected
   */
  canSelectDate(date: Date): { allowed: boolean; message: string | null } {
    const result = this.restrictionManager.checkSelection(date, date);
    return {
      allowed: result.allowed,
      message: result.message || null
    };
  }

  /**
   * Check if a range can be selected
   */
  canSelectRange(startDate: Date, endDate: Date, anchorDate?: Date): { allowed: boolean; message: string | null } {
    if (!isValid(startDate) || !isValid(endDate)) {
      return { allowed: false, message: 'Invalid date range' };
    }

    // For date comparison, ensure chronological order
    const [chronologicalStart, chronologicalEnd] = startDate > endDate ?
      [endDate, startDate] : [startDate, endDate];

    // Handle boundary restrictions specially
    // Only apply boundary restrictions if the anchor point is within that boundary
    if (anchorDate) {
      // First check if anchor is in any boundary
      const anchorBoundary = this.isInRestrictedBoundary(anchorDate);

      // If anchor is in a boundary, check if the entire range stays within that boundary
      if (anchorBoundary.inBoundary && anchorBoundary.boundaryStart && anchorBoundary.boundaryEnd) {
        // If either start or end is outside the relevant boundary, it's not allowed
        if (chronologicalStart < anchorBoundary.boundaryStart || chronologicalEnd > anchorBoundary.boundaryEnd) {
          return { allowed: false, message: anchorBoundary.message };
        }
      }
    }

    // For all other cases, use the standard check
    const result = this.restrictionManager.checkSelection(chronologicalStart, chronologicalEnd);
    return {
      allowed: result.allowed,
      message: result.allowed ? null : result.message
    };
  }

  /**
   * Start a new selection
   */
  startSelection(date: Date): {
    success: boolean;
    range: DateRange;
    message: string | null
  } {
    // When starting a selection, we only check if the date itself is restricted
    const result = this.restrictionManager.checkSelection(date, date);

    if (!result.allowed) {
      return {
        success: false,
        range: { start: null, end: null },
        message: result.message || null
      };
    }

    const formattedDate = format(date, 'yyyy-MM-dd');
    return {
      success: true,
      range: {
        start: formattedDate,
        end: this.selectionMode === 'single' ? formattedDate : null,
        // Store the original anchor point to maintain it during selection
        anchorDate: formattedDate
      },
      message: null
    };
  }

  // Add a private helper method to check if a date is within any restricted boundary
  private isInRestrictedBoundary(date: Date): { inBoundary: boolean; boundaryStart: Date | null; boundaryEnd: Date | null; message: string | null } {
    // Check if there are any restricted_boundary restrictions
    const boundaries = this.restrictionManager.getRestrictedBoundaries();
    if (!boundaries || !boundaries.length) {
      return { inBoundary: false, boundaryStart: null, boundaryEnd: null, message: null };
    }

    // Check if the date falls within any restricted boundary
    for (const boundary of boundaries) {
      if (!boundary.enabled) continue;

      for (const range of boundary.ranges) {
        const rangeStart = parseISO(range.startDate);
        const rangeEnd = parseISO(range.endDate);

        if (!isValid(rangeStart) || !isValid(rangeEnd)) continue;

        if (date >= rangeStart && date <= rangeEnd) {
          return {
            inBoundary: true,
            boundaryStart: rangeStart,
            boundaryEnd: rangeEnd,
            message: range.message || 'Selection must stay within the boundary'
          };
        }
      }
    }

    return { inBoundary: false, boundaryStart: null, boundaryEnd: null, message: null };
  }

  /**
   * Update an in-progress selection
   */
  updateSelection(
    currentRange: DateRange,
    newDate: Date
  ): {
    success: boolean;
    range: DateRange;
    message: string | null
  } {
    if (!currentRange.start) {
      return { success: false, range: currentRange, message: "No selection in progress" };
    }

    // Single date mode just returns the new date
    if (this.selectionMode === 'single') {
      const validCheck = this.canSelectDate(newDate);
      if (!validCheck.allowed) {
        return {
          success: false,
          range: currentRange,
          message: validCheck.message
        };
      }
      return {
        success: true,
        range: {
          start: format(newDate, 'yyyy-MM-dd'),
          end: format(newDate, 'yyyy-MM-dd'),
          anchorDate: format(newDate, 'yyyy-MM-dd')
        },
        message: null
      };
    }

    // Get the anchor date (the fixed point of the selection)
    const anchorDate = currentRange.anchorDate
      ? parseISO(currentRange.anchorDate)
      : parseISO(currentRange.start);

    // Determine if this is a backward selection (new date is before anchor)
    const isBackwardSelection = isBefore(newDate, anchorDate);

    // Check if the anchor date is in a restricted boundary
    const anchorBoundary = this.isInRestrictedBoundary(anchorDate);

    // If the anchor is in a boundary, the selection must stay within that boundary
    if (anchorBoundary.inBoundary) {
      const boundaryStart = anchorBoundary.boundaryStart;
      const boundaryEnd = anchorBoundary.boundaryEnd;

      if (isBackwardSelection && boundaryStart) {
        // For backward selection, the new date must not go before the boundary start
        if (isBefore(newDate, boundaryStart)) {
          return {
            success: true,
            range: {
              start: format(boundaryStart, 'yyyy-MM-dd'),
              end: format(anchorDate, 'yyyy-MM-dd'),
              anchorDate: format(anchorDate, 'yyyy-MM-dd'),
              isBackwardSelection: true
            },
            message: anchorBoundary.message || "Selection limited by boundary restriction"
          };
        }
      }
      else if (!isBackwardSelection && boundaryEnd) {
        // For forward selection, the new date must not go beyond the boundary end
        if (isAfter(newDate, boundaryEnd)) {
          return {
            success: true,
            range: {
              start: format(anchorDate, 'yyyy-MM-dd'),
              end: format(boundaryEnd, 'yyyy-MM-dd'),
              anchorDate: format(anchorDate, 'yyyy-MM-dd'),
              isBackwardSelection: false
            },
            message: anchorBoundary.message || "Selection limited by boundary restriction"
          };
        }
      }
    }

    // For both forward and backward selections, we need to check if the direct selection is valid
    // This ensures we can't "jump over" restricted ranges

    // Define the chronological start and end
    let chronologicalStart, chronologicalEnd;
    if (isBackwardSelection) {
      chronologicalStart = newDate;
      chronologicalEnd = anchorDate;
    } else {
      chronologicalStart = anchorDate;
      chronologicalEnd = newDate;
    }

    // First, check if direct selection is valid
    const directSelectionValid = this.restrictionManager.checkSelection(
      chronologicalStart,
      chronologicalEnd
    );

    // If direct selection is valid, return it
    if (directSelectionValid.allowed) {
      return {
        success: true,
        range: {
          start: isBackwardSelection ? format(newDate, 'yyyy-MM-dd') : format(anchorDate, 'yyyy-MM-dd'),
          end: isBackwardSelection ? format(anchorDate, 'yyyy-MM-dd') : format(newDate, 'yyyy-MM-dd'),
          anchorDate: format(anchorDate, 'yyyy-MM-dd'),
          isBackwardSelection
        },
        message: null
      };
    }

    // If direct selection is not valid, find the closest valid date to the anchor
    const message = directSelectionValid.message || 'Cannot select across restricted dates';

    if (isBackwardSelection) {
      // Find the last valid date when moving backward from anchor
      let validDate = anchorDate;
      let foundValidDate = false;

      // We try day by day from anchor toward newDate until we hit a restriction
      for (let currentDate = addDays(anchorDate, -1);
        !isBefore(currentDate, newDate);
        currentDate = addDays(currentDate, -1)) {

        // Check if this current selection range is valid
        const check = this.restrictionManager.checkSelection(currentDate, anchorDate);

        if (check.allowed) {
          // This date is still valid - remember it and continue
          validDate = currentDate;
          foundValidDate = true;
        } else {
          // We hit a restriction - stop here
          break;
        }
      }

      // If we found a valid date, use it
      if (foundValidDate) {
        return {
          success: true,
          range: {
            start: format(validDate, 'yyyy-MM-dd'),
            end: format(anchorDate, 'yyyy-MM-dd'),
            anchorDate: format(anchorDate, 'yyyy-MM-dd'),
            isBackwardSelection: true
          },
          message
        };
      }

      // If no valid date found (only the anchor is valid), return just the anchor
      return {
        success: false,
        range: {
          start: format(anchorDate, 'yyyy-MM-dd'),
          end: format(anchorDate, 'yyyy-MM-dd'),
          anchorDate: format(anchorDate, 'yyyy-MM-dd'),
          isBackwardSelection: true
        },
        message
      };
    } else {
      // Find the last valid date when moving forward from anchor
      let validDate = anchorDate;
      let foundValidDate = false;

      // We try day by day from anchor toward newDate until we hit a restriction
      for (let currentDate = addDays(anchorDate, 1);
        !isAfter(currentDate, newDate);
        currentDate = addDays(currentDate, 1)) {

        // Check if this current selection range is valid
        const check = this.restrictionManager.checkSelection(anchorDate, currentDate);

        if (check.allowed) {
          // This date is still valid - remember it and continue
          validDate = currentDate;
          foundValidDate = true;
        } else {
          // We hit a restriction - stop here
          break;
        }
      }

      // If we found a valid date, use it
      if (foundValidDate) {
        return {
          success: true,
          range: {
            start: format(anchorDate, 'yyyy-MM-dd'),
            end: format(validDate, 'yyyy-MM-dd'),
            anchorDate: format(anchorDate, 'yyyy-MM-dd'),
            isBackwardSelection: false
          },
          message
        };
      }

      // If no valid date found (only the anchor is valid), return just the anchor
      return {
        success: false,
        range: {
          start: format(anchorDate, 'yyyy-MM-dd'),
          end: format(anchorDate, 'yyyy-MM-dd'),
          anchorDate: format(anchorDate, 'yyyy-MM-dd'),
          isBackwardSelection: false
        },
        message
      };
    }
  }

  /**
   * Update the restriction configuration
   */
  updateRestrictions(restrictionConfig?: RestrictionConfig): void {
    this.restrictionManager = new RestrictionManager(restrictionConfig ?? { restrictions: [] });
  }

  /**
   * Gets the current selection mode
   */
  getSelectionMode(): 'single' | 'range' {
    return this.selectionMode;
  }
} 