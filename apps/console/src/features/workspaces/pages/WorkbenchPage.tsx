import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { buildWorkspaceAppUrl } from '@/shared/config/workspacesApp';
import {
  type ConsoleApproval,
  type ConsoleTask,
  type ConsoleWorkspace,
  workspacesConsoleApi,
} from '../api/workspacesConsoleApi';

type WorkbenchState = {
  approvals: ConsoleApproval[];
  tasks: ConsoleTask[];
  workspaces: ConsoleWorkspace[];
};

function getWorkspaceTitle(workspaces: ConsoleWorkspace[], workspaceId: string) {
  return workspaces.find((workspace) => workspace.id === workspaceId)?.title ?? workspaceId;
}

function getTaskVariant(status: string): 'secondary' | 'success' | 'warning' | 'destructive' {
  if (status === 'completed' || status === 'succeeded') {
    return 'success';
  }

  if (status.includes('approval') || status === 'blocked' || status === 'pending') {
    return 'warning';
  }

  if (status === 'failed' || status === 'cancelled') {
    return 'destructive';
  }

  return 'secondary';
}

export function WorkbenchPage() {
  const [query, setQuery] = useState('');
  const [state, setState] = useState<WorkbenchState>({
    approvals: [],
    tasks: [],
    workspaces: [],
  });
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const loadWorkbench = async () => {
      try {
        const [workspaces, tasks, approvals] = await Promise.all([
          workspacesConsoleApi.listWorkspaces(controller.signal),
          workspacesConsoleApi.listTasks(controller.signal),
          workspacesConsoleApi.listApprovals(controller.signal),
        ]);

        setState({ workspaces, tasks, approvals });
        setErrorMessage('');
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : 'Unable to load workbench.');
      }
    };

    void loadWorkbench();

    return () => {
      controller.abort();
    };
  }, []);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredTasks = useMemo(
    () =>
      state.tasks.filter((task) => {
        if (!normalizedQuery) {
          return true;
        }

        const workspaceTitle = getWorkspaceTitle(state.workspaces, task.workspace_id).toLowerCase();
        return (
          task.playbook_key.toLowerCase().includes(normalizedQuery) ||
          task.status.toLowerCase().includes(normalizedQuery) ||
          task.status_summary.toLowerCase().includes(normalizedQuery) ||
          workspaceTitle.includes(normalizedQuery)
        );
      }),
    [normalizedQuery, state.tasks, state.workspaces],
  );

  const filteredApprovals = useMemo(
    () =>
      state.approvals.filter((approval) => {
        if (!normalizedQuery) {
          return true;
        }

        const workspaceTitle = getWorkspaceTitle(state.workspaces, approval.workspace_id).toLowerCase();
        return (
          approval.task_playbook_key.toLowerCase().includes(normalizedQuery) ||
          approval.status.toLowerCase().includes(normalizedQuery) ||
          approval.task_id.toLowerCase().includes(normalizedQuery) ||
          workspaceTitle.includes(normalizedQuery)
        );
      }),
    [normalizedQuery, state.approvals, state.workspaces],
  );

  const primaryWorkspace = state.workspaces[0];

  return (
    <div className="space-y-6 px-5 pb-6">
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card px-6 py-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-mono">Workbench</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Keep active work moving across the account before you drop into a specific workspace.
          </p>
        </div>
        {primaryWorkspace ? (
          <a
            aria-label="Open workspace"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
            href={buildWorkspaceAppUrl(primaryWorkspace.id)}
          >
            Open workspace
          </a>
        ) : null}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Account Triage</CardTitle>
          <CardDescription>Filter active runs and pending decisions across every workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            aria-label="Filter workbench items"
            placeholder="Filter by workspace, playbook, status, or task"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </CardContent>
      </Card>

      {errorMessage ? (
        <Card>
          <CardHeader>
            <CardTitle>Workbench Unavailable</CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Waiting Approvals</CardTitle>
            <CardDescription>Items that still need a decision before work can continue.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredApprovals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No approvals match the current filter.</p>
            ) : (
              filteredApprovals.map((approval) => (
                <div key={approval.id} className="rounded-lg border border-border px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-mono">{approval.task_playbook_key}</p>
                      <p className="text-sm text-muted-foreground">
                        {getWorkspaceTitle(state.workspaces, approval.workspace_id)} / Task {approval.task_id}
                      </p>
                    </div>
                    <Badge variant={getTaskVariant(approval.status)} appearance="light">
                      {approval.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Runs</CardTitle>
            <CardDescription>The latest work still moving across your workspaces.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No runs match the current filter.</p>
            ) : (
              filteredTasks.map((task) => (
                <div key={task.id} className="rounded-lg border border-border px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-mono">{task.playbook_key}</p>
                      <p className="text-sm text-muted-foreground">{task.status_summary}</p>
                      <p className="text-xs text-muted-foreground">
                        {getWorkspaceTitle(state.workspaces, task.workspace_id)}
                      </p>
                    </div>
                    <Badge variant={getTaskVariant(task.status)} appearance="light">
                      {task.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
