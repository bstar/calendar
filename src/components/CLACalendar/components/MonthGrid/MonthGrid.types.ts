import { DateRange } from '../../../CLACalendarComponents/selection/DateRangeSelectionManager';
import { Layer, CalendarSettings } from '../../../CLACalendar.config';
import { RestrictionConfig } from '../../../CLACalendarComponents/restrictions/types';
import { Renderer } from '../../CLACalendar.types';

export interface MonthGridProps {
  baseDate: Date;
  monthIndex?: number; // Position of this month in the calendar (0-based)
  selectedRange: DateRange;
  onSelectionStart: (date: Date) => void;
  onSelectionMove: (date: Date) => void;
  style?: React.CSSProperties;
  showMonthHeading?: boolean;
  showTooltips: boolean;
  renderDay: Renderer;
  layer: Layer;
  startWeekOnSunday?: boolean;
  restrictionConfig?: RestrictionConfig;
  activeLayer?: string;
  settings?: CalendarSettings;
  totalMonths?: number; // Total number of visible months
  onNavigateToMonth?: (monthIndex: number, date: Date) => void; // Callback to navigate to another month
  onNavigateMonth?: (direction: 'prev' | 'next') => void; // Callback for Page Up/Down navigation
  monthsPerRow?: number; // Number of months displayed per row (for grid layout)
}