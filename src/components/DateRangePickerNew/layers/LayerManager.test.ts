import { describe, it, expect, beforeEach } from 'vitest';
import { LayerManager } from './LayerManager';
import type { Layer, LayerData, EventData, BackgroundData } from '../../DateRangePicker.config';

describe('LayerManager', () => {
  let manager: LayerManager;

  const sampleLayers: Layer[] = [
    {
      name: 'holidays',
      title: 'Public Holidays',
      description: 'National holidays and observances',
      enabled: true,
      visible: true,
      required: true,
      color: '#dc3545',
      data: {
        events: [
          {
            date: '2025-12-25',
            title: 'Christmas',
            type: 'holiday',
            time: 'All day',
            description: 'Christmas Day',
            color: '#dc3545'
          },
          {
            date: '2025-01-01',
            title: 'New Year',
            type: 'holiday',
            time: 'All day',
            description: 'New Year\'s Day'
          }
        ],
        background: [
          {
            startDate: '2025-12-24',
            endDate: '2025-12-26',
            color: '#ffe6e6'
          }
        ]
      }
    },
    {
      name: 'meetings',
      title: 'Team Meetings',
      description: 'Weekly team meetings and standups',
      enabled: true,
      visible: false,
      required: false,
      color: '#0366d6',
      data: {
        events: [
          {
            date: '2025-06-16',
            title: 'Sprint Planning',
            type: 'meeting',
            time: '9:00 AM',
            description: 'Plan next sprint'
          }
        ]
      }
    },
    {
      name: 'deadlines',
      title: 'Project Deadlines',
      description: 'Important project milestones',
      enabled: false,
      visible: true,
      required: false
    }
  ];

  beforeEach(() => {
    manager = new LayerManager([]);
  });

  describe('Initialization', () => {
    it('should initialize with empty layers', () => {
      expect(manager.getLayers()).toHaveLength(0);
    });

    it('should initialize with provided layers', () => {
      manager = new LayerManager(sampleLayers);
      expect(manager.getLayers()).toHaveLength(3);
      expect(manager.getLayers()).toEqual(sampleLayers);
    });
  });

  describe('Layer Management', () => {
    it('should add a new layer', () => {
      const newLayer: Layer = {
        name: 'reminders',
        title: 'Reminders',
        description: 'Personal reminders',
        enabled: true,
        visible: true
      };

      manager.addLayer(newLayer);
      expect(manager.getLayers()).toHaveLength(1);
      expect(manager.getLayer('reminders')).toEqual(newLayer);
    });

    it('should add layer even with duplicate names', () => {
      manager = new LayerManager(sampleLayers);
      
      const duplicateLayer: Layer = {
        name: 'holidays',
        title: 'Duplicate Holidays',
        description: 'This should be added',
        enabled: true,
        visible: true
      };

      manager.addLayer(duplicateLayer);
      expect(manager.getLayers()).toHaveLength(4);
    });

    it('should remove a layer', () => {
      manager = new LayerManager(sampleLayers);
      
      const result = manager.removeLayer('meetings');
      expect(result).toBe(true);
      expect(manager.getLayers()).toHaveLength(2);
      expect(manager.getLayer('meetings')).toBeUndefined();
    });

    it('should not remove required layers', () => {
      manager = new LayerManager(sampleLayers);
      
      const result = manager.removeLayer('holidays');
      expect(result).toBe(false);
      expect(manager.getLayers()).toHaveLength(3);
      expect(manager.getLayer('holidays')).toBeDefined();
    });

    it('should handle removal of non-existent layer', () => {
      manager = new LayerManager(sampleLayers);
      
      const result = manager.removeLayer('nonexistent');
      expect(result).toBe(false);
      expect(manager.getLayers()).toHaveLength(3);
    });

    it('should update layer properties', () => {
      manager = new LayerManager(sampleLayers);
      
      const updates = {
        title: 'Updated Meetings',
        description: 'Updated description',
        visible: true
      };

      const result = manager.updateLayer('meetings', updates);
      expect(result).toBe(true);
      
      const updatedLayer = manager.getLayer('meetings');
      expect(updatedLayer?.title).toBe('Updated Meetings');
      expect(updatedLayer?.description).toBe('Updated description');
      expect(updatedLayer?.visible).toBe(true);
      expect(updatedLayer?.name).toBe('meetings'); // Should preserve name
    });

    it('should handle updating non-existent layer', () => {
      const result = manager.updateLayer('nonexistent', { title: 'New Title' });
      expect(result).toBe(false);
    });

    it('should get layer by name', () => {
      manager = new LayerManager(sampleLayers);
      
      const layer = manager.getLayer('holidays');
      expect(layer).toBeDefined();
      expect(layer?.name).toBe('holidays');
      expect(layer?.title).toBe('Public Holidays');
    });

    it('should return undefined for non-existent layer', () => {
      const layer = manager.getLayer('nonexistent');
      expect(layer).toBeUndefined();
    });
  });

  describe('Layer Data Management', () => {
    beforeEach(() => {
      manager = new LayerManager(sampleLayers);
    });

    it('should update layer data', () => {
      const newData: LayerData = {
        events: [
          {
            date: '2025-07-04',
            title: 'Independence Day',
            type: 'holiday',
            time: 'All day',
            description: 'Independence Day'
          }
        ]
      };

      const result = manager.updateLayerData('holidays', newData);
      expect(result).toBe(true);
      
      const layer = manager.getLayer('holidays');
      expect(layer?.data?.events).toEqual(newData.events);
    });

    it('should handle updating data for non-existent layer', () => {
      const newData: LayerData = { events: [] };
      const result = manager.updateLayerData('nonexistent', newData);
      expect(result).toBe(false);
    });

    it('should add background data to existing layer', () => {
      const newBackgroundData: BackgroundData[] = [
        {
          startDate: '2025-06-01',
          endDate: '2025-06-05',
          color: '#e6f3ff'
        }
      ];

      const result = manager.addBackgroundData('holidays', newBackgroundData);
      expect(result).toBe(true);
      
      const layer = manager.getLayer('holidays');
      expect(layer?.data?.background).toHaveLength(2); // Original + new
    });

    it('should set background data replacing existing', () => {
      const newBackgroundData: BackgroundData[] = [
        {
          startDate: '2025-06-01',
          endDate: '2025-06-05',
          color: '#e6f3ff'
        }
      ];

      const result = manager.setBackgroundData('holidays', newBackgroundData);
      expect(result).toBe(true);
      
      const layer = manager.getLayer('holidays');
      expect(layer?.data?.background).toHaveLength(1);
      expect(layer?.data?.background?.[0]).toEqual(newBackgroundData[0]);
    });

    it('should add event data to existing layer', () => {
      const newEventData: EventData[] = [
        {
          date: '2025-07-04',
          title: 'Independence Day',
          type: 'holiday',
          time: 'All day',
          description: 'Independence Day'
        }
      ];

      const result = manager.addEventData('holidays', newEventData);
      expect(result).toBe(true);
      
      const layer = manager.getLayer('holidays');
      expect(layer?.data?.events).toHaveLength(3); // Original 2 + new 1
    });

    it('should handle adding data to layer without existing data', () => {
      const eventData: EventData[] = [
        {
          date: '2025-06-20',
          title: 'New Event',
          type: 'meeting',
          time: '2:00 PM',
          description: 'New meeting'
        }
      ];

      const result = manager.addEventData('deadlines', eventData);
      expect(result).toBe(true);
      
      const layer = manager.getLayer('deadlines');
      expect(layer?.data?.events).toHaveLength(1);
    });

    it('should handle adding data to non-existent layer', () => {
      const eventData: EventData[] = [
        {
          date: '2025-06-20',
          title: 'Event',
          type: 'meeting',
          time: '2:00 PM',
          description: 'Meeting'
        }
      ];

      const result = manager.addEventData('nonexistent', eventData);
      expect(result).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle layers without data', () => {
      const layerWithoutData: Layer = {
        name: 'empty',
        title: 'Empty Layer',
        description: 'No data',
        enabled: true,
        visible: true
      };

      manager.addLayer(layerWithoutData);
      expect(manager.getLayer('empty')).toBeDefined();
      expect(manager.getLayer('empty')?.data).toBeUndefined();
    });

    it('should handle layers with empty data arrays', () => {
      const layerWithEmptyData: Layer = {
        name: 'empty-data',
        title: 'Empty Data Layer',
        description: 'Empty data arrays',
        enabled: true,
        visible: true,
        data: {
          events: [],
          background: []
        }
      };

      manager.addLayer(layerWithEmptyData);
      
      const layer = manager.getLayer('empty-data');
      expect(layer?.data?.events).toHaveLength(0);
      expect(layer?.data?.background).toHaveLength(0);
    });

    it('should handle partial data updates', () => {
      manager = new LayerManager(sampleLayers);
      
      const partialData: Partial<LayerData> = {
        events: [
          {
            date: '2025-07-04',
            title: 'Independence Day',
            type: 'holiday',
            time: 'All day',
            description: 'Independence Day'
          }
        ]
      };

      const result = manager.updateLayerData('holidays', partialData);
      expect(result).toBe(true);
      
      const layer = manager.getLayer('holidays');
      expect(layer?.data?.events).toEqual(partialData.events);
      expect(layer?.data?.background).toEqual(sampleLayers[0].data?.background); // Should preserve existing background
    });
  });

  describe('Performance', () => {
    it('should handle large numbers of layers efficiently', () => {
      const largeLayers: Layer[] = [];
      
      // Create 100 layers
      for (let i = 0; i < 100; i++) {
        largeLayers.push({
          name: `layer-${i}`,
          title: `Layer ${i}`,
          description: `Description for layer ${i}`,
          enabled: i % 2 === 0,
          visible: i % 3 === 0,
          data: {
            events: [
              {
                date: '2025-06-15',
                title: `Event ${i}`,
                type: 'test',
                time: '10:00 AM',
                description: `Test event ${i}`
              }
            ]
          }
        });
      }

      const startTime = performance.now();
      
      manager = new LayerManager(largeLayers);
      const layers = manager.getLayers();
      const specificLayer = manager.getLayer('layer-50');
      
      const endTime = performance.now();
      
      // Should complete within reasonable time (less than 10ms)
      expect(endTime - startTime).toBeLessThan(10);
      expect(layers).toHaveLength(100);
      expect(specificLayer).toBeDefined();
    });
  });
});