import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { DayCell } from './DayCell';
import { CalendarSettings } from '../../CLACalendar.types';
import { createDate } from '../../../../utils/DateUtils';

// Mock dependencies
vi.mock('../../CalendarComponents/CalendarComponents', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('DayCell Component', () => {
  const defaultProps = {
    date: createDate(2025, 6, 15), // July 15, 2025
    selectedRange: { start: null, end: null },
    isCurrentMonth: true,
    onMouseDown: vi.fn(),
    onMouseEnter: vi.fn(),
    showTooltips: false,
    renderContent: () => null,
    layer: {
      name: 'calendar',
      title: 'Calendar',
      description: 'Base calendar layer',
      visible: true,
      data: {
        events: [],
        background: []
      }
    },
    restrictionConfig: undefined,
    settings: {
      selectionMode: 'range',
      showTooltips: false,
      backgroundColors: {
        selection: '#b1e4e5',
        emptyRows: 'white',
        dayCells: 'transparent'
      }
    } as CalendarSettings,
    rowIndex: 0,
    colIndex: 0
  };

  describe('Single Day Selection in Range Mode', () => {
    it('should apply both range-start and range-end classes when only one day is selected', () => {
      const { container } = render(
        <DayCell
          {...defaultProps}
          selectedRange={{ start: '2025-07-15', end: null }}
        />
      );

      const dayCell = container.querySelector('.day-cell');
      expect(dayCell).toHaveClass('range-start');
      expect(dayCell).toHaveClass('range-end');
      expect(dayCell).toHaveClass('selected');
    });

    it('should apply circular border radius styling for single day selection', () => {
      const { container } = render(
        <DayCell
          {...defaultProps}
          selectedRange={{ start: '2025-07-15', end: null }}
        />
      );

      const dayCell = container.querySelector('.day-cell');
      // The CSS rule .day-cell.range-start.range-end applies border-radius: 50%
      expect(dayCell).toHaveClass('range-start', 'range-end');
    });

    it('should only apply range-start class to start date when range has two different dates', () => {
      const { container } = render(
        <DayCell
          {...defaultProps}
          selectedRange={{ start: '2025-07-15', end: '2025-07-20' }}
        />
      );

      const dayCell = container.querySelector('.day-cell');
      expect(dayCell).toHaveClass('range-start');
      expect(dayCell).not.toHaveClass('range-end');
    });

    it('should only apply range-end class to end date when range has two different dates', () => {
      const { container } = render(
        <DayCell
          {...defaultProps}
          date={createDate(2025, 6, 20)} // July 20, 2025
          selectedRange={{ start: '2025-07-15', end: '2025-07-20' }}
        />
      );

      const dayCell = container.querySelector('.day-cell');
      expect(dayCell).not.toHaveClass('range-start');
      expect(dayCell).toHaveClass('range-end');
    });

    it('should apply both classes when start and end dates are the same', () => {
      const { container } = render(
        <DayCell
          {...defaultProps}
          selectedRange={{ start: '2025-07-15', end: '2025-07-15' }}
        />
      );

      const dayCell = container.querySelector('.day-cell');
      expect(dayCell).toHaveClass('range-start');
      expect(dayCell).toHaveClass('range-end');
    });

    it('should handle chronological ordering correctly', () => {
      // When end date is before start date (user selected backwards)
      const { container } = render(
        <DayCell
          {...defaultProps}
          date={createDate(2025, 6, 10)} // July 10, 2025
          selectedRange={{ start: '2025-07-15', end: '2025-07-10' }}
        />
      );

      const dayCell = container.querySelector('.day-cell');
      // July 10 should be treated as range-start due to chronological ordering
      expect(dayCell).toHaveClass('range-start');
      expect(dayCell).not.toHaveClass('range-end');
    });
  });

  describe('Selection States', () => {
    it('should mark date as selected when it matches start date', () => {
      const { container } = render(
        <DayCell
          {...defaultProps}
          selectedRange={{ start: '2025-07-15', end: null }}
        />
      );

      const dayCell = container.querySelector('.day-cell');
      expect(dayCell).toHaveClass('selected');
    });

    it('should mark date as in range when between start and end dates', () => {
      const { container } = render(
        <DayCell
          {...defaultProps}
          date={createDate(2025, 6, 17)} // July 17, 2025
          selectedRange={{ start: '2025-07-15', end: '2025-07-20' }}
        />
      );

      const dayCell = container.querySelector('.day-cell');
      expect(dayCell).not.toHaveClass('selected');
      expect(dayCell).not.toHaveClass('range-start');
      expect(dayCell).not.toHaveClass('range-end');
      // The component should have the selection background color applied
      expect(dayCell).toHaveStyle({ backgroundColor: '#b1e4e5' });
    });

    it('should not apply selection classes when no dates are selected', () => {
      const { container } = render(
        <DayCell
          {...defaultProps}
          selectedRange={{ start: null, end: null }}
        />
      );

      const dayCell = container.querySelector('.day-cell');
      expect(dayCell).not.toHaveClass('selected');
      expect(dayCell).not.toHaveClass('range-start');
      expect(dayCell).not.toHaveClass('range-end');
    });
  });

  describe('Single Selection Mode', () => {
    it('should apply single-day class in single selection mode', () => {
      const { container } = render(
        <DayCell
          {...defaultProps}
          settings={{
            ...defaultProps.settings,
            selectionMode: 'single'
          } as CalendarSettings}
          selectedRange={{ start: '2025-07-15', end: null }}
        />
      );

      const dayCell = container.querySelector('.day-cell');
      expect(dayCell).toHaveClass('single-day');
      expect(dayCell).toHaveClass('selected');
    });
  });
});