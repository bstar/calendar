import React, { Component, ErrorInfo, ReactNode } from 'react';

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
          <div style={{
            padding: '20px',
            margin: '20px',
            border: '2px solid #dc3545',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa',
            fontFamily: 'monospace',
            maxWidth: '100%',
            overflow: 'auto'
          }}>
            <div style={{ 
              color: '#dc3545', 
              fontSize: '18px', 
              fontWeight: 'bold',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🚨 {componentName} Error
              <span style={{ 
                fontSize: '12px', 
                fontWeight: 'normal',
                backgroundColor: '#dc3545',
                color: 'white',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                {errorId}
              </span>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <strong>Message:</strong> {error?.message}
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <strong>Timestamp:</strong> {new Date().toLocaleString()}
            </div>

            <details style={{ marginBottom: '15px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                📋 Stack Trace
              </summary>
              <pre style={{ 
                whiteSpace: 'pre-wrap', 
                backgroundColor: '#f1f1f1',
                padding: '10px',
                borderRadius: '4px',
                fontSize: '12px',
                overflow: 'auto',
                maxHeight: '200px'
              }}>
                {error?.stack}
              </pre>
            </details>

            <details style={{ marginBottom: '15px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                🔧 Component Stack
              </summary>
              <pre style={{ 
                whiteSpace: 'pre-wrap', 
                backgroundColor: '#f1f1f1',
                padding: '10px',
                borderRadius: '4px',
                fontSize: '12px',
                overflow: 'auto',
                maxHeight: '200px'
              }}>
                {errorInfo?.componentStack}
              </pre>
            </details>

            <details style={{ marginBottom: '15px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                ⚙️ Props & Context
              </summary>
              <pre style={{ 
                whiteSpace: 'pre-wrap', 
                backgroundColor: '#f1f1f1',
                padding: '10px',
                borderRadius: '4px',
                fontSize: '12px',
                overflow: 'auto',
                maxHeight: '200px'
              }}>
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

            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              flexWrap: 'wrap',
              marginTop: '20px'
            }}>
              <button
                onClick={this.handleRetry}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                🔄 Retry
              </button>
              
              <button
                onClick={this.copyErrorToClipboard}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                📋 Copy Error Report
              </button>
              
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                🔃 Reload Page
              </button>
            </div>
          </div>
        );
      }

      // Production mode - show user-friendly error
      return (
        <div style={{
          padding: '20px',
          margin: '20px',
          border: '1px solid #dc3545',
          borderRadius: '8px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>
            📅 Calendar Temporarily Unavailable
          </div>
          <div style={{ marginBottom: '15px' }}>
            We're experiencing a technical issue with the calendar component.
          </div>
          <button
            onClick={this.handleRetry}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
          <div style={{ 
            fontSize: '12px', 
            marginTop: '10px',
            opacity: 0.7
          }}>
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