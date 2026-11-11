import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] capturó un error:', error, errorInfo);
  }

  private reset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          className="inner-page"
          style={{ padding: '60px 24px', textAlign: 'center' }}
        >
          <span className="section-kicker">ERROR</span>
          <h1
            style={{
              fontFamily: 'Libre Caslon Display, Georgia, serif',
              fontSize: '32px',
              margin: '12px 0 8px',
              color: 'var(--ink)',
            }}
          >
            Algo salió mal
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '20px' }}>
            Ocurrió un error inesperado en esta sección.
          </p>

          {this.state.error && (
            <pre
              style={{
                maxWidth: '640px',
                margin: '0 auto 24px',
                padding: '12px 16px',
                background: '#f8f9fb',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                fontSize: '11px',
                color: '#8b3838',
                textAlign: 'left',
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {this.state.error.message}
            </pre>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <button type="button" className="primary-button" onClick={this.reset}>
              Intentar de nuevo
            </button>
            <a href="/" className="subtle-button" style={{ minHeight: '40px' }}>
              Ir al inicio
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}