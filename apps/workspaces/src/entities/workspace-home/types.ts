export interface AttentionItem {
  id: string;
  title: string;
  reason: string;
  severity: string;
}

export interface TaskHealth {
  running: number;
  waiting_approval: number;
  blocked: number;
  completed_today: number;
}

export interface ActivityItem {
  id: string;
  message: string;
  relative_time: string;
}

export interface DeliverableItem {
  id: string;
  label: string;
  canonical_path: string;
  status: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  focus: string;
  status: string;
}

export interface WorkspaceHomeTemplateConfig {
  id: string;
  title: string;
  slot_order: string[];
  labels?: Partial<Record<"task" | "deliverable" | "approval", string>>;
  primary_cta_label?: string;
}

export interface WorkspaceDiscussionItem {
  id: string;
  title: string;
  summary: string;
  status: "open" | "resolved";
}

export interface WorkspaceAssistantData {
  summary: string;
  suggested_actions: Array<{
    id: string;
    label: string;
    target_kind: "task" | "deliverable" | "discussion";
    target_id: string;
  }>;
}

export interface WorkspaceAssistantSessionSummary {
  assistant_session_id: string;
  active_team_session_id?: string | null;
  task_id?: string;
  state: string;
}

export interface WorkspaceHomeData {
  attention: AttentionItem[];
  task_health: TaskHealth;
  activity: ActivityItem[];
  deliverables: DeliverableItem[];
  team_snapshot: TeamMember[];
  discussion?: WorkspaceDiscussionItem[];
  template?: WorkspaceHomeTemplateConfig;
  assistant?: WorkspaceAssistantData;
  assistant_session?: WorkspaceAssistantSessionSummary;
}
