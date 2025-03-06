import { isValid } from 'date-fns';
import { format, parseISO, eachDayOfInterval } from '../../../utils/DateUtils';
import { RestrictionManager } from '../restrictions/RestrictionManager';
import { RestrictionConfig } from '../restrictions/types';

export interface DateRange {
  start: string | null;
  end: string | null;
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
    
    return {
      success: true,
      range: { 
        start: format(date, 'yyyy-MM-dd'), 
        end: this.selectionMode === 'single' ? format(date, 'yyyy-MM-dd') : null 
      },
      message: null
    };
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

    // Determine selection direction and actual start/end dates
    const isForwardSelection = newDate >= startDate;
    const [rangeStart, rangeEnd] = isForwardSelection 
      ? [startDate, newDate]
      : [newDate, startDate];

    // Check if the range is allowed
    const result = this.canSelectRange(rangeStart, rangeEnd);
    
    if (!result.allowed) {
      // If the selection is not allowed, keep only the valid part
      // For forward selection: keep start date, end date becomes the last valid date before restriction
      // For backward selection: keep end date (original start), start date becomes first valid date after restriction
      const dates = eachDayOfInterval({ start: rangeStart, end: rangeEnd });
      
      if (isForwardSelection) {
        // Find the last valid date before hitting a restriction
        let lastValidDate = startDate;
        for (const date of dates) {
          const checkResult = this.restrictionManager.checkSelection(date, date);
          if (!checkResult.allowed) break;
          lastValidDate = date;
        }
        
        return {
          success: false,
          range: {
            start: format(startDate, 'yyyy-MM-dd'),
            end: format(lastValidDate, 'yyyy-MM-dd')
          },
          message: result.message || 'Selection includes restricted dates'
        };
      } else {
        // Find the first valid date after hitting a restriction
        let firstValidDate = startDate;
        for (let i = dates.length - 1; i >= 0; i--) {
          const checkResult = this.restrictionManager.checkSelection(dates[i], dates[i]);
          if (!checkResult.allowed) break;
          firstValidDate = dates[i];
        }
        
        return {
          success: false,
          range: {
            start: format(firstValidDate, 'yyyy-MM-dd'),
            end: format(startDate, 'yyyy-MM-dd')
          },
          message: result.message || 'Selection includes restricted dates'
        };
      }
    }
    
    // If we get here, the range is valid
    return {
      success: true,
      range: {
        start: format(rangeStart, 'yyyy-MM-dd'),
        end: format(rangeEnd, 'yyyy-MM-dd')
      },
      message: null
    };
  }
  
  /**
   * Update the restriction configuration
   */
  updateRestrictions(restrictionConfig?: RestrictionConfig): void {
    this.restrictionManager = new RestrictionManager(restrictionConfig ?? { restrictions: [] });
  }
} 