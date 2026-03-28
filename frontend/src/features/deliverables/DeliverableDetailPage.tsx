import { useEffect, useState } from "react";

import type { DeliverableDetail } from "../../entities/deliverable/types";
import { getDeliverableDetail } from "../../shared/api/deliverables";
import { DeliverablePreviewPanel } from "./DeliverablePreviewPanel";

interface DeliverableDetailPageProps {
  deliverableId: string;
  workspaceId: string;
}

export function DeliverableDetailPage({ deliverableId, workspaceId }: DeliverableDetailPageProps) {
  const [detail, setDetail] = useState<DeliverableDetail | null>(null);

  useEffect(() => {
    let active = true;

    async function loadDetail() {
      try {
        const nextDetail = await getDeliverableDetail(workspaceId, deliverableId);
        if (active) {
          setDetail(nextDetail);
        }
      } catch {
        if (active) {
          setDetail(null);
        }
      }
    }

    void loadDetail();

    return () => {
      active = false;
    };
  }, [deliverableId, workspaceId]);

  if (!detail) {
    return (
      <section className="workspace-route-placeholder">
        <p className="eyebrow">Deliverable</p>
        <h1>Loading deliverable</h1>
      </section>
    );
  }

  return (
    <section className="task-main-column" aria-label="Deliverable detail">
      <button
        type="button"
        className="secondary-button"
        onClick={() => {
          window.history.pushState({}, "", `/workspaces/${workspaceId}/deliverables`);
          window.dispatchEvent(new PopStateEvent("popstate"));
        }}
      >
        Back to deliverables
      </button>
      <section className="task-panel">
        <p className="section-kicker">Deliverable</p>
        <h1>{detail.deliverable.label}</h1>
        <p className="panel-copy">{detail.deliverable.canonical_path}</p>
        <p className="panel-copy">Review status: {detail.deliverable.status}</p>
        <p className="panel-copy">Task: {detail.task_playbook_key}</p>
      </section>
      <DeliverablePreviewPanel artifactId={detail.deliverable.id} />
    </section>
  );
}
