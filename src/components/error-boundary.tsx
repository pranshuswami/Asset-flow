import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production, forward to an error reporting service.
    console.error("Uncaught error:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
            <AlertTriangle className="size-7" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Something went wrong</h1>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              An unexpected error occurred. You can try again — your data is safe.
            </p>
          </div>
          <pre className="max-w-md truncate rounded-lg bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">
            {this.state.error.message}
          </pre>
          <Button onClick={() => window.location.reload()}>Reload application</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
