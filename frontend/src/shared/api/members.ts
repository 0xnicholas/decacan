import type { Member } from "../../entities/member/types";

export const MOCK_MEMBERS: Member[] = [
  {
    id: "member-1",
    name: "Ari Mitchell",
    email: "ari@example.com",
    role: "admin",
    avatarUrl: undefined,
    workload: {
      activeTasks: 12,
      pendingApprovals: 3,
    },
    recentActivity: {
      description: "Created task TASK-001",
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "member-2",
    name: "Maya Chen",
    email: "maya@example.com",
    role: "lead",
    avatarUrl: undefined,
    workload: {
      activeTasks: 8,
      pendingApprovals: 5,
    },
    recentActivity: {
      description: "Completed task TASK-002",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "member-3",
    name: "Sam Park",
    email: "sam@example.com",
    role: "executor",
    avatarUrl: undefined,
    workload: {
      activeTasks: 15,
      pendingApprovals: 1,
    },
    recentActivity: {
      description: "Requested approval APPROVAL-003",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
    joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export async function fetchWorkspaceMembers(workspaceId: string): Promise<Member[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  if (workspaceId === "error-workspace") {
    throw new Error("GET members failed with 500");
  }

  return [...MOCK_MEMBERS];
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    admin: "Admin",
    lead: "Lead",
    executor: "Executor",
    viewer: "Viewer",
  };
  return labels[role] || role;
}

export function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    admin: "#8B4513",
    lead: "#2D5E3E",
    executor: "#1E4D6B",
    viewer: "#6B5B1E",
  };
  return colors[role] || "#181311";
}
