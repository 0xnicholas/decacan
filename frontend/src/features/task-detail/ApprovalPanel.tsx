import type { Approval } from "../../entities/approval/types";

interface ApprovalPanelProps {
  approvals: Approval[];
  onApprove: (approvalId: string) => void;
}

export function ApprovalPanel({ approvals, onApprove }: ApprovalPanelProps) {
  return (
    <section className="task-panel">
      <div className="section-header">
        <p className="section-kicker">Risk</p>
        <h2>Approvals</h2>
      </div>
      {approvals.length > 0 ? (
        <ul className="detail-list">
          {approvals.map((approval) => (
            <li key={approval.id}>
              <strong>{approval.status}</strong>
              <span>{approval.comment ?? "Approval decision pending."}</span>
              {approval.status === "pending" ? (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => onApprove(approval.id)}
                >
                  Approve
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="panel-copy">No approvals are blocking this task.</p>
      )}
    </section>
  );
}
