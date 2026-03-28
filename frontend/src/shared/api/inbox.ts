import { getJson } from "./client";

export interface InboxItem {
  id: string;
  workspace_id: string;
  task_id: string;
  title: string;
  kind: string;
}

export interface InboxData {
  waiting_on_me: InboxItem[];
  recently_resolved: InboxItem[];
}

export function getInbox() {
  return getJson<InboxData>("/api/inbox");
}
