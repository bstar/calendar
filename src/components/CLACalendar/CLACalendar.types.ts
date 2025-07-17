import { CalendarSettings, Layer, RestrictionConfig } from '../CLACalendar.config';

export interface CLACalendarProps {
  settings?: Partial<CalendarSettings>;
  _onSettingsChange?: (settings: CalendarSettings) => void;
  onMonthChange?: (visibleMonths: Date[]) => void;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export interface Renderer {
  (date: Date): RenderResult | null;
}

// Import RenderResult from CalendarComponents since it's already defined there
export type { RenderResult } from '../CLACalendarComponents/CalendarComponents';