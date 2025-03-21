import { Layer } from '../../DateRangePicker.config';

/**
 * Factory function to create calendar layers
 * This allows lazy loading of layer data
 * 
 * @returns A function that creates layers when called
 */
export const createLayersFactory = () => {
  return () => {
    // Default empty implementation
    const layers: Layer[] = [
      {
        name: "Calendar",
        title: "Base Calendar",
        description: "Basic calendar functionality",
        required: true,
        visible: true,
        data: {
          events: [],
          background: []
        }
      }
    ];

    return layers;
  };
}; 