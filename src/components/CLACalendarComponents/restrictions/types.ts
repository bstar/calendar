/**
 * @fileoverview Type definitions for the calendar restriction system
 * 
 * This file defines the interfaces and types used by the restriction system
 * to control which dates can be selected in the calendar. The restriction
 * system supports multiple strategies for date validation:
 * 
 * - Date range restrictions: Block specific date ranges
 * - Boundary restrictions: Set min/max selectable dates
 * - Allowed ranges: Only permit selection within specific ranges
 * - Restricted boundary: Complex rules with exceptions
 * - Weekday restrictions: Block specific days of the week
 * 
 * Each restriction type can be individually enabled/disabled and can provide
 * custom error messages to display when dates are restricted.
 * 
 * @module restrictions/types
 */

/**
 * Available restriction types in the system
 */
export type RestrictionType = 'daterange' | 'boundary' | 'allowedranges' | 'restricted_boundary' | 'weekday';

/**
 * Base interface that all restriction types extend
 * @interface BaseRestriction
 * @property type - The type of restriction
 * @property enabled - Whether this restriction is currently active
 */
export interface BaseRestriction {
  type: RestrictionType;
  enabled: boolean;
}

export interface DateRangeRestriction extends BaseRestriction {
  type: 'daterange';
  ranges: {
    startDate: string;  // YYYY-MM-DD format
    endDate: string;    // YYYY-MM-DD format
    message?: string;
  }[];
  message?: string;
}

export interface BoundaryRestriction extends BaseRestriction {
  type: 'boundary';
  date: string;  // YYYY-MM-DD format
  direction: 'before' | 'after';
  inclusive?: boolean;
  message?: string;
}

export interface AllowedRangesRestriction extends BaseRestriction {
  type: 'allowedranges';
  ranges: {
    startDate: string;  // YYYY-MM-DD format
    endDate: string;    // YYYY-MM-DD format
    message?: string;
  }[];
  message?: string;
}

export interface RestrictedBoundaryRestriction extends BaseRestriction {
  type: 'restricted_boundary';
  minDate?: string;  // YYYY-MM-DD format
  maxDate?: string;  // YYYY-MM-DD format
  ranges: {
    startDate: string;  // YYYY-MM-DD format
    endDate: string;    // YYYY-MM-DD format
    message?: string;
    restricted?: boolean;
    exceptions?: {
      startDate: string;
      endDate: string;
      message?: string;
    }[];
  }[];
  message?: string;
}

export interface WeekdayRestriction extends BaseRestriction {
  type: 'weekday';
  days: number[];  // 0-6 for Sunday-Saturday
  message?: string;
}

// Union type for all restriction types
export type Restriction = DateRangeRestriction | BoundaryRestriction | AllowedRangesRestriction | RestrictedBoundaryRestriction | WeekdayRestriction;

export interface RestrictionConfig {
  restrictions: Restriction[];
} 