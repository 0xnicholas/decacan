interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="loading-state" role="status">
      <div className="loading-spinner" />
      <span className="loading-message">{message}</span>
    </div>
  );
}
