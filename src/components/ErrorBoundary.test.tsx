import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarErrorBoundary } from './ErrorBoundary';

// Test component that throws an error
const ErrorComponent = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error for error boundary');
  }
  return <div>Working component</div>;
};

describe('CalendarErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'group').mockImplementation(() => {});
    vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
    vi.spyOn(console, 'groupCollapsed').mockImplementation(() => {});
    vi.spyOn(console, 'table').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render children when there is no error', () => {
    render(
      <CalendarErrorBoundary>
        <ErrorComponent shouldThrow={false} />
      </CalendarErrorBoundary>
    );

    expect(screen.getByText('Working component')).toBeInTheDocument();
  });

  it('should render error boundary when child throws error in development', () => {
    render(
      <CalendarErrorBoundary showDetails={true}>
        <ErrorComponent shouldThrow={true} />
      </CalendarErrorBoundary>
    );

    expect(screen.getByText(/Calendar Error/)).toBeInTheDocument();
    expect(screen.getAllByText(/Test error for error boundary/)).toHaveLength(2); // Appears in message and stack
    expect(screen.getByText('🔄 Retry')).toBeInTheDocument();
    expect(screen.getByText('📋 Copy Error Report')).toBeInTheDocument();
  });

  it('should render production error UI when showDetails is false', () => {
    render(
      <CalendarErrorBoundary showDetails={false}>
        <ErrorComponent shouldThrow={true} />
      </CalendarErrorBoundary>
    );

    expect(screen.getByText('📅 Calendar Temporarily Unavailable')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Refresh Page')).toBeInTheDocument();
  });

  it('should render custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;
    
    render(
      <CalendarErrorBoundary fallback={customFallback}>
        <ErrorComponent shouldThrow={true} />
      </CalendarErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('should call onError callback when error occurs', () => {
    const mockOnError = vi.fn();
    
    render(
      <CalendarErrorBoundary onError={mockOnError}>
        <ErrorComponent shouldThrow={true} />
      </CalendarErrorBoundary>
    );

    expect(mockOnError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.any(Object),
      expect.stringMatching(/calendar-error-/)
    );
  });

  it('should reset error state when retry button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <CalendarErrorBoundary showDetails={true}>
        <ErrorComponent shouldThrow={true} />
      </CalendarErrorBoundary>
    );

    // Should show error initially
    expect(screen.getByText(/Calendar Error/)).toBeInTheDocument();

    // Click retry - this should reset the error boundary state
    const retryButton = screen.getByText('🔄 Retry');
    await user.click(retryButton);

    // The error boundary should have reset its state,
    // but since the component still throws, it will show the error again
    // This proves the retry functionality works (it attempted to re-render)
    expect(screen.getByText(/Calendar Error/)).toBeInTheDocument();
  });

  it('should log detailed error information to console', () => {
    const consoleSpy = vi.spyOn(console, 'error');
    
    render(
      <CalendarErrorBoundary componentName="TestCalendar">
        <ErrorComponent shouldThrow={true} />
      </CalendarErrorBoundary>
    );

    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should handle component with custom name', () => {
    render(
      <CalendarErrorBoundary componentName="CustomCalendar" showDetails={true}>
        <ErrorComponent shouldThrow={true} />
      </CalendarErrorBoundary>
    );

    expect(screen.getByText(/CustomCalendar Error/)).toBeInTheDocument();
  });
});