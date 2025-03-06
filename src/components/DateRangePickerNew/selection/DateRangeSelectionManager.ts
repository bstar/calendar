import { isValid } from 'date-fns';
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
      return this.startSelection(newDate);
    }
    
    const startDate = parseISO(currentRange.start);
    if (!isValid(startDate)) {
      return {
        success: false,
        range: currentRange,
        message: 'Invalid start date'
      };
    }
    
    // For single selection mode, just replace the date
    if (this.selectionMode === 'single') {
      return this.startSelection(newDate);
    }

    // Get the original anchor date - this never changes during a selection
    // If anchorDate is not stored, use the start date as the anchor
    const anchorDate = currentRange.anchorDate 
      ? parseISO(currentRange.anchorDate)
      : startDate;
    
    // Determine whether this is a forward or backward selection based on anchor
    const isBackward = newDate < anchorDate;
    
    // Check if the initial selection point is within a restricted boundary
    const startBoundary = this.isInRestrictedBoundary(anchorDate);
    
    // If selection started in a restricted boundary, it must stay within that boundary
    if (startBoundary.inBoundary && startBoundary.boundaryStart && startBoundary.boundaryEnd) {
      // Check if the new date is outside the boundary
      if (newDate < startBoundary.boundaryStart || newDate > startBoundary.boundaryEnd) {
        // Selection is trying to go outside the boundary - restrict it
        const boundaryLimit = isBackward ? startBoundary.boundaryStart : startBoundary.boundaryEnd;
        
        return {
          success: false,
          range: {
            // In backward selection, the anchor is the end date and we adjust the start date
            // In forward selection, the anchor is the start date and we adjust the end date
            start: isBackward ? format(boundaryLimit, 'yyyy-MM-dd') : format(anchorDate, 'yyyy-MM-dd'),
            end: isBackward ? format(anchorDate, 'yyyy-MM-dd') : format(boundaryLimit, 'yyyy-MM-dd'),
            anchorDate: currentRange.anchorDate
          },
          message: startBoundary.message
        };
      }
    }
    
    // Proceed with normal selection logic
    if (isBackward) {
      // Backward selection: the anchor is the end date and we adjust the start date
      // We're selecting dates to the left of the anchor
      const rangeStart = newDate;
      const rangeEnd = anchorDate;
      
      // Check if we can select this range
      const rangeCheck = this.canSelectRange(rangeStart, rangeEnd);
      
      if (!rangeCheck.allowed) {
        // If the backward range is not allowed, we need to find the closest valid date
        // Get all days between the new date and the anchor
        const datesInRange = eachDayOfInterval({ start: rangeStart, end: rangeEnd });
        
        // Start from the anchor and work backward until we hit a restricted date
        let validStart = rangeStart; // Default to the proposed start if all dates are valid
        
        for (let i = 0; i < datesInRange.length; i++) {
          const dateToCheck = datesInRange[i];
          const dateCheck = this.restrictionManager.checkSelection(dateToCheck, dateToCheck);
          
          if (!dateCheck.allowed) {
            // When we hit a restriction, use the date after it as the valid start
            if (i > 0) {
              validStart = datesInRange[i-1];
            } else {
              // If the first date is restricted, use the anchor itself
              validStart = anchorDate;
            }
            break;
          }
        }
        
        // Create a range with validStart as start and anchor as end
        return {
          success: false,
          range: {
            start: format(validStart, 'yyyy-MM-dd'),
            end: format(anchorDate, 'yyyy-MM-dd'),
            anchorDate: currentRange.anchorDate
          },
          message: rangeCheck.message || 'Selection includes restricted dates'
        };
      }
      
      // If range is valid, create the backward range
      return {
        success: true,
        range: {
          start: format(rangeStart, 'yyyy-MM-dd'),
          end: format(rangeEnd, 'yyyy-MM-dd'),
          anchorDate: currentRange.anchorDate
        },
        message: null
      };
    } else {
      // Forward selection: the anchor is the start date and we adjust the end date
      // We're selecting dates to the right of the anchor
      const rangeStart = anchorDate;
      const rangeEnd = newDate;
      
      // Check if we can select this range
      const rangeCheck = this.canSelectRange(rangeStart, rangeEnd);
      
      if (!rangeCheck.allowed) {
        // If the range is not allowed, find the closest valid date before restriction
        const datesInRange = eachDayOfInterval({ start: rangeStart, end: rangeEnd });
        
        // Start from the anchor and work forward until we hit a restricted date
        let validEnd = rangeStart; // Default to the anchor if all dates are restricted
        
        for (let i = 0; i < datesInRange.length; i++) {
          const dateToCheck = datesInRange[i];
          const dateCheck = this.restrictionManager.checkSelection(dateToCheck, dateToCheck);
          
          if (!dateCheck.allowed) {
            // When we hit a restriction, use the date before it as the valid end
            if (i > 0) {
              validEnd = datesInRange[i-1];
            }
            break;
          }
          
          // If all dates are valid, use the last date (proposed end)
          validEnd = dateToCheck;
        }
        
        // Create a range with anchor as start and validEnd as end
        return {
          success: false,
          range: {
            start: format(rangeStart, 'yyyy-MM-dd'),
            end: format(validEnd, 'yyyy-MM-dd'),
            anchorDate: currentRange.anchorDate
          },
          message: rangeCheck.message || 'Selection includes restricted dates'
        };
      }
      
      // If range is valid, create the forward range
      return {
        success: true,
        range: {
          start: format(rangeStart, 'yyyy-MM-dd'),
          end: format(rangeEnd, 'yyyy-MM-dd'),
          anchorDate: currentRange.anchorDate
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