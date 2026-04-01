import { useAuthenticatedClient } from './authClient';
import type { Member, MemberRole } from '../../entities/member/types';

export function useMembersApi() {
  const { fetchWithAuth } = useAuthenticatedClient();

  const fetchWorkspaceMembers = async (workspaceId: string): Promise<Member[]> => {
    const response = await fetchWithAuth(`/api/workspaces/${workspaceId}/members`);
    return response.json();
  };

  const inviteMember = async (
    workspaceId: string,
    email: string,
    role: MemberRole
  ): Promise<Member> => {
    const response = await fetchWithAuth(`/api/workspaces/${workspaceId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role }),
    });
    return response.json();
  };

  const updateMemberRole = async (
    workspaceId: string,
    memberId: string,
    role: MemberRole
  ): Promise<void> => {
    await fetchWithAuth(`/api/workspaces/${workspaceId}/members/${memberId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
  };

  const removeMember = async (
    workspaceId: string,
    memberId: string
  ): Promise<void> => {
    await fetchWithAuth(`/api/workspaces/${workspaceId}/members/${memberId}`, {
      method: 'DELETE',
    });
  };

  return {
    fetchWorkspaceMembers,
    inviteMember,
    updateMemberRole,
    removeMember,
  };
}

// Keep helper functions
export function getRoleLabel(role: MemberRole): string {
  const labels: Record<MemberRole, string> = {
    owner: 'Owner',
    admin: 'Admin',
    editor: 'Editor',
    viewer: 'Viewer',
  };
  return labels[role] || role;
}

export function getRoleColor(role: MemberRole): string {
  const colors: Record<MemberRole, string> = {
    owner: '#8B4513',
    admin: '#2D5E3E',
    editor: '#1E4D6B',
    viewer: '#6B5B1E',
  };
  return colors[role] || '#181311';
}
