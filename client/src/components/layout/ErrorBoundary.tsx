import React from 'react';
import { ErrorView } from './ErrorView';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

// Ловит ошибки рендера/жизненного цикла React и показывает страницу 500
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Unhandled UI error:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorView
          error={this.state.error}
          status={500}
          message="Интерфейс столкнулся с непредвиденной ошибкой. Обновите страницу — данные на сервере не пострадали."
          onRetry={() => window.location.reload()}
        />
      );
    }

    return this.props.children;
  }
}
