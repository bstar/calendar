export type RestrictionType = 'readonly' | 'boundary' | 'custom_future_types';

export interface BaseRestriction {
  type: RestrictionType;
  enabled: boolean;
}

export interface ReadOnlyRestriction extends BaseRestriction {
  type: 'readonly';
  ranges: {
    start: string;  // YYYY-MM-DD format
    end: string;    // YYYY-MM-DD format
    message: string;
  }[];
}

export interface BoundaryRestriction extends BaseRestriction {
  type: 'boundary';
  date: string;  // YYYY-MM-DD format
  direction: 'before' | 'after';
  message: string;
}

// Union type for all restriction types
export type Restriction = ReadOnlyRestriction | BoundaryRestriction;

export interface RestrictionConfig {
  restrictions: Restriction[];
} 