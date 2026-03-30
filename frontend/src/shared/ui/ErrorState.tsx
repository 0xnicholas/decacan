interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="ui-state error-state" role="alert">
      <p className="error-title">Something went wrong</p>
      <p className="error-message">{message}</p>
      {onRetry && (
        <button className="secondary-button" onClick={onRetry} type="button">
          Retry
        </button>
      )}
    </div>
  );
}
