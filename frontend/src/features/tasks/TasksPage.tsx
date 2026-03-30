import { useCallback, useEffect, useState } from "react";

import type { TaskListItem } from "../../entities/task/types";
import { listWorkspaceTasks } from "../../shared/api/tasks";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "../../shared/ui";
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

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const nextTasks = await listWorkspaceTasks(workspaceId);
      setTasks(nextTasks);
    } catch {
      setError("Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const handleRetry = () => {
    void loadTasks();
  };

  return (
    <section aria-label="Tasks">
      <PageHeader title="Tasks" subtitle="Workspace" />
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
      {isLoading ? <LoadingState message="Loading tasks..." /> : null}
      {error ? <ErrorState message={error} onRetry={handleRetry} /> : null}
      {!isLoading && !error && tasks.length === 0 ? (
        <EmptyState title="No tasks found" message="Get started by creating your first task." />
      ) : null}
      {!isLoading && !error && tasks.length > 0 ? (
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
