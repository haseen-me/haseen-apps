import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: 40,
            fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
            background: '#0c0d10',
            color: '#e4e4e7',
          }}
        >
          <div
            style={{
              maxWidth: 440,
              textAlign: 'center',
              padding: 32,
              borderRadius: 12,
              border: '1px solid #27272a',
              background: '#18181b',
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚠</div>
            <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Something went wrong</h1>
            <p style={{ fontSize: 14, color: '#a1a1aa', marginBottom: 20 }}>
              An unexpected error occurred. Please try refreshing the page.
            </p>
            {this.state.error && (
              <pre
                style={{
                  fontSize: 12,
                  color: '#ef4444',
                  background: '#1c1c20',
                  padding: 12,
                  borderRadius: 8,
                  overflow: 'auto',
                  maxHeight: 120,
                  textAlign: 'left',
                  marginBottom: 20,
                }}
              >
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 24px',
                borderRadius: 8,
                border: 'none',
                background: '#2db8af',
                color: '#fff',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Refresh page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
