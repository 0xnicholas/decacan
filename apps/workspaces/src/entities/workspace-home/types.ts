export interface AttentionItem {
  id: string;
  title: string;
  reason: string;
  severity: string;
}

export interface TaskHealth {
  running: number;
  waiting_approval: number;
  blocked: number;
  completed_today: number;
}

export interface ActivityItem {
  id: string;
  message: string;
  relative_time: string;
}

export interface DeliverableItem {
  id: string;
  label: string;
  canonical_path: string;
  status: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  focus: string;
  status: string;
}

export interface WorkspaceHomeData {
  attention: AttentionItem[];
  task_health: TaskHealth;
  activity: ActivityItem[];
  deliverables: DeliverableItem[];
  team_snapshot: TeamMember[];
}
