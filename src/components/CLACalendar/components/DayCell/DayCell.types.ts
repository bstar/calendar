import { DateRange } from '../../../CLACalendarComponents/selection/DateRangeSelectionManager';
import { Layer, CalendarSettings } from '../../../CLACalendar.config';
import { RestrictionConfig } from '../../../CLACalendarComponents/restrictions/types';
import { Renderer } from '../../CLACalendar.types';

export interface DayCellProps {
  date: Date;
  selectedRange: DateRange;
  isCurrentMonth: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseEnter: (e: React.MouseEvent) => void;
  showTooltips: boolean;
  renderContent: Renderer;
  layer: Layer;
  restrictionConfig?: RestrictionConfig;
  settings?: CalendarSettings;
  rowIndex: number;
  colIndex: number;
  globalRowIndex?: number; // Global row index across all months
  globalColIndex?: number; // Global column index across all months
  onKeyDown?: (e: React.KeyboardEvent) => void;
  tabIndex?: number;
  onFocus?: (e: React.FocusEvent) => void;
  onSelectionStart?: (date: Date, isMouseDrag?: boolean) => void;
  onSelectionMove?: (date: Date, forceUpdate?: boolean) => void;
}