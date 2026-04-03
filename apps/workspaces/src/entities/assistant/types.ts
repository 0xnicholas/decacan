export interface AssistantObjective {
  title: string;
  user_goal: string;
}

export interface CreateAssistantSessionRequest {
  workspace_id: string;
  objective: AssistantObjective;
  execution_mode: "interactive" | "autonomous";
}

export interface AssistantDelegation {
  task_id: string;
  run_id: string;
  team_session_id: string;
  status: string;
}

export interface TeamSessionSnapshot {
  session_id: string;
  status: string;
  phase: string;
  snapshot_version: number;
  continuation_token?: string | null;
}

export interface AssistantSessionResponse {
  assistant_session_id: string;
  workspace_id: string;
  objective: AssistantObjective;
  execution_mode: string;
  delegation: AssistantDelegation;
  team_session: TeamSessionSnapshot;
}
