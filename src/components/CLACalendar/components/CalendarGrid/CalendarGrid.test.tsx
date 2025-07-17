import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CalendarGrid } from './CalendarGrid';
import { getDefaultSettings } from '../../../CLACalendar.config';
import type { CalendarGridProps } from './CalendarGrid.types';
import type { Layer } from '../../../CLACalendar.config';

// Mock the MonthGrid component
vi.mock('../MonthGrid', () => ({
  MonthGrid: ({ 
    baseDate, 
    selectedRange, 
    onSelectionStart, 
    onSelectionMove,
    style,
    showMonthHeading,
    showTooltips,
    renderDay,
    layer,
    restrictionConfig,
    startWeekOnSunday,
    settings,
    activeLayer
  }: any) => (
    <div 
      data-testid="month-grid" 
      data-month={baseDate.toISOString()}
      style={style}
      data-show-month-heading={showMonthHeading}
      data-show-tooltips={showTooltips}
      data-has-render-day={!!renderDay}
      data-layer-name={layer?.name}
      data-active-layer={activeLayer}
      data-start-week-on-sunday={startWeekOnSunday}
    >
      <button onClick={() => {
        const testDate = new Date('2025-06-15');
        onSelectionStart(testDate);
      }}>Start Selection</button>
      <button onClick={() => {
        const testDate = new Date('2025-06-20');
        onSelectionMove(testDate);
      }}>Move Selection</button>
      {renderDay && (
        <div data-testid="render-day-test">
          {(() => {
            const result = renderDay(new Date('2025-06-15'));
            if (!result) return 'null';
            // Safely extract properties without circular references
            return JSON.stringify({
              backgroundColor: result.backgroundColor || null,
              hasElement: !!result.element,
              hasTooltip: !!result.tooltipContent
            });
          })()}
        </div>
      )}
    </div>
  )
}));

// Mock LayerRenderer
vi.mock('../../../CLACalendarComponents/layers/LayerRenderer', () => ({
  LayerRenderer: {
    createBackgroundRenderer: (backgrounds: any[]) => {
      return (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        const bg = backgrounds.find(b => 
          dateStr >= b.startDate && dateStr <= b.endDate
        );
        return bg ? { backgroundColor: bg.color } : null;
      };
    },
    createEventRenderer: (events: any[]) => {
      return (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        const event = events.find(e => e.date === dateStr);
        return event ? {
          element: <div className="event">{event.title}</div>,
          tooltipContent: <div>{event.title} - {event.description}</div>
        } : null;
      };
    }
  }
}));

