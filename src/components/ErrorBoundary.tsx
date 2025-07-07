import React, { Component, ErrorInfo, ReactNode } from 'react';
import './ErrorBoundary.css';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void;
  showDetails?: boolean;
  componentName?: string;
}

export class CalendarErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Generate unique error ID for tracking
    const errorId = `calendar-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, componentName = 'Calendar' } = this.props;
    const { errorId } = this.state;

    // Enhanced error logging (avoid circular references)
    const errorDetails = {
      errorId,
      timestamp: new Date().toISOString(),
      component: componentName,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      props: {
        componentName: this.props.componentName,
        showDetails: this.props.showDetails,
        fallback: this.props.fallback ? 'Custom fallback provided' : undefined,
        onError: this.props.onError ? 'Custom error handler provided' : undefined,
        children: 'React component'
      },
      state: {
        hasError: this.state.hasError,
        errorId: this.state.errorId,
        errorMessage: this.state.error?.message
      }
    };

    // Log to console with detailed information
    console.group(`🚨 ${componentName} Error [${errorId}]`);
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.table({
      'Error ID': errorId,
      'Component': componentName,
      'Message': error.message,
      'Timestamp': errorDetails.timestamp,
      'URL': errorDetails.url
    });
    console.groupCollapsed('📋 Full Error Details');
    console.log(JSON.stringify(errorDetails, null, 2));
    console.groupEnd();
    console.groupEnd();

    // Send to external error tracking (uncomment and configure as needed)
    // this.sendErrorToService(errorDetails);

    // Update state with error info
    this.setState({ errorInfo });

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo, errorId);
    }
  }

  private sendErrorToService = (errorDetails: any) => {
    // Example error reporting service integration
    // Uncomment and configure based on your error tracking service
    
    /*
    // Sentry example
    if (window.Sentry) {
      window.Sentry.captureException(errorDetails.error, {
        tags: {
          component: errorDetails.component,
          errorId: errorDetails.errorId
        },
        extra: errorDetails
      });
    }

    // Custom API example
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorDetails)
    }).catch(console.error);
    */
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  private copyErrorToClipboard = async () => {
    const { error, errorInfo, errorId } = this.state;
    const { componentName = 'Calendar' } = this.props;
    
    const errorReport = `
=== ${componentName} Error Report ===
Error ID: ${errorId}
Timestamp: ${new Date().toISOString()}
Component: ${componentName}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}

Error Message: ${error?.message}

Stack Trace:
${error?.stack}

Component Stack:
${errorInfo?.componentStack}

Props:
${JSON.stringify(this.props, null, 2)}
    `.trim();

    try {
      await navigator.clipboard.writeText(errorReport);
      alert('Error report copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy error report:', err);
      // Fallback: create a text area and select it
      const textArea = document.createElement('textarea');
      textArea.value = errorReport;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Error report copied to clipboard!');
    }
  };

  render() {
    const { hasError, error, errorInfo, errorId } = this.state;
    const { children, fallback, showDetails = process.env.NODE_ENV === 'development', componentName = 'Calendar' } = this.props;

    if (hasError) {
      // Custom fallback provided
      if (fallback) {
        return fallback;
      }

      // Development mode - show detailed error
      if (showDetails) {
        return (
          <div className="error-boundary-container">
            <div className="error-boundary-header">
              🚨 {componentName} Error
              <span className="error-boundary-id">
                {errorId}
              </span>
            </div>
            
            <div className="error-boundary-info">
              <strong>Message:</strong> {error?.message}
            </div>
            
            <div className="error-boundary-info">
              <strong>Timestamp:</strong> {new Date().toLocaleString()}
            </div>

            <details className="error-boundary-details">
              <summary className="error-boundary-summary">
                📋 Stack Trace
              </summary>
              <pre className="error-boundary-pre">
                {error?.stack}
              </pre>
            </details>

            <details className="error-boundary-details">
              <summary className="error-boundary-summary">
                🔧 Component Stack
              </summary>
              <pre className="error-boundary-pre">
                {errorInfo?.componentStack}
              </pre>
            </details>

            <details className="error-boundary-details">
              <summary className="error-boundary-summary">
                ⚙️ Props & Context
              </summary>
              <pre className="error-boundary-pre">
                {JSON.stringify({
                  props: {
                    componentName: this.props.componentName,
                    showDetails: this.props.showDetails,
                    fallback: this.props.fallback ? 'Custom fallback provided' : undefined,
                    onError: this.props.onError ? 'Custom error handler provided' : undefined,
                    children: 'React component'
                  },
                  userAgent: navigator.userAgent,
                  url: window.location.href
                }, null, 2)}
              </pre>
            </details>

            <div className="error-boundary-actions">
              <button
                onClick={this.handleRetry}
                className="error-boundary-button error-boundary-button-retry"
              >
                🔄 Retry
              </button>
              
              <button
                onClick={this.copyErrorToClipboard}
                className="error-boundary-button error-boundary-button-copy"
              >
                📋 Copy Error Report
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="error-boundary-button error-boundary-button-reload"
              >
                🔃 Reload Page
              </button>
            </div>
          </div>
        );
      }

      // Production mode - show user-friendly error
      return (
        <div className="error-boundary-production">
          <div className="error-boundary-production-title">
            📅 Calendar Temporarily Unavailable
          </div>
          <div className="error-boundary-production-message">
            We're experiencing a technical issue with the calendar component.
          </div>
          <div className="error-boundary-production-actions">
            <button
              onClick={this.handleRetry}
              className="error-boundary-production-button error-boundary-production-button-retry"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="error-boundary-production-button error-boundary-production-button-reload"
            >
              Refresh Page
            </button>
          </div>
          <div className="error-boundary-production-id">
            Error ID: {errorId}
          </div>
        </div>
      );
    }

    return children;
  }
}

// Convenience wrapper for common calendar error boundary usage
export const withCalendarErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) => {
  return (props: P) => (
    <CalendarErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </CalendarErrorBoundary>
  );
};

// Hook for manually triggering error boundary (useful for testing)
export const useErrorHandler = () => {
  return (error: Error, errorInfo?: any) => {
    // This will be caught by the nearest error boundary
    throw error;
  };
};