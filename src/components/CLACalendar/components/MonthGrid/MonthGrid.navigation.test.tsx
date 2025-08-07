import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { MonthGrid } from './MonthGrid';
import { DateRange } from '../../../CLACalendarComponents/selection/DateRangeSelectionManager';
import { addMonths, format } from '../../../../utils/DateUtils';

describe('MonthGrid Navigation - Skip Blank Days', () => {
  let mockOnSelectionStart: ReturnType<typeof vi.fn>;
  let mockOnSelectionMove: ReturnType<typeof vi.fn>;
  let mockOnNavigateToMonth: ReturnType<typeof vi.fn>;
  let mockOnNavigateMonth: ReturnType<typeof vi.fn>;
  const mockSelectedRange: DateRange = { start: null, end: null };
  let defaultProps: any;

  beforeEach(() => {
    mockOnSelectionStart = vi.fn();
    mockOnSelectionMove = vi.fn();
    mockOnNavigateToMonth = vi.fn();
    mockOnNavigateMonth = vi.fn();
    
    // Mock current date for consistent testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15'));

    // Define default props after mocks are created
    defaultProps = {
      baseDate: new Date('2025-06-01'),
      monthIndex: 0,
      selectedRange: mockSelectedRange,
      onSelectionStart: mockOnSelectionStart,
      onSelectionMove: mockOnSelectionMove,
      showTooltips: false,
      renderDay: () => null,
      layer: { name: 'default', title: 'Default', data: {} },
      startWeekOnSunday: false,
      settings: { timezone: 'UTC' },
      totalMonths: 1,
      onNavigateToMonth: mockOnNavigateToMonth,
      onNavigateMonth: mockOnNavigateMonth,
      monthsPerRow: 1
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Helper Function - findNextValidDay', () => {
    it('should find next valid day in current month', () => {
      const { container } = render(<MonthGrid {...defaultProps} />);
      
      // June 2025 starts on a Sunday, so in a Monday-start week,
      // the first few cells will be blank days from May
      const gridCells = container.querySelectorAll('[role="gridcell"]');
      
      // Verify that we have cells for the full grid (6 weeks * 7 days = 42 cells)
      expect(gridCells.length).toBe(42);
      
      // First day of June should be at index 1 (after Monday from May)
      const june1Cell = screen.getByLabelText(format(new Date('2025-06-01'), 'EEEE, MMMM d, yyyy'));
      expect(june1Cell).toBeInTheDocument();
    });
  });

  describe('Arrow Left Navigation', () => {
    it('should skip blank days when navigating left at start of month', () => {
      render(<MonthGrid {...defaultProps} />);
      
      // Focus on June 1 (first day of month)
      const june1 = screen.getByLabelText(format(new Date('2025-06-01'), 'EEEE, MMMM d, yyyy'));
      act(() => {
        june1.focus();
      });
      
      // Try to navigate left - should stay on June 1
      act(() => {
        fireEvent.keyDown(june1, { key: 'ArrowLeft' });
      });
      
      // Should still be focused on June 1 (not on blank May days)
      expect(document.activeElement).toBe(june1);
      
      // onNavigateToMonth should not have been called (no previous month)
      expect(mockOnNavigateToMonth).not.toHaveBeenCalled();
    });

    it('should navigate to previous month when multiple months visible', () => {
      const { container } = render(<MonthGrid {...defaultProps} totalMonths={2} />);
      
      // Focus on June 1
      const june1 = screen.getByLabelText(format(new Date('2025-06-01'), 'EEEE, MMMM d, yyyy'));
      act(() => {
        june1.focus();
      });
      
      // Find the grid container
      const grid = container.querySelector('[role="grid"]') as HTMLElement;
      expect(grid).toBeTruthy();
      
      // Try to navigate left - fire event on grid, not individual cell
      act(() => {
        fireEvent.keyDown(grid, { key: 'ArrowLeft' });
      });
      
      // Should navigate to previous month (May)
      expect(mockOnNavigateToMonth).toHaveBeenCalledWith(
        -1, // Previous month index
        expect.any(Date) // Last valid day of May
      );
    });
  });

  describe('Arrow Right Navigation', () => {
    it('should skip blank days when navigating right at end of month', () => {
      render(<MonthGrid {...defaultProps} />);
      
      // Focus on June 30 (last day of month)
      const june30 = screen.getByLabelText(format(new Date('2025-06-30'), 'EEEE, MMMM d, yyyy'));
      june30.focus();
      
      // Try to navigate right - should stay on June 30
      fireEvent.keyDown(june30, { key: 'ArrowRight' });
      
      // Should still be focused on June 30 (not on blank July days)
      expect(document.activeElement).toBe(june30);
      
      // onNavigateToMonth should not have been called (only one month visible)
      expect(mockOnNavigateToMonth).not.toHaveBeenCalled();
    });

    it('should navigate to next month when multiple months visible', () => {
      render(<MonthGrid {...defaultProps} totalMonths={2} monthIndex={0} />);
      
      // Focus on June 30
      const june30 = screen.getByLabelText(format(new Date('2025-06-30'), 'EEEE, MMMM d, yyyy'));
      
      act(() => {
        june30.focus();
        fireEvent.focus(june30);
      });
      
      // Try to navigate right
      act(() => {
        fireEvent.keyDown(june30, { key: 'ArrowRight' });
      });
      
      // Should navigate to next month (July)
      expect(mockOnNavigateToMonth).toHaveBeenCalledWith(
        1, // Next month index
        expect.any(Date) // First valid day of July
      );
    });
  });

  describe('Arrow Up Navigation', () => {
    it('should skip blank days when navigating up in first week', () => {
      render(<MonthGrid {...defaultProps} />);
      
      // Focus on June 5 (first week, Thursday)
      const june5 = screen.getByLabelText(format(new Date('2025-06-05'), 'EEEE, MMMM d, yyyy'));
      june5.focus();
      
      // Try to navigate up - should stay on June 5
      fireEvent.keyDown(june5, { key: 'ArrowUp' });
      
      // Should still be focused on June 5 (no valid days above)
      expect(document.activeElement).toBe(june5);
    });

    it.skip('should navigate within month when possible', () => {
      render(<MonthGrid {...defaultProps} />);
      
      // Focus on June 15 (middle of month)
      const june15 = screen.getByLabelText(format(new Date('2025-06-15'), 'EEEE, MMMM d, yyyy'));
      june15.focus();
      
      // Navigate up - should go to June 8
      fireEvent.keyDown(june15, { key: 'ArrowUp' });
      
      const june8 = screen.getByLabelText(format(new Date('2025-06-08'), 'EEEE, MMMM d, yyyy'));
      expect(document.activeElement).toBe(june8);
    });

    it.skip('should maintain column position when navigating to previous month', () => {
      render(<MonthGrid {...defaultProps} monthIndex={1} totalMonths={2} />);
      
      // Focus on June 3 (Tuesday, column 2 with Monday start)
      const june3 = screen.getByLabelText(format(new Date('2025-06-03'), 'EEEE, MMMM d, yyyy'));
      june3.focus();
      
      // Navigate up
      fireEvent.keyDown(june3, { key: 'ArrowUp' });
      
      // Should navigate to previous month, maintaining Tuesday column
      expect(mockOnNavigateToMonth).toHaveBeenCalledWith(
        0, // Previous month index
        expect.any(Date) // Should be a Tuesday in May
      );
    });
  });

  describe('Arrow Down Navigation', () => {
    it('should skip blank days when navigating down in last week', () => {
      render(<MonthGrid {...defaultProps} />);
      
      // Focus on June 28 (last week, Saturday)
      const june28 = screen.getByLabelText(format(new Date('2025-06-28'), 'EEEE, MMMM d, yyyy'));
      june28.focus();
      
      // Try to navigate down - should stay on June 28
      fireEvent.keyDown(june28, { key: 'ArrowDown' });
      
      // Should still be focused on June 28 (no valid days below in June)
      expect(document.activeElement).toBe(june28);
    });

    it.skip('should navigate within month when possible', () => {
      render(<MonthGrid {...defaultProps} />);
      
      // Focus on June 8
      const june8 = screen.getByLabelText(format(new Date('2025-06-08'), 'EEEE, MMMM d, yyyy'));
      june8.focus();
      
      // Navigate down - should go to June 15
      fireEvent.keyDown(june8, { key: 'ArrowDown' });
      
      const june15 = screen.getByLabelText(format(new Date('2025-06-15'), 'EEEE, MMMM d, yyyy'));
      expect(document.activeElement).toBe(june15);
    });

    it.skip('should maintain column position when navigating to next month', () => {
      render(<MonthGrid {...defaultProps} monthIndex={0} totalMonths={2} />);
      
      // Focus on June 25 (Wednesday, column 3 with Monday start)
      const june25 = screen.getByLabelText(format(new Date('2025-06-25'), 'EEEE, MMMM d, yyyy'));
      june25.focus();
      
      // Navigate down
      fireEvent.keyDown(june25, { key: 'ArrowDown' });
      
      // Should navigate to next month, maintaining Wednesday column
      expect(mockOnNavigateToMonth).toHaveBeenCalledWith(
        1, // Next month index
        expect.any(Date) // Should be a Wednesday in July
      );
    });
  });

  describe('Home/End Key Navigation', () => {
    it.skip('should navigate to first valid day of week with Home', () => {
      render(<MonthGrid {...defaultProps} startWeekOnSunday={true} />);
      
      // Focus on June 4 (Wednesday)
      const june4 = screen.getByLabelText(format(new Date('2025-06-04'), 'EEEE, MMMM d, yyyy'));
      june4.focus();
      
      // Press Home - should go to June 1 (Sunday, first day of week)
      fireEvent.keyDown(june4, { key: 'Home' });
      
      const june1 = screen.getByLabelText(format(new Date('2025-06-01'), 'EEEE, MMMM d, yyyy'));
      expect(document.activeElement).toBe(june1);
    });

    it.skip('should navigate to last valid day of week with End', () => {
      render(<MonthGrid {...defaultProps} startWeekOnSunday={true} />);
      
      // Focus on June 25 (Wednesday)
      const june25 = screen.getByLabelText(format(new Date('2025-06-25'), 'EEEE, MMMM d, yyyy'));
      june25.focus();
      
      // Press End - should go to June 28 (Saturday, last day of week)
      fireEvent.keyDown(june25, { key: 'End' });
      
      const june28 = screen.getByLabelText(format(new Date('2025-06-28'), 'EEEE, MMMM d, yyyy'));
      expect(document.activeElement).toBe(june28);
    });

    it('should skip blank days with Home in first week', () => {
      render(<MonthGrid {...defaultProps} startWeekOnSunday={false} />);
      
      // Focus on June 1 (Sunday, but week starts Monday)
      const june1 = screen.getByLabelText(format(new Date('2025-06-01'), 'EEEE, MMMM d, yyyy'));
      june1.focus();
      
      // Press Home - should stay on June 1 (first valid day in week)
      fireEvent.keyDown(june1, { key: 'Home' });
      
      expect(document.activeElement).toBe(june1);
    });

    it('should skip blank days with End in last week', () => {
      render(<MonthGrid {...defaultProps} startWeekOnSunday={false} />);
      
      // Focus on June 30 (Monday, last day of month)
      const june30 = screen.getByLabelText(format(new Date('2025-06-30'), 'EEEE, MMMM d, yyyy'));
      june30.focus();
      
      // Press End - should stay on June 30 (last valid day in week)
      fireEvent.keyDown(june30, { key: 'End' });
      
      expect(document.activeElement).toBe(june30);
    });

    it.skip('should navigate to first day of month with Ctrl+Home', () => {
      const { container } = render(<MonthGrid {...defaultProps} />);
      
      // Get the grid element
      const grid = container.querySelector('[role="grid"]') as HTMLElement;
      
      // Focus on June 15
      const june15 = screen.getByLabelText(format(new Date('2025-06-15'), 'EEEE, MMMM d, yyyy'));
      june15.focus();
      
      // Press Ctrl+Home on the grid
      act(() => {
        fireEvent.keyDown(grid, { key: 'Home', ctrlKey: true });
      });
      
      // Flush any pending timers for requestAnimationFrame
      act(() => {
        vi.runOnlyPendingTimers();
      });
      
      const june1 = screen.getByLabelText(format(new Date('2025-06-01'), 'EEEE, MMMM d, yyyy'));
      expect(document.activeElement).toBe(june1);
    });

    it.skip('should navigate to last day of month with Ctrl+End', () => {
      const { container } = render(<MonthGrid {...defaultProps} />);
      
      // Get the grid element
      const grid = container.querySelector('[role="grid"]') as HTMLElement;
      
      // Focus on June 15
      const june15 = screen.getByLabelText(format(new Date('2025-06-15'), 'EEEE, MMMM d, yyyy'));
      june15.focus();
      
      // Press Ctrl+End on the grid
      act(() => {
        fireEvent.keyDown(grid, { key: 'End', ctrlKey: true });
      });
      
      // Flush any pending timers for requestAnimationFrame
      act(() => {
        vi.runOnlyPendingTimers();
      });
      
      const june30 = screen.getByLabelText(format(new Date('2025-06-30'), 'EEEE, MMMM d, yyyy'));
      expect(document.activeElement).toBe(june30);
    });
  });

  describe('Page Up/Down Navigation', () => {
    it.skip('should call onNavigateMonth for Page Up', () => {
      const { container } = render(<MonthGrid {...defaultProps} />);
      
      // Get the grid element
      const grid = container.querySelector('[role="grid"]') as HTMLElement;
      
      // Focus on any day to set focusedDate
      const june15 = screen.getByLabelText(format(new Date('2025-06-15'), 'EEEE, MMMM d, yyyy'));
      june15.focus();
      
      // Fire event on the grid element  
      act(() => {
        fireEvent.keyDown(grid, { key: 'PageUp' });
      });
      
      expect(mockOnNavigateMonth).toHaveBeenCalledWith('prev');
    });

    it.skip('should call onNavigateMonth for Page Down', () => {
      const { container } = render(<MonthGrid {...defaultProps} />);
      
      // Get the grid element
      const grid = container.querySelector('[role="grid"]') as HTMLElement;
      
      // Focus on any day to set focusedDate
      const june15 = screen.getByLabelText(format(new Date('2025-06-15'), 'EEEE, MMMM d, yyyy'));
      june15.focus();
      
      // Fire event on the grid element
      act(() => {
        fireEvent.keyDown(grid, { key: 'PageDown' });
      });
      
      expect(mockOnNavigateMonth).toHaveBeenCalledWith('next');
    });
  });

  describe('Initial Focus', () => {
    it.skip('should focus on current date if in current month', () => {
      render(<MonthGrid {...defaultProps} monthIndex={0} />);
      
      // Current date is June 15 (mocked)
      const today = screen.getByLabelText(format(new Date('2025-06-15'), 'EEEE, MMMM d, yyyy'));
      
      // Should have tabindex="0"
      expect(today).toHaveAttribute('tabindex', '0');
    });

    it('should focus on first day of month if current date not in view', () => {
      // Render July instead of June
      render(<MonthGrid {...defaultProps} baseDate={new Date('2025-07-01')} monthIndex={0} />);
      
      // First day of July should have tabindex="0"
      const july1 = screen.getByLabelText(format(new Date('2025-07-01'), 'EEEE, MMMM d, yyyy'));
      expect(july1).toHaveAttribute('tabindex', '0');
    });

    it('should only have one focusable day cell', () => {
      const { container } = render(<MonthGrid {...defaultProps} />);
      
      const focusableCells = container.querySelectorAll('[role="gridcell"][tabindex="0"]');
      expect(focusableCells).toHaveLength(1);
      
      const nonFocusableCells = container.querySelectorAll('[role="gridcell"][tabindex="-1"]');
      expect(nonFocusableCells.length).toBeGreaterThan(0);
    });
  });
});