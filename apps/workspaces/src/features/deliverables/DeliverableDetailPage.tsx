import { useEffect, useState } from "react";

import type { DeliverableDetail } from "../../entities/deliverable/types";
import {
  ApiRequestError,
  getDeliverableDetail,
  submitDeliverableReview,
} from "../../shared/api/deliverables";
import { DeliverablePreviewPanel } from "./DeliverablePreviewPanel";

interface DeliverableDetailPageProps {
  deliverableId: string;
  workspaceId: string;
}

export function DeliverableDetailPage({ deliverableId, workspaceId }: DeliverableDetailPageProps) {
  const [detail, setDetail] = useState<DeliverableDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"agent" | "context" | "history">("agent");

  useEffect(() => {
    let active = true;

    async function loadDetail() {
      setIsLoading(true);
      setNotFound(false);
      setError(null);
      try {
        const nextDetail = await getDeliverableDetail(workspaceId, deliverableId);
        if (active) {
          setDetail(nextDetail);
        }
      } catch (loadError) {
        if (active) {
          setDetail(null);
          if (loadError instanceof ApiRequestError && loadError.status === 404) {
            setNotFound(true);
          } else {
            setError("Failed to load deliverable");
          }
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadDetail();

    return () => {
      active = false;
    };
  }, [deliverableId, workspaceId]);

  if (isLoading) {
    return (
      <section className="workspace-route-placeholder">
        <p className="eyebrow">Deliverable</p>
        <h1>Loading deliverable</h1>
      </section>
    );
  }

  if (notFound) {
    return (
      <section className="workspace-route-placeholder">
        <p className="eyebrow">Deliverable</p>
        <h1>Deliverable not found</h1>
      </section>
    );
  }

  if (error || !detail) {
    return (
      <section className="workspace-route-placeholder">
        <p className="eyebrow">Deliverable</p>
        <h1>{error ?? "Failed to load deliverable"}</h1>
      </section>
    );
  }

  const actionLabel: Record<"approve" | "request_revision", string> = {
    approve: "Approve",
    request_revision: "Request revision",
  };

  return (
    <div className="task-page task-page--full" aria-label="Deliverable detail">
      <section className="task-main-column">
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
          <p className="panel-copy">Task: {detail.linked_task.id}</p>
          <p className="panel-copy">Playbook: {detail.linked_task.playbook_key}</p>
          <p className="panel-copy">Owner: {detail.deliverable.owner}</p>
          <div className="task-composer-actions">
            {detail.review_actions.map((action) => {
              if (action !== "approve" && action !== "request_revision") {
                return null;
              }

              return (
                <button
                  key={action}
                  type="button"
                  className="secondary-button"
                  onClick={async () => {
                    await submitDeliverableReview(workspaceId, deliverableId, action);
                    const refreshed = await getDeliverableDetail(workspaceId, deliverableId);
                    setDetail(refreshed);
                  }}
                >
                  {actionLabel[action]}
                </button>
              );
            })}
          </div>
        </section>
        <DeliverablePreviewPanel artifactId={detail.deliverable.id} />
      </section>
      <aside className="task-right-rail">
        <nav aria-label="Deliverable collaboration rail" className="task-right-tabs">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "agent"}
            className={`task-tab-button ${activeTab === "agent" ? "is-active" : ""}`}
            onClick={() => setActiveTab("agent")}
          >
            Agent
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "context"}
            className={`task-tab-button ${activeTab === "context" ? "is-active" : ""}`}
            onClick={() => setActiveTab("context")}
          >
            Context
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "history"}
            className={`task-tab-button ${activeTab === "history" ? "is-active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            History
          </button>
        </nav>
        {activeTab === "agent" ? (
          <section className="task-panel">
            <p className="section-kicker">Agent</p>
            <p className="panel-copy">Use review actions to keep this deliverable moving.</p>
          </section>
        ) : null}
        {activeTab === "context" ? (
          <section className="task-panel">
            <p className="section-kicker">Context</p>
            <p className="panel-copy">Input: {detail.task_input}</p>
            <p className="panel-copy">Task summary: {detail.task_status_summary}</p>
          </section>
        ) : null}
        {activeTab === "history" ? (
          <section className="task-panel">
            <p className="section-kicker">History</p>
            <ul className="detail-list">
              {detail.review_history.map((entry) => (
                <li key={entry.id}>
                  <strong>{entry.action}</strong>
                  <span>{entry.note}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </aside>
    </div>
  );
}
