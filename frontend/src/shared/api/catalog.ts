import type { PlaybookCard, StoreEntry, Workspace } from "../../entities/playbook/types";

import { getJson, postJson, putJson } from "./client";

export function fetchWorkspaces() {
  return getJson<Workspace[]>("/api/workspaces");
}

export function fetchPlaybookStore(): Promise<PlaybookCard[]> {
  return getJson<StoreEntry[]>("/api/playbook-store").then((entries) =>
    entries.map((entry) => ({
      key: entry.title, // playbook_key is the Chinese title
      store_entry_id: entry.store_entry_id,
      title: entry.title,
      summary: entry.summary,
      mode_label: entry.mode === "standard" ? "标准模式" : "发现模式",
      expected_output_label: "Result document",
      expected_output_path: "output/result.md",
    }))
  );
}

export interface ForkPlaybookRequest {
  store_entry_id: string;
}

export interface ForkPlaybookResponse {
  handle: {
    playbook_handle_id: string;
    title: string;
  };
  draft: {
    draft_id: string;
  };
}

export function forkPlaybook(request: ForkPlaybookRequest) {
  return postJson<ForkPlaybookRequest, ForkPlaybookResponse>(
    "/api/playbooks/fork",
    request
  );
}

export interface PublishPlaybookResponse {
  version?: {
    playbook_version_id: string;
    version_number: number;
  };
}

export function publishPlaybook(handleId: string) {
  return postJson<Record<string, never>, PublishPlaybookResponse>(
    `/api/playbooks/${handleId}/publish`,
    {}
  );
}

export interface SaveDraftRequest {
  spec_document: string;
}

export interface SaveDraftResponse {
  draft: {
    draft_id: string;
  };
  health_report: {
    publishable: boolean;
  };
}

export function savePlaybookDraft(handleId: string, request: SaveDraftRequest) {
  return putJson<SaveDraftRequest, SaveDraftResponse>(
    `/api/playbooks/${handleId}/draft`,
    request
  );
}
