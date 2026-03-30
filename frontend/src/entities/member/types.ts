export type MemberRole = "admin" | "lead" | "executor" | "viewer";

export interface MemberWorkload {
  activeTasks: number;
  pendingApprovals: number;
}

export interface MemberActivity {
  description: string;
  timestamp: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  avatarUrl?: string;
  workload: MemberWorkload;
  recentActivity: MemberActivity;
  joinedAt: string;
}
