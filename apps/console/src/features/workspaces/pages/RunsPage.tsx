import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { buildWorkspaceAppUrl } from '@/shared/config/workspacesApp';
import {
  type ConsoleTask,
  type ConsoleWorkspace,
  workspacesConsoleApi,
} from '../api/workspacesConsoleApi';

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

export function RunsPage() {
  const [tasks, setTasks] = useState<ConsoleTask[]>([]);
  const [workspaces, setWorkspaces] = useState<ConsoleWorkspace[]>([]);
  const [query, setQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const loadPage = async () => {
      try {
        const [nextWorkspaces, nextTasks] = await Promise.all([
          workspacesConsoleApi.listWorkspaces(controller.signal),
          workspacesConsoleApi.listTasks(controller.signal),
        ]);

        setWorkspaces(nextWorkspaces);
        setTasks(nextTasks);
        setErrorMessage('');
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : 'Unable to load runs.');
      }
    };

    void loadPage();

    return () => {
      controller.abort();
    };
  }, []);

  const filteredTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return tasks.filter((task) => {
      if (!normalizedQuery) {
        return true;
      }

      const workspaceTitle = getWorkspaceTitle(workspaces, task.workspace_id).toLowerCase();
      return (
        task.playbook_key.toLowerCase().includes(normalizedQuery) ||
        task.status.toLowerCase().includes(normalizedQuery) ||
        task.status_summary.toLowerCase().includes(normalizedQuery) ||
        workspaceTitle.includes(normalizedQuery)
      );
    });
  }, [query, tasks, workspaces]);

  return (
    <div className="space-y-6 px-5 pb-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold text-mono">Runs</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Track recent task runs across workspaces and reopen the workspace that owns the run.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Run Feed</CardTitle>
          <CardDescription>Filter by workspace, playbook, run status, or summary.</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            aria-label="Filter runs"
            placeholder="Filter runs"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </CardContent>
      </Card>

      {errorMessage ? (
        <Card>
          <CardHeader>
            <CardTitle>Runs Unavailable</CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <div className="grid gap-4">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              No runs match the current filter.
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card key={task.id}>
              <CardContent className="flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-mono">{task.playbook_key}</h2>
                    <Badge variant={getTaskVariant(task.status)} appearance="light">
                      {task.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{task.status_summary}</p>
                  <p className="text-xs text-muted-foreground">
                    {getWorkspaceTitle(workspaces, task.workspace_id)} / Task {task.id}
                  </p>
                </div>
                <a
                  className="inline-flex h-10 items-center justify-center rounded-md border border-input px-4 text-sm font-medium hover:bg-muted"
                  href={buildWorkspaceAppUrl(task.workspace_id)}
                >
                  Open workspace
                </a>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
