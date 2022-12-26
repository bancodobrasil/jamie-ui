import React from 'react';
import {
  NotificationContext,
  openDefaultErrorNotification,
} from '../../contexts/NotificationContext';
import { ErrorFallback } from './ErrorFallback';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: string | JSX.Element;
  RetryFallback?: React.FC<{ retry: () => void }>;
  openNotification?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const { openNotification } = this.props;
    if (openNotification) {
      const { dispatch } = this.context;
      openDefaultErrorNotification(error, dispatch);
    }
  }

  render() {
    const { RetryFallback, fallback, children } = this.props;
    const { hasError = false } = this.state;

    const fallbackComponent =
      typeof fallback === 'string' ? <ErrorFallback message={fallback} /> : fallback;

    if (hasError) {
      return RetryFallback ? (
        <RetryFallback retry={() => this.setState({ hasError: false })} />
      ) : (
        fallbackComponent
      );
    }

    return typeof children === 'function' ? children() : children;
  }
}
ErrorBoundary.contextType = NotificationContext;

export default ErrorBoundary;
