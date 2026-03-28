import type { ActivityItem, TaskHealth } from "../../entities/workspace-home/types";

interface ExecutionOverviewPanelProps {
  taskHealth: TaskHealth;
  activity: ActivityItem[];
}

export function ExecutionOverviewPanel({ taskHealth, activity }: ExecutionOverviewPanelProps) {
  return (
    <section aria-label="Execution Overview panel">
      <h2>Execution Overview</h2>
      <p>
        Running: {taskHealth.running} | Waiting approval: {taskHealth.waiting_approval} | Blocked:{" "}
        {taskHealth.blocked} | Completed today: {taskHealth.completed_today}
      </p>
      <ul>
        {activity.map((item) => (
          <li key={item.id}>
            {item.message} ({item.relative_time})
          </li>
        ))}
      </ul>
    </section>
  );
}
