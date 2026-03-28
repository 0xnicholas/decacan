import type { TaskSummary } from "../../entities/task/types";

interface TaskHeaderProps {
  task: TaskSummary;
}

export function TaskHeader({ task }: TaskHeaderProps) {
  return (
    <section className="task-panel task-header">
      <p className="section-kicker">Task</p>
      <div className="task-header-row">
        <div>
          <h1>{task.playbook_key}</h1>
          <p className="panel-copy">{task.status_summary}</p>
          <p className="panel-copy">{task.input}</p>
        </div>
        <span className="status-pill">{capitalize(task.status)}</span>
      </div>
    </section>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
