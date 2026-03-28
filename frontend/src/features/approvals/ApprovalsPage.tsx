import { useEffect, useState } from "react";

import type { Approval } from "../../entities/approval/types";

interface ApprovalsPageProps {
  workspaceId: string;
}

async function listWorkspaceApprovals(workspaceId: string) {
  const response = await fetch(`/api/workspaces/${workspaceId}/approvals`);
  if (!response.ok) {
    throw new Error(`GET approvals failed with ${response.status}`);
  }
  return (await response.json()) as Approval[];
}

async function decideWorkspaceApproval(
  workspaceId: string,
  approvalId: string,
  decision: "approved" | "rejected",
) {
  const response = await fetch(`/api/workspaces/${workspaceId}/approvals/${approvalId}/decision`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      decision,
      comment: decision === "approved" ? "Approved in approvals center" : "Rejected in approvals center",
    }),
  });

  if (!response.ok) {
    throw new Error(`POST approval decision failed with ${response.status}`);
  }
}

export function ApprovalsPage({ workspaceId }: ApprovalsPageProps) {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadApprovals() {
      setIsLoading(true);
      setError(null);
      try {
        const next = await listWorkspaceApprovals(workspaceId);
        if (active) {
          setApprovals(next);
        }
      } catch {
        if (active) {
          setError("Failed to load approvals");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadApprovals();
    return () => {
      active = false;
    };
  }, [workspaceId]);

  return (
    <section aria-label="Approvals">
      <p className="eyebrow">Workspace</p>
      <h1>Approvals</h1>
      {isLoading ? <p className="subcopy">Loading approvals...</p> : null}
      {error ? <p className="subcopy">{error}</p> : null}
      {!isLoading && !error && approvals.length === 0 ? (
        <p className="subcopy">No approvals in queue.</p>
      ) : null}
      {!isLoading && !error && approvals.length > 0 ? (
        <ul className="detail-list">
          {approvals.map((approval) => (
            <li key={approval.id} className="task-panel">
              <strong>{approval.id}</strong>
              <span>Task: {approval.task_id}</span>
              <span>Status: {approval.status}</span>
              <div className="task-composer-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={async () => {
                    await decideWorkspaceApproval(workspaceId, approval.id, "approved");
                  }}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={async () => {
                    await decideWorkspaceApproval(workspaceId, approval.id, "rejected");
                  }}
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
