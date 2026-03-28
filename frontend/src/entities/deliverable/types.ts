export interface Deliverable {
  id: string;
  workspace_id: string;
  task_id: string;
  label: string;
  canonical_path: string;
  status: string;
  task_status: string;
}

export interface DeliverableDetail {
  deliverable: Deliverable;
  task_playbook_key: string;
  task_input: string;
  task_status_summary: string;
}
