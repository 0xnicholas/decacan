import type { TeamSessionSnapshot } from "../../entities/assistant/types";
import { DecisionAuditPanel, type DecisionRecord } from "./DecisionAuditPanel";

interface TeamSessionPanelProps {
  session: TeamSessionSnapshot;
  decisions?: DecisionRecord[];
  isReviewingProposalId?: string | null;
  onReviewProposal?: (proposalId: string, title: string, reviewState: string) => Promise<void>;
  onApproveDecision?: (decisionId: string) => void;
  onRejectDecision?: (decisionId: string) => void;
}

export function TeamSessionPanel({
  session,
  decisions = [],
  isReviewingProposalId = null,
  onReviewProposal,
  onApproveDecision,
  onRejectDecision,
}: TeamSessionPanelProps) {
  const evolutionProposals = session.evolution_proposals ?? [];

  const isBlockedOnHuman =
    session.blocked_reason?.toLowerCase().includes("human") ?? false;

  return (
    <section className="task-panel" aria-label="Team session">
      <p className="section-kicker">Agent Team</p>
      <h3 className="text-lg font-semibold">Team Session</h3>
      <p className="panel-copy">
        <strong>Status:</strong> {session.status}
      </p>
      <p className="panel-copy">
        <strong>Phase:</strong> {session.phase}
      </p>
      <p className="panel-copy">
        <strong>Snapshot:</strong> v{session.snapshot_version}
      </p>

      {isBlockedOnHuman && decisions.length > 0 && (
        <div className="mt-4">
          <DecisionAuditPanel
            decisions={decisions}
            onApprove={onApproveDecision}
            onReject={onRejectDecision}
            pendingOnly
          />
        </div>
      )}

      {decisions.length > 0 && !isBlockedOnHuman && (
        <div className="mt-4">
          <DecisionAuditPanel decisions={decisions} />
        </div>
      )}

      {evolutionProposals.length > 0 ? (
        <>
          <p className="panel-copy mt-4">
            <strong>Evolution Proposals</strong> (review-only)
          </p>
          <ul className="panel-copy" style={{ paddingLeft: "18px", margin: "0" }}>
            {evolutionProposals.map((proposal) => (
              <li key={proposal.proposal_id}>
                <span>
                  {proposal.title} - {proposal.review_state}
                </span>
                {onReviewProposal ? (
                  <span style={{ marginLeft: "8px" }}>
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={isReviewingProposalId === proposal.proposal_id}
                      onClick={() => {
                        void onReviewProposal(
                          proposal.proposal_id,
                          proposal.title,
                          "approved"
                        );
                      }}
                      aria-label={`Approve proposal ${proposal.title}`}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={isReviewingProposalId === proposal.proposal_id}
                      onClick={() => {
                        void onReviewProposal(
                          proposal.proposal_id,
                          proposal.title,
                          "rejected"
                        );
                      }}
                      aria-label={`Reject proposal ${proposal.title}`}
                      style={{ marginLeft: "6px" }}
                    >
                      Reject
                    </button>
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}
