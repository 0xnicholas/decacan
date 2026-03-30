interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <p className="empty-message">{message}</p>
      {actionLabel && onAction && (
        <button className="primary-button" onClick={onAction} type="button">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
