import type { Workspace } from "../../entities/workspace/types";

import { getJson } from "./client";

export function fetchWorkspaces() {
  return getJson<Workspace[]>("/api/workspaces");
}
