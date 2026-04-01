export interface Approval {
  id: string;
  task_id: string;
  decision: string;
  comment: string | null;
  status: string;
}
