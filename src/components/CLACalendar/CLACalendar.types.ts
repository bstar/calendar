import { CalendarSettings, Layer, RestrictionConfig } from '../CLACalendar.config';

export interface CLACalendarProps {
  settings?: Partial<CalendarSettings>;
  _onSettingsChange?: (settings: CalendarSettings) => void;
  initialActiveLayer?: string;
  onSubmit?: (startDate: string | null, endDate: string | null) => void;
  onMonthChange?: (visibleMonths: Date[]) => void;
  layersFactory?: () => Layer[];
  restrictionConfigFactory?: () => RestrictionConfig;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export interface Renderer {
  (date: Date): RenderResult | null;
}

// Import RenderResult from CalendarComponents since it's already defined there
export type { RenderResult } from '../CLACalendarComponents/CalendarComponents';