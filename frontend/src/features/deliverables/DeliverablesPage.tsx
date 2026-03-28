import { useEffect, useState } from "react";

import type { Deliverable } from "../../entities/deliverable/types";
import { listDeliverables } from "../../shared/api/deliverables";

interface DeliverablesPageProps {
  workspaceId: string;
}

export function DeliverablesPage({ workspaceId }: DeliverablesPageProps) {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);

  useEffect(() => {
    let active = true;

    async function loadDeliverables() {
      try {
        const nextDeliverables = await listDeliverables(workspaceId);
        if (active) {
          setDeliverables(nextDeliverables);
        }
      } catch {
        if (active) {
          setDeliverables([]);
        }
      }
    }

    void loadDeliverables();

    return () => {
      active = false;
    };
  }, [workspaceId]);

  return (
    <section aria-label="Deliverables">
      <p className="eyebrow">Workspace</p>
      <h1>Deliverables</h1>
      {deliverables.length ? (
        <ul className="detail-list">
          {deliverables.map((deliverable) => (
            <li key={deliverable.id} className="task-panel">
              <strong>{deliverable.label}</strong>
              <span>{deliverable.canonical_path}</span>
              <span>{deliverable.status}</span>
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
