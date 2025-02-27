export type RestrictionType = 'daterange' | 'boundary' | 'allowedranges' | 'boundaryrange' | 'custom_future_types';

export interface BaseRestriction {
  type: RestrictionType;
  enabled: boolean;
}

export interface DateRangeRestriction extends BaseRestriction {
  type: 'daterange';
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

export interface AllowedRangesRestriction extends BaseRestriction {
  type: 'allowedranges';
  ranges: {
    start: string;  // YYYY-MM-DD format
    end: string;    // YYYY-MM-DD format
    message: string;
  }[];
}

export interface BoundaryRangeRestriction extends BaseRestriction {
  type: 'boundaryrange';
  ranges: Array<{
    start: string;    // YYYY-MM-DD format
    end: string;      // YYYY-MM-DD format
    message?: string;
  }>;
}

// Union type for all restriction types
export type Restriction = 
  | DateRangeRestriction 
  | BoundaryRestriction 
  | AllowedRangesRestriction
  | BoundaryRangeRestriction;

export interface RestrictionConfig {
  restrictions: Restriction[];
} 