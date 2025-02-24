export type RestrictionType = 'readonly' | 'custom_future_types';

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

// Union type for all restriction types
export type Restriction = ReadOnlyRestriction; // Add more types as needed

export interface RestrictionConfig {
  restrictions: Restriction[];
} 