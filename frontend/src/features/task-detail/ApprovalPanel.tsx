import type { Approval } from "../../entities/approval/types";

interface ApprovalPanelProps {
  approvals: Approval[];
}

export function ApprovalPanel({ approvals }: ApprovalPanelProps) {
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
            </li>
          ))}
        </ul>
      ) : (
        <p className="panel-copy">No approvals are blocking this task.</p>
      )}
    </section>
  );
}
