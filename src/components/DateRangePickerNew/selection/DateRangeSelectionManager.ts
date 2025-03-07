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
    
    // For checking other types of restrictions
    if (isBackwardSelection) {
      // For backward selection, check if the range is valid (passing in anchor date)
      const rangeCheck = this.canSelectRange(newDate, anchorDate, anchorDate);
      
      if (!rangeCheck.allowed) {
        // If not allowed, find the closest valid date to the anchor
        // Start walking back from the anchor to find the first valid date
        let validStart = addDays(anchorDate, -1);
        
        // Binary search to efficiently find the last valid date
        let minDate = newDate;
        let maxDate = anchorDate;
        let foundValidDate = false;
        let foundMessage = rangeCheck.message;
        
        // First check if we can go back at least one day
        const oneBackCheck = this.canSelectRange(validStart, anchorDate, anchorDate);
        if (!oneBackCheck.allowed) {
          // If we can't even go back one day, return the anchor as both start and end
          return {
            success: false,
            range: {
              start: format(anchorDate, 'yyyy-MM-dd'),
              end: format(anchorDate, 'yyyy-MM-dd'),
              anchorDate: format(anchorDate, 'yyyy-MM-dd'),
              isBackwardSelection: true
            },
            message: oneBackCheck.message
          };
        }
        
        // Use binary search to efficiently find the last valid date
        while (differenceInCalendarDays(maxDate, minDate) > 1) {
          const midDate = new Date(minDate.getTime() + (maxDate.getTime() - minDate.getTime()) / 2);
          const midCheck = this.canSelectRange(midDate, anchorDate, anchorDate);
          
          if (midCheck.allowed) {
            maxDate = midDate; // If mid date is valid, search between min and mid
            foundValidDate = true;
            validStart = midDate;
          } else {
            minDate = midDate; // If mid date is invalid, search between mid and max
            foundMessage = midCheck.message;
          }
        }
        
        // Final check to find the exact boundary
        if (!foundValidDate) {
          const finalCheck = this.canSelectRange(minDate, anchorDate, anchorDate);
          if (finalCheck.allowed) {
            validStart = minDate;
            foundValidDate = true;
          }
        }
        
        // If we found a valid date, use it
        if (foundValidDate) {
          return {
            success: true, 
            range: {
              start: format(validStart, 'yyyy-MM-dd'),
              end: format(anchorDate, 'yyyy-MM-dd'),
              anchorDate: format(anchorDate, 'yyyy-MM-dd'),
              isBackwardSelection: true
            },
            message: foundMessage
          };
        }
        
        // If we couldn't find any valid date, return the anchor date
        return {
          success: false,
          range: {
            start: format(anchorDate, 'yyyy-MM-dd'),
            end: format(anchorDate, 'yyyy-MM-dd'),
            anchorDate: format(anchorDate, 'yyyy-MM-dd'),
            isBackwardSelection: true
          },
          message: rangeCheck.message
        };
      }
      
      // If range is valid, return the selection
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
      // Forward selection (passing in anchor date)
      const rangeCheck = this.canSelectRange(anchorDate, newDate, anchorDate);
      
      if (!rangeCheck.allowed) {
        // If not allowed, find the closest valid date to the anchor
        // Start walking forward from the anchor to find the last valid date
        let validEnd = addDays(anchorDate, 1);
        
        // Binary search to efficiently find the last valid date
        let minDate = anchorDate;
        let maxDate = newDate;
        let foundValidDate = false;
        let foundMessage = rangeCheck.message;
        
        // First check if we can go forward at least one day
        const oneForwardCheck = this.canSelectRange(anchorDate, validEnd, anchorDate);
        if (!oneForwardCheck.allowed) {
          // If we can't even go forward one day, return the anchor as both start and end
          return {
            success: false,
            range: {
              start: format(anchorDate, 'yyyy-MM-dd'),
              end: format(anchorDate, 'yyyy-MM-dd'),
              anchorDate: format(anchorDate, 'yyyy-MM-dd'),
              isBackwardSelection: false
            },
            message: oneForwardCheck.message
          };
        }
        
        // Use binary search to efficiently find the last valid date
        while (differenceInCalendarDays(maxDate, minDate) > 1) {
          const midDate = new Date(minDate.getTime() + (maxDate.getTime() - minDate.getTime()) / 2);
          const midCheck = this.canSelectRange(anchorDate, midDate, anchorDate);
          
          if (midCheck.allowed) {
            minDate = midDate; // If mid date is valid, search between mid and max
            foundValidDate = true;
            validEnd = midDate;
          } else {
            maxDate = midDate; // If mid date is invalid, search between min and mid
            foundMessage = midCheck.message;
          }
        }
        
        // Final check to find the exact boundary
        if (!foundValidDate) {
          const finalCheck = this.canSelectRange(anchorDate, maxDate, anchorDate);
          if (finalCheck.allowed) {
            validEnd = maxDate;
            foundValidDate = true;
          }
        }
        
        // If we found a valid date, use it
        if (foundValidDate) {
          return {
            success: true,
            range: {
              start: format(anchorDate, 'yyyy-MM-dd'),
              end: format(validEnd, 'yyyy-MM-dd'),
              anchorDate: format(anchorDate, 'yyyy-MM-dd'),
              isBackwardSelection: false
            },
            message: foundMessage
          };
        }
        
        // If we couldn't find any valid date, return the anchor date
        return {
          success: false,
          range: {
            start: format(anchorDate, 'yyyy-MM-dd'),
            end: format(anchorDate, 'yyyy-MM-dd'),
            anchorDate: format(anchorDate, 'yyyy-MM-dd'),
            isBackwardSelection: false
          },
          message: rangeCheck.message
        };
      }
      
      // If range is valid, return the selection
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