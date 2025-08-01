/**
 * @fileoverview Type definitions for the CLACalendar component
 * 
 * This file contains the TypeScript interfaces and types specific to the
 * CLACalendar component implementation, including:
 * - Component props interface
 * - Input element props
 * - Render function signatures
 * - Re-exports of shared types
 * 
 * @module CLACalendar/types
 */

import { CalendarSettings, Layer, RestrictionConfig } from '../CLACalendar.config';

/**
 * Props interface for the main CLACalendar component
 * @interface CLACalendarProps
 * @property settings - Partial calendar settings to override defaults
 * @property _onSettingsChange - Internal callback for settings updates (prefixed with _ for internal use)
 * @property onMonthChange - Callback fired when visible months change (e.g., navigation)
 */
export interface CLACalendarProps {
  settings?: Partial<CalendarSettings>;
  _onSettingsChange?: (settings: CalendarSettings) => void;
  onMonthChange?: (visibleMonths: Date[]) => void;
}

/**
 * Props interface for the calendar input element
 * @interface InputProps
 * Extends standard HTML input attributes with optional className override
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

/**
 * Function signature for custom date cell renderers
 * @interface Renderer
 * @param date - The date to render content for
 * @returns RenderResult object or null if no custom content
 */
export interface Renderer {
  (date: Date): RenderResult | null;
}

// Import RenderResult from CalendarComponents since it's already defined there
export type { RenderResult } from '../CLACalendarComponents/CalendarComponents';