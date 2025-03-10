/**
 * LayerRenderer.tsx
 * 
 * This component is responsible for rendering visual layers in the calendar system.
 * It combines multiple visual elements including restrictions, selections, and custom content.
 * 
 * Architecture:
 * The LayerRenderer acts as a composition system that:
 * 1. Manages multiple visual layers (base calendar, restrictions, custom content)
 * 2. Handles layer priority and visibility
 * 3. Combines different visual indicators into a single rendered output
 * 
 * Visual Components:
 * 1. Base Calendar Layer
 *    - Basic calendar grid and date display
 *    - Month and year navigation
 * 
 * 2. Restriction Layer
 *    - Visualizes date restrictions from RestrictionBackgroundGenerator
 *    - Shows disabled dates and restricted ranges
 *    - Applies visual styles from restriction handlers
 * 
 * 3. Selection Layer
 *    - Shows currently selected date range
 *    - Handles hover states and selection preview
 *    - Manages selection indicators
 * 
 * 4. Custom Content Layer
 *    - Renders user-provided content for specific dates
 *    - Supports tooltips and custom styling
 *    - Allows for dynamic content injection
 * 
 * Integration Points:
 * - Works with RestrictionManager for date validation
 * - Uses RestrictionBackgroundGenerator for visual styles
 * - Coordinates with DateRangePickerHandlers for user interactions
 * - Manages LayerControl for layer switching
 * 
 * Usage:
 * The LayerRenderer is used within the calendar grid to compose the final
 * visual representation of each date cell, combining restrictions, selections,
 * and custom content into a unified display.
 * 
 * Example of custom layer:
 * interface HolidayLayer extends Layer {
 *   type: 'holiday';
 *   dates: {
 *     [key: string]: {
 *       name: string;
 *       style: React.CSSProperties;
 *     }
 *   };
 * }
 * 
 * Then add rendering logic in renderContent() to handle the holiday layer type.
 */

import React from 'react';
import {
  BackgroundRange,
  Event,
  RenderResult,
  Layer
} from './types';
import { parseISO, isSameDay, isWithinInterval } from '../../../utils/DateUtils';

/**
 * LayerRenderer class provides static methods for rendering different types of layers
 * in the date picker calendar. Each renderer method creates a function that determines
 * how to display specific date cells based on the provided data.
 */
export class LayerRenderer {
  /**
   * Creates a renderer function for background layers that applies background colors
   * to date ranges.
   * 
   * @param backgroundData - Array of objects containing start date, end date,
   *                        and color information for background ranges
   * @returns Renderer function that takes a date and returns style object
   *          or null if no background should be applied
   */
  static createBackgroundRenderer(backgroundData: BackgroundRange[]): (date: Date) => RenderResult | null {
    return (date: Date) => {
      if (!Array.isArray(backgroundData)) return null;

      for (const range of backgroundData) {
        const start = parseISO(range.startDate);
        const end = parseISO(range.endDate);

        // Check if the date falls within the range
        // Note: isWithinInterval includes start and end dates
        if (isWithinInterval(date, { start, end })) {
          return {
            backgroundColor: range.color
          };
        }
      }
      return null;
    };
  }

  /**
   * Creates a render function for a layer that displays events with their colors
   * @param layer - Layer configuration with color and events
   * @returns Function that determines how to render a specific date
   */
  static createEventRenderer(eventsData: Event[]): (date: Date) => RenderResult | null {
    return (date: Date) => {
      if (!Array.isArray(eventsData)) return null;

      // Find all events for the given date
      const dayEvents = eventsData.filter(event =>
        isSameDay(date, parseISO(event.date))
      );

      if (dayEvents.length === 0) return null;

      const mainEvent = dayEvents[0];
      const eventColor = mainEvent.color || '#0366d6'; // Default to blue if no color specified

      return {
        element: (
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: `${eventColor}33`, // 20% opacity version of the color
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              position: 'relative',
              zIndex: 5 // Higher z-index to appear above restriction patterns
            }}
          >
            {dayEvents.length > 1 && (
              <span style={{
                fontSize: '12px',
                fontWeight: 'bold',
                color: eventColor,
                lineHeight: 1,
                pointerEvents: 'none'
              }}>
                {dayEvents.length}
              </span>
            )}
          </div>
        ),
        tooltipContent: (
          <div style={{
            padding: '8px',
            backgroundColor: '#1a1a1a',
            color: '#ffffff',
            borderRadius: '4px',
            position: 'relative'
          }}>
            {dayEvents.map((event, index) => (
              <div key={index} style={{
                marginBottom: index < dayEvents.length - 1 ? '8px' : 0,
                whiteSpace: 'nowrap'
              }}>
                <div style={{
                  fontWeight: 'bold',
                  color: event.color ? `${event.color}dd` : '#4dabf7'
                }}>
                  {event.title}
                </div>
                <div style={{ fontSize: '0.9em', color: '#adb5bd' }}>{event.time}</div>
                <div style={{ fontSize: '0.9em', color: '#e9ecef' }}>{event.description}</div>
              </div>
            ))}
          </div>
        )
      };
    };
  }

  /**
   * Creates a render function for custom content
   * @param layer - Layer configuration with custom render function
   * @returns The layer's custom render function or null
   */
  static createCustomRenderer(layer: Layer) {
    return layer.renderContent || null;
  }

  /**
   * Determines the appropriate renderer for a layer
   * @param layer - Layer configuration
   * @returns Function that determines how to render a specific date
   */
  static getRenderer(layer: Layer) {
    if (layer.renderContent) {
      return LayerRenderer.createCustomRenderer(layer);
    }
    return LayerRenderer.createEventRenderer(layer.events);
  }
} 