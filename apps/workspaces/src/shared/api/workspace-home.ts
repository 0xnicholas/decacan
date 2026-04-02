import type { WorkspaceHomeData } from "../../entities/workspace-home/types";

import { getJson } from "./client";

export async function fetchWorkspaceHome(workspaceId: string): Promise<WorkspaceHomeData> {
  return getJson<WorkspaceHomeData>(`/api/workspaces/${workspaceId}/home`);
}
