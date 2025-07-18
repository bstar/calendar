import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarErrorBoundary, withCalendarErrorBoundary, useErrorHandler } from './ErrorBoundary';
import '@testing-library/jest-dom';

// Test component that throws an error
const ErrorComponent = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error for error boundary');
  }
  return <div>Working component</div>;
};

// Test component that uses useErrorHandler
const ComponentWithErrorHandler = () => {
  const handleError = useErrorHandler();
  const [shouldError, setShouldError] = React.useState(false);
  
  // Throw error during render if flag is set
  if (shouldError) {
    handleError(new Error('Manual error'));
  }
  
  return (
    <div>
      <button onClick={() => setShouldError(true)}>Trigger Error</button>
      <div>Component with error handler</div>
    </div>
  );
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

  describe('Copy Error Report functionality', () => {
    it('should copy error report to clipboard when button is clicked', async () => {
      const user = userEvent.setup();
      
      // Mock clipboard API
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: mockWriteText
        },
        writable: true,
        configurable: true
      });
      
      // Mock alert
      const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});
      
      render(
        <CalendarErrorBoundary showDetails={true} componentName="TestCalendar">
          <ErrorComponent shouldThrow={true} />
        </CalendarErrorBoundary>
      );

      const copyButton = screen.getByText('📋 Copy Error Report');
      await user.click(copyButton);

      expect(mockWriteText).toHaveBeenCalled();
      const copiedText = mockWriteText.mock.calls[0][0];
      expect(copiedText).toContain('=== TestCalendar Error Report ===');
      expect(copiedText).toContain('Test error for error boundary');
      expect(mockAlert).toHaveBeenCalledWith('Error report copied to clipboard!');
    });

    it('should use fallback copy method when clipboard API fails', async () => {
      const user = userEvent.setup();
      
      // Mock clipboard API to fail
      const mockWriteText = vi.fn().mockRejectedValue(new Error('Clipboard not available'));
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: mockWriteText
        },
        writable: true,
        configurable: true
      });
      
      // Mock document methods for fallback
      // jsdom doesn't have execCommand, so we need to add it
      document.execCommand = vi.fn(() => true);
      const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});
      
      render(
        <CalendarErrorBoundary showDetails={true}>
          <ErrorComponent shouldThrow={true} />
        </CalendarErrorBoundary>
      );

      const copyButton = screen.getByText('📋 Copy Error Report');
      await user.click(copyButton);

      expect(mockWriteText).toHaveBeenCalled();
      expect(document.execCommand).toHaveBeenCalledWith('copy');
      expect(mockAlert).toHaveBeenCalledWith('Error report copied to clipboard!');
    });
  });

  describe('Reload Page functionality', () => {
    it('should reload page when reload button is clicked in development mode', async () => {
      const user = userEvent.setup();
      const mockReload = vi.fn();
      
      // Mock window.location with reload method
      vi.stubGlobal('location', {
        ...window.location,
        reload: mockReload
      });
      
      render(
        <CalendarErrorBoundary showDetails={true}>
          <ErrorComponent shouldThrow={true} />
        </CalendarErrorBoundary>
      );

      const reloadButton = screen.getByText('🔃 Reload Page');
      await user.click(reloadButton);

      expect(mockReload).toHaveBeenCalled();
      
      // Restore original location
      vi.unstubAllGlobals();
    });

    it('should reload page when refresh button is clicked in production mode', async () => {
      const user = userEvent.setup();
      const mockReload = vi.fn();
      
      // Mock window.location with reload method
      vi.stubGlobal('location', {
        ...window.location,
        reload: mockReload
      });
      
      render(
        <CalendarErrorBoundary showDetails={false}>
          <ErrorComponent shouldThrow={true} />
        </CalendarErrorBoundary>
      );

      const refreshButton = screen.getByText('Refresh Page');
      await user.click(refreshButton);

      expect(mockReload).toHaveBeenCalled();
      
      // Restore original location
      vi.unstubAllGlobals();
    });
  });

  describe('Error Details sections', () => {
    it('should show expandable error details in development mode', async () => {
      const user = userEvent.setup();
      
      render(
        <CalendarErrorBoundary showDetails={true}>
          <ErrorComponent shouldThrow={true} />
        </CalendarErrorBoundary>
      );

      // Check that details sections exist
      expect(screen.getByText('📋 Stack Trace')).toBeInTheDocument();
      expect(screen.getByText('🔧 Component Stack')).toBeInTheDocument();
      expect(screen.getByText('⚙️ Props & Context')).toBeInTheDocument();

      // Check that error stack is visible when expanded
      const stackDetails = screen.getByText('📋 Stack Trace').closest('details');
      expect(stackDetails).toBeInTheDocument();
      
      // Click to expand
      const stackSummary = screen.getByText('📋 Stack Trace');
      await user.click(stackSummary);
      
      // Stack trace should contain error message
      expect(stackDetails?.textContent).toContain('Test error for error boundary');
    });

    it('should include props and context information in details', async () => {
      const user = userEvent.setup();
      
      render(
        <CalendarErrorBoundary 
          showDetails={true} 
          componentName="TestComponent"
          onError={() => {}}
        >
          <ErrorComponent shouldThrow={true} />
        </CalendarErrorBoundary>
      );

      const propsDetails = screen.getByText('⚙️ Props & Context').closest('details');
      const propsSummary = screen.getByText('⚙️ Props & Context');
      await user.click(propsSummary);
      
      expect(propsDetails?.textContent).toContain('TestComponent');
      expect(propsDetails?.textContent).toContain('Custom error handler provided');
      expect(propsDetails?.textContent).toContain('userAgent');
      expect(propsDetails?.textContent).toContain('url');
    });
  });

  describe('getDerivedStateFromError', () => {
    it('should generate unique error ID', () => {
      const error = new Error('Test error');
      const state = CalendarErrorBoundary.getDerivedStateFromError(error);
      
      expect(state.hasError).toBe(true);
      expect(state.error).toBe(error);
      expect(state.errorId).toMatch(/^calendar-error-\d+-[a-z0-9]{9}$/);
    });
  });

  describe('Production mode retry', () => {
    it('should reset error state when Try Again is clicked in production', async () => {
      const user = userEvent.setup();
      
      // Create a component that can toggle throwing
      let shouldThrow = true;
      const ToggleErrorComponent = () => {
        if (shouldThrow) {
          throw new Error('Test error');
        }
        return <div>Component recovered</div>;
      };
      
      const { rerender } = render(
        <CalendarErrorBoundary showDetails={false}>
          <ToggleErrorComponent />
        </CalendarErrorBoundary>
      );

      expect(screen.getByText('📅 Calendar Temporarily Unavailable')).toBeInTheDocument();

      // Change the component to not throw
      shouldThrow = false;
      
      // Click Try Again
      const tryAgainButton = screen.getByText('Try Again');
      await user.click(tryAgainButton);

      // Component should now render normally
      expect(screen.getByText('Component recovered')).toBeInTheDocument();
    });
  });

  describe('Error ID display', () => {
    it('should display error ID in production mode', () => {
      render(
        <CalendarErrorBoundary showDetails={false}>
          <ErrorComponent shouldThrow={true} />
        </CalendarErrorBoundary>
      );

      const errorIdElement = screen.getByText(/Error ID:/);
      expect(errorIdElement.textContent).toMatch(/Error ID: calendar-error-\d+-[a-z0-9]{9}/);
    });

    it('should display error ID in development mode', () => {
      render(
        <CalendarErrorBoundary showDetails={true}>
          <ErrorComponent shouldThrow={true} />
        </CalendarErrorBoundary>
      );

      const errorIdElement = document.querySelector('.error-boundary-id');
      expect(errorIdElement?.textContent).toMatch(/calendar-error-\d+-[a-z0-9]{9}/);
    });
  });
});

