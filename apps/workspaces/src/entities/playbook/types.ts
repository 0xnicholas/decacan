export interface Workspace {
  id: string;
  title: string;
  root_path: string;
}

export interface PlaybookCard {
  key: string;
  store_entry_id: string;
  title: string;
  summary: string;
  mode_label: string;
  expected_output_label: string;
  expected_output_path: string;
}

export interface StoreEntry {
  store_entry_id: string;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  mode: "standard" | "discovery";
  official_version: string;
}
