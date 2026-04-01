interface EmptyStateProps {
  title: string;
  message: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <div className="ui-state empty-state">
      <p className="empty-title">{title}</p>
      <p className="empty-message">{message}</p>
      {action && (
        <button className="primary-button" onClick={action.onClick} type="button">
          {action.label}
        </button>
      )}
    </div>
  );
}
