/**
 * @fileoverview Main entry point for the CLA Calendar library
 * 
 * This file exports all public APIs and components that consumers of the
 * CLA Calendar library can use. The exports include:
 * 
 * - CLACalendar: The main calendar component
 * - Error handling utilities: Error boundary component and HOC
 * - Configuration utilities: Settings creation and validation functions
 * - Constants: Default colors and styles
 * 
 * Usage example:
 * ```typescript
 * import { CLACalendar, getDefaultSettings } from 'cla-calendar';
 * 
 * function MyApp() {
 *   return <CLACalendar settings={getDefaultSettings()} />;
 * }
 * ```
 * 
 * @module cla-calendar
 */

export { default as CLACalendar } from './components/CLACalendar';
export { CalendarErrorBoundary, withCalendarErrorBoundary, useErrorHandler } from './components/ErrorBoundary';
export {
  createCalendarSettings,
  createMinimalCalendar,
  validateCalendarSettings,
  getDefaultSettings,
  DEFAULT_COLORS,
  DEFAULT_CONTAINER_STYLES
} from './components/CLACalendar.config';

// Export types
export type { CalendarSettings, Layer, Event } from './components/CLACalendar.config';
export type { CLACalendarProps } from './components/CLACalendar/CLACalendar.types';
export type { RestrictionConfig, Restriction } from './components/CLACalendar.types'; 