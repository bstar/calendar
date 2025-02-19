import { LAYER_TYPES, LAYER_CAPABILITIES } from './types';
import { parseISO, isWithinInterval, isSameDay } from 'date-fns';

export class LayerRenderer {
  static createBackgroundRenderer(backgroundData) {
    return (date) => {
      if (!Array.isArray(backgroundData)) return null;
      
      for (const range of backgroundData) {
        const start = parseISO(range.startDate);
        const end = parseISO(range.endDate);
        
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

  static createEventRenderer(eventsData) {
    return (date) => {
      if (!Array.isArray(eventsData)) return null;
      
      const dayEvents = eventsData.filter(event => 
        isSameDay(date, parseISO(event.date))
      );
      
      if (dayEvents.length === 0) return null;

      const mainEvent = dayEvents[0];
      
      return {
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

  static getRenderer(layer) {
    const capabilities = LAYER_CAPABILITIES[layer.type];
    
    return {
      renderDay: (date, props) => {
        if (capabilities.applyBackground) {
          return this.renderBackgroundDay(date, layer.data, props);
        }
        
        switch (layer.type) {
          case LAYER_TYPES.EVENTS:
            return this.renderEventDay(date, layer.data?.events || [], props);
          case LAYER_TYPES.BASE:
            return this.renderBaseDay(date, layer.data, props);
          default:
            return null;
        }
      },
      
      getBackgroundColor: capabilities.applyBackground ? 
        (date) => this.getBackgroundColor(date, layer.data?.background || []) : 
        null
    };
  }

  static getBackgroundColor(date, data) {
    if (!Array.isArray(data)) return 'transparent';
    
    for (const range of data) {
      const start = parseISO(range.startDate);
      const end = parseISO(range.endDate);
      
      if (isWithinInterval(date, { start, end }) || 
          isSameDay(date, start) || 
          isSameDay(date, end)) {
        return range.color;
      }
    }
    return 'transparent';
  }

  static renderBackgroundDay(date, data, props) {
    return {
      backgroundColor: this.getBackgroundColor(date, data?.background || [])
    };
  }

  static renderEventDay(date, data, props) {
    if (!Array.isArray(data)) return null;
    
    const events = data.filter(event => 
      isSameDay(date, parseISO(event.date))
    );
    
    return events.length > 0 ? {
      content: events.map(event => event.title).join(', '),
      events
    } : null;
  }

  // Other render methods as needed...
} 