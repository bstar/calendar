import { isValid, isBefore, isAfter, addDays, differenceInCalendarDays } from 'date-fns';
import { format, parseISO, eachDayOfInterval } from '../../../utils/DateUtils';
import { RestrictionManager } from '../restrictions/RestrictionManager';
import { RestrictionConfig } from '../restrictions/types';

export interface DateRange {
  start: string | null;
  end: string | null;
  // Add a field to track if this is a backward selection
  isBackwardSelection?: boolean;
  // Store the original anchor point
  anchorDate?: string | null;
}

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
  canSelectRange(startDate: Date, endDate: Date): { allowed: boolean; message: string | null } {
    // First check the start and end dates
    const startResult = this.restrictionManager.checkSelection(startDate, startDate);
    if (!startResult.allowed) {
      return {
        allowed: false,
        message: startResult.message || null
      };
    }

    const endResult = this.restrictionManager.checkSelection(endDate, endDate);
    if (!endResult.allowed) {
      return {
        allowed: false,
        message: endResult.message || null
      };
    }

    // Get all dates in the range
    const dates = eachDayOfInterval({ start: startDate, end: endDate });

    // Check each date in the range
    for (const date of dates) {
      const result = this.restrictionManager.checkSelection(date, date);
      if (!result.allowed) {
        return {
          allowed: false,
          message: result.message || 'Selection includes restricted dates'
        };
      }
    }

    // Finally check the entire range as a whole
    const rangeResult = this.restrictionManager.checkSelection(startDate, endDate);
    return {
      allowed: rangeResult.allowed,
      message: rangeResult.message || null
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
  private isInRestrictedBoundary(date: Date): {inBoundary: boolean; boundaryStart: Date | null; boundaryEnd: Date | null; message: string | null} {
    // Check if there are any restricted_boundary restrictions
    const boundaries = this.restrictionManager.getRestrictedBoundaries();
    if (!boundaries || !boundaries.length) {
      return {inBoundary: false, boundaryStart: null, boundaryEnd: null, message: null};
    }

    // Check if the date falls within any restricted boundary
    for (const boundary of boundaries) {
      if (!boundary.enabled) continue;
      
      for (const range of boundary.ranges) {
        const rangeStart = parseISO(range.start);
        const rangeEnd = parseISO(range.end);
        
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
    
    return {inBoundary: false, boundaryStart: null, boundaryEnd: null, message: null};
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

    // Get the current anchor date from the selection
    const anchorDate = currentRange.anchorDate 
      ? parseISO(currentRange.anchorDate) 
      : parseISO(currentRange.start);
    
    // Determine if selection is backward (new date is before anchor)
    const isBackwardSelection = isBefore(newDate, anchorDate);
    
    // For checking any boundaries that might contain the anchor date
    const boundaryCheck = this.isInRestrictedBoundary(anchorDate);
    if (boundaryCheck.inBoundary) {
      // If anchor is in a boundary, selection must stay within that boundary
      const boundaryStart = boundaryCheck.boundaryStart;
      const boundaryEnd = boundaryCheck.boundaryEnd;
      
      if (isBackwardSelection && boundaryStart) {
        // Don't allow backward selection to go before boundary start
        if (isBefore(newDate, boundaryStart)) {
          return {
            success: true,
            range: {
              start: format(boundaryStart, 'yyyy-MM-dd'),
              end: format(anchorDate, 'yyyy-MM-dd'),
              anchorDate: format(anchorDate, 'yyyy-MM-dd'),
              isBackwardSelection: true
            },
            message: boundaryCheck.message || "Selection limited by boundary restriction"
          };
        }
      } else if (!isBackwardSelection && boundaryEnd) {
        // Don't allow forward selection to go beyond boundary end
        if (isAfter(newDate, boundaryEnd)) {
          return {
            success: true,
            range: {
              start: format(anchorDate, 'yyyy-MM-dd'),
              end: format(boundaryEnd, 'yyyy-MM-dd'),
              anchorDate: format(anchorDate, 'yyyy-MM-dd'),
              isBackwardSelection: false
            },
            message: boundaryCheck.message || "Selection limited by boundary restriction"
          };
        }
      }
    }
    
    // If we're moving backward (selecting earlier dates)
    if (isBackwardSelection) {
      // Check if the direct selection from newDate to anchor is valid
      const validCheck = this.canSelectRange(newDate, anchorDate);
      
      if (!validCheck.allowed) {
        // Find the closest valid date to the anchor when moving backward
        const startDate = addDays(anchorDate, -1); // Start checking from the day before anchor
        let validStartDate = null;
        let currentMessage = validCheck.message;
        
        // Binary search approach to quickly find the last valid date
        // This is more efficient than checking every date one by one
        let minDate = newDate;
        let maxDate = startDate;
        
        // First check if the day right before anchor is valid
        // If not, there's no valid selection possible
        const firstDayCheck = this.canSelectRange(maxDate, anchorDate);
        if (!firstDayCheck.allowed) {
          return { 
            success: false, 
            range: currentRange, 
            message: firstDayCheck.message || "No valid selection possible" 
          };
        }
        
        while (differenceInCalendarDays(maxDate, minDate) > 1) {
          const midDate = new Date(minDate.getTime() + (maxDate.getTime() - minDate.getTime()) / 2);
          const midDateCheck = this.canSelectRange(midDate, anchorDate);
          
          if (midDateCheck.allowed) {
            maxDate = midDate; // The mid date is valid, search between min and mid
            validStartDate = midDate;
          } else {
            minDate = midDate; // The mid date is invalid, search between mid and max
            currentMessage = midDateCheck.message;
          }
        }
        
        // Final check to find the exact last valid date
        const finalCheck = this.canSelectRange(minDate, anchorDate);
        if (finalCheck.allowed) {
          validStartDate = minDate;
        } else if (!validStartDate) {
          validStartDate = maxDate;
        }
        
        // Return the most optimal valid selection
        return {
          success: true,
          range: {
            start: format(validStartDate, 'yyyy-MM-dd'),
            end: format(anchorDate, 'yyyy-MM-dd'),
            anchorDate: format(anchorDate, 'yyyy-MM-dd'),
            isBackwardSelection: true
          },
          message: currentMessage
        };
      }
      
      // Valid backward selection
      return {
        success: true,
        range: {
          start: format(newDate, 'yyyy-MM-dd'),
          end: format(anchorDate, 'yyyy-MM-dd'),
          anchorDate: format(anchorDate, 'yyyy-MM-dd'),
          isBackwardSelection: true
        },
        message: null
      };
    } else {
      // Forward selection (selecting later dates)
      const validCheck = this.canSelectRange(anchorDate, newDate);
      
      if (!validCheck.allowed) {
        // Find the closest valid date to the anchor when moving forward
        const endDate = addDays(anchorDate, 1); // Start checking from the day after anchor
        let validEndDate = null;
        let currentMessage = validCheck.message;
        
        // Binary search approach to quickly find the last valid date
        let minDate = endDate;
        let maxDate = newDate;
        
        // First check if the day right after anchor is valid
        // If not, there's no valid selection possible
        const firstDayCheck = this.canSelectRange(anchorDate, minDate);
        if (!firstDayCheck.allowed) {
          return { 
            success: false, 
            range: currentRange, 
            message: firstDayCheck.message || "No valid selection possible" 
          };
        }
        
        while (differenceInCalendarDays(maxDate, minDate) > 1) {
          const midDate = new Date(minDate.getTime() + (maxDate.getTime() - minDate.getTime()) / 2);
          const midDateCheck = this.canSelectRange(anchorDate, midDate);
          
          if (midDateCheck.allowed) {
            minDate = midDate; // The mid date is valid, search between mid and max
            validEndDate = midDate;
          } else {
            maxDate = midDate; // The mid date is invalid, search between min and mid
            currentMessage = midDateCheck.message;
          }
        }
        
        // Final check to find the exact last valid date
        const finalCheck = this.canSelectRange(anchorDate, maxDate);
        if (finalCheck.allowed) {
          validEndDate = maxDate;
        } else if (!validEndDate) {
          validEndDate = minDate;
        }
        
        // Return the most optimal valid selection
        return {
          success: true,
          range: {
            start: format(anchorDate, 'yyyy-MM-dd'),
            end: format(validEndDate, 'yyyy-MM-dd'),
            anchorDate: format(anchorDate, 'yyyy-MM-dd'),
            isBackwardSelection: false
          },
          message: currentMessage
        };
      }
      
      // Valid forward selection
      return {
        success: true,
        range: {
          start: format(anchorDate, 'yyyy-MM-dd'),
          end: format(newDate, 'yyyy-MM-dd'),
          anchorDate: format(anchorDate, 'yyyy-MM-dd'),
          isBackwardSelection: false
        },
        message: null
      };
    }
  }
  
  /**
   * Update the restriction configuration
   */
  updateRestrictions(restrictionConfig?: RestrictionConfig): void {
    this.restrictionManager = new RestrictionManager(restrictionConfig ?? { restrictions: [] });
  }
} 