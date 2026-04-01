import type { WorkspaceHomeData } from "../../entities/workspace-home/types";

import { getJson } from "./client";

export function fetchWorkspaceHome(workspaceId: string) {
  return getJson<WorkspaceHomeData>(`/api/workspaces/${workspaceId}/home`);
}
