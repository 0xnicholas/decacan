import { useEffect, useState } from "react";

import type { Deliverable } from "../../entities/deliverable/types";
import { listDeliverables } from "../../shared/api/deliverables";

interface DeliverablesPageProps {
  workspaceId: string;
}

export function DeliverablesPage({ workspaceId }: DeliverablesPageProps) {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [taskFilter, setTaskFilter] = useState("all");

  useEffect(() => {
    let active = true;

    async function loadDeliverables() {
      setIsLoading(true);
      setError(null);
      try {
        const nextDeliverables = await listDeliverables(workspaceId, {
          status: statusFilter,
          taskId: taskFilter,
        });
        if (active) {
          setDeliverables(nextDeliverables);
        }
      } catch {
        if (active) {
          setError("Failed to load deliverables");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadDeliverables();

    return () => {
      active = false;
    };
  }, [statusFilter, taskFilter, workspaceId]);

  const knownTaskIds = Array.from(new Set(deliverables.map((deliverable) => deliverable.task_id)));
  const knownStatuses = Array.from(new Set(deliverables.map((deliverable) => deliverable.status)));

  return (
    <section aria-label="Deliverables">
      <p className="eyebrow">Workspace</p>
      <h1>Deliverables</h1>
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
        <p className="subcopy">Loading deliverables...</p>
      ) : error ? (
        <p className="subcopy">{error}</p>
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
        <p className="subcopy">No deliverables yet.</p>
      )}
    </section>
  );
}
