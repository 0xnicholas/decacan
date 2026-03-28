import type { PlaybookCard, Workspace } from "../../entities/playbook/types";

import { getJson } from "./client";

export function fetchWorkspaces() {
  return getJson<Workspace[]>("/api/workspaces");
}

export function fetchPlaybooks() {
  return getJson<PlaybookCard[]>("/api/playbooks");
}
