import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CLACalendar from './CLACalendar';
import { createCalendarSettings } from './CLACalendar.config';
import { format } from '../utils/DateUtils';
import '@testing-library/jest-dom';

const boundaryRestrictions = {
  restrictions: [
    {
      type: 'boundary',
      enabled: true,
      date: '2025-01-01',
      direction: 'before',
      inclusive: false,
      message: 'Please select dates in 2025 or later'
    },
    {
      type: 'boundary',
      enabled: true,
      date: '2025-12-31',
      direction: 'after',
      inclusive: true,
      message: 'Please select dates in 2025 or earlier'
    }
  ]
};

describe('CLACalendar validation and submit flow', () => {
  it('keeps popup open and shows error on reversed range submit (no blur)', async () => {
    const onSubmit = vi.fn();

    const { container } = render(
      <CLACalendar
        settings={createCalendarSettings({
          displayMode: 'popup',
          selectionMode: 'range',
          visibleMonths: 2,
          monthWidth: 300,
          showSubmitButton: true,
          showFooter: true,
          defaultRange: { start: '2025-09-10', end: '2025-09-10' },
          restrictionConfigFactory: () => boundaryRestrictions,
          timezone: 'UTC',
          dateRangeSeparator: ' - ',
          onSubmit
        })}
      />
    );

    // Open popup by clicking internal input
    const triggerInput = container.querySelector('.cla-input-custom') as HTMLInputElement | null;
    // If no internal custom input (embedded case), find the first input.date-input
    if (triggerInput) {
      fireEvent.click(triggerInput);
    } else {
      // Alternatively, simulate open by clicking into calendar area
      const wrapper = container.querySelector('.cla-calendar-wrapper');
      expect(wrapper).toBeInTheDocument();
    }

    // Fill start and end inputs (reversed)
    const inputs = document.querySelectorAll('input.date-input') as NodeListOf<HTMLInputElement>;
    expect(inputs.length).toBeGreaterThanOrEqual(2);
    const startInput = inputs[0];
    const endInput = inputs[1];

    fireEvent.change(startInput, { target: { value: '09/10/2025' } });
    fireEvent.change(endInput, { target: { value: '09/08/2025' } });

    // Click Submit directly (no blur/enter)
    const submitButton = screen.getByText('Submit');
    fireEvent.mouseDown(submitButton); // prevent blur path
    fireEvent.click(submitButton);

    // Should show inline error and remain open
    await waitFor(() => {
      const error = document.querySelector('.date-input-error.show');
      expect(error).toBeInTheDocument();
      expect(error?.textContent).toMatch(/End date must be after start date/i);
    });

    // Portal should still be present (popup remains open)
    const portal = document.querySelector('.cla-calendar-portal');
    expect(portal).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('clears inline errors after a manual mouse selection (embedded)', async () => {
    const onSubmit = vi.fn();

    const { container } = render(
      <CLACalendar
        settings={createCalendarSettings({
          displayMode: 'embedded',
          selectionMode: 'range',
          visibleMonths: 2,
          monthWidth: 300,
          showSubmitButton: true,
          showFooter: true,
          defaultRange: { start: '2025-09-10', end: '2025-09-10' },
          restrictionConfigFactory: () => boundaryRestrictions,
          timezone: 'UTC',
          dateRangeSeparator: ' - ',
          onSubmit
        })}
      />
    );

    // Cause an error first: reversed range & submit
    const inputs = container.querySelectorAll('input.date-input') as NodeListOf<HTMLInputElement>;
    expect(inputs.length).toBeGreaterThanOrEqual(2);

    fireEvent.change(inputs[0], { target: { value: '09/10/2025' } });
    fireEvent.change(inputs[1], { target: { value: '09/08/2025' } });
    const submitButton = screen.getByText('Submit');
    fireEvent.mouseDown(submitButton);
    fireEvent.click(submitButton);

    await waitFor(() => {
      const error = container.querySelector('.date-input-error.show');
      expect(error).toBeInTheDocument();
    });

    // Now perform a mouse selection for a valid range (e.g., 12 to 15)
    const dayCells = container.querySelectorAll('.day-cell');
    const startCell = Array.from(dayCells).find((c) => c.textContent === '12');
    const endCell = Array.from(dayCells).find((c) => c.textContent === '15');
    expect(startCell && endCell).toBeTruthy();

    if (startCell && endCell) {
      fireEvent.mouseDown(startCell);
      fireEvent.mouseEnter(endCell);
      fireEvent.mouseUp(endCell);
    }

    // Errors should be cleared by mouse selection
    await waitFor(() => {
      const error = container.querySelector('.date-input-error.show');
      expect(error).not.toBeInTheDocument();
    });
  });

  it('only closes popup after a successful submit', async () => {
    const onSubmit = vi.fn();

    const { container } = render(
      <CLACalendar
        settings={createCalendarSettings({
          displayMode: 'popup',
          selectionMode: 'range',
          visibleMonths: 2,
          monthWidth: 300,
          showSubmitButton: true,
          showFooter: true,
          defaultRange: { start: '2025-09-10', end: '2025-09-10' },
          restrictionConfigFactory: () => boundaryRestrictions,
          timezone: 'UTC',
          dateRangeSeparator: ' - ',
          onSubmit
        })}
      />
    );

    const triggerInput = container.querySelector('.cla-input-custom') as HTMLInputElement | null;
    if (triggerInput) {
      fireEvent.click(triggerInput);
    }

    const inputs = document.querySelectorAll('input.date-input') as NodeListOf<HTMLInputElement>;
    const startInput = inputs[0];
    const endInput = inputs[1];

    // First, invalid reversed submit (should not close)
    fireEvent.change(startInput, { target: { value: '09/10/2025' } });
    fireEvent.change(endInput, { target: { value: '09/08/2025' } });

    let submitButton = screen.getByText('Submit');
    fireEvent.mouseDown(submitButton);
    fireEvent.click(submitButton);

    await waitFor(() => {
      const error = document.querySelector('.date-input-error.show');
      expect(error).toBeInTheDocument();
    });

    // Portal still open
    expect(document.querySelector('.cla-calendar-portal')).toBeInTheDocument();

    // Fix to a valid range and submit again (should close)
    fireEvent.change(endInput, { target: { value: '09/12/2025' } });
    submitButton = screen.getByText('Submit');
    fireEvent.mouseDown(submitButton);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });

    // Portal should be gone
    await waitFor(() => {
      expect(document.querySelector('.cla-calendar-portal')).not.toBeInTheDocument();
    });
  });

  it('blocks typed end outside restriction on immediate submit (embedded)', async () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <CLACalendar
        settings={createCalendarSettings({
          displayMode: 'embedded',
          selectionMode: 'range',
          visibleMonths: 2,
          showSubmitButton: true,
          showFooter: true,
          defaultRange: { start: '2025-09-10', end: '2025-09-10' },
          restrictionConfigFactory: () => boundaryRestrictions,
          timezone: 'UTC',
          dateRangeSeparator: ' - ',
        })}
        onSubmit={onSubmit}
      />
    );

    const inputs = container.querySelectorAll('input.date-input') as NodeListOf<HTMLInputElement>;
    const startInput = inputs[0];
    const endInput = inputs[1];

    // Valid start in 2025
    fireEvent.change(startInput, { target: { value: '09/10/2025' } });
    // End outside boundary (2026)
    fireEvent.change(endInput, { target: { value: '01/05/2026' } });

    const submitButton = screen.getByText('Submit');
    fireEvent.mouseDown(submitButton);
    fireEvent.click(submitButton);

    // The inputs validate on blur/Enter. Since we intentionally submitted without blurring,
    // assert no submit happened, then trigger blur on End to surface the inline error state.
    expect(onSubmit).not.toHaveBeenCalled();
    fireEvent.blur(endInput);
    // Still no submission and calendar remains open
    expect(onSubmit).not.toHaveBeenCalled();
    const wrapper = container.querySelector('.cla-calendar-wrapper');
    expect(wrapper?.getAttribute('data-open')).toBe('true');
  });

  it('uses " to " separator for external input display when configured', async () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <CLACalendar
        settings={createCalendarSettings({
          displayMode: 'popup',
          selectionMode: 'range',
          visibleMonths: 2,
          dateRangeSeparator: ' to ',
          dateFormatter: (date) => format(date, 'MMM dd, yyyy', 'UTC'),
          defaultRange: { start: '2025-09-10', end: '2025-09-12' },
        })}
        onSubmit={onSubmit}
      />
    );

    // Open popup
    const triggerInput = container.querySelector('.cla-input-custom') as HTMLInputElement | null;
    if (triggerInput) {
      fireEvent.click(triggerInput);
    }

    // Submit the default range
    const submitButton = screen.queryByText('Submit');
    if (submitButton) {
      fireEvent.mouseDown(submitButton);
      fireEvent.click(submitButton);
    }

    // After submit, external input should display with " to "
    await waitFor(() => {
      const external = container.querySelector('.cla-input-custom') as HTMLInputElement | null;
      expect(external?.value).toMatch(/ to /);
      expect(external?.value).toMatch(/Sep 10, 2025 to Sep 12, 2025/i);
    });
  });
});
