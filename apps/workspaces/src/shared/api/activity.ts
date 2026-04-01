import type { ActivityEvent, ActivityEventType, ActivityFilters } from "../../entities/activity/types";

export const MOCK_ACTIVITY: ActivityEvent[] = [
  {
    id: "event-1",
    type: "task_created",
    actor: { id: "user-1", name: "Ari" },
    target: { type: "task", id: "TASK-001", title: "TASK-001" },
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: "event-2",
    type: "task_completed",
    actor: { id: "user-2", name: "Maya" },
    target: { type: "task", id: "TASK-002", title: "TASK-002" },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "event-3",
    type: "approval_requested",
    actor: { id: "user-3", name: "Sam" },
    target: { type: "approval", id: "APPROVAL-001", title: "APPROVAL-001" },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "event-4",
    type: "deliverable_created",
    actor: { id: "user-4", name: "Alex" },
    target: { type: "deliverable", id: "DELIVERABLE-001", title: "DELIVERABLE-001" },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export async function fetchWorkspaceActivity(
  workspaceId: string,
  filters?: ActivityFilters,
): Promise<ActivityEvent[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  if (workspaceId === "error-workspace") {
    throw new Error("GET activity failed with 500");
  }

  let results = [...MOCK_ACTIVITY];

  if (filters?.types && filters.types.length > 0) {
    const filterTypes = filters.types;
    results = results.filter((event) => filterTypes.includes(event.type));
  }

  return results;
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
