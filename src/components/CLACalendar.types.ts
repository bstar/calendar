/**
 * @fileoverview Type definitions for CLACalendar component
 * 
 * This file centralizes all TypeScript type definitions used throughout the
 * CLACalendar component system. It provides:
 * - Re-exports of types from their source modules for convenient imports
 * - Restriction system type definitions for date validation
 * - Interfaces for various restriction strategies
 * 
 * The restriction system supports multiple validation strategies:
 * - Weekday restrictions: Block specific days of the week
 * - Date range restrictions: Block specific date ranges
 * - Boundary restrictions: Set minimum/maximum selectable dates
 * - Allowed ranges: Only allow selection within specific ranges
 * - Restricted boundary: Complex rules with exceptions
 * 
 * @module CLACalendar.types
 */

// Re-export types from their source locations for easier imports
export type { Layer, Event } from './CLACalendar.config';
export type { CalendarSettings } from './CLACalendar/CLACalendar.types';

// Define restriction types here for clarity
/**
 * Configuration container for calendar restrictions
 * @interface RestrictionConfig
 */
export interface RestrictionConfig {
  restrictions: Restriction[];
}

/**
 * Union type for all available restriction types
 * Each restriction type implements different validation logic
 */
export type Restriction = 
  | WeekdayRestriction
  | DateRangeRestriction
  | BoundaryRestriction
  | AllowedRangesRestriction
  | RestrictedBoundaryRestriction;

/**
 * Restricts selection based on day of the week
 * @interface WeekdayRestriction
 * @property type - Identifies this as a weekday restriction
 * @property enabled - Whether this restriction is active
 * @property days - Array of restricted weekdays (0=Sunday, 6=Saturday)
 * @property message - Optional custom message to display when date is restricted
 */
export interface WeekdayRestriction {
  type: 'weekday';
  enabled: boolean;
  days: number[]; // 0-6, where 0 is Sunday
  message?: string;
}

/**
 * Restricts selection within specific date ranges
 * @interface DateRangeRestriction
 * @property type - Identifies this as a date range restriction
 * @property enabled - Whether this restriction is active
 * @property ranges - Array of date ranges to restrict
 * @property message - Optional custom message to display when date is restricted
 */
export interface DateRangeRestriction {
  type: 'daterange';
  enabled: boolean;
  ranges: DateRange[];
  message?: string;
}

/**
 * Represents a date range with optional message
 * @interface DateRange
 * @property startDate - Start date in YYYY-MM-DD format
 * @property endDate - End date in YYYY-MM-DD format
 * @property message - Optional message specific to this range
 */
export interface DateRange {
  startDate: string;
  endDate: string;
  message?: string;
}

/**
 * Sets a boundary date that restricts selection before or after it
 * @interface BoundaryRestriction
 * @property type - Identifies this as a boundary restriction
 * @property enabled - Whether this restriction is active
 * @property direction - Whether to restrict dates 'before' or 'after' the boundary
 * @property date - Boundary date in YYYY-MM-DD format
 * @property inclusive - Whether the boundary date itself is restricted
 * @property message - Optional custom message to display when date is restricted
 */
export interface BoundaryRestriction {
  type: 'boundary';
  enabled: boolean;
  direction: 'before' | 'after';
  date: string;
  inclusive: boolean;
  message?: string;
}

/**
 * Only allows selection within specified date ranges
 * @interface AllowedRangesRestriction
 * @property type - Identifies this as an allowed ranges restriction
 * @property enabled - Whether this restriction is active
 * @property ranges - Array of date ranges where selection is allowed
 * @property message - Optional custom message to display when date is outside allowed ranges
 */
export interface AllowedRangesRestriction {
  type: 'allowedranges';
  enabled: boolean;
  ranges: DateRange[];
  message?: string;
}

/**
 * Complex restriction with min/max boundaries and specific restricted ranges
 * @interface RestrictedBoundaryRestriction
 * @property type - Identifies this as a restricted boundary restriction
 * @property enabled - Whether this restriction is active
 * @property minDate - Minimum selectable date in YYYY-MM-DD format
 * @property maxDate - Maximum selectable date in YYYY-MM-DD format
 * @property ranges - Array of restricted ranges with potential exceptions
 * @property message - Optional custom message to display when date is restricted
 */
export interface RestrictedBoundaryRestriction {
  type: 'restricted_boundary';
  enabled: boolean;
  minDate: string;
  maxDate: string;
  ranges: RestrictedRange[];
  message?: string;
}

/**
 * Represents a restricted date range with possible exceptions
 * @interface RestrictedRange
 * @property startDate - Start date in YYYY-MM-DD format
 * @property endDate - End date in YYYY-MM-DD format
 * @property message - Optional message specific to this range
 * @property restricted - Whether dates in this range are restricted
 * @property exceptions - Optional array of date ranges that are exceptions to the restriction
 */
export interface RestrictedRange {
  startDate: string;
  endDate: string;
  message?: string;
  restricted: boolean;
  exceptions?: DateRange[];
}