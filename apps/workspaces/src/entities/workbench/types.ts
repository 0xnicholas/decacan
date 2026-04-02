import type {
  AttentionItem,
  ActivityItem,
  DeliverableItem,
  TaskHealth,
  TeamMember,
  WorkspaceDiscussionItem,
} from "../workspace-home/types";

export type WorkbenchSlot =
  | "resume"
  | "current_work_primary"
  | "queue_secondary"
  | "collaboration_left"
  | "collaboration_right"
  | "assistant_dock";

export interface WorkbenchTemplate {
  id: string;
  title: string;
  slot_order: WorkbenchSlot[];
  primary_cta_label: string;
  labels: Record<"task" | "deliverable" | "approval", string>;
}

export interface ResumeModel {
  primary_label: string;
  title: string;
  detail: string;
  target_task_id?: string;
}

export interface QueueModel {
  items: AttentionItem[];
}

export interface AssistantDockModel {
  state: "ambient" | "contextual";
  summary: string;
  suggested_actions: Array<{
    id: string;
    label: string;
    target_kind: "task" | "deliverable" | "discussion";
    target_id: string;
  }>;
}

export interface WorkspaceWorkbenchModel {
  workspace_id: string;
  template: WorkbenchTemplate;
  resume: ResumeModel;
  current_work: {
    task_health: TaskHealth;
    deliverables: DeliverableItem[];
  };
  queue: QueueModel;
  activity: ActivityItem[];
  discussion: WorkspaceDiscussionItem[];
  team_snapshot: TeamMember[];
  assistant: AssistantDockModel;
}
