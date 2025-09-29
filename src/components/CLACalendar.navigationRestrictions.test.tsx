import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { CLACalendar } from './CLACalendar';
import { getDefaultSettings, createCalendarSettings } from './CLACalendar.config';

/**
 * Navigation Restrictions - targeted tests
 * - "before" means minimum FIRST visible month (inclusive)
 * - "after" means maximum LAST visible month (inclusive)
 */

describe('CLACalendar - Navigation Restrictions', () => {

  it('disables prev at before edge and next at after edge (visibleMonths=2)', async () => {
    const settings = createCalendarSettings({
      displayMode: 'popup',
      isOpen: true,
      visibleMonths: 2,
      showDateInputs: true,
      defaultRange: { start: '2025-09-10', end: '2025-09-12' },
      navigationRestrictions: {
        restrictions: [
          { direction: 'before', date: '2025-09-01', message: 'Minimum month reached' },
          { direction: 'after', date: '2025-12-31', message: 'Maximum month reached' }
        ]
      }
    });

    const { container } = render(
      <CLACalendar
        settings={settings}
        onSubmit={() => {}}
      />
    );

    // At start: first visible month should be September 2025, last October 2025
    await waitFor(() => expect(screen.getByText('September 2025 - October 2025')).toBeInTheDocument());

    const prevBtn = screen.getByLabelText('Previous month') as HTMLButtonElement;
    const nextBtn = screen.getByLabelText('Next month') as HTMLButtonElement;

    // At min edge: prev should be disabled, next enabled
    expect(prevBtn.disabled).toBe(true);
    expect(nextBtn.disabled).toBe(false);

    // Click next twice: Sep/Oct -> Oct/Nov -> Nov/Dec
    act(() => { fireEvent.click(nextBtn); });
    await waitFor(() => expect(screen.getByText('October 2025 - November 2025')).toBeInTheDocument());

    act(() => { fireEvent.click(nextBtn); });
    await waitFor(() => expect(screen.getByText('November 2025 - December 2025')).toBeInTheDocument());

    // At max edge: next should now be disabled
    expect(nextBtn.disabled).toBe(true);
    // And prev is enabled
    expect(prevBtn.disabled).toBe(false);
  });

  it('clamps initial months when initialized outside window (before)', async () => {
    const settings = createCalendarSettings({
      displayMode: 'popup',
      isOpen: true,
      visibleMonths: 2,
      defaultRange: { start: '2025-06-10', end: '2025-06-12' },
      navigationRestrictions: {
        restrictions: [
          { direction: 'before', date: '2025-09-01' },
          { direction: 'after', date: '2025-12-31' }
        ]
      }
    });

    render(<CLACalendar settings={settings} onSubmit={() => {}} />);

    // Should clamp to Sep/Oct window on initial render
    await waitFor(() => expect(screen.getByText('September 2025 - October 2025')).toBeInTheDocument());
  });

  it('input validation blocks dates outside window with configured message', async () => {
    const settings = createCalendarSettings({
      displayMode: 'popup',
      isOpen: true,
      visibleMonths: 2,
      showDateInputs: true,
      navigationRestrictions: {
        restrictions: [
          { direction: 'before', date: '2025-09-01', message: 'Min month is September 2025' },
          { direction: 'after', date: '2025-12-31', message: 'Max month is December 2025' }
        ]
      }
    });

    const { container } = render(<CLACalendar settings={settings} onSubmit={() => {}} />);

    // Type a date before the allowed min month
    const input = screen.getAllByLabelText(/start date/i)[0] as HTMLInputElement;
    act(() => {
      fireEvent.change(input, { target: { value: '2025-08-15' } });
      fireEvent.blur(input);
    });

    // Error should surface with configured message (rendered in portal)
    await waitFor(() => {
      const alerts = screen.getAllByRole('alert');
      const errorEl = alerts.find(a => a.textContent?.includes('Min month is September 2025')) as HTMLElement | undefined;
      expect(errorEl).toBeTruthy();
    });
  });
});
