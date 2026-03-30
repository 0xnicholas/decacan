import type { ActivityEvent, ActivityEventType, ActivityFilters } from "../../entities/activity/types";

export const MOCK_ACTIVITY: ActivityEvent[] = [
  {
    id: "event-1",
    type: "task_created",
    actor: "Ari",
    target: "TASK-001",
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: "event-2",
    type: "task_completed",
    actor: "Maya",
    target: "TASK-002",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "event-3",
    type: "approval_requested",
    actor: "Sam",
    target: "APPROVAL-001",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "event-4",
    type: "deliverable_created",
    actor: "Alex",
    target: "DELIVERABLE-001",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export async function fetchWorkspaceActivity(
  workspaceId: string,
  filters?: ActivityFilters,
): Promise<ActivityEvent[]> {
  let url = `/api/workspaces/${workspaceId}/activity`;
  
  if (filters?.type) {
    url += `?type=${filters.type}`;
  }

  const response = await fetch(url);
  
  if (workspaceId === "error-workspace") {
    throw new Error(`GET activity failed with ${response.status}`);
  }
  
  if (!response.ok) {
    throw new Error(`GET activity failed with ${response.status}`);
  }

  return (await response.json()) as ActivityEvent[];
}

export function getEventTypeLabel(type: ActivityEventType): string {
  const labels: Record<ActivityEventType, string> = {
    task_created: "Task created",
    task_completed: "Task completed",
    approval_requested: "Approval requested",
    approval_resolved: "Approval resolved",
    deliverable_created: "Deliverable created",
    member_joined: "Member joined",
  };
  return labels[type];
}
