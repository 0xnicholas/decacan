import type { PlaybookCard, Workspace } from "../../entities/playbook/types";

import { getJson } from "./client";

export function fetchWorkspaces() {
  return getJson<Workspace[]>("/api/workspaces");
}

export interface AccountHomeWorkspace {
  id: string;
  title: string;
  root_path: string;
}

export interface AccountHome {
  default_workspace_id: string;
  workspaces: AccountHomeWorkspace[];
  waiting_on_me: Array<Record<string, unknown>>;
  recent_tasks: Array<Record<string, unknown>>;
  playbook_shortcuts: Array<Record<string, unknown>>;
}

export function fetchAccountHome() {
  return getJson<AccountHome>("/api/account/home");
}

export function fetchPublishedPlaybooks() {
  return getJson<PlaybookCard[]>("/api/published-playbooks").then((playbooks) =>
    playbooks.map((playbook) => ({
      ...playbook,
      key: playbook.playbook_handle_id,
    })),
  );
}
