import type { Approval } from "../approval/types";
import type { Artifact } from "../artifact/types";

export interface TaskEventEnvelope {
  event_id: string;
  task_id: string;
  sequence: number;
  event_type: string;
  snapshot_version: number;
  message: string;
}

export type TaskConnectionState = "live" | "reconnecting" | "offline";

export interface TaskSummary {
  id: string;
  workspace_id: string;
  playbook_key: string;
  input: string;
  status: string;
  status_summary: string;
  artifact_id: string | null;
}

export interface TaskListItem {
  id: string;
  workspace_id: string;
  playbook_key: string;
  input: string;
  status: string;
  artifact_id: string | null;
}

export interface TaskPlan {
  steps: string[];
  current_step_index: number;
  status: string;
}

export interface TaskDetail {
  task: TaskSummary;
  plan: TaskPlan;
  approvals: Approval[];
  artifacts: Artifact[];
  timeline: TaskEventEnvelope[];
}
