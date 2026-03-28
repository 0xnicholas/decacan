import { useEffect, useState } from "react";

import type { TaskListItem } from "../../entities/task/types";
import { listWorkspaceTasks } from "../../shared/api/tasks";
import { MyTasksView } from "./MyTasksView";
import { TaskBoardView } from "./TaskBoardView";
import { TaskListView } from "./TaskListView";

interface TasksPageProps {
  workspaceId: string;
}

type TasksViewMode = "list" | "board" | "my";

export function TasksPage({ workspaceId }: TasksPageProps) {
  const [tasks, setTasks] = useState<TaskListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<TasksViewMode>("list");

  useEffect(() => {
    let active = true;

    async function loadTasks() {
      setIsLoading(true);
      setError(null);
      try {
        const nextTasks = await listWorkspaceTasks(workspaceId);
        if (active) {
          setTasks(nextTasks);
        }
      } catch {
        if (active) {
          setError("Failed to load tasks");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadTasks();
    return () => {
      active = false;
    };
  }, [workspaceId]);

  return (
    <section aria-label="Tasks">
      <p className="eyebrow">Workspace</p>
      <h1>Tasks</h1>
      <div role="tablist" aria-label="Task views" className="tasks-view-tabs">
        <button
          type="button"
          role="tab"
          aria-selected={viewMode === "list"}
          className={`task-tab-button ${viewMode === "list" ? "is-active" : ""}`}
          onClick={() => setViewMode("list")}
        >
          List
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={viewMode === "board"}
          className={`task-tab-button ${viewMode === "board" ? "is-active" : ""}`}
          onClick={() => setViewMode("board")}
        >
          Board
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={viewMode === "my"}
          className={`task-tab-button ${viewMode === "my" ? "is-active" : ""}`}
          onClick={() => setViewMode("my")}
        >
          My Tasks
        </button>
      </div>
      {isLoading ? <p className="subcopy">Loading tasks...</p> : null}
      {error ? <p className="subcopy">{error}</p> : null}
      {!isLoading && !error ? (
        viewMode === "list" ? (
          <TaskListView tasks={tasks} workspaceId={workspaceId} />
        ) : viewMode === "board" ? (
          <TaskBoardView tasks={tasks} workspaceId={workspaceId} />
        ) : (
          <MyTasksView tasks={tasks} workspaceId={workspaceId} />
        )
      ) : null}
    </section>
  );
}
