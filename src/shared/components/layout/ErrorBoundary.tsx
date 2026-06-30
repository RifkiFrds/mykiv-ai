'use client';

import { Component, ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-6">
          <Card className="w-full max-w-sm rounded-3xl border-0 p-8 text-center shadow-lg">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50">
              <AlertTriangle className="h-8 w-8 text-rose-500" />
            </div>
            <h1 className="mt-6 text-lg font-bold text-neutral-900">Something went wrong</h1>
            <p className="mt-2 text-sm text-neutral-500">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <Button
              onClick={this.handleRetry}
              className="mt-6 h-12 w-full rounded-xl bg-teal-600 font-semibold hover:bg-teal-700"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
