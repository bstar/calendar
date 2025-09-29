import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { CLACalendar } from '../CLACalendar';
import { getDefaultSettings } from '../CLACalendar.config';
import { format, addMonths, startOfMonth, endOfMonth } from '../../utils/DateUtils';

describe('CLACalendar Keyboard Navigation', () => {
  let mockOnSubmit: ReturnType<typeof vi.fn>;
  let mockOnSettingsChange: ReturnType<typeof vi.fn>;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    mockOnSubmit = vi.fn();
    mockOnSettingsChange = vi.fn();
    user = userEvent.setup();
    
    // Mock current date for consistent testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Basic Arrow Key Navigation', () => {
    it('should navigate between days with arrow keys', () => {
      render(
        <CLACalendar
          settings={{
            ...getDefaultSettings(),
            displayMode: 'embedded',
            visibleMonths: 1,
            onSubmit: mockOnSubmit
          }}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Find a day in the middle of the month
      const currentMonth = new Date('2025-06-15');
      const dayCell = screen.getByLabelText(format(currentMonth, 'EEEE, MMMM d, yyyy'));
      
      // Focus on the day
      act(() => {
        dayCell.focus();
      });
      expect(document.activeElement).toBe(dayCell);

      // Navigate right
      act(() => {
        fireEvent.keyDown(dayCell, { key: 'ArrowRight' });
      });
      act(() => {
        vi.runOnlyPendingTimers();
      });
      const nextDay = new Date('2025-06-16');
      const nextDayCell = screen.getByLabelText(format(nextDay, 'EEEE, MMMM d, yyyy'));
      expect(document.activeElement).toBe(nextDayCell);

      // Navigate left
      act(() => {
        fireEvent.keyDown(nextDayCell, { key: 'ArrowLeft' });
      });
      act(() => {
        vi.runOnlyPendingTimers();
      });
      expect(document.activeElement).toBe(dayCell);

      // Navigate down (next week)
      act(() => {
        fireEvent.keyDown(dayCell, { key: 'ArrowDown' });
      });
      act(() => {
        vi.runOnlyPendingTimers();
      });
      const nextWeek = new Date('2025-06-22');
      const nextWeekCell = screen.getByLabelText(format(nextWeek, 'EEEE, MMMM d, yyyy'));
      expect(document.activeElement).toBe(nextWeekCell);

      // Navigate up (previous week)
      act(() => {
        fireEvent.keyDown(nextWeekCell, { key: 'ArrowUp' });
      });
      act(() => {
        vi.runOnlyPendingTimers();
      });
      expect(document.activeElement).toBe(dayCell);
    });

    it.skip('should skip blank days at the beginning of month', () => {
      render(
        <CLACalendar
          settings={{
            ...getDefaultSettings(),
            displayMode: 'embedded',
            visibleMonths: 1,
            onSubmit: mockOnSubmit
          }}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Focus on first day of June 2025 (which is a Sunday)
      const firstDay = new Date('2025-06-01');
      const firstDayCell = screen.getByLabelText(format(firstDay, 'EEEE, MMMM d, yyyy'));
      firstDayCell.focus();

      // Try to navigate left - should stay on June 1st (not go to May)
      act(() => {
        fireEvent.keyDown(firstDayCell, { key: 'ArrowLeft' });
      });
      act(() => {
        vi.runOnlyPendingTimers();
      });
      expect(document.activeElement).toBe(firstDayCell);

      // Try to navigate up - should stay on June 1st
      act(() => {
        fireEvent.keyDown(firstDayCell, { key: 'ArrowUp' });
      });
      act(() => {
        vi.runOnlyPendingTimers();
      });
      expect(document.activeElement).toBe(firstDayCell);
    });

    it.skip('should skip blank days at the end of month', () => {
      render(
        <CLACalendar
          settings={{
            ...getDefaultSettings(),
            displayMode: 'embedded',
            visibleMonths: 1,
            onSubmit: mockOnSubmit
          }}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Focus on last day of June 2025 (which is June 30, a Monday)
      const lastDay = new Date('2025-06-30');
      const lastDayCell = screen.getByLabelText(format(lastDay, 'EEEE, MMMM d, yyyy'));
      lastDayCell.focus();

      // Try to navigate right - should stay on June 30
      act(() => {
        fireEvent.keyDown(lastDayCell, { key: 'ArrowRight' });
      });
      act(() => {
        vi.runOnlyPendingTimers();
      });
      expect(document.activeElement).toBe(lastDayCell);

      // Try to navigate down - should stay on June 30
      act(() => {
        fireEvent.keyDown(lastDayCell, { key: 'ArrowDown' });
      });
      act(() => {
        vi.runOnlyPendingTimers();
      });
      expect(document.activeElement).toBe(lastDayCell);
    });
  });

  describe('Cross-Month Navigation', () => {
    it.skip('should navigate to previous month when at the beginning', () => {
      render(
        <CLACalendar
          settings={{
            ...getDefaultSettings(),
            displayMode: 'embedded',
            visibleMonths: 2,
            onSubmit: mockOnSubmit
          }}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Navigate to previous month
      const prevButton = screen.getByLabelText('Previous month');
      act(() => {
        fireEvent.click(prevButton);
      });
      act(() => {
        vi.runOnlyPendingTimers();
      });

      // Focus on first day of first visible month (May 2025)
      const firstDay = new Date('2025-05-01');
      const firstDayCell = screen.getByLabelText(format(firstDay, 'EEEE, MMMM d, yyyy'));
      act(() => {
        firstDayCell.focus();
      });

      // Navigate right to last day of May
      let currentElement = firstDayCell;
      for (let i = 0; i < 30; i++) {
        act(() => {
          fireEvent.keyDown(currentElement, { key: 'ArrowRight' });
        });
        act(() => {
          vi.runOnlyPendingTimers();
        });
        currentElement = document.activeElement as HTMLElement;
      }

      // One more right should go to June 1st
      act(() => {
        fireEvent.keyDown(currentElement, { key: 'ArrowRight' });
      });
      act(() => {
        vi.runOnlyPendingTimers();
      });
      const june1 = new Date('2025-06-01');
      const june1Cell = screen.getByLabelText(format(june1, 'EEEE, MMMM d, yyyy'));
      expect(document.activeElement).toBe(june1Cell);
    });

    it.skip('should navigate to next month when at the end', () => {
      render(
        <CLACalendar
          settings={{
            ...getDefaultSettings(),
            displayMode: 'embedded',
            visibleMonths: 2,
            onSubmit: mockOnSubmit
          }}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Focus on last day of June 2025
      const lastDay = new Date('2025-06-30');
      const lastDayCell = screen.getByLabelText(format(lastDay, 'EEEE, MMMM d, yyyy'));
      lastDayCell.focus();

      // Navigate right to go to July 1st
      act(() => {
        fireEvent.keyDown(lastDayCell, { key: 'ArrowRight' });
      });
      act(() => {
        vi.runOnlyPendingTimers();
      });
      const july1 = new Date('2025-07-01');
      const july1Cell = screen.getByLabelText(format(july1, 'EEEE, MMMM d, yyyy'));
      expect(document.activeElement).toBe(july1Cell);
    });

    it.skip('should maintain column position when navigating between months vertically', () => {
      render(
        <CLACalendar
          settings={{
            ...getDefaultSettings(),
            displayMode: 'embedded',
            visibleMonths: 2,
            onSubmit: mockOnSubmit
          }}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Focus on June 3rd (Tuesday in column 2)
      const june3 = new Date('2025-06-03');
      const june3Cell = screen.getByLabelText(format(june3, 'EEEE, MMMM d, yyyy'));
      june3Cell.focus();

      // Navigate up to go to previous month
      act(() => {
        fireEvent.keyDown(june3Cell, { key: 'ArrowUp' });
      });
      act(() => {
        vi.runOnlyPendingTimers();
      });
      
      // Should be on a Tuesday in May (column 2)
      const activeElement = document.activeElement as HTMLElement;
      expect(activeElement.getAttribute('aria-label')).toContain('Tuesday');
    });
  });

  describe('Page Up/Down Navigation', () => {
    it.skip('should navigate months with Page Up/Down', () => {
      const { rerender } = render(
        <CLACalendar
          settings={{
            ...getDefaultSettings(),
            displayMode: 'embedded',
            visibleMonths: 1,
            onSubmit: mockOnSubmit
          }}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Focus on a day in June
      const june15 = new Date('2025-06-15');
      const june15Cell = screen.getByLabelText(format(june15, 'EEEE, MMMM d, yyyy'));
      june15Cell.focus();

      // Page Down to go to next month
      act(() => {
        fireEvent.keyDown(june15Cell, { key: 'PageDown' });
      });
      act(() => {
        vi.runOnlyPendingTimers();
      });

      // Verify July is visible
      const julyHeader = screen.getByText('July 2025');
      expect(julyHeader).toBeInTheDocument();

      // Page Up to go back to June
      const focusedElement = document.activeElement as HTMLElement;
      act(() => {
        fireEvent.keyDown(focusedElement, { key: 'PageUp' });
      });
      act(() => {
        vi.runOnlyPendingTimers();
      });

      const juneHeader = screen.getByText('June 2025');
      expect(juneHeader).toBeInTheDocument();
    });
  });

  describe('Home/End Key Navigation', () => {
    it.skip('should navigate to first/last day of week with Home/End', () => {
      render(
        <CLACalendar
          settings={{
            ...getDefaultSettings(),
            displayMode: 'embedded',
            visibleMonths: 1,
            startWeekOnSunday: false, // Week starts on Monday
            onSubmit: mockOnSubmit
          }}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Focus on June 15 (Sunday)
      const june15 = new Date('2025-06-15');
      const june15Cell = screen.getByLabelText(format(june15, 'EEEE, MMMM d, yyyy'));
      june15Cell.focus();

      // Home should go to Monday (June 9)
      act(() => {
        fireEvent.keyDown(june15Cell, { key: 'Home' });
      });
      act(() => {
        vi.runOnlyPendingTimers();
      });
      const june9 = new Date('2025-06-09');
      const june9Cell = screen.getByLabelText(format(june9, 'EEEE, MMMM d, yyyy'));
      expect(document.activeElement).toBe(june9Cell);

      // End should go to Sunday (June 15)
      act(() => {
        fireEvent.keyDown(june9Cell, { key: 'End' });
      });
      act(() => {
        vi.runOnlyPendingTimers();
      });
      expect(document.activeElement).toBe(june15Cell);
    });

    it.skip('should navigate to first/last day of month with Ctrl+Home/End', () => {
      render(
        <CLACalendar
          settings={{
            ...getDefaultSettings(),
            displayMode: 'embedded',
            visibleMonths: 1,
            onSubmit: mockOnSubmit
          }}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Focus on June 15
      const june15 = new Date('2025-06-15');
      const june15Cell = screen.getByLabelText(format(june15, 'EEEE, MMMM d, yyyy'));
      june15Cell.focus();

      // Ctrl+Home should go to June 1
      act(() => {
        fireEvent.keyDown(june15Cell, { key: 'Home', ctrlKey: true });
      });
      act(() => {
        vi.runOnlyPendingTimers();
      });
      const june1 = new Date('2025-06-01');
      const june1Cell = screen.getByLabelText(format(june1, 'EEEE, MMMM d, yyyy'));
      expect(document.activeElement).toBe(june1Cell);

      // Ctrl+End should go to June 30
      act(() => {
        fireEvent.keyDown(june1Cell, { key: 'End', ctrlKey: true });
      });
      act(() => {
        vi.runOnlyPendingTimers();
      });
      const june30 = new Date('2025-06-30');
      const june30Cell = screen.getByLabelText(format(june30, 'EEEE, MMMM d, yyyy'));
      expect(document.activeElement).toBe(june30Cell);
    });

    it('should skip blank days with Home/End keys', () => {
      render(
        <CLACalendar
          settings={{
            ...getDefaultSettings(),
            displayMode: 'embedded',
            visibleMonths: 1,
            startWeekOnSunday: true,
            onSubmit: mockOnSubmit
          }}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Focus on June 1 (first day of month, which is a Sunday)
      const june1 = new Date('2025-06-01');
      const june1Cell = screen.getByLabelText(format(june1, 'EEEE, MMMM d, yyyy'));
      june1Cell.focus();

      // Home should stay on June 1 (not go to blank days from May)
      act(() => {
        fireEvent.keyDown(june1Cell, { key: 'Home' });
      });
      act(() => {
        vi.runOnlyPendingTimers();
      });
      expect(document.activeElement).toBe(june1Cell);

      // Navigate to June 30 (last day)
      act(() => {
        fireEvent.keyDown(june1Cell, { key: 'End', ctrlKey: true });
      });
      act(() => {
        vi.runOnlyPendingTimers();
      });
      const june30 = new Date('2025-06-30');
      const june30Cell = screen.getByLabelText(format(june30, 'EEEE, MMMM d, yyyy'));
      expect(document.activeElement).toBe(june30Cell);

      // End should stay on June 30 (not go to blank days from July)
      act(() => {
        fireEvent.keyDown(june30Cell, { key: 'End' });
      });
      act(() => {
        vi.runOnlyPendingTimers();
      });
      expect(document.activeElement).toBe(june30Cell);
    });
  });

  describe('Multiple Visible Months Navigation', () => {
    it.skip('should navigate across all visible months with arrow keys', () => {
      render(
        <CLACalendar
          settings={{
            ...getDefaultSettings(),
            displayMode: 'embedded',
            visibleMonths: 3,
            onSubmit: mockOnSubmit
          }}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Focus on last day of first month (June 30)
      const june30 = new Date('2025-06-30');
      const june30Cell = screen.getByLabelText(format(june30, 'EEEE, MMMM d, yyyy'));
      june30Cell.focus();

      // Navigate right to July 1
      act(() => {
        fireEvent.keyDown(june30Cell, { key: 'ArrowRight' });
      });
      act(() => {
        vi.runOnlyPendingTimers();
      });
      const july1 = new Date('2025-07-01');
      const july1Cell = screen.getByLabelText(format(july1, 'EEEE, MMMM d, yyyy'));
      expect(document.activeElement).toBe(july1Cell);

      // Navigate to end of July
      let currentElement = july1Cell;
      for (let i = 0; i < 30; i++) {
        act(() => {
          fireEvent.keyDown(currentElement, { key: 'ArrowRight' });
        });
        act(() => {
          vi.runOnlyPendingTimers();
        });
        currentElement = document.activeElement as HTMLElement;
      }

      // One more right should go to August 1
      act(() => {
        fireEvent.keyDown(currentElement, { key: 'ArrowRight' });
      });
      act(() => {
        vi.runOnlyPendingTimers();
      });
      const aug1 = new Date('2025-08-01');
      const aug1Cell = screen.getByLabelText(format(aug1, 'EEEE, MMMM d, yyyy'));
      expect(document.activeElement).toBe(aug1Cell);
    });

    it.skip('should handle navigation with 6 visible months', () => {
      render(
        <CLACalendar
          settings={{
            ...getDefaultSettings(),
            displayMode: 'embedded',
            visibleMonths: 6,
            monthWidth: 150,
            onSubmit: mockOnSubmit
          }}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Verify all 6 months are visible
      expect(screen.getByText('June 2025')).toBeInTheDocument();
      expect(screen.getByText('July 2025')).toBeInTheDocument();
      expect(screen.getByText('August 2025')).toBeInTheDocument();
      expect(screen.getByText('September 2025')).toBeInTheDocument();
      expect(screen.getByText('October 2025')).toBeInTheDocument();
      expect(screen.getByText('November 2025')).toBeInTheDocument();

      // Focus on June 1
      const june1 = new Date('2025-06-01');
      const june1Cell = screen.getByLabelText(format(june1, 'EEEE, MMMM d, yyyy'));
      june1Cell.focus();

      // Navigate through all months
      // Navigate to last day of November
      const lastDayNov = endOfMonth(new Date('2025-11-01'));
      
      // Use Page Down to quickly navigate through months
      let currentElement = june1Cell;
      for (let i = 0; i < 5; i++) {
        act(() => {
          fireEvent.keyDown(currentElement, { key: 'PageDown' });
        });
        act(() => {
          vi.runOnlyPendingTimers();
        });
        currentElement = document.activeElement as HTMLElement;
      }

      // Verify we can reach November
      const novemberCells = screen.getAllByRole('gridcell').filter(cell => 
        cell.getAttribute('aria-label')?.includes('November')
      );
      expect(novemberCells.length).toBeGreaterThan(0);
    });

    it.skip('should handle navigation with 9 visible months', () => {
      render(
        <CLACalendar
          settings={{
            ...getDefaultSettings(),
            displayMode: 'embedded',
            visibleMonths: 9,
            monthWidth: 120,
            onSubmit: mockOnSubmit
          }}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Verify 9 months are visible (June through February next year)
      expect(screen.getByText('June 2025')).toBeInTheDocument();
      expect(screen.getByText('February 2026')).toBeInTheDocument();

      // Focus on June 15
      const june15 = new Date('2025-06-15');
      const june15Cell = screen.getByLabelText(format(june15, 'EEEE, MMMM d, yyyy'));
      june15Cell.focus();

      // Use Page Down to navigate through all months
      let currentElement = june15Cell;
      for (let i = 0; i < 8; i++) {
        act(() => {
          fireEvent.keyDown(currentElement, { key: 'PageDown' });
        });
        act(() => {
          vi.runOnlyPendingTimers();
        });
        currentElement = document.activeElement as HTMLElement;
      }

      // Should be able to focus on February 2026
      const feb2026Cells = screen.getAllByRole('gridcell').filter(cell => 
        cell.getAttribute('aria-label')?.includes('February') &&
        cell.getAttribute('aria-label')?.includes('2026')
      );
      expect(feb2026Cells.length).toBeGreaterThan(0);
    });
  });

  describe('Tab Navigation', () => {
    it.skip('should tab through calendar controls in correct order', () => {
      render(
        <CLACalendar
          settings={{
            ...getDefaultSettings(),
            displayMode: 'embedded',
            showDateInputs: true,
            showLayersNavigation: true,
            layers: [{
              name: 'holidays',
              title: 'Holidays',
              visible: true,
              data: { events: [] }
            }],
            onSubmit: mockOnSubmit
          }}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Tab through all focusable elements
      const startInput = screen.getByLabelText(/start date/i);
      startInput.focus();

      // Tab to end date input
      act(() => {
        fireEvent.keyDown(startInput, { key: 'Tab' });
      });
      act(() => {
        vi.runOnlyPendingTimers();
      });
      const endInput = screen.getByLabelText(/end date/i);
      expect(document.activeElement).toBe(endInput);

      // Tab to previous month button
      act(() => {
        fireEvent.keyDown(endInput, { key: 'Tab' });
      });
      act(() => {
        vi.runOnlyPendingTimers();
      });
      const prevButton = screen.getByLabelText('Previous month');
      expect(document.activeElement).toBe(prevButton);

      // Tab to next month button
      act(() => {
        fireEvent.keyDown(prevButton, { key: 'Tab' });
      });
      act(() => {
        vi.runOnlyPendingTimers();
      });
      const nextButton = screen.getByLabelText('Next month');
      expect(document.activeElement).toBe(nextButton);

      // Tab to layer navigation (if visible)
      act(() => {
        fireEvent.keyDown(nextButton, { key: 'Tab' });
      });
      act(() => {
        vi.runOnlyPendingTimers();
      });
      const layerButton = screen.getByRole('button', { name: /holidays/i });
      expect(document.activeElement).toBe(layerButton);

      // Tab to calendar grid
      act(() => {
        fireEvent.keyDown(layerButton, { key: 'Tab' });
      });
      act(() => {
        vi.runOnlyPendingTimers();
      });
      const firstFocusableDay = screen.getAllByRole('gridcell').find(
        cell => cell.getAttribute('tabindex') === '0'
      );
      expect(document.activeElement).toBe(firstFocusableDay);
    });

    it.skip('should maintain single tab stop in calendar grid', () => {
      render(
        <CLACalendar
          settings={{
            ...getDefaultSettings(),
            displayMode: 'embedded',
            onSubmit: mockOnSubmit
          }}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Get all gridcells
      const gridCells = screen.getAllByRole('gridcell');
      
      // Only one cell should have tabindex="0"
      const focusableCells = gridCells.filter(
        cell => cell.getAttribute('tabindex') === '0'
      );
      expect(focusableCells).toHaveLength(1);

      // All other cells should have tabindex="-1"
      const nonFocusableCells = gridCells.filter(
        cell => cell.getAttribute('tabindex') === '-1'
      );
      expect(nonFocusableCells).toHaveLength(gridCells.length - 1);
    });
  });

  it('tabs from rightmost month to footer actions (Clear then Submit)', async () => {
    const { container } = render(
      <CLACalendar
        settings={{
          ...getDefaultSettings(),
          displayMode: 'embedded',
          visibleMonths: 2,
          showFooter: true,
          showSubmitButton: true,
          showClearButton: true,
        }}
      />
    );

    // Focus a day in the rightmost month (second month)
    const grids = container.querySelectorAll('[role="grid"]');
    expect(grids.length).toBeGreaterThanOrEqual(2);
    const rightGrid = grids[1];
    const rightMonthCells = rightGrid.querySelectorAll('[role="gridcell"]');
    const focusableCell = Array.from(rightMonthCells).find(el => el.getAttribute('tabindex') === '0') as HTMLElement | undefined;
    (focusableCell || rightMonthCells[0] as HTMLElement).focus();

    // Press Tab and expect Clear to get focus first (if present)
    fireEvent.keyDown(rightGrid, { key: 'Tab' });
    const clearButton = screen.queryByRole('button', { name: /clear/i });
    const submitButton = screen.getByRole('button', { name: /submit/i });
    if (clearButton) {
      expect(document.activeElement).toBe(clearButton);
      // Next Tab should go to Submit
      fireEvent.keyDown(clearButton, { key: 'Tab' });
      expect(document.activeElement).toBe(submitButton);
    } else {
      // If no Clear, it should focus Submit directly
      expect(document.activeElement).toBe(submitButton);
    }
  });

  describe('Selection with Keyboard', () => {
    it.skip('should select date with Space or Enter', () => {
      render(
        <CLACalendar
          settings={{
            ...getDefaultSettings(),
            displayMode: 'embedded',
            selectionMode: 'single',
            onSubmit: mockOnSubmit
          }}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Focus on June 15
      const june15 = new Date('2025-06-15');
      const june15Cell = screen.getByLabelText(format(june15, 'EEEE, MMMM d, yyyy'));
      june15Cell.focus();

      // Select with Space
      act(() => {
        fireEvent.keyDown(june15Cell, { key: ' ', code: 'Space' });
      });
      act(() => {
        vi.runOnlyPendingTimers();
      });
      
      // Verify selection
      expect(june15Cell).toHaveClass('cla-cal-day-selected');

      // Focus on June 20
      const june20 = new Date('2025-06-20');
      const june20Cell = screen.getByLabelText(format(june20, 'EEEE, MMMM d, yyyy'));
      act(() => {
        june20Cell.focus();
      });

      // Select with Enter
      act(() => {
        fireEvent.keyDown(june20Cell, { key: 'Enter' });
      });
      act(() => {
        vi.runOnlyPendingTimers();
      });
      
      // Verify new selection
      expect(june20Cell).toHaveClass('cla-cal-day-selected');
      expect(june15Cell).not.toHaveClass('cla-cal-day-selected');
    });

    it.skip('should select date range in range mode', () => {
      render(
        <CLACalendar
          settings={{
            ...getDefaultSettings(),
            displayMode: 'embedded',
            selectionMode: 'range',
            onSubmit: mockOnSubmit
          }}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Select start date
      const june10 = new Date('2025-06-10');
      const june10Cell = screen.getByLabelText(format(june10, 'EEEE, MMMM d, yyyy'));
      act(() => {
        june10Cell.focus();
      });
      act(() => {
        fireEvent.keyDown(june10Cell, { key: ' ', code: 'Space' });
      });
      act(() => {
        vi.runOnlyPendingTimers();
      });

      // Navigate to end date
      let currentElement = june10Cell;
      for (let i = 0; i < 5; i++) {
        act(() => {
          fireEvent.keyDown(currentElement, { key: 'ArrowRight' });
        });
        act(() => {
          vi.runOnlyPendingTimers();
        });
        currentElement = document.activeElement as HTMLElement;
      }

      // Select end date
      act(() => {
        fireEvent.keyDown(currentElement, { key: ' ', code: 'Space' });
      });
      act(() => {
        vi.runOnlyPendingTimers();
      });

      // Verify range is selected
      const june15 = new Date('2025-06-15');
      const june15Cell = screen.getByLabelText(format(june15, 'EEEE, MMMM d, yyyy'));
      
      expect(june10Cell).toHaveClass('cla-cal-day-range-start');
      expect(june15Cell).toHaveClass('cla-cal-day-range-end');
      
      // Verify days in between have in-range class
      const june12 = new Date('2025-06-12');
      const june12Cell = screen.getByLabelText(format(june12, 'EEEE, MMMM d, yyyy'));
      expect(june12Cell).toHaveClass('cla-cal-day-in-range');
    });
  });

  describe('Escape Key Behavior', () => {
    it.skip('should close popup with Escape key', () => {
      const { rerender } = render(
        <CLACalendar
          settings={{
            ...getDefaultSettings(),
            displayMode: 'popup',
            isOpen: true,
            onSubmit: mockOnSubmit
          }}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Verify popup is open
      const calendar = screen.getByRole('dialog');
      expect(calendar).toBeInTheDocument();

      // Press Escape
      act(() => {
        fireEvent.keyDown(calendar, { key: 'Escape' });
      });
      act(() => {
        vi.runOnlyPendingTimers();
      });

      // Verify onSettingsChange was called to close popup
      expect(mockOnSettingsChange).toHaveBeenCalledWith(
        expect.objectContaining({
          isOpen: false
        })
      );
    });
  });

  describe('Focus Restoration', () => {
    it.skip('should maintain focused date when navigating months', () => {
      render(
        <CLACalendar
          settings={{
            ...getDefaultSettings(),
            displayMode: 'embedded',
            visibleMonths: 1,
            onSubmit: mockOnSubmit
          }}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Focus on June 15
      const june15 = new Date('2025-06-15');
      const june15Cell = screen.getByLabelText(format(june15, 'EEEE, MMMM d, yyyy'));
      june15Cell.focus();

      // Navigate to next month with button
      const nextButton = screen.getByLabelText('Next month');
      act(() => {
        fireEvent.click(nextButton);
      });
      act(() => {
        vi.runOnlyPendingTimers();
      });

      // Focus should move to July 15 (same day in new month)
      const july15 = new Date('2025-07-15');
      const july15Cell = screen.getByLabelText(format(july15, 'EEEE, MMMM d, yyyy'));
      expect(document.activeElement).toBe(july15Cell);
    });

    it.skip('should set initial focus on current date if in view', () => {
      render(
        <CLACalendar
          settings={{
            ...getDefaultSettings(),
            displayMode: 'embedded',
            visibleMonths: 1,
            onSubmit: mockOnSubmit
          }}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Current date is June 15, 2025 (mocked)
      const today = new Date('2025-06-15');
      const todayCell = screen.getByLabelText(format(today, 'EEEE, MMMM d, yyyy'));
      
      // Today should have tabindex="0"
      expect(todayCell).toHaveAttribute('tabindex', '0');
    });

    it('should set initial focus on first day of month if current date not in view', () => {
      // Set system time to a different month
      vi.setSystemTime(new Date('2025-01-15'));

      render(
        <CLACalendar
          settings={{
            ...getDefaultSettings(),
            displayMode: 'embedded',
            visibleMonths: 1,
            onSubmit: mockOnSubmit
          }}
          _onSettingsChange={mockOnSettingsChange}
        />
      );

      // Navigate to June
      const nextButton = screen.getByLabelText('Next month');
      for (let i = 0; i < 5; i++) {
        act(() => {
          fireEvent.click(nextButton);
        });
        act(() => {
          vi.runOnlyPendingTimers();
        });
      }

      // First day of June should have tabindex="0"
      const june1 = new Date('2025-06-01');
      const june1Cell = screen.getByLabelText(format(june1, 'EEEE, MMMM d, yyyy'));
      expect(june1Cell).toHaveAttribute('tabindex', '0');
    });
  });
});