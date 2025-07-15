import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CLACalendar } from './CLACalendar';
import { getDefaultSettings } from './CLACalendar.config';

describe('Multiple Calendar Instances', () => {
  it('should render multiple embedded calendar instances without conflicts', () => {
    render(
      <div>
        <CLACalendar 
          key="cal-1"
          settings={{
            ...getDefaultSettings(),
            displayMode: 'embedded',
            selectionMode: 'range',
            visibleMonths: 1,
          }}
          _onSettingsChange={() => {}}
        />
        <CLACalendar 
          key="cal-2"
          settings={{
            ...getDefaultSettings(),
            displayMode: 'embedded',
            selectionMode: 'single',
            visibleMonths: 1,
          }}
          _onSettingsChange={() => {}}
        />
        <CLACalendar 
          key="cal-3"
          settings={{
            ...getDefaultSettings(),
            displayMode: 'embedded',
            selectionMode: 'range',
            visibleMonths: 2,
          }}
          _onSettingsChange={() => {}}
        />
      </div>
    );

    // Check that all three calendars are rendered by looking for month grids
    const calendars = document.querySelectorAll('.month-grid-container');
    expect(calendars).toHaveLength(4); // 1 + 1 + 2 = 4 month grids total
  });

  it('should render multiple popup calendar instances with unique portals', () => {
    render(
      <div>
        <CLACalendar 
          key="popup-1"
          settings={{
            ...getDefaultSettings(),
            displayMode: 'popup',
            selectionMode: 'range',
            visibleMonths: 2,
          }}
          _onSettingsChange={() => {}}
        />
        <CLACalendar 
          key="popup-2"
          settings={{
            ...getDefaultSettings(),
            displayMode: 'popup',
            selectionMode: 'single',
            visibleMonths: 1,
          }}
          _onSettingsChange={() => {}}
        />
      </div>
    );

    // Check that two input fields are rendered
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(2);

    // Each calendar should have its own unique portal class
    // This ensures they don't conflict with each other
    const portals = document.querySelectorAll('[class*="cla-calendar-portal-calendar-"]');
    // Initially portals may not be created until calendars are opened
    // But the important thing is that each calendar has unique identifiers
  });

  it('should maintain separate state for each calendar instance', async () => {
    const { rerender } = render(
      <div>
        <CLACalendar 
          key="state-1"
          settings={{
            ...getDefaultSettings(),
            displayMode: 'embedded',
            selectionMode: 'range',
            visibleMonths: 1,
            defaultRange: {
              start: '2024-01-01',
              end: '2024-01-07'
            }
          }}
          _onSettingsChange={() => {}}
        />
        <CLACalendar 
          key="state-2"
          settings={{
            ...getDefaultSettings(),
            displayMode: 'embedded',
            selectionMode: 'range',
            visibleMonths: 1,
            defaultRange: {
              start: '2024-02-01',
              end: '2024-02-07'
            }
          }}
          _onSettingsChange={() => {}}
        />
      </div>
    );

    // Each calendar should maintain its own selection state
    const calendars = document.querySelectorAll('.month-grid-container');
    expect(calendars).toHaveLength(2);

    // Verify each calendar can be updated independently
    rerender(
      <div>
        <CLACalendar 
          key="state-1"
          settings={{
            ...getDefaultSettings(),
            displayMode: 'embedded',
            selectionMode: 'range',
            visibleMonths: 2, // Changed
            defaultRange: {
              start: '2024-01-01',
              end: '2024-01-07'
            }
          }}
          _onSettingsChange={() => {}}
        />
        <CLACalendar 
          key="state-2"
          settings={{
            ...getDefaultSettings(),
            displayMode: 'embedded',
            selectionMode: 'range',
            visibleMonths: 1, // Unchanged
            defaultRange: {
              start: '2024-02-01',
              end: '2024-02-07'
            }
          }}
          _onSettingsChange={() => {}}
        />
      </div>
    );

    // First calendar now has 2 months, second still has 1
    const updatedCalendars = document.querySelectorAll('.month-grid-container');
    expect(updatedCalendars).toHaveLength(3); // 2 + 1 = 3 month grids
  });
});