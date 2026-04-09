import { useCallback, useEffect, useState } from "react";

import type { Approval } from "../../entities/approval/types";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "../../shared/ui";

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

  const loadApprovals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const next = await listWorkspaceApprovals(workspaceId);
      setApprovals(next);
    } catch {
      setError("Failed to load approvals");
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    void loadApprovals();
  }, [loadApprovals]);

  const handleRetry = () => {
    void loadApprovals();
  };

  if (isLoading && approvals.length === 0 && !error) {
    return <LoadingState message="Loading approvals..." />;
  }

  return (
    <section aria-label="Approvals">
      <PageHeader title="Approvals" subtitle="Workspace" />
      {isLoading ? <LoadingState message="Loading approvals..." /> : null}
      {error ? <ErrorState message={error} onRetry={handleRetry} /> : null}
      {!isLoading && !error && approvals.length === 0 ? (
        <EmptyState title="No approvals in queue" message="Pending approvals will appear here when tasks require review." />
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
