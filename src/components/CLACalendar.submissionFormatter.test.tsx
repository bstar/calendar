import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CLACalendar } from './CLACalendar';
import { createCalendarSettings } from './CLACalendar.config';
import { format } from '../utils/DateUtils';

describe('CLACalendar - submissionFormatter', () => {
  const defaultProps = {
    settings: createCalendarSettings({
      displayMode: 'embedded',
      selectionMode: 'range',
      showSubmitButton: true,
      showFooter: true,
      // Set a specific date to ensure consistent test behavior
      defaultRange: { start: '2025-01-15', end: '2025-01-15' }
    })
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Backward Compatibility', () => {
    it('should submit dates in ISO format when submissionFormatter is not provided', async () => {
      const handleSubmit = vi.fn();
      
      const { container } = render(
        <CLACalendar
          {...defaultProps}
          settings={createCalendarSettings({
            ...defaultProps.settings,
            onSubmit: handleSubmit,
            defaultRange: { start: '2025-01-15', end: '2025-01-15' },
            // No submissionFormatter provided
          })}
        />
      );

      // Select start date (15th of current month)
      // Use aria-label to select specific dates (includes day of week)
      const startDate = container.querySelector('[aria-label*="January 15, 2025"]') as HTMLElement;
      const endDate = container.querySelector('[aria-label*="January 20, 2025"]') as HTMLElement;
      
      if (startDate && endDate) {
        // Use mouseDown/mouseUp for range selection
        fireEvent.mouseDown(startDate, { clientX: 100, clientY: 100, button: 0 });
        fireEvent.mouseEnter(endDate);
        fireEvent.mouseUp(endDate);
        
        // Click submit button
        const submitButton = screen.getByText('Submit');
        fireEvent.click(submitButton);
        
        // Should be called with ISO format (YYYY-MM-DD)
        await waitFor(() => {
          expect(handleSubmit).toHaveBeenCalled();
          const [start, end] = handleSubmit.mock.calls[0];
          expect(start).toMatch(/^\d{4}-\d{2}-15$/); // YYYY-MM-15
          expect(end).toMatch(/^\d{4}-\d{2}-20$/);   // YYYY-MM-20
        });
      }
    });

    it('should maintain existing behavior with dateFormatter only affecting display', async () => {
      const handleSubmit = vi.fn();
      const dateFormatter = vi.fn((date: Date) => format(date, 'dd/MM/yyyy'));
      
      const { container } = render(
        <CLACalendar
          {...defaultProps}
          settings={createCalendarSettings({
            ...defaultProps.settings,
            onSubmit: handleSubmit,
            defaultRange: { start: '2025-01-15', end: '2025-01-15' },
            dateFormatter, // Only visual formatting
            // No submissionFormatter
          })}
        />
      );

      // Use aria-label to select specific date (includes day of week)
      const startDate = container.querySelector('[aria-label*="January 15, 2025"]') as HTMLElement;
      
      if (startDate) {
        fireEvent.mouseDown(startDate, { clientX: 100, clientY: 100, button: 0 });
        fireEvent.mouseUp(startDate);
        
        const submitButton = screen.getByText('Submit');
        fireEvent.click(submitButton);
        
        await waitFor(() => {
          expect(handleSubmit).toHaveBeenCalled();
          const [start, end] = handleSubmit.mock.calls[0];
          // Still ISO format, not affected by dateFormatter
          expect(start).toMatch(/^\d{4}-\d{2}-15$/);
          expect(end).toMatch(/^\d{4}-\d{2}-15$/);
        });
      }
    });
  });

  describe('Custom Submission Format', () => {
    it('should use submissionFormatter when provided', async () => {
      const handleSubmit = vi.fn();
      const submissionFormatter = vi.fn((date: Date) => format(date, 'MM/dd/yyyy'));
      
      const { container } = render(
        <CLACalendar
          {...defaultProps}
          settings={createCalendarSettings({
            ...defaultProps.settings,
            onSubmit: handleSubmit,
            defaultRange: { start: '2025-01-15', end: '2025-01-15' },
            submissionFormatter,
          })}
        />
      );

      // Use aria-label to select specific dates (includes day of week)
      const startDate = container.querySelector('[aria-label*="January 15, 2025"]') as HTMLElement;
      const endDate = container.querySelector('[aria-label*="January 20, 2025"]') as HTMLElement;
      
      if (startDate && endDate) {
        // Use mouseDown/mouseUp for range selection
        fireEvent.mouseDown(startDate, { clientX: 100, clientY: 100, button: 0 });
        fireEvent.mouseEnter(endDate);
        fireEvent.mouseUp(endDate);
        
        const submitButton = screen.getByText('Submit');
        fireEvent.click(submitButton);
        
        await waitFor(() => {
          expect(handleSubmit).toHaveBeenCalled();
          expect(submissionFormatter).toHaveBeenCalledTimes(2); // Once for start, once for end
          
          const [start, end] = handleSubmit.mock.calls[0];
          expect(start).toMatch(/^\d{2}\/15\/\d{4}$/); // MM/15/yyyy
          expect(end).toMatch(/^\d{2}\/20\/\d{4}$/);   // MM/20/yyyy
        });
      }
    });

    it('should support timestamp format for submission', async () => {
      const handleSubmit = vi.fn();
      const submissionFormatter = (date: Date) => date.getTime().toString();
      
      const { container } = render(
        <CLACalendar
          {...defaultProps}
          settings={createCalendarSettings({
            ...defaultProps.settings,
            onSubmit: handleSubmit,
            defaultRange: { start: '2025-01-15', end: '2025-01-15' },
            submissionFormatter,
          })}
        />
      );

      // Use aria-label to select specific date (includes day of week)
      const dateToSelect = container.querySelector('[aria-label*="January 15, 2025"]') as HTMLElement;
      
      if (dateToSelect) {
        fireEvent.mouseDown(dateToSelect, { clientX: 100, clientY: 100, button: 0 });
        fireEvent.mouseUp(dateToSelect);
        fireEvent.mouseUp(dateToSelect);
        
        const submitButton = screen.getByText('Submit');
        fireEvent.click(submitButton);
        
        await waitFor(() => {
          expect(handleSubmit).toHaveBeenCalled();
          const [start, end] = handleSubmit.mock.calls[0];
          
          // Should be timestamps
          expect(start).toMatch(/^\d{13}$/); // Unix timestamp in milliseconds
          expect(end).toMatch(/^\d{13}$/);
          expect(Number(start)).toBeGreaterThan(0);
        });
      }
    });

    it('should support ISO string format for submission', async () => {
      const handleSubmit = vi.fn();
      const submissionFormatter = (date: Date) => date.toISOString();
      
      const { container } = render(
        <CLACalendar
          {...defaultProps}
          settings={createCalendarSettings({
            ...defaultProps.settings,
            onSubmit: handleSubmit,
            defaultRange: { start: '2025-01-15', end: '2025-01-15' },
            submissionFormatter,
          })}
        />
      );

      // Use aria-label to select specific date (includes day of week)
      const dateToSelect = container.querySelector('[aria-label*="January 15, 2025"]') as HTMLElement;
      
      if (dateToSelect) {
        fireEvent.mouseDown(dateToSelect, { clientX: 100, clientY: 100, button: 0 });
        fireEvent.mouseUp(dateToSelect);
        fireEvent.mouseUp(dateToSelect);
        
        const submitButton = screen.getByText('Submit');
        fireEvent.click(submitButton);
        
        await waitFor(() => {
          expect(handleSubmit).toHaveBeenCalled();
          const [start, end] = handleSubmit.mock.calls[0];
          
          // Should be full ISO strings with time
          expect(start).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
          expect(end).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
        });
      }
    });
  });

  describe('Independence of Formatters', () => {
    it('should have different formats for display and submission', async () => {
      const handleSubmit = vi.fn();
      const dateFormatter = (date: Date) => format(date, 'MMM dd, yyyy'); // Display: "Jan 15, 2025"
      const submissionFormatter = (date: Date) => format(date, 'yyyy/MM/dd'); // Submit: "2025/01/15"
      
      const { container } = render(
        <CLACalendar
          {...defaultProps}
          settings={createCalendarSettings({
            ...defaultProps.settings,
            onSubmit: handleSubmit,
            dateFormatter,
            submissionFormatter,
            defaultRange: { start: '2025-01-15', end: '2025-01-20' }
          })}
        />
      );

      // Check that display format is applied to input
      const input = container.querySelector('.cla-input-custom') as HTMLInputElement;
      if (input) {
        expect(input.value).toContain('Jan'); // Display format
        expect(input.value).not.toContain('2025/01'); // Not submission format
      }

      // Click submit to check submission format
      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalled();
        const [start, end] = handleSubmit.mock.calls[0];
        
        // Submission format (yyyy/MM/dd)
        expect(start).toBe('2025/01/15');
        expect(end).toBe('2025/01/20');
        
        // Not display format
        expect(start).not.toContain('Jan');
        expect(end).not.toContain('Jan');
      });
    });

    it('should allow dateFormatter without submissionFormatter', async () => {
      const handleSubmit = vi.fn();
      const dateFormatter = (date: Date) => format(date, 'dd.MM.yyyy');
      
      const { container } = render(
        <CLACalendar
          {...defaultProps}
          settings={createCalendarSettings({
            ...defaultProps.settings,
            onSubmit: handleSubmit,
            dateFormatter,
            // No submissionFormatter - should use ISO
            defaultRange: { start: '2025-01-15', end: '2025-01-20' }
          })}
        />
      );

      // Display format in input
      const input = container.querySelector('.cla-input-custom') as HTMLInputElement;
      if (input) {
        expect(input.value).toContain('15.01.2025'); // Display format
      }

      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalled();
        const [start, end] = handleSubmit.mock.calls[0];
        
        // Should still be ISO format
        expect(start).toBe('2025-01-15');
        expect(end).toBe('2025-01-20');
      });
    });

    it('should allow submissionFormatter without dateFormatter', async () => {
      const handleSubmit = vi.fn();
      const submissionFormatter = (date: Date) => format(date, 'dd-MM-yyyy');
      
      const { container } = render(
        <CLACalendar
          {...defaultProps}
          settings={createCalendarSettings({
            ...defaultProps.settings,
            onSubmit: handleSubmit,
            submissionFormatter,
            // No dateFormatter - should use default display
            defaultRange: { start: '2025-01-15', end: '2025-01-20' }
          })}
        />
      );

      // Default display format in input
      const input = container.querySelector('.cla-input-custom') as HTMLInputElement;
      if (input) {
        expect(input.value).toContain('Jan 15'); // Default display format
      }

      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalled();
        const [start, end] = handleSubmit.mock.calls[0];
        
        // Custom submission format
        expect(start).toBe('15-01-2025');
        expect(end).toBe('20-01-2025');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle single date selection with submissionFormatter', async () => {
      const handleSubmit = vi.fn();
      const submissionFormatter = (date: Date) => format(date, 'yyyy.MM.dd');
      
      const { container } = render(
        <CLACalendar
          {...defaultProps}
          settings={createCalendarSettings({
            ...defaultProps.settings,
            selectionMode: 'range',
            onSubmit: handleSubmit,
            defaultRange: { start: '2025-01-15', end: '2025-01-15' },
            submissionFormatter,
          })}
        />
      );

      // Use aria-label to select specific date (includes day of week)
      const dateToSelect = container.querySelector('[aria-label*="January 15, 2025"]') as HTMLElement;
      
      if (dateToSelect) {
        // Single click without drag
        fireEvent.mouseDown(dateToSelect);
        fireEvent.mouseUp(dateToSelect);
        
        const submitButton = screen.getByText('Submit');
        fireEvent.click(submitButton);
        
        await waitFor(() => {
          expect(handleSubmit).toHaveBeenCalled();
          const [start, end] = handleSubmit.mock.calls[0];
          
          // Both should be the same formatted date
          expect(start).toMatch(/^\d{4}\.01\.15$/);
          expect(end).toMatch(/^\d{4}\.01\.15$/);
          expect(start).toBe(end);
        });
      }
    });

    it('should handle formatter that throws error gracefully', async () => {
      const handleSubmit = vi.fn();
      const submissionFormatter = vi.fn(() => {
        throw new Error('Formatter error!');
      });
      
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = vi.fn();
      
      const { container } = render(
        <CLACalendar
          {...defaultProps}
          settings={createCalendarSettings({
            ...defaultProps.settings,
            onSubmit: handleSubmit,
            defaultRange: { start: '2025-01-15', end: '2025-01-15' },
            submissionFormatter,
          })}
        />
      );

      // Use aria-label to select specific date (includes day of week)
      const dateToSelect = container.querySelector('[aria-label*="January 15, 2025"]') as HTMLElement;
      
      if (dateToSelect) {
        fireEvent.mouseDown(dateToSelect, { clientX: 100, clientY: 100, button: 0 });
        fireEvent.mouseUp(dateToSelect);
        fireEvent.mouseUp(dateToSelect);
        
        const submitButton = screen.getByText('Submit');
        
        // Should not crash when clicking submit
        expect(() => fireEvent.click(submitButton)).not.toThrow();
      }
      
      // Restore console.error
      console.error = originalError;
    });

    it('should handle null formatter correctly', async () => {
      const handleSubmit = vi.fn();
      
      const { container } = render(
        <CLACalendar
          {...defaultProps}
          settings={createCalendarSettings({
            ...defaultProps.settings,
            onSubmit: handleSubmit,
            defaultRange: { start: '2025-01-25', end: '2025-01-25' },
            submissionFormatter: undefined,
          })}
        />
      );

      // Use aria-label to select specific date (includes day of week)
      const dateToSelect = container.querySelector('[aria-label*="January 15, 2025"]') as HTMLElement;
      
      if (dateToSelect) {
        fireEvent.mouseDown(dateToSelect, { clientX: 100, clientY: 100, button: 0 });
        fireEvent.mouseUp(dateToSelect);
        fireEvent.mouseUp(dateToSelect);
        
        const submitButton = screen.getByText('Submit');
        fireEvent.click(submitButton);
        
        await waitFor(() => {
          expect(handleSubmit).toHaveBeenCalled();
          const [start] = handleSubmit.mock.calls[0];
          // Should use ISO format as default
          expect(start).toMatch(/^\d{4}-\d{2}-15$/);
        });
      }
    });
  });

  describe('Single Selection Mode', () => {
    it('should work with submissionFormatter in single selection mode', async () => {
      const handleSubmit = vi.fn();
      const submissionFormatter = (date: Date) => {
        // Use UTC methods to avoid timezone issues in tests
        const day = date.getUTCDate();
        const month = date.getUTCMonth() + 1;
        const year = date.getUTCFullYear();
        return `${month}/${day}/${year}`;
      };
      
      const { container } = render(
        <CLACalendar
          {...defaultProps}
          settings={createCalendarSettings({
            ...defaultProps.settings,
            selectionMode: 'single',
            onSubmit: handleSubmit,
            defaultRange: { start: '2025-01-25', end: '2025-01-25' },
            submissionFormatter,
          })}
        />
      );

      // Use aria-label to select the specific date (includes day of week)
      const dateToSelect = container.querySelector('[aria-label*="January 25, 2025"]') as HTMLElement;
      
      if (dateToSelect) {
        fireEvent.mouseDown(dateToSelect, { clientX: 100, clientY: 100, button: 0 });
        fireEvent.mouseUp(dateToSelect);
        
        const submitButton = screen.getByText('Submit');
        fireEvent.click(submitButton);
        
        await waitFor(() => {
          expect(handleSubmit).toHaveBeenCalled();
          const [start, end] = handleSubmit.mock.calls[0];
          
          // In single mode, both dates are the same
          expect(start).toMatch(/^\d{1,2}\/25\/\d{4}$/);
          expect(end).toMatch(/^\d{1,2}\/25\/\d{4}$/);
          expect(start).toBe(end);
        });
      }
    });
  });
});