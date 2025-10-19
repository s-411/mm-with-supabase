'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-mm-dark text-mm-white p-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
              <h2 className="text-xl font-heading text-red-400 mb-4">Application Error</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-mm-white mb-2">Error Message:</h3>
                  <p className="text-red-300 font-mono text-sm bg-red-500/5 p-3 rounded">
                    {this.state.error?.message || 'Unknown error occurred'}
                  </p>
                </div>
                {this.state.error?.stack && (
                  <div>
                    <h3 className="font-medium text-mm-white mb-2">Stack Trace:</h3>
                    <pre className="text-red-300 font-mono text-xs bg-red-500/5 p-3 rounded overflow-auto max-h-64">
                      {this.state.error.stack}
                    </pre>
                  </div>
                )}
                <button
                  onClick={() => this.setState({ hasError: false, error: undefined })}
                  className="btn-mm"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Development error display component
export function DevelopmentErrorDisplay() {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-green-500/20 border border-green-500/30 rounded-lg px-3 py-2">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-300 text-xs font-medium">No Errors</span>
        </div>
      </div>
    </div>
  );
}