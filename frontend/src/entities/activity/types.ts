export type ActivityEventType =
  | "task_created"
  | "task_completed"
  | "approval_requested"
  | "approval_resolved"
  | "deliverable_created"
  | "member_joined";

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  actor: string;
  target: string;
  timestamp: string;
}

export interface ActivityFilters {
  type?: ActivityEventType;
}
