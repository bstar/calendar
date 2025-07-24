import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { LayerRenderer } from './LayerRenderer';
import { parseISO } from '../../../utils/DateUtils';

describe('LayerRenderer', () => {
  describe('createBackgroundRenderer', () => {
    it('should return null for invalid backgroundData', () => {
      const renderer = LayerRenderer.createBackgroundRenderer(null as any);
      const date = parseISO('2025-06-15');
      expect(renderer(date)).toBeNull();
    });

    it('should return null when date is outside all ranges', () => {
      const backgroundData = [
        { startDate: '2025-01-01', endDate: '2025-01-31', color: '#ff0000' },
        { startDate: '2025-03-01', endDate: '2025-03-31', color: '#00ff00' }
      ];
      const renderer = LayerRenderer.createBackgroundRenderer(backgroundData);
      const date = parseISO('2025-02-15');
      expect(renderer(date)).toBeNull();
    });

    it('should return background color when date is within range', () => {
      const backgroundData = [
        { startDate: '2025-01-01', endDate: '2025-01-31', color: '#ff0000' }
      ];
      const renderer = LayerRenderer.createBackgroundRenderer(backgroundData);
      const date = parseISO('2025-01-15');
      expect(renderer(date)).toEqual({ backgroundColor: '#ff0000' });
    });

    it('should return color for first matching range when multiple ranges overlap', () => {
      const backgroundData = [
        { startDate: '2025-01-01', endDate: '2025-01-31', color: '#ff0000' },
        { startDate: '2025-01-15', endDate: '2025-02-15', color: '#00ff00' }
      ];
      const renderer = LayerRenderer.createBackgroundRenderer(backgroundData);
      const date = parseISO('2025-01-20');
      expect(renderer(date)).toEqual({ backgroundColor: '#ff0000' });
    });

    it('should handle start and end dates inclusively', () => {
      const backgroundData = [
        { startDate: '2025-01-01', endDate: '2025-01-31', color: '#ff0000' }
      ];
      const renderer = LayerRenderer.createBackgroundRenderer(backgroundData);
      
      const startDate = parseISO('2025-01-01');
      expect(renderer(startDate)).toEqual({ backgroundColor: '#ff0000' });
      
      const endDate = parseISO('2025-01-31');
      expect(renderer(endDate)).toEqual({ backgroundColor: '#ff0000' });
    });
  });

  describe('createEventRenderer', () => {
    it('should return null for invalid events data', () => {
      const renderer = LayerRenderer.createEventRenderer(null as any);
      const date = parseISO('2025-06-15');
      expect(renderer(date)).toBeNull();
    });

    it('should return null when no events match the date', () => {
      const eventsData = [
        { date: '2025-01-01', title: 'Event 1', time: '10:00', description: 'Description 1' },
        { date: '2025-01-02', title: 'Event 2', time: '14:00', description: 'Description 2' }
      ];
      const renderer = LayerRenderer.createEventRenderer(eventsData);
      const date = parseISO('2025-01-03');
      expect(renderer(date)).toBeNull();
    });

    it('should render single event with default color', () => {
      const eventsData = [
        { date: '2025-01-01', title: 'Event 1', time: '10:00', description: 'Description 1' }
      ];
      const renderer = LayerRenderer.createEventRenderer(eventsData);
      const date = parseISO('2025-01-01');
      const result = renderer(date);
      
      expect(result).not.toBeNull();
      expect(result?.element).toBeDefined();
      expect(result?.tooltipContent).toBeDefined();
    });

    it('should render single event with custom color', () => {
      const eventsData = [
        { date: '2025-01-01', title: 'Event 1', time: '10:00', description: 'Description 1', color: '#ff0000' }
      ];
      const renderer = LayerRenderer.createEventRenderer(eventsData);
      const date = parseISO('2025-01-01');
      const result = renderer(date);
      
      expect(result).not.toBeNull();
      expect(result?.element).toBeDefined();
      expect(result?.tooltipContent).toBeDefined();
    });

    it('should render multiple events with count indicator', () => {
      const eventsData = [
        { date: '2025-01-01', title: 'Event 1', time: '10:00', description: 'Description 1', color: '#ff0000' },
        { date: '2025-01-01', title: 'Event 2', time: '14:00', description: 'Description 2', color: '#00ff00' },
        { date: '2025-01-01', title: 'Event 3', time: '16:00', description: 'Description 3' }
      ];
      const renderer = LayerRenderer.createEventRenderer(eventsData);
      const date = parseISO('2025-01-01');
      const result = renderer(date);
      
      expect(result).not.toBeNull();
      expect(result?.element).toBeDefined();
      expect(result?.tooltipContent).toBeDefined();
      
      // Check that the element contains the event count
      const element = result?.element as React.ReactElement;
      const countElement = element.props.children;
      expect(countElement).toBeDefined();
      expect(countElement.props.children).toBe(3);
      expect(countElement.props.className).toBe('layer-event-count');
    });

    it('should include all events in tooltip content', () => {
      const eventsData = [
        { date: '2025-01-01', title: 'Event 1', time: '10:00', description: 'Description 1' },
        { date: '2025-01-01', title: 'Event 2', time: '14:00', description: 'Description 2' }
      ];
      const renderer = LayerRenderer.createEventRenderer(eventsData);
      const date = parseISO('2025-01-01');
      const result = renderer(date);
      
      const tooltip = result?.tooltipContent as React.ReactElement;
      expect(tooltip.props.children).toHaveLength(2);
    });
  });

  describe('createCustomRenderer', () => {
    it('should return null when layer has no renderContent', () => {
      const layer = {
        name: 'test',
        title: 'Test Layer',
        description: 'Test',
        events: []
      };
      const renderer = LayerRenderer.createCustomRenderer(layer);
      expect(renderer).toBeNull();
    });

    it('should return the custom render function when provided', () => {
      const customRender = vi.fn();
      const layer = {
        name: 'test',
        title: 'Test Layer',
        description: 'Test',
        events: [],
        renderContent: customRender
      };
      const renderer = LayerRenderer.createCustomRenderer(layer);
      expect(renderer).toBe(customRender);
    });
  });

  describe('getRenderer', () => {
    it('should return custom renderer when renderContent is provided', () => {
      const customRender = vi.fn();
      const layer = {
        name: 'test',
        title: 'Test Layer',
        description: 'Test',
        events: [],
        renderContent: customRender
      };
      const renderer = LayerRenderer.getRenderer(layer);
      expect(renderer).toBe(customRender);
    });

    it('should return event renderer when renderContent is not provided', () => {
      const layer = {
        name: 'test',
        title: 'Test Layer',
        description: 'Test',
        events: [
          { date: '2025-01-01', title: 'Event', time: '10:00', description: 'Description' }
        ]
      };
      const renderer = LayerRenderer.getRenderer(layer);
      expect(renderer).toBeDefined();
      expect(typeof renderer).toBe('function');
      
      // Test that it behaves like an event renderer
      const date = parseISO('2025-01-01');
      const result = renderer?.(date);
      expect(result).not.toBeNull();
      expect(result?.element).toBeDefined();
    });

    it('should handle layer with empty events array', () => {
      const layer = {
        name: 'test',
        title: 'Test Layer', 
        description: 'Test',
        events: []
      };
      const renderer = LayerRenderer.getRenderer(layer);
      expect(renderer).toBeDefined();
      
      const date = parseISO('2025-01-01');
      const result = renderer?.(date);
      expect(result).toBeNull();
    });
  });
});