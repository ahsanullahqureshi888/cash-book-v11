import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an unhandled rendering crash:", error, errorInfo);
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (e) {
        // ignore callback error
      }
    }
  }

  componentDidUpdate(prevProps) {
    if (this.state.hasError && this.props.resetKey !== prevProps.resetKey) {
      this.setState({ hasError: false, error: null });
    }
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDev = import.meta.env?.DEV || import.meta.env?.MODE === 'development';

      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg, #09090b)',
          color: 'var(--text, #fafafa)',
          fontFamily: 'Inter, system-ui, sans-serif',
          padding: '24px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            background: 'var(--surface, rgba(9, 9, 11, 0.8))',
            border: '1px solid var(--border, rgba(39, 39, 42, 0.5))',
            borderRadius: '16px',
            padding: '40px 32px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-lg, 0 8px 32px rgba(0,0,0,0.4))',
            backdropFilter: 'blur(16px)',
            webkitBackdropFilter: 'blur(16px)',
            animation: 'fade-in 0.4s ease-out'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: 'var(--danger, #ef4444)',
              marginBottom: '24px'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '32px', height: '32px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>

            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              marginBottom: '12px',
              letterSpacing: '-0.025em',
              color: 'var(--text, #fafafa)',
              lineHeight: '1.2'
            }}>
              Something went wrong
            </h1>
            
            <p style={{
              fontSize: '0.9rem',
              lineHeight: '1.5',
              color: 'var(--text-soft, #a1a1aa)',
              marginBottom: '32px'
            }}>
              This section could not be displayed. Try again or refresh the application.
            </p>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <button
                type="button"
                onClick={this.handleRefresh}
                className="error-btn-primary"
                style={{
                  background: 'var(--accent, #4f46e5)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px 24px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                Refresh Page
              </button>
              
              <button
                type="button"
                onClick={this.handleReset}
                className="error-btn-secondary"
                style={{
                  background: 'transparent',
                  color: 'var(--text-soft, #a1a1aa)',
                  border: '1px solid var(--border, rgba(39, 39, 42, 0.4))',
                  borderRadius: '10px',
                  padding: '10px 24px',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Try Again
              </button>
            </div>

            {isDev && this.state.error && (
              <details style={{
                marginTop: '32px',
                textAlign: 'left',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '8px',
                padding: '12px',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <summary style={{
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  color: 'var(--text-soft, #a1a1aa)',
                  outline: 'none'
                }}>
                  Developer Diagnostics
                </summary>
                <pre style={{
                  fontSize: '0.7rem',
                  overflowX: 'auto',
                  marginTop: '8px',
                  color: 'var(--danger, #ef4444)',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace'
                }}>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
          
          <style>{`
            @keyframes fade-in {
              from { opacity: 0; transform: scale(0.98); }
              to { opacity: 1; transform: scale(1); }
            }
            .error-btn-primary:hover {
              filter: brightness(1.1);
            }
            .error-btn-secondary:hover {
              background: var(--surface-hover, rgba(39, 39, 42, 0.4)) !important;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}
