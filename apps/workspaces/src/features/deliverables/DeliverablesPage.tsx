import { useCallback, useEffect, useState } from "react";

import type { Deliverable } from "../../entities/deliverable/types";
import { listDeliverables } from "../../shared/api/deliverables";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "../../shared/ui";

interface DeliverablesPageProps {
  workspaceId: string;
}

export function DeliverablesPage({ workspaceId }: DeliverablesPageProps) {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [taskFilter, setTaskFilter] = useState("all");

  const loadDeliverables = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const nextDeliverables = await listDeliverables(workspaceId, {
        status: statusFilter,
        taskId: taskFilter,
      });
      setDeliverables(nextDeliverables);
    } catch {
      setError("Failed to load deliverables");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, taskFilter, workspaceId]);

  useEffect(() => {
    void loadDeliverables();
  }, [loadDeliverables]);

  const knownTaskIds = Array.from(new Set(deliverables.map((deliverable) => deliverable.task_id)));
  const knownStatuses = Array.from(new Set(deliverables.map((deliverable) => deliverable.status)));

  const handleRetry = () => {
    void loadDeliverables();
  };

  return (
    <section aria-label="Deliverables">
      <PageHeader title="Deliverables" subtitle="Workspace" />
      <div className="workspace-header-actions">
        <label>
          Status
          <select
            aria-label="Deliverables status filter"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
            }}
          >
            <option value="all">All</option>
            {knownStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label>
          Source task
          <select
            aria-label="Deliverables source task filter"
            value={taskFilter}
            onChange={(event) => {
              setTaskFilter(event.target.value);
            }}
          >
            <option value="all">All</option>
            {knownTaskIds.map((taskId) => (
              <option key={taskId} value={taskId}>
                {taskId}
              </option>
            ))}
          </select>
        </label>
      </div>
      {isLoading ? (
        <LoadingState message="Loading deliverables..." />
      ) : error ? (
        <ErrorState message={error} onRetry={handleRetry} />
      ) : deliverables.length ? (
        <ul className="detail-list">
          {deliverables.map((deliverable) => (
            <li key={deliverable.id} className="task-panel">
              <strong>{deliverable.label}</strong>
              <span>{deliverable.canonical_path}</span>
              <span>{deliverable.status}</span>
              <span>{deliverable.owner}</span>
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  window.history.pushState(
                    {},
                    "",
                    `/workspaces/${workspaceId}/deliverables/${deliverable.id}`,
                  );
                  window.dispatchEvent(new PopStateEvent("popstate"));
                }}
              >
                Preview {deliverable.canonical_path}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="No deliverables yet" message="Deliverables will appear here once tasks generate them." />
      )}
    </section>
  );
}
