import { useEffect, useState } from "react";

import type { TaskListItem } from "../../entities/task/types";
import { listMyTasks } from "../../shared/api/tasks";

export function MyWorkPage() {
  const [tasks, setTasks] = useState<TaskListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadMyTasks() {
      setIsLoading(true);
      setError(null);
      try {
        const nextTasks = await listMyTasks();
        if (active) {
          setTasks(nextTasks);
        }
      } catch {
        if (active) {
          setError("Failed to load my tasks");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadMyTasks();
    return () => {
      active = false;
    };
  }, []);

  const needsInput = tasks.filter((task) => task.status === "waiting_approval" || task.status === "failed");
  const runningNow = tasks.filter((task) => task.status === "running" || task.status === "planning");
  const recentOutputs = tasks.filter((task) => task.status === "succeeded" || task.status === "completed");

  return (
    <section aria-label="My Work" className="task-route-placeholder">
      <p className="eyebrow">Workspace</p>
      <h1>My Work</h1>
      {isLoading ? <p className="subcopy">Loading my tasks...</p> : null}
      {error ? <p className="subcopy">{error}</p> : null}
      {!isLoading && !error ? (
        <div className="tasks-my-work-grid">
          <section className="task-panel">
            <h2>Needs my input</h2>
            <p>{needsInput.length}</p>
          </section>
          <section className="task-panel">
            <h2>Running now</h2>
            <p>{runningNow.length}</p>
          </section>
          <section className="task-panel">
            <h2>Recent outputs</h2>
            <p>{recentOutputs.length}</p>
          </section>
        </div>
      ) : null}
    </section>
  );
}
