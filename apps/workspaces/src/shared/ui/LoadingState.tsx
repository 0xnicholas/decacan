interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="ui-state loading-state" role="status" aria-live="polite">
      <div className="loading-spinner" />
      <span className="loading-message">{message}</span>
    </div>
  );
}
