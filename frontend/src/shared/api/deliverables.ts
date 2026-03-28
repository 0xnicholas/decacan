import type { Deliverable, DeliverableDetail } from "../../entities/deliverable/types";
import { getJson } from "./client";

export function listDeliverables(workspaceId: string) {
  return getJson<Deliverable[]>(`/api/workspaces/${workspaceId}/deliverables`);
}

export function getDeliverableDetail(workspaceId: string, deliverableId: string) {
  return getJson<DeliverableDetail>(
    `/api/workspaces/${workspaceId}/deliverables/${deliverableId}`,
  );
}
