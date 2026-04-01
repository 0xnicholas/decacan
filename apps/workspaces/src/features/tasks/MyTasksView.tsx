import type { TaskListItem } from "../../entities/task/types";

interface MyTasksViewProps {
  tasks: TaskListItem[];
  workspaceId: string;
}

export function MyTasksView({ tasks, workspaceId }: MyTasksViewProps) {
  const needsInput = tasks.filter((task) => task.status === "waiting_approval" || task.status === "failed");
  const runningNow = tasks.filter((task) => task.status === "running" || task.status === "planning");
  const recentlyDone = tasks.filter((task) => task.status === "succeeded" || task.status === "completed");

  return (
    <div className="tasks-my-work-grid">
      <section className="task-panel">
        <h2>Needs My Input</h2>
        <TaskSlice tasks={needsInput} workspaceId={workspaceId} emptyCopy="No tasks need input right now." />
      </section>
      <section className="task-panel">
        <h2>Running Now</h2>
        <TaskSlice tasks={runningNow} workspaceId={workspaceId} emptyCopy="No tasks are running." />
      </section>
      <section className="task-panel">
        <h2>Recently Completed</h2>
        <TaskSlice tasks={recentlyDone} workspaceId={workspaceId} emptyCopy="No completed tasks yet." />
      </section>
    </div>
  );
}

interface TaskSliceProps {
  tasks: TaskListItem[];
  workspaceId: string;
  emptyCopy: string;
}

function TaskSlice({ tasks, workspaceId, emptyCopy }: TaskSliceProps) {
  if (tasks.length === 0) {
    return <p className="panel-copy">{emptyCopy}</p>;
  }

  return (
    <ul className="detail-list">
      {tasks.map((task) => (
        <li key={task.id}>
          <strong>{task.input}</strong>
          <span>{task.status_summary ?? task.status}</span>
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              window.history.pushState({}, "", `/workspaces/${workspaceId}/tasks/${task.id}`);
              window.dispatchEvent(new PopStateEvent("popstate"));
            }}
          >
            Open
          </button>
        </li>
      ))}
    </ul>
  );
}
