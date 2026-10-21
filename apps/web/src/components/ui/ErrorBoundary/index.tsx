import { Component, type ErrorInfo, type ReactNode } from 'react';
import { IconAlertTriangle, IconHome, IconRefresh } from '@tabler/icons-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches a render error from anywhere below it and shows something a person can
 * act on. Without one, a single thrown error inside one card leaves the whole
 * app a blank page — no message, no hint that reloading would help.
 *
 * React only supports class components as error boundaries (there is no hook),
 * so this is deliberately the one class in the app.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // A browser user can only tell us it broke; the console and the deployment's
    // log are where the actual stack lives.
    console.error('Unhandled render error:', error, info.componentStack);
  }

  private readonly reload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <div
        role="alert"
        aria-live="assertive"
        className="flex min-h-screen items-center justify-center bg-canvas px-6"
      >
        <div className="w-full max-w-md rounded-16 border border-border bg-surface p-8 text-center shadow-card">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-error-light">
            <IconAlertTriangle className="h-7 w-7 text-error" aria-hidden="true" />
          </div>

          <h1 className="mb-2 text-xl font-semibold text-ink">משהו נשבר בדרך</h1>
          <p className="mb-6 text-sm text-ink-secondary">
            העמוד הזה נתקל בשגיאה שלא צפינו בה. רענון בדרך כלל מסדר את זה — ואם לא, חזרו לדף הבית
            ונסו שוב מאוחר יותר.
          </p>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <button type="button" onClick={this.reload} className="btn-primary">
              <IconRefresh className="h-4 w-4" aria-hidden="true" />
              רענון העמוד
            </button>
            <a href="/app" className="btn-secondary">
              <IconHome className="h-4 w-4" aria-hidden="true" />
              חזרה לאפליקציה
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
