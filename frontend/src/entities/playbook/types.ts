export interface Workspace {
  id: string;
  title: string;
  root_path: string;
}

export interface PlaybookCard {
  key: string;
  title: string;
  summary: string;
  mode_label: string;
  expected_output_label: string;
  expected_output_path: string;
}
