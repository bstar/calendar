import React from 'react';
import { LAYER_TYPES, LAYER_CAPABILITIES } from './types';
import { parseISO, isWithinInterval, isSameDay } from 'date-fns';

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
   * @param {Array} backgroundData - Array of objects containing start date, end date,
   *                                and color information for background ranges
   * @returns {Function} Renderer function that takes a date and returns style object
   *                     or null if no background should be applied
   */
  static createBackgroundRenderer(backgroundData) {
    return (date) => {
      if (!Array.isArray(backgroundData)) return null;

      for (const range of backgroundData) {
        const start = parseISO(range.startDate);
        const end = parseISO(range.endDate);

        // Check if the date falls within the range or matches range boundaries
        if (isWithinInterval(date, { start, end }) ||
          isSameDay(date, start) ||
          isSameDay(date, end)) {
          return {
            backgroundColor: range.color
          };
        }
      }
      return null;
    };
  }

  /**
   * Creates a renderer function for event layers that displays event indicators
   * and tooltips for dates with events.
   * 
   * @param {Array} eventsData - Array of event objects containing date, type, title,
   *                            time, and description information
   * @returns {Function} Renderer function that takes a date and returns an object
   *                     containing the event indicator element and tooltip content
   */
  static createEventRenderer(eventsData) {
    return (date) => {
      if (!Array.isArray(eventsData)) return null;

      // Find all events for the given date
      const dayEvents = eventsData.filter(event =>
        isSameDay(date, parseISO(event.date))
      );

      if (dayEvents.length === 0) return null;

      const mainEvent = dayEvents[0];

      return {
        // Render circular indicator with event count if multiple events exist
        element: (
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: mainEvent.type === 'work'
                ? 'rgba(3, 102, 214, 0.2)'
                : 'rgba(40, 167, 69, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none'
            }}
          >
            {/* Show event count if there are multiple events */}
            {dayEvents.length > 1 && (
              <span style={{
                fontSize: '12px',
                fontWeight: 'bold',
                color: mainEvent.type === 'work' ? '#0366d6' : '#28a745',
                lineHeight: 1,
                pointerEvents: 'none'
              }}>
                {dayEvents.length}
              </span>
            )}
          </div>
        ),
        // Render tooltip showing details for all events on this date
        tooltipContent: (
          <div style={{
            padding: '8px',
            backgroundColor: 'white',
            borderRadius: '4px'
          }}>
            {dayEvents.map((event, index) => (
              <div key={index} style={{
                marginBottom: index < dayEvents.length - 1 ? '8px' : 0,
                whiteSpace: 'nowrap'
              }}>
                <div style={{
                  fontWeight: 'bold',
                  color: event.type === 'work' ? '#0366d6' : '#28a745'
                }}>
                  {event.title}
                </div>
                <div style={{ fontSize: '0.9em', color: '#666' }}>{event.time}</div>
                <div style={{ fontSize: '0.9em' }}>{event.description}</div>
              </div>
            ))}
          </div>
        )
      };
    };
  }
} 