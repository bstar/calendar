import { Layer, LayerData, BackgroundData, EventData } from '../../DateRangePicker.config';

export class LayerManager {
  private layers: Layer[];
  
  constructor(initialLayers: Layer[]) {
    this.layers = [...initialLayers];
  }
  
  /**
   * Get all layers
   */
  getLayers(): Layer[] {
    return [...this.layers];
  }
  
  /**
   * Get a specific layer by name
   */
  getLayer(name: string): Layer | undefined {
    return this.layers.find(layer => layer.name === name);
  }
  
  /**
   * Add a new layer
   */
  addLayer(layer: Layer): void {
    this.layers.push(layer);
  }
  
  /**
   * Remove a layer by name
   */
  removeLayer(name: string): boolean {
    const layer = this.getLayer(name);
    if (!layer || layer.required) {
      return false;
    }
    
    this.layers = this.layers.filter(l => l.name !== name);
    return true;
  }
  
  /**
   * Update a layer
   */
  updateLayer(name: string, updates: Partial<Layer>): boolean {
    const index = this.layers.findIndex(l => l.name === name);
    if (index === -1) return false;
    
    this.layers[index] = { ...this.layers[index], ...updates };
    return true;
  }
  
  /**
   * Update layer data
   */
  updateLayerData(name: string, data: Partial<LayerData>): boolean {
    const layer = this.getLayer(name);
    if (!layer) return false;
    
    return this.updateLayer(name, {
      data: {
        ...layer.data,
        ...data
      }
    });
  }
  
  /**
   * Add background data to a layer
   */
  addBackgroundData(name: string, backgroundData: BackgroundData[]): boolean {
    const layer = this.getLayer(name);
    if (!layer) return false;
    
    const currentBackground = layer.data?.background || [];
    
    return this.updateLayerData(name, {
      background: [...currentBackground, ...backgroundData]
    });
  }
  
  /**
   * Set background data for a layer (replacing existing data)
   */
  setBackgroundData(name: string, backgroundData: BackgroundData[]): boolean {
    return this.updateLayerData(name, {
      background: backgroundData
    });
  }
  
  /**
   * Add event data to a layer
   */
  addEventData(name: string, eventData: EventData[]): boolean {
    const layer = this.getLayer(name);
    if (!layer) return false;
    
    const currentEvents = layer.data?.events || [];
    
    return this.updateLayerData(name, {
      events: [...currentEvents, ...eventData]
    });
  }
} 