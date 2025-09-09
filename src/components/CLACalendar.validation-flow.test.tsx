import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CLACalendar from './CLACalendar';
import { createCalendarSettings } from './CLACalendar.config';
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
});
