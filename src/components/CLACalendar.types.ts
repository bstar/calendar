// Re-export types from their source locations for easier imports
export type { Layer, Event } from './CLACalendar.config';
export type { CalendarSettings } from './CLACalendar/CLACalendar.types';

// Define restriction types here for clarity
export interface RestrictionConfig {
  restrictions: Restriction[];
}

export type Restriction = 
  | WeekdayRestriction
  | DateRangeRestriction
  | BoundaryRestriction
  | AllowedRangesRestriction
  | RestrictedBoundaryRestriction;

export interface WeekdayRestriction {
  type: 'weekday';
  enabled: boolean;
  days: number[]; // 0-6, where 0 is Sunday
  message?: string;
}

export interface DateRangeRestriction {
  type: 'daterange';
  enabled: boolean;
  ranges: DateRange[];
  message?: string;
}

export interface DateRange {
  startDate: string;
  endDate: string;
  message?: string;
}

export interface BoundaryRestriction {
  type: 'boundary';
  enabled: boolean;
  direction: 'before' | 'after';
  date: string;
  inclusive: boolean;
  message?: string;
}

export interface AllowedRangesRestriction {
  type: 'allowedranges';
  enabled: boolean;
  ranges: DateRange[];
  message?: string;
}

export interface RestrictedBoundaryRestriction {
  type: 'restricted_boundary';
  enabled: boolean;
  minDate: string;
  maxDate: string;
  ranges: RestrictedRange[];
  message?: string;
}

export interface RestrictedRange {
  startDate: string;
  endDate: string;
  message?: string;
  restricted: boolean;
  exceptions?: DateRange[];
}