export interface Deliverable {
  id: string;
  workspace_id: string;
  task_id: string;
  label: string;
  canonical_path: string;
  status: string;
  task_status: string;
  owner: string;
}

export interface DeliverableLinkedTask {
  id: string;
  playbook_key: string;
}

export interface DeliverableReviewHistoryEntry {
  id: string;
  action: string;
  note: string;
}

export interface DeliverableDetail {
  deliverable: Deliverable;
  linked_task: DeliverableLinkedTask;
  review_actions: string[];
  review_history: DeliverableReviewHistoryEntry[];
  task_playbook_key: string;
  task_input: string;
  task_status_summary: string;
}
