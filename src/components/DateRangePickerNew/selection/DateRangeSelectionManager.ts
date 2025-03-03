import { format, parseISO, isValid, eachDayOfInterval } from 'date-fns';
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
    // For restricted boundary, we only need to check the start and end points
    // If the start is within a restricted boundary, then the end must be within the same boundary
    // If the start is outside any restricted boundary, then no restriction applies
    const result = this.restrictionManager.checkSelection(startDate, endDate);
    return {
      allowed: result.allowed,
      message: result.message || null
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
    
    // Check if the range is allowed
    const result = this.canSelectRange(startDate, newDate);
    
    if (!result.allowed) {
      return {
        success: false,
        range: currentRange,
        message: result.message
      };
    }
    
    return {
      success: true,
      range: {
        ...currentRange,
        end: format(newDate, 'yyyy-MM-dd')
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