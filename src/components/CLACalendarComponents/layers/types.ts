/**
 * Enumeration of available layer types in the date picker.
 * These determine the basic behavior and rendering approach for each layer.
 * 
 * - BASE: Core calendar layer providing date selection functionality
 * - BACKGROUND: Renders colored backgrounds for date ranges
 * - EVENTS: Displays event indicators and tooltips
 * - OVERLAY: Renders custom content over calendar cells
 */
export enum LAYER_TYPES {
  BASE = 'base',
  BACKGROUND = 'background',
  EVENTS = 'events',
  OVERLAY = 'overlay'
}

/**
 * Enumeration of layer capabilities.
 * These define what features a layer can support and utilize.
 * 
 * - BACKGROUND: Ability to render background colors for date ranges
 * - EVENTS: Ability to display events with indicators and tooltips
 * - BASE: Core calendar functionality
 */
export enum LAYER_CAPABILITIES {
  BACKGROUND = 'background',
  EVENTS = 'events',
  BASE = 'base'
}

/**
 * Interface defining the structure of a background range.
 * Used to specify date ranges that should have a specific background color.
 * 
 * Properties:
 * - startDate: Start date of the range in ISO string format (YYYY-MM-DD)
 * - endDate: End date of the range in ISO string format (YYYY-MM-DD)
 * - color: CSS color value to apply as background
 */
export interface BackgroundRange {
  startDate: string;
  endDate: string;
  color: string;
}

/**
 * Interface defining the structure of a calendar event.
 * Used to display event indicators and tooltips on specific dates.
 * 
 * Properties:
 * - date: Date of the event in ISO string format (YYYY-MM-DD)
 * - title: Title/name of the event
 * - color: Color for the event indicator (optional)
 * - time: Time of the event in display format
 * - description: Detailed description of the event
 */
export interface Event {
  date: string;
  title: string;
  type: string;
  time: string;
  description: string;
  color?: string;
  displayTreatment?: 'solid' | 'stroke';
}

/**
 * Interface defining the possible data structure for a layer.
 * Layers can contain background ranges, events, or both.
 * 
 * Properties:
 * - background: Optional array of background ranges to render
 * - events: Optional array of events to display
 */
export interface LayerData {
  events?: Event[];
  background?: BackgroundData[];
}

/**
 * Interface defining the structure of a calendar layer.
 * Layers are the primary mechanism for adding functionality to the calendar.
 * 
 * Properties:
 * - name: Unique identifier for the layer
 * - title: Title of the layer
 * - description: Description of the layer
 * - required: Whether the layer is required
 * - visible: Whether the layer is visible
 * - data: Optional data for the layer
 * - color: Color directly used for the layer
 * - enabled: Whether the layer is currently enabled
 * - events: Array of events to display
 * - renderContent: Optional function to render custom content for a date
 */
export interface Layer {
  name: string;
  title: string;
  description: string;
  required?: boolean;
  visible?: boolean;
  data?: LayerData;
  color?: string;
  enabled?: boolean;
  events?: Event[];
  renderContent?: (date: Date) => RenderResult | null;
}

/**
 * Interface defining the possible return values from a layer renderer.
 * Renderers can specify background colors, React elements, and tooltip content.
 * 
 * Properties:
 * - backgroundColor: Background color to apply to the date cell
 * - element: React element to render in the date cell
 * - tooltipContent: React element to render in the tooltip
 */
export interface RenderResult {
  backgroundColor?: string;
  element?: React.ReactNode;
  tooltipContent?: React.ReactNode;
}

export interface BackgroundData {
  startDate: string;
  endDate: string;
  color: string;
} 