import type { TaskListItem } from "../../entities/task/types";

interface TaskListViewProps {
  tasks: TaskListItem[];
  workspaceId: string;
}

export function TaskListView({ tasks, workspaceId }: TaskListViewProps) {
  if (tasks.length === 0) {
    return <p className="subcopy">No tasks found for this workspace.</p>;
  }

  return (
    <ul className="detail-list">
      {tasks.map((task) => (
        <li key={task.id} className="task-panel">
          <strong>{task.input}</strong>
          <span>Playbook: {task.playbook_key}</span>
          <span>Status: {task.status}</span>
          <span>{task.status_summary ?? "No status summary yet."}</span>
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              window.history.pushState({}, "", `/workspaces/${workspaceId}/tasks/${task.id}`);
              window.dispatchEvent(new PopStateEvent("popstate"));
            }}
          >
            Open task
          </button>
        </li>
      ))}
    </ul>
  );
}
