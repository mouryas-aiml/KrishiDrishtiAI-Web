import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("[KrishiDrishti] UI rendering error:", error, errorInfo);
  }

  private reloadApplication = (): void => {
    window.location.reload();
  };

  public render(): ReactNode {
    if (!this.state.error) return this.props.children;

    return (
      <main className="app-failure-state" role="alert">
        <div className="card">
          <p className="eyebrow">KrishiDrishti AI</p>
          <h1>We could not load this workspace</h1>
          <p className="muted">
            The application encountered an unexpected rendering error. Your saved records are not affected.
          </p>
          <button type="button" className="button" onClick={this.reloadApplication}>
            Reload workspace
          </button>
        </div>
      </main>
    );
  }
}
