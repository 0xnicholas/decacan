import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { buildWorkspaceAppUrl } from '@/shared/config/workspacesApp';
import {
  type ConsoleApproval,
  type ConsoleWorkspace,
  workspacesConsoleApi,
} from '../api/workspacesConsoleApi';

function getWorkspaceTitle(workspaces: ConsoleWorkspace[], workspaceId: string) {
  return workspaces.find((workspace) => workspace.id === workspaceId)?.title ?? workspaceId;
}

export function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ConsoleApproval[]>([]);
  const [workspaces, setWorkspaces] = useState<ConsoleWorkspace[]>([]);
  const [query, setQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const loadPage = async () => {
      try {
        const [nextWorkspaces, nextApprovals] = await Promise.all([
          workspacesConsoleApi.listWorkspaces(controller.signal),
          workspacesConsoleApi.listApprovals(controller.signal),
        ]);

        setWorkspaces(nextWorkspaces);
        setApprovals(nextApprovals);
        setErrorMessage('');
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : 'Unable to load approvals.');
      }
    };

    void loadPage();

    return () => {
      controller.abort();
    };
  }, []);

  const filteredApprovals = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return approvals.filter((approval) => {
      if (!normalizedQuery) {
        return true;
      }

      const workspaceTitle = getWorkspaceTitle(workspaces, approval.workspace_id).toLowerCase();
      return (
        approval.task_playbook_key.toLowerCase().includes(normalizedQuery) ||
        approval.status.toLowerCase().includes(normalizedQuery) ||
        approval.task_id.toLowerCase().includes(normalizedQuery) ||
        workspaceTitle.includes(normalizedQuery)
      );
    });
  }, [approvals, query, workspaces]);

  return (
    <div className="space-y-6 px-5 pb-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold text-mono">Approvals</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Review pending decisions across every workspace without losing account-level context.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Approval Queue</CardTitle>
          <CardDescription>Filter by workspace, task, playbook, or approval status.</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            aria-label="Filter approvals"
            placeholder="Filter approvals"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </CardContent>
      </Card>

      {errorMessage ? (
        <Card>
          <CardHeader>
            <CardTitle>Approvals Unavailable</CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <div className="grid gap-4">
        {filteredApprovals.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              No approvals match the current filter.
            </CardContent>
          </Card>
        ) : (
          filteredApprovals.map((approval) => (
            <Card key={approval.id}>
              <CardContent className="flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-mono">{approval.task_playbook_key}</h2>
                    <Badge variant="warning" appearance="light">
                      {approval.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getWorkspaceTitle(workspaces, approval.workspace_id)} / Task {approval.task_id}
                  </p>
                </div>
                <a
                  className="inline-flex h-10 items-center justify-center rounded-md border border-input px-4 text-sm font-medium hover:bg-muted"
                  href={buildWorkspaceAppUrl(approval.workspace_id)}
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