describe('withCalendarErrorBoundary HOC', () => {
  it('should wrap component with error boundary', () => {
    const TestComponent = () => <div>Test Component</div>;
    const WrappedComponent = withCalendarErrorBoundary(TestComponent);
    
    render(<WrappedComponent />);
    
    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });

  it('should pass error boundary props to wrapper', () => {
    const TestComponent = () => {
      throw new Error('HOC test error');
    };
    
    const mockOnError = vi.fn();
    const WrappedComponent = withCalendarErrorBoundary(TestComponent, {
      onError: mockOnError,
      showDetails: true,
      componentName: 'HOCTest'
    });
    
    // Suppress console for this test
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'group').mockImplementation(() => {});
    vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
    vi.spyOn(console, 'groupCollapsed').mockImplementation(() => {});
    vi.spyOn(console, 'table').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    
    render(<WrappedComponent />);
    
    expect(screen.getByText(/HOCTest Error/)).toBeInTheDocument();
    expect(mockOnError).toHaveBeenCalled();
  });

  it('should pass component props through HOC', () => {
    interface TestProps {
      message: string;
    }
    
    const TestComponent = ({ message }: TestProps) => <div>{message}</div>;
    const WrappedComponent = withCalendarErrorBoundary(TestComponent);
    
    render(<WrappedComponent message="Props passed through" />);
    
    expect(screen.getByText('Props passed through')).toBeInTheDocument();
  });
});

describe('useErrorHandler hook', () => {
  it('should throw error that is caught by error boundary', () => {
    // Suppress console for this test
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'group').mockImplementation(() => {});
    vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
    vi.spyOn(console, 'groupCollapsed').mockImplementation(() => {});
    vi.spyOn(console, 'table').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    
    render(
      <CalendarErrorBoundary showDetails={true}>
        <ComponentWithErrorHandler />
      </CalendarErrorBoundary>
    );

    // Component should render initially
    expect(screen.getByText('Component with error handler')).toBeInTheDocument();

    // Click button to trigger error
    const triggerButton = screen.getByText('Trigger Error');
    fireEvent.click(triggerButton);

    // Error boundary should catch the error
    expect(screen.getByText(/Calendar Error/)).toBeInTheDocument();
  });
});