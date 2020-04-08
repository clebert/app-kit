import * as preact from 'preact';

export interface ErrorBoundaryProps {
  readonly children: preact.ComponentChildren;
}

export interface ErrorBoundaryState {
  readonly hasError: boolean;
}

export class ErrorBoundary extends preact.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  public static getDerivedStateFromError(): ErrorBoundaryState {
    return {hasError: true};
  }

  public constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {hasError: false};
  }

  public componentDidCatch(error: unknown): void {
    if (error instanceof Error || (error && typeof error === 'string')) {
      console.error(error);
    } else {
      console.error('An unknown error occured.');
    }
  }

  public render(): preact.JSX.Element | null {
    return !this.state.hasError ? (
      <preact.Fragment>{this.props.children}</preact.Fragment>
    ) : null;
  }
}
