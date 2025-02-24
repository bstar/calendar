export interface ReadOnlyRange {
  start: string;  // YYYY-MM-DD format
  end: string;    // YYYY-MM-DD format
  message: string;
}

export interface RestrictionConfig {
  readOnlyRanges: ReadOnlyRange[];
  enabled: boolean;
} 