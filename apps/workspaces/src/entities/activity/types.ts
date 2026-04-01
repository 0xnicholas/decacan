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
  actor: { id: string; name: string };
  target: { type: "task" | "deliverable" | "approval" | "workspace"; id: string; title: string };
  createdAt: string;
}

export interface ActivityFilters {
  types?: ActivityEventType[];
}
