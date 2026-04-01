import type { Deliverable, DeliverableDetail } from "../../entities/deliverable/types";
import { getJson } from "./client";

export interface DeliverablesFilter {
  status?: string;
  taskId?: string;
}

export class ApiRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function listDeliverables(workspaceId: string, filter: DeliverablesFilter = {}) {
  const query = new URLSearchParams();
  if (filter.status && filter.status !== "all") {
    query.set("status", filter.status);
  }
  if (filter.taskId && filter.taskId !== "all") {
    query.set("task_id", filter.taskId);
  }

  const path = query.size
    ? `/api/workspaces/${workspaceId}/deliverables?${query.toString()}`
    : `/api/workspaces/${workspaceId}/deliverables`;
  return getJson<Deliverable[]>(path);
}

export async function getDeliverableDetail(workspaceId: string, deliverableId: string) {
  const path = `/api/workspaces/${workspaceId}/deliverables/${deliverableId}`;
  const response = await fetch(path);
  if (!response.ok) {
    throw new ApiRequestError(`GET ${path} failed with ${response.status}`, response.status);
  }
  return (await response.json()) as DeliverableDetail;
}

export async function submitDeliverableReview(
  workspaceId: string,
  deliverableId: string,
  action: "approve" | "request_revision",
) {
  const path = `/api/workspaces/${workspaceId}/deliverables/${deliverableId}/review`;
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      action,
    }),
  });

  if (!response.ok) {
    throw new ApiRequestError(`POST ${path} failed with ${response.status}`, response.status);
  }
}
