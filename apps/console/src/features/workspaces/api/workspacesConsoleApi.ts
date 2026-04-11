import { getJson } from '@/shared/api/client';

export interface ConsoleWorkspace {
  id: string;
  title: string;
  root_path?: string;
}

export interface ConsoleTask {
  id: string;
  workspace_id: string;
  playbook_key: string;
  input: string;
  status: string;
  status_summary: string;
  artifact_id: string | null;
}

export interface ConsoleApproval {
  id: string;
  workspace_id: string;
  task_id: string;
  task_playbook_key: string;
  decision: string;
  comment: string | null;
  status: string;
}

export interface ConsoleMember {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  invited_by: string | null;
  joined_at: string;
  workspace_id: string;
  workspace_title: string;
}

function getAuthHeaders() {
  const token = localStorage.getItem('token');

  if (!token) {
    return undefined;
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

async function getJsonWithStatus<T>(
  input: string,
  init: RequestInit = {},
): Promise<{ ok: true; data: T } | { ok: false; status?: number; error: Error }> {
  try {
    const headers = new Headers(init.headers);

    if (!headers.has('accept')) {
      headers.set('accept', 'application/json');
    }

    const response = await fetch(input, {
      ...init,
      method: init.method ?? 'GET',
      headers,
    });

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: new Error(`Request failed with status ${response.status}`),
      };
    }

    return {
      ok: true,
      data: (await response.json()) as T,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error : new Error('Request failed'),
    };
  }
}

async function listWorkspaceApprovals(workspaceId: string, signal?: AbortSignal) {
  return getJson<ConsoleApproval[]>(`/api/workspaces/${workspaceId}/approvals`, { signal });
}

async function listWorkspaceMembers(workspace: ConsoleWorkspace, signal?: AbortSignal) {
  const members = await getJson<
    Omit<ConsoleMember, 'workspace_id' | 'workspace_title'>[]
  >(`/api/workspaces/${workspace.id}/members`, {
    signal,
    headers: getAuthHeaders(),
  });

  return members.map((member) => ({
    ...member,
    workspace_id: workspace.id,
    workspace_title: workspace.title,
  }));
}

async function listWorkspaces(signal?: AbortSignal) {
  return getJson<ConsoleWorkspace[]>('/api/workspaces', { signal });
}

async function listTasks(signal?: AbortSignal) {
  return getJson<ConsoleTask[]>('/api/tasks', { signal });
}

async function listAccountApprovals(signal?: AbortSignal) {
  return getJson<ConsoleApproval[]>('/api/approvals', { signal });
}

async function listAccountMembers(signal?: AbortSignal) {
  return getJson<ConsoleMember[]>('/api/members', {
    signal,
    headers: getAuthHeaders(),
  });
}

async function listApprovalsByWorkspaceFanOut(signal?: AbortSignal) {
  const workspaces = await listWorkspaces(signal);
  const approvals = await Promise.allSettled(
    workspaces.map((workspace) => listWorkspaceApprovals(workspace.id, signal)),
  );

  return approvals.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
}

async function listMembersByWorkspaceFanOut(signal?: AbortSignal) {
  const workspaces = await listWorkspaces(signal);
  const members = await Promise.allSettled(
    workspaces.map((workspace) => listWorkspaceMembers(workspace, signal)),
  );

  return members.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
}

async function listApprovals(signal?: AbortSignal) {
  const result = await getJsonWithStatus<ConsoleApproval[]>('/api/approvals', { signal });

  if (result.ok) {
    return result.data;
  }

  if (result.status === 404 || result.status === 405) {
    return listApprovalsByWorkspaceFanOut(signal);
  }

  throw result.error;
}

async function listMembers(signal?: AbortSignal) {
  const result = await getJsonWithStatus<ConsoleMember[]>('/api/members', {
    signal,
    headers: getAuthHeaders(),
  });

  if (result.ok) {
    return result.data;
  }

  if (result.status === 404 || result.status === 405) {
    return listMembersByWorkspaceFanOut(signal);
  }

  throw result.error;
}

export const workspacesConsoleApi = {
  listWorkspaces,
  listTasks,
  listApprovals,
  listMembers,
};
