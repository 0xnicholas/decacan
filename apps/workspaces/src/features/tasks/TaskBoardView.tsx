import type { TaskListItem } from "../../entities/task/types";

interface TaskBoardViewProps {
  tasks: TaskListItem[];
  workspaceId: string;
}

interface BoardLane {
  key: string;
  label: string;
  statuses: string[];
}

const boardLanes: BoardLane[] = [
  {
    key: "running",
    label: "Running",
    statuses: ["running", "planning", "accepted"],
  },
  {
    key: "waiting-approval",
    label: "Waiting Approval",
    statuses: ["waiting_approval", "paused"],
  },
  {
    key: "completed",
    label: "Completed",
    statuses: ["succeeded", "completed"],
  },
  {
    key: "failed",
    label: "Failed",
    statuses: ["failed", "cancelled"],
  },
];

export function TaskBoardView({ tasks, workspaceId }: TaskBoardViewProps) {
  return (
    <div className="tasks-board">
      {boardLanes.map((lane) => {
        const laneTasks = tasks.filter((task) => lane.statuses.includes(task.status));
        return (
          <section key={lane.key} className="task-panel">
            <h2>{lane.label}</h2>
            {laneTasks.length === 0 ? (
              <p className="panel-copy">No tasks in this lane.</p>
            ) : (
              <ul className="detail-list">
                {laneTasks.map((task) => (
                  <li key={task.id}>
                    <strong>{task.input}</strong>
                    <span>{task.status_summary ?? task.status}</span>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => {
                        window.history.pushState(
                          {},
                          "",
                          `/workspaces/${workspaceId}/tasks/${task.id}`,
                        );
                        window.dispatchEvent(new PopStateEvent("popstate"));
                      }}
                    >
                      Open
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
