// frontend/src/components/common/ErrorBoundary.tsx

import React, { Component, ErrorInfo, ReactNode } from 'react';
import './ErrorBoundary.css';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { onError } = this.props;
    
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }

    // Call onError callback if provided
    if (onError) {
      onError(error, errorInfo);
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback: FallbackComponent } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (FallbackComponent) {
        return <FallbackComponent error={error} resetError={this.resetError} />;
      }

      // Default error UI
      return (
        <div className="error-boundary">
          <div className="error-boundary__content">
            <div className="error-boundary__icon">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <h1 className="error-boundary__title">Something went wrong</h1>
            
            <p className="error-boundary__message">
              {error.message || 'An unexpected error occurred'}
            </p>

            <p className="error-boundary__description">
              We apologize for the inconvenience. Please try one of the following options:
            </p>

            {/* Show error details in development */}
            {process.env.NODE_ENV === 'development' && (
              <details className="error-boundary__details">
                <summary>Error Details</summary>
                <pre>{error.stack}</pre>
              </details>
            )}

            <div className="error-boundary__actions">
              <button
                onClick={this.resetError}
                className="error-boundary__button error-boundary__button--primary"
              >
                Try Again
              </button>
              
              <button
                onClick={this.handleReload}
                className="error-boundary__button error-boundary__button--secondary"
              >
                Reload Page
              </button>
              
              <a href="/" className="error-boundary__link">
                Go to Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}
