export interface Workspace {
  id: string;
  title: string;
  root_path: string;
}

export interface PublishedPlaybook {
  key: string;
  playbook_handle_id: string;
  playbook_version_id: string;
  title: string;
  summary: string;
  mode_label: string;
  expected_output_label: string;
  expected_output_path: string;
}

export type PlaybookCard = PublishedPlaybook;

export interface StoreEntry {
  store_entry_id: string;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  mode: "standard" | "discovery";
  official_version: string;
}
