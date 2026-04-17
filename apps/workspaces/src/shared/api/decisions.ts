import { getJson, postJson } from "./client";

export interface DecisionRecord {
  id: string;
  teamSessionId: string;
  taskId: string;
  executionId: string;
  decisionType: string;
  decision: string;
  reason?: string;
  policyId?: string;
  riskLevel?: string;
  decidedBy: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface EvaluationRequest {
  actorId: string;
  action: string;
  profileId: string;
  resourceOwnerId?: string;
}

export interface EvaluationResult {
  authorized: boolean;
  actionClass: string;
  reason: string;
  requiresApproval: boolean;
  approverRole?: string;
}

export async function getDecisionsByTask(taskId: string): Promise<DecisionRecord[]> {
  const response = await getJson<{ decisions: DecisionRecord[] }>(`/api/decisions/audit/${taskId}`);
  return response.decisions;
}

export async function getDecisionsByTeamSession(teamSessionId: string): Promise<DecisionRecord[]> {
  const response = await getJson<{ decisions: DecisionRecord[] }>(`/api/decisions/team-session/${teamSessionId}`);
  return response.decisions;
}

export async function getDecisionsByExecution(executionId: string): Promise<DecisionRecord[]> {
  const response = await getJson<{ decisions: DecisionRecord[] }>(`/api/decisions/execution/${executionId}`);
  return response.decisions;
}

export async function evaluateAction(request: EvaluationRequest): Promise<EvaluationResult> {
  const response = await postJson<EvaluationRequest, { evaluation: EvaluationResult }>(
    "/api/decisions/evaluate",
    request
  );
  return response.evaluation;
}

export interface PolicyAction {
  action: string;
  actionClass: string;
  riskLevel: string;
  requiresApproval: boolean;
  approverRole?: string;
}

export async function getPolicyActions(profileId: string): Promise<PolicyAction[]> {
  const response = await getJson<{ actions: PolicyAction[] }>(`/api/policy/actions/${profileId}`);
  return response.actions;
}
