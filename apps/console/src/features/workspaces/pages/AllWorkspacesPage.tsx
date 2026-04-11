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

function getTaskCount(tasks: ConsoleTask[], workspaceId: string) {
  return tasks.filter((task) => task.workspace_id === workspaceId).length;
}

function getOpenTaskCount(tasks: ConsoleTask[], workspaceId: string) {
  return tasks.filter(
    (task) =>
      task.workspace_id === workspaceId && task.status !== 'completed' && task.status !== 'succeeded',
  ).length;
}

export function AllWorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<ConsoleWorkspace[]>([]);
  const [tasks, setTasks] = useState<ConsoleTask[]>([]);
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

        setErrorMessage(error instanceof Error ? error.message : 'Unable to load workspaces.');
      }
    };

    void loadPage();

    return () => {
      controller.abort();
    };
  }, []);

  const filteredWorkspaces = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return workspaces.filter((workspace) => {
      if (!normalizedQuery) {
        return true;
      }

      return (
        workspace.title.toLowerCase().includes(normalizedQuery) ||
        workspace.id.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [query, workspaces]);

  return (
    <div className="space-y-6 px-5 pb-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold text-mono">All Workspaces</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Browse every workspace in this account, then jump into the execution app when you need detail.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Workspace Directory</CardTitle>
          <CardDescription>Filter the account-wide workspace list before handing off into a workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            aria-label="Filter workspaces"
            placeholder="Filter by workspace name or id"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </CardContent>
      </Card>

      {errorMessage ? (
        <Card>
          <CardHeader>
            <CardTitle>Workspace Directory Unavailable</CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <div className="grid gap-4">
        {filteredWorkspaces.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              No workspaces match the current filter.
            </CardContent>
          </Card>
        ) : (
          filteredWorkspaces.map((workspace) => (
            <Card key={workspace.id}>
              <CardContent className="flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-mono">{workspace.title}</h2>
                    <Badge variant="secondary" appearance="light">
                      {workspace.id}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getTaskCount(tasks, workspace.id)} total runs, {getOpenTaskCount(tasks, workspace.id)} still active.
                  </p>
                </div>
                <a
                  aria-label={`Open ${workspace.title}`}
                  className="inline-flex h-10 items-center justify-center rounded-md border border-input px-4 text-sm font-medium hover:bg-muted"
                  href={buildWorkspaceAppUrl(workspace.id)}
                >
                  Open
                </a>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