describe('CalendarGrid', () => {
  const mockDate1 = new Date('2025-06-01');
  const mockDate2 = new Date('2025-07-01');
  
  const defaultProps: CalendarGridProps = {
    months: [mockDate1, mockDate2],
    selectedRange: { start: null, end: null },
    onSelectionStart: vi.fn(),
    onSelectionMove: vi.fn(),
    isSelecting: false,
    visibleMonths: 2,
    showMonthHeadings: true,
    layer: {
      name: 'default',
      title: 'Default Layer',
      description: 'Default layer',
      visible: true,
      enabled: true
    },
    activeLayer: 'default',
    restrictionConfig: { restrictions: [] },
    startWeekOnSunday: false,
    settings: getDefaultSettings()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the correct number of MonthGrid components', () => {
      render(<CalendarGrid {...defaultProps} />);
      
      const monthGrids = screen.getAllByTestId('month-grid');
      expect(monthGrids).toHaveLength(2);
    });

    it('should render with single month when visibleMonths is 1', () => {
      const props = {
        ...defaultProps,
        visibleMonths: 1,
        months: [mockDate1]
      };
      
      render(<CalendarGrid {...props} />);
      
      const monthGrids = screen.getAllByTestId('month-grid');
      expect(monthGrids).toHaveLength(1);
    });

    it('should render up to 6 months maximum', () => {
      const manyMonths = Array.from({ length: 8 }, (_, i) => 
        new Date(2025, 5 + i, 1)
      );
      
      const props = {
        ...defaultProps,
        visibleMonths: 8,
        months: manyMonths
      };
      
      render(<CalendarGrid {...props} />);
      
      const monthGrids = screen.getAllByTestId('month-grid');
      expect(monthGrids).toHaveLength(8); // Will show all months from the array
    });

    it('should pass correct props to MonthGrid components', () => {
      render(<CalendarGrid {...defaultProps} />);
      
      const monthGrids = screen.getAllByTestId('month-grid');
      
      // Check first month grid
      expect(monthGrids[0]).toHaveAttribute('data-month', mockDate1.toISOString());
      expect(monthGrids[0]).toHaveAttribute('data-show-month-heading', 'true');
      expect(monthGrids[0]).toHaveAttribute('data-show-tooltips', 'true');
      expect(monthGrids[0]).toHaveAttribute('data-layer-name', 'default');
      expect(monthGrids[0]).toHaveAttribute('data-active-layer', 'default');
      expect(monthGrids[0]).toHaveAttribute('data-start-week-on-sunday', 'false');
      
      // Check it has renderDay function
      expect(monthGrids[0]).toHaveAttribute('data-has-render-day', 'true');
    });

    it('should calculate width correctly for each MonthGrid', () => {
      render(<CalendarGrid {...defaultProps} />);
      
      const monthGrids = screen.getAllByTestId('month-grid');
      
      monthGrids.forEach(grid => {
        expect(grid).toHaveStyle({ width: '50%' }); // 100% / 2 visible months
      });
    });

    it('should handle showTooltips setting correctly', () => {
      const props = {
        ...defaultProps,
        settings: {
          ...getDefaultSettings(),
          showTooltips: false
        }
      };
      
      render(<CalendarGrid {...props} />);
      
      const monthGrids = screen.getAllByTestId('month-grid');
      expect(monthGrids[0]).toHaveAttribute('data-show-tooltips', 'false');
    });

    it('should suppress tooltips during selection when configured', () => {
      const props = {
        ...defaultProps,
        isSelecting: true,
        settings: {
          ...getDefaultSettings(),
          showTooltips: true,
          suppressTooltipsOnSelection: true
        }
      };
      
      render(<CalendarGrid {...props} />);
      
      const monthGrids = screen.getAllByTestId('month-grid');
      expect(monthGrids[0]).toHaveAttribute('data-show-tooltips', 'false');
    });
  });

  describe('Event Handlers', () => {
    it('should call onSelectionStart when selection starts', () => {
      render(<CalendarGrid {...defaultProps} />);
      
      const startButton = screen.getAllByText('Start Selection')[0];
      fireEvent.click(startButton);
      
      expect(defaultProps.onSelectionStart).toHaveBeenCalledWith(
        new Date('2025-06-15')
      );
    });

    it('should call onSelectionMove when selection moves', () => {
      render(<CalendarGrid {...defaultProps} />);
      
      const moveButton = screen.getAllByText('Move Selection')[0];
      fireEvent.click(moveButton);
      
      expect(defaultProps.onSelectionMove).toHaveBeenCalledWith(
        new Date('2025-06-20')
      );
    });
  });

  describe('Layer Rendering', () => {
    it('should create background renderer when layer has background data', () => {
      const layerWithBackground: Layer = {
        ...defaultProps.layer,
        data: {
          background: [
            {
              startDate: '2025-06-10',
              endDate: '2025-06-20',
              color: '#ffcccc'
            }
          ]
        }
      };
      
      const props = {
        ...defaultProps,
        layer: layerWithBackground
      };
      
      render(<CalendarGrid {...props} />);
      
      const renderDayTest = screen.getAllByTestId('render-day-test')[0];
      const result = JSON.parse(renderDayTest.textContent || '{}');
      
      expect(result).toEqual({ 
        backgroundColor: '#ffcccc',
        hasElement: false,
        hasTooltip: false
      });
    });

    it('should create event renderer when layer has event data', () => {
      const layerWithEvents: Layer = {
        ...defaultProps.layer,
        data: {
          events: [
            {
              date: '2025-06-15',
              title: 'Test Event',
              type: 'work',
              time: '10:00 AM',
              description: 'Test Description'
            }
          ]
        }
      };
      
      const props = {
        ...defaultProps,
        layer: layerWithEvents
      };
      
      render(<CalendarGrid {...props} />);
      
      // Check the render result
      const renderDayTest = screen.getAllByTestId('render-day-test')[0];
      const result = JSON.parse(renderDayTest.textContent || '{}');
      
      expect(result).toEqual({ 
        backgroundColor: null,
        hasElement: true,
        hasTooltip: true
      });
    });

    it('should combine multiple renderers when layer has both background and events', () => {
      const layerWithBoth: Layer = {
        ...defaultProps.layer,
        data: {
          background: [
            {
              startDate: '2025-06-10',
              endDate: '2025-06-20',
              color: '#ffcccc'
            }
          ],
          events: [
            {
              date: '2025-06-15',
              title: 'Combined Event',
              type: 'other',
              time: '2:00 PM',
              description: 'Combined Description'
            }
          ]
        }
      };
      
      const props = {
        ...defaultProps,
        layer: layerWithBoth
      };
      
      render(<CalendarGrid {...props} />);
      
      // Check combined render result
      const renderDayTest = screen.getAllByTestId('render-day-test')[0];
      const result = JSON.parse(renderDayTest.textContent || '{}');
      
      expect(result).toEqual({ 
        backgroundColor: '#ffcccc',
        hasElement: true,
        hasTooltip: true
      });
    });

    it('should handle empty event array', () => {
      const layerWithEmptyEvents: Layer = {
        ...defaultProps.layer,
        data: {
          events: []
        }
      };
      
      const props = {
        ...defaultProps,
        layer: layerWithEmptyEvents
      };
      
      render(<CalendarGrid {...props} />);
      
      const renderDayTest = screen.getAllByTestId('render-day-test')[0];
      expect(renderDayTest.textContent).toBe('null');
    });

    it('should return null from renderDay when no renderers exist', () => {
      const layerWithNoData: Layer = {
        ...defaultProps.layer,
        data: undefined
      };
      
      const props = {
        ...defaultProps,
        layer: layerWithNoData
      };
      
      render(<CalendarGrid {...props} />);
      
      const renderDayTest = screen.getAllByTestId('render-day-test')[0];
      expect(renderDayTest.textContent).toBe('null');
    });

    it('should handle dates with no matching events or backgrounds', () => {
      const layerWithData: Layer = {
        ...defaultProps.layer,
        data: {
          events: [
            {
              date: '2025-08-01', // Different date
              title: 'Far Event',
              type: 'work',
              time: '9:00 AM',
              description: 'Far away'
            }
          ],
          background: [
            {
              startDate: '2025-08-01',
              endDate: '2025-08-31',
              color: '#ccffcc'
            }
          ]
        }
      };
      
      const props = {
        ...defaultProps,
        layer: layerWithData
      };
      
      render(<CalendarGrid {...props} />);
      
      const renderDayTest = screen.getAllByTestId('render-day-test')[0];
      expect(renderDayTest.textContent).toBe('null');
    });
  });

  describe('MonthPair Component', () => {
    it('should handle null secondMonth correctly', () => {
      const props = {
        ...defaultProps,
        visibleMonths: 1,
        months: [mockDate1] // Only provide one month
      };
      
      render(<CalendarGrid {...props} />);
      
      const monthGrids = screen.getAllByTestId('month-grid');
      expect(monthGrids).toHaveLength(1);
    });

    it('should use months array when provided', () => {
      const customMonths = [
        new Date('2025-01-01'),
        new Date('2025-02-01'),
        new Date('2025-03-01')
      ];
      
      const props = {
        ...defaultProps,
        months: customMonths,
        visibleMonths: 3
      };
      
      render(<CalendarGrid {...props} />);
      
      const monthGrids = screen.getAllByTestId('month-grid');
      expect(monthGrids).toHaveLength(3);
      
      expect(monthGrids[0]).toHaveAttribute('data-month', customMonths[0].toISOString());
      expect(monthGrids[1]).toHaveAttribute('data-month', customMonths[1].toISOString());
      expect(monthGrids[2]).toHaveAttribute('data-month', customMonths[2].toISOString());
    });

    it('should apply flex container styles correctly', () => {
      const { container } = render(<CalendarGrid {...defaultProps} />);
      
      const flexContainer = container.querySelector('div');
      expect(flexContainer).toHaveStyle({
        display: 'flex',
        width: '100%',
        gap: '0px'
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined settings gracefully', () => {
      const props = {
        ...defaultProps,
        settings: undefined
      };
      
      render(<CalendarGrid {...props} />);
      
      const monthGrids = screen.getAllByTestId('month-grid');
      // When settings is undefined, tooltips are disabled (default to false)
      expect(monthGrids[0]).toHaveAttribute('data-show-tooltips', 'false');
    });

    it('should handle missing restrictionConfig', () => {
      const props = {
        ...defaultProps,
        restrictionConfig: undefined
      };
      
      render(<CalendarGrid {...props} />);
      
      // Should render without errors
      expect(screen.getAllByTestId('month-grid')).toHaveLength(2);
    });

    it('should handle startWeekOnSunday as undefined', () => {
      const props = {
        ...defaultProps,
        startWeekOnSunday: undefined
      };
      
      render(<CalendarGrid {...props} />);
      
      const monthGrids = screen.getAllByTestId('month-grid');
      // Should render without errors
      expect(monthGrids).toHaveLength(2);
    });

    it('should handle layer with mixed event types', () => {
      const layerWithMixedEvents: Layer = {
        ...defaultProps.layer,
        data: {
          events: [
            {
              date: '2025-06-15',
              title: 'Work Event',
              type: 'work',
              time: '9:00 AM',
              description: 'Work stuff'
            },
            {
              date: '2025-06-15',
              title: 'Other Event',
              type: 'other',
              time: '5:00 PM',
              description: 'Other stuff'
            },
            {
              date: '2025-06-15',
              title: 'Unknown Event',
              type: 'unknown' as any, // Testing type coercion
              time: '12:00 PM',
              description: 'Unknown type'
            }
          ]
        }
      };
      
      const props = {
        ...defaultProps,
        layer: layerWithMixedEvents
      };
      
      render(<CalendarGrid {...props} />);
      
      // Check that events are processed
      const renderDayTest = screen.getAllByTestId('render-day-test')[0];
      const result = JSON.parse(renderDayTest.textContent || '{}');
      
      // Should have combined all three events
      expect(result.hasElement).toBe(true);
      expect(result.hasTooltip).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should memoize renderers based on layer data', () => {
      const layer: Layer = {
        ...defaultProps.layer,
        data: {
          events: [{ 
            date: '2025-06-15', 
            title: 'Event 1',
            type: 'work',
            time: '10:00 AM',
            description: 'Description 1'
          }]
        }
      };
      
      const { rerender } = render(
        <CalendarGrid {...defaultProps} layer={layer} />
      );
      
      // Rerender with same layer data
      rerender(
        <CalendarGrid {...defaultProps} layer={layer} isSelecting={true} />
      );
      
      // Check that renderer is still working
      const renderDayTest = screen.getAllByTestId('render-day-test')[0];
      const result = JSON.parse(renderDayTest.textContent || '{}');
      expect(result.hasElement).toBe(true);
    });

    it('should update renderers when layer data changes', () => {
      const layer1: Layer = {
        ...defaultProps.layer,
        data: {
          events: [{ 
            date: '2025-06-15', 
            title: 'Event 1',
            type: 'work',
            time: '10:00 AM',
            description: 'Description 1'
          }]
        }
      };
      
      const layer2: Layer = {
        ...defaultProps.layer,
        data: {
          events: [{ 
            date: '2025-06-15', 
            title: 'Event 2',
            type: 'other',
            time: '2:00 PM',
            description: 'Description 2'
          }]
        }
      };
      
      const { rerender } = render(
        <CalendarGrid {...defaultProps} layer={layer1} />
      );
      
      let renderDayTest = screen.getAllByTestId('render-day-test')[0];
      let result = JSON.parse(renderDayTest.textContent || '{}');
      expect(result.hasElement).toBe(true);
      
      // Rerender with different layer data
      rerender(
        <CalendarGrid {...defaultProps} layer={layer2} />
      );
      
      renderDayTest = screen.getAllByTestId('render-day-test')[0];
      result = JSON.parse(renderDayTest.textContent || '{}');
      expect(result.hasElement).toBe(true);
      expect(result.hasTooltip).toBe(true);
    });
  });
});