import type { TeamSessionSnapshot } from "../../entities/assistant/types";

interface TeamSessionPanelProps {
  session: TeamSessionSnapshot;
  isReviewingProposalId?: string | null;
  onReviewProposal?: (proposalId: string, title: string, reviewState: string) => Promise<void>;
}

export function TeamSessionPanel({
  session,
  isReviewingProposalId = null,
  onReviewProposal,
}: TeamSessionPanelProps) {
  const evolutionProposals = session.evolution_proposals ?? [];

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
      {evolutionProposals.length > 0 ? (
        <>
          <p className="panel-copy">
            <strong>Evolution Proposals</strong> (review-only)
          </p>
          <ul className="panel-copy" style={{ paddingLeft: "18px", margin: "0" }}>
            {evolutionProposals.map((proposal) => (
              <li key={proposal.proposal_id}>
                <span>{proposal.title} - {proposal.review_state}</span>
                {onReviewProposal ? (
                  <span style={{ marginLeft: "8px" }}>
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={isReviewingProposalId === proposal.proposal_id}
                      onClick={() => {
                        void onReviewProposal(proposal.proposal_id, proposal.title, "approved");
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
                        void onReviewProposal(proposal.proposal_id, proposal.title, "rejected");
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
