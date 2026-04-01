export interface AccountWorkspace {
  id: string;
  title: string;
  root_path: string;
}

export interface AccountWorkItem {
  id: string;
  workspace_id: string;
  task_id: string;
  title: string;
  kind: string;
  status: string;
}

export interface AccountTaskSummary {
  id: string;
  workspace_id: string;
  playbook_key: string;
  status: string;
  status_summary: string;
}

export interface AccountPlaybookShortcut {
  playbook_key: string;
  title: string;
  summary: string;
  mode_label: string;
}

export interface AccountHome {
  default_workspace_id: string;
  workspaces: AccountWorkspace[];
  waiting_on_me: AccountWorkItem[];
  recent_tasks: AccountTaskSummary[];
  playbook_shortcuts: AccountPlaybookShortcut[];
}
