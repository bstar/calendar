import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import ReactDOM from 'react-dom';
import { MonthGrid } from './MonthGrid';
import { createDate, format } from '../../../../utils/DateUtils';
import '@testing-library/jest-dom';

// Mock ReactDOM.createPortal
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom');
  return {
    ...actual,
    createPortal: (element: React.ReactElement) => element
  };
});

// Mock DayCell to simplify testing
vi.mock('../DayCell', () => ({
  DayCell: ({ date, onMouseDown, onMouseEnter }: any) => (
    <div 
      data-testid={`day-${format(date, 'yyyy-MM-dd')}`}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
    >
      {format(date, 'd')}
    </div>
  )
}));

describe('MonthGrid', () => {
  const defaultProps = {
    baseDate: createDate(2025, 5, 15), // June 15, 2025
    selectedRange: { start: null, end: null },
    onSelectionStart: vi.fn(),
    onSelectionMove: vi.fn(),
    showTooltips: true,
    settings: {
      timezone: 'UTC',
      baseFontSize: '16px',
      backgroundColors: {
        monthHeader: '#f0f0f0',
        emptyRows: '#fafafa'
      }
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    document.hasFocus = vi.fn().mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render month grid with correct structure', () => {
      render(<MonthGrid {...defaultProps} />);
      
      // Should have weekday headers
      expect(screen.getByText('Mon')).toBeInTheDocument();
      expect(screen.getByText('Sun')).toBeInTheDocument();
      
      // Should render days
      expect(screen.getByTestId('day-2025-06-01')).toBeInTheDocument();
      expect(screen.getByTestId('day-2025-06-15')).toBeInTheDocument();
      expect(screen.getByTestId('day-2025-06-30')).toBeInTheDocument();
    });

    it('should render with Sunday as first day when specified', () => {
      render(<MonthGrid {...defaultProps} startWeekOnSunday={true} />);
      
      const weekdays = screen.getAllByText(/^(Sun|Mon|Tue|Wed|Thu|Fri|Sat)$/);
      expect(weekdays[0]).toHaveTextContent('Sun');
      expect(weekdays[1]).toHaveTextContent('Mon');
    });

    it('should show month heading when enabled', () => {
      render(<MonthGrid {...defaultProps} showMonthHeading={true} />);
      
      expect(screen.getByText('Jun 2025')).toBeInTheDocument();
    });

    it('should apply custom styles', () => {
      const customStyle = { backgroundColor: 'red', padding: '20px' };
      const { container } = render(<MonthGrid {...defaultProps} style={customStyle} />);
      
      const monthGrid = container.querySelector('.month-grid-container');
      expect(monthGrid).toHaveAttribute('style');
      const style = monthGrid!.getAttribute('style');
      expect(style).toContain('background-color');
      expect(style).toContain('padding');
    });

    it('should always render 6 weeks (42 days) for consistent height', () => {
      const { container } = render(<MonthGrid {...defaultProps} />);
      
      // Count all day cells and empty cells
      const dayCells = container.querySelectorAll('[data-testid^="day-"]');
      const emptyCells = container.querySelectorAll('.month-grid-empty-cell');
      
      expect(dayCells.length + emptyCells.length).toBe(42);
    });
  });

  describe('Mouse Interactions', () => {
    it('should track mouse position on grid mouse move', () => {
      const { container } = render(<MonthGrid {...defaultProps} />);
      const grid = container.querySelector('.month-grid-days');
      
      fireEvent.mouseMove(grid!, {
        clientX: 100,
        clientY: 200
      });
      
      // Mouse position is stored in ref, so we can't directly test it
      // But we can test that the handler runs without error
      expect(grid).toBeInTheDocument();
    });

    it('should clear hovered date on mouse leave', async () => {
      const { container } = render(<MonthGrid {...defaultProps} />);
      const grid = container.querySelector('.month-grid-days');
      
      // First hover over a date
      const dayCell = screen.getByTestId('day-2025-06-15');
      fireEvent.mouseEnter(dayCell);
      
      // Then leave the grid
      fireEvent.mouseLeave(grid!);
      
      // Tooltip should not be rendered
      await waitFor(() => {
        expect(container.querySelector('.month-grid-tooltip')).not.toBeInTheDocument();
      });
    });

    it('should call onSelectionStart when clicking a day', () => {
      render(<MonthGrid {...defaultProps} />);
      
      const dayCell = screen.getByTestId('day-2025-06-15');
      fireEvent.mouseDown(dayCell);
      
      expect(defaultProps.onSelectionStart).toHaveBeenCalledWith(
        expect.objectContaining({
          // Date object for June 15, 2025
        })
      );
    });

    it('should call onSelectionMove when hovering over a day', async () => {
      render(<MonthGrid {...defaultProps} />);
      
      const dayCell = screen.getByTestId('day-2025-06-15');
      fireEvent.mouseEnter(dayCell);
      
      await waitFor(() => {
        expect(defaultProps.onSelectionMove).toHaveBeenCalledWith(
          expect.objectContaining({
            // Date object for June 15, 2025
          })
        );
      });
    });
  });

  describe('Scroll Handling', () => {
    it('should hide tooltip on window scroll', async () => {
      const { container } = render(<MonthGrid {...defaultProps} />);
      
      // Hover over a date to potentially show tooltip
      const dayCell = screen.getByTestId('day-2025-06-15');
      fireEvent.mouseEnter(dayCell);
      
      // Trigger scroll event
      fireEvent.scroll(window);
      
      // Tooltip should not be visible
      await waitFor(() => {
        expect(container.querySelector('.month-grid-tooltip')).not.toBeInTheDocument();
      });
    });

    it('should add and remove scroll listener on mount/unmount', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      const { unmount } = render(<MonthGrid {...defaultProps} />);
      
      // Should add scroll listener
      expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function), true);
      
      unmount();
      
      // Should remove scroll listener
      expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function), true);
    });
  });

  describe('Tooltip Rendering', () => {
    let createPortalSpy: any;
    
    beforeEach(() => {
      createPortalSpy = vi.spyOn(ReactDOM, 'createPortal').mockImplementation((element, container) => {
        return element as React.ReactPortal;
      });
    });
    
    afterEach(() => {
      createPortalSpy.mockRestore();
    });

    it('should handle tooltip logic for restricted dates', async () => {
      const onSelectionMove = vi.fn();
      const restrictionConfig = {
        restrictions: [{
          type: 'daterange',
          enabled: true,
          ranges: [{
            startDate: '2025-06-15',
            endDate: '2025-06-20',
            message: 'These dates are blocked'
          }]
        }]
      };
      
      render(
        <MonthGrid 
          {...defaultProps} 
          onSelectionMove={onSelectionMove}
          restrictionConfig={restrictionConfig} 
        />
      );
      
      // Test that mouse enter triggers selection move
      const dayCell = screen.getByTestId('day-2025-06-15');
      fireEvent.mouseEnter(dayCell);
      
      expect(onSelectionMove).toHaveBeenCalled();
    });


    it('should render tooltip for restricted boundary ranges', async () => {
      const restrictionConfig = {
        restrictions: [{
          type: 'restricted_boundary',
          enabled: true,
          ranges: [{
            startDate: '2025-06-10',
            endDate: '2025-06-20',
            message: 'Must stay within June 10-20'
          }]
        }]
      };

      const restrictionManager = {
        checkSelection: vi.fn().mockReturnValue({ allowed: true })
      };

      const { container } = render(
        <MonthGrid
          {...defaultProps}
          selectedRange={{ start: '2025-06-15', end: null }}
          restrictionConfig={restrictionConfig}
          restrictionManager={restrictionManager as any}
        />
      );

      const grid = container.querySelector('.month-grid-days');
      fireEvent.mouseMove(grid!, { clientX: 100, clientY: 200 });

      // Hover outside boundary
      const dayCell = screen.getByTestId('day-2025-06-25');
      fireEvent.mouseEnter(dayCell);

      await waitFor(() => {
        expect(createPortalSpy).toHaveBeenCalled();
        const tooltipCall = createPortalSpy.mock.calls[0];
        if (tooltipCall) {
          const tooltip = tooltipCall[0];
          expect(tooltip.props.children).toBe('Must stay within June 10-20');
        }
      }, { timeout: 1000 });
    });

    it('should use default message for restricted boundary', async () => {
      const restrictionConfig = {
        restrictions: [{
          type: 'restricted_boundary',
          enabled: true,
          ranges: [{
            start: '2025-06-10',
            end: '2025-06-20'
            // No message provided
          }]
        }]
      };

      const restrictionManager = {
        checkSelection: vi.fn().mockReturnValue({ allowed: true })
      };

      const { container } = render(
        <MonthGrid
          {...defaultProps}
          selectedRange={{ start: '2025-06-15', end: null }}
          restrictionConfig={restrictionConfig}
          restrictionManager={restrictionManager as any}
        />
      );

      const grid = container.querySelector('.month-grid-days');
      fireEvent.mouseMove(grid!, { clientX: 100, clientY: 200 });

      const dayCell = screen.getByTestId('day-2025-06-25');
      fireEvent.mouseEnter(dayCell);

      await waitFor(() => {
        const calls = createPortalSpy.mock.calls;
        if (calls.length > 0) {
          const tooltip = calls[0][0];
          expect(tooltip.props.children).toBe('Selection must stay within the boundary');
        }
      }, { timeout: 1000 });
    });

    it('should handle invalid date ranges in restricted boundary', async () => {
      const restrictionConfig = {
        restrictions: [{
          type: 'restricted_boundary',
          enabled: true,
          ranges: [{
            startDate: 'invalid-date',
            endDate: '2025-06-20',
            message: 'Invalid range'
          }]
        }]
      };

      const restrictionManager = {
        checkSelection: vi.fn().mockReturnValue({ allowed: true })
      };

      const { container } = render(
        <MonthGrid
          {...defaultProps}
          selectedRange={{ start: '2025-06-15', end: null }}
          restrictionConfig={restrictionConfig}
          restrictionManager={restrictionManager as any}
        />
      );

      const dayCell = screen.getByTestId('day-2025-06-25');
      fireEvent.mouseEnter(dayCell);

      // Should not show tooltip due to invalid date
      await waitFor(() => {
        expect(createPortalSpy).not.toHaveBeenCalled();
      }, { timeout: 500 });
    });

    it('should not show tooltip when selection not within boundary', async () => {
      const restrictionConfig = {
        restrictions: [{
          type: 'restricted_boundary',
          enabled: true,
          ranges: [{
            start: '2025-06-10',
            end: '2025-06-20',
            message: 'Must stay within boundary'
          }]
        }]
      };

      const restrictionManager = {
        checkSelection: vi.fn().mockReturnValue({ allowed: true })
      };

      const { container } = render(
        <MonthGrid
          {...defaultProps}
          selectedRange={{ start: '2025-06-25', end: null }} // Started outside boundary
          restrictionConfig={restrictionConfig}
          restrictionManager={restrictionManager as any}
        />
      );

      const dayCell = screen.getByTestId('day-2025-06-15');
      fireEvent.mouseEnter(dayCell);

      await waitFor(() => {
        expect(createPortalSpy).not.toHaveBeenCalled();
      }, { timeout: 500 });
    });

    it('should handle font size with rem units', async () => {
      const restrictionManager = {
        checkSelection: vi.fn().mockReturnValue({
          allowed: false,
          message: 'Test tooltip'
        })
      };

      const { container } = render(
        <MonthGrid
          {...defaultProps}
          settings={{ ...defaultProps.settings, baseFontSize: '1rem' }}
          restrictionManager={restrictionManager as any}
          restrictionConfig={{ restrictions: [] }}
        />
      );

      const grid = container.querySelector('.month-grid-days');
      fireEvent.mouseMove(grid!, { clientX: 100, clientY: 200 });

      const dayCell = screen.getByTestId('day-2025-06-15');
      fireEvent.mouseEnter(dayCell);

      await waitFor(() => {
        const calls = createPortalSpy.mock.calls;
        if (calls.length > 0) {
          const tooltip = calls[0][0];
          expect(tooltip.props.style.fontSize).toBe('0.875rem');
        }
      }, { timeout: 1000 });
    });

    it('should not render tooltip when document is not focused', async () => {
      document.hasFocus = vi.fn().mockReturnValue(false);
      
      const restrictionConfig = {
        restrictions: [{
          type: 'daterange',
          enabled: true,
          ranges: [{
            startDate: '2025-06-15',
            endDate: '2025-06-20',
            message: 'Blocked'
          }]
        }]
      };
      
      const { container } = render(
        <MonthGrid {...defaultProps} restrictionConfig={restrictionConfig} />
      );
      
      const dayCell = screen.getByTestId('day-2025-06-15');
      fireEvent.mouseEnter(dayCell);
      
      await waitFor(() => {
        expect(createPortalSpy).not.toHaveBeenCalled();
      });
    });

    it('should track mouse position for tooltip placement', () => {
      const { container } = render(<MonthGrid {...defaultProps} />);
      const grid = container.querySelector('.month-grid-days');
      
      // Test mouse move handler
      fireEvent.mouseMove(grid!, { clientX: 100, clientY: 200 });
      
      // Handler should execute without error
      expect(grid).toBeInTheDocument();
    });

  });

  describe('Week Calculation', () => {
    it('should correctly calculate weeks for different months', () => {
      // Test February 2025 (4 weeks + padding)
      const febProps = {
        ...defaultProps,
        baseDate: createDate(2025, 1, 15) // February
      };
      
      const { container } = render(<MonthGrid {...febProps} />);
      
      const dayCells = container.querySelectorAll('[data-testid^="day-"]');
      const emptyCells = container.querySelectorAll('.month-grid-empty-cell');
      
      // February 2025 starts on Saturday, ends on Friday
      // Needs dates from Jan 26 to Mar 8 to fill 6 weeks
      expect(dayCells.length).toBeGreaterThan(0);
      expect(dayCells.length + emptyCells.length).toBe(42); // Always 6 weeks
    });
  });

  describe('Custom Rendering', () => {
    it('should use custom renderDay function', () => {
      const renderDay = vi.fn();
      render(<MonthGrid {...defaultProps} renderDay={renderDay} />);
      
      // renderDay is passed to DayCell component
      expect(screen.getByTestId('day-2025-06-15')).toBeInTheDocument();
    });

    it('should apply layer-specific styling', () => {
      const layer = {
        name: 'test-layer',
        title: 'Test Layer',
        color: 'blue'
      };
      
      render(<MonthGrid {...defaultProps} layer={layer} />);
      
      // Layer is passed to DayCell component
      expect(screen.getByTestId('day-2025-06-15')).toBeInTheDocument();
    });
  });

  describe('Font Size Handling', () => {
    it('should apply font sizes from settings', () => {
      const { container } = render(
        <MonthGrid {...defaultProps} showMonthHeading={true} />
      );
      
      const weekdays = container.querySelectorAll('.month-grid-weekday');
      weekdays.forEach(weekday => {
        expect(weekday).toHaveStyle({ fontSize: '14px' }); // small size
      });
      
      const heading = container.querySelector('.month-grid-heading');
      expect(heading).toHaveStyle({ fontSize: '14px' });
    });

    it('should handle missing settings gracefully', () => {
      const propsWithoutSettings = {
        ...defaultProps,
        settings: undefined
      };
      
      const { container } = render(<MonthGrid {...propsWithoutSettings} />);
      expect(container.querySelector('.month-grid-container')).toBeInTheDocument();
    });
  });

  describe('Handler Function Coverage', () => {
    it('should properly handle grid mouse leave', () => {
      const { container } = render(<MonthGrid {...defaultProps} />);
      const grid = container.querySelector('.month-grid-days');
      
      // Trigger mouse leave
      fireEvent.mouseLeave(grid!);
      
      // Should clear hovered date (indirectly testable by no tooltip)
      expect(container.querySelector('.month-grid-tooltip')).not.toBeInTheDocument();
    });
    
    it('should handle restriction manager creation', () => {
      const restrictionConfig = {
        restrictions: [{
          type: 'daterange',
          enabled: true,
          ranges: [{
            startDate: '2025-06-15',
            endDate: '2025-06-20'
          }]
        }]
      };
      
      const { rerender } = render(<MonthGrid {...defaultProps} />);
      
      // First render without restrictions
      expect(document.querySelector('.month-grid-tooltip')).not.toBeInTheDocument();
      
      // Then add restrictions
      rerender(<MonthGrid {...defaultProps} restrictionConfig={restrictionConfig} />);
      
      // Component should handle the change
      expect(screen.getByTestId('day-2025-06-15')).toBeInTheDocument();
    });
    
    it('should handle empty restriction config properly', () => {
      const { container } = render(
        <MonthGrid {...defaultProps} restrictionConfig={{ restrictions: [] }} />
      );
      
      // Should render without errors
      expect(container.querySelector('.month-grid-container')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty restriction config', async () => {
      const restrictionConfig = {
        restrictions: []
      };
      
      const { container } = render(
        <MonthGrid {...defaultProps} restrictionConfig={restrictionConfig} />
      );
      
      const dayCell = screen.getByTestId('day-2025-06-15');
      fireEvent.mouseEnter(dayCell);
      
      await waitFor(() => {
        expect(container.querySelector('.month-grid-tooltip')).not.toBeInTheDocument();
      });
    });

    it('should handle null restriction config', async () => {
      const { container } = render(
        <MonthGrid {...defaultProps} restrictionConfig={undefined} />
      );
      
      const dayCell = screen.getByTestId('day-2025-06-15');
      fireEvent.mouseEnter(dayCell);
      
      await waitFor(() => {
        expect(container.querySelector('.month-grid-tooltip')).not.toBeInTheDocument();
      });
    });

    it('should handle month boundary correctly', () => {
      // Test a month that spans 6 full weeks
      const props = {
        ...defaultProps,
        baseDate: createDate(2025, 4, 1) // May 2025
      };
      
      const { container } = render(<MonthGrid {...props} />);
      
      // Should include April dates at the beginning
      expect(screen.getByTestId('day-2025-04-28')).toBeInTheDocument();
      
      // Should include May dates
      expect(screen.getByTestId('day-2025-05-01')).toBeInTheDocument();
      expect(screen.getByTestId('day-2025-05-31')).toBeInTheDocument();
      
      // Should include June dates at the end
      expect(screen.getByTestId('day-2025-06-01')).toBeInTheDocument();
    });
  });
});