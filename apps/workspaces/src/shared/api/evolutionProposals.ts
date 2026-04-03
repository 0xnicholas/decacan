interface ReviewEvolutionProposalRequest {
  team_session_id: string;
  title: string;
  review_state: string;
}

interface EvolutionProposalResponse {
  proposal_id: string;
  team_session_id: string;
  title: string;
  review_state: string;
}

export async function reviewEvolutionProposal(
  proposalId: string,
  request: ReviewEvolutionProposalRequest,
): Promise<EvolutionProposalResponse> {
  const response = await fetch(`/api/evolution-proposals/${proposalId}/review`, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`PATCH /api/evolution-proposals/${proposalId}/review failed with ${response.status}`);
  }

  return (await response.json()) as EvolutionProposalResponse;
}
