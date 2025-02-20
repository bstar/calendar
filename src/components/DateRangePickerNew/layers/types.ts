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
 * - type: Type of event ('work' or 'other'), affects visual styling
 * - time: Time of the event in display format
 * - description: Detailed description of the event
 */
export interface Event {
  date: string;
  title: string;
  type: 'work' | 'other';
  time: string;
  description: string;
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
  background?: BackgroundRange[];
  events?: Event[];
}

/**
 * Interface defining the structure of a calendar layer.
 * Layers are the primary mechanism for adding functionality to the calendar.
 * 
 * Properties:
 * - name: Unique identifier for the layer
 * - type: Type of layer (LAYER_TYPES), determines basic behavior
 * - title: Display name for the layer in the UI
 * - description: Description of the layer's purpose
 * - required: Whether the layer is required and cannot be disabled
 * - visible: Whether the layer is currently visible
 * - features: Array of capability identifiers that this layer supports
 * - data: Data used by the layer for rendering
 */
export interface Layer {
  name: string;
  type: LAYER_TYPES;
  title: string;
  description: string;
  required?: boolean;
  visible?: boolean;
  features: string[];
  data?: LayerData;
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