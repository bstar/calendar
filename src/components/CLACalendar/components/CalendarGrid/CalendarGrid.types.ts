import { DateRange } from '../../../CLACalendarComponents/selection/DateRangeSelectionManager';
import { Layer, CalendarSettings } from '../../../CLACalendar.config';
import { RestrictionConfig } from '../../../CLACalendarComponents/restrictions/types';

export interface CalendarGridProps {
  months: Date[];
  selectedRange: DateRange;
  onSelectionStart: (date: Date) => void;
  onSelectionMove: (date: Date) => void;
  isSelecting: boolean;
  visibleMonths: number;
  showMonthHeadings: boolean;
  showTooltips: boolean;
  layer: Layer;
  activeLayer: string;
  restrictionConfig?: RestrictionConfig;
  startWeekOnSunday?: boolean;
  settings?: CalendarSettings;
}

export interface MonthPairProps extends CalendarGridProps {
  firstMonth: Date;
  secondMonth: Date | null;
  renderDay: (date: Date) => any;
}