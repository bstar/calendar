import { LAYER_TYPES, LAYER_CAPABILITIES } from './types';
import { parseISO, isWithinInterval, isSameDay } from 'date-fns';

export class LayerRenderer {
  static getRenderer(layer) {
    const capabilities = LAYER_CAPABILITIES[layer.type];
    
    return {
      renderDay: (date, props) => {
        if (capabilities.applyBackground) {
          return this.renderBackgroundDay(date, layer.data, props);
        }
        
        switch (layer.type) {
          case LAYER_TYPES.EVENTS:
            return this.renderEventDay(date, layer.data, props);
          case LAYER_TYPES.BASE:
            return this.renderBaseDay(date, layer.data, props);
          default:
            return null;
        }
      },
      
      getBackgroundColor: capabilities.applyBackground ? 
        (date) => this.getBackgroundColor(date, layer.data) : 
        null
    };
  }

  static getBackgroundColor(date, data) {
    if (!data) return 'transparent';
    
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
      backgroundColor: this.getBackgroundColor(date, data)
    };
  }

  // Other render methods as needed...
} 