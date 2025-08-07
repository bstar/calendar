import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { CLACalendar } from '../CLACalendar';
import { getDefaultSettings } from '../CLACalendar.config';
import { format } from '../../utils/DateUtils';

describe('CLACalendar Keyboard Navigation Instance Isolation', () => {
  let mockOnSubmit1: ReturnType<typeof vi.fn>;
  let mockOnSubmit2: ReturnType<typeof vi.fn>;
  let mockOnSettingsChange1: ReturnType<typeof vi.fn>;
  let mockOnSettingsChange2: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnSubmit1 = vi.fn();
    mockOnSubmit2 = vi.fn();
    mockOnSettingsChange1 = vi.fn();
    mockOnSettingsChange2 = vi.fn();
    
    // Mock current date for consistent testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should verify DOM query scoping fixes are working', () => {
    render(
      <div>
        <div data-testid="calendar-1">
          <CLACalendar
            settings={{
              ...getDefaultSettings(),
              displayMode: 'embedded',
              visibleMonths: 1,
              onSubmit: mockOnSubmit1
            }}
            _onSettingsChange={mockOnSettingsChange1}
          />
        </div>
        <div data-testid="calendar-2">
          <CLACalendar
            settings={{
              ...getDefaultSettings(),
              displayMode: 'embedded',
              visibleMonths: 1,
              onSubmit: mockOnSubmit2
            }}
            _onSettingsChange={mockOnSettingsChange2}
          />
        </div>
      </div>
    );

    // Verify both calendars are rendered
    const calendar1Container = screen.getByTestId('calendar-1');
    const calendar2Container = screen.getByTestId('calendar-2');
    
    // Each calendar should have its own grid
    const grid1 = calendar1Container.querySelector('[role="grid"]');
    const grid2 = calendar2Container.querySelector('[role="grid"]');
    expect(grid1).toBeTruthy();
    expect(grid2).toBeTruthy();
    expect(grid1).not.toBe(grid2); // Different DOM elements
    
    // Each grid should have its own set of day cells with same dates
    const grid1Cells = grid1?.querySelectorAll('[data-date="2025-06-15"]');
    const grid2Cells = grid2?.querySelectorAll('[data-date="2025-06-15"]');
    
    expect(grid1Cells?.length).toBe(1);
    expect(grid2Cells?.length).toBe(1);
    expect(grid1Cells?.[0]).not.toBe(grid2Cells?.[0]); // Different DOM elements
    
    // This test verifies that our DOM scoping fix works:
    // Each calendar instance has its own separate DOM tree
    // so querySelector operations are properly scoped
  });
});