import { useEffect, useState } from 'react';
import { AccountSummaryCards } from '@/features/account-hub/components/AccountSummaryCards';
import { PlaybookShortcutPanel } from '@/features/account-hub/components/PlaybookShortcutPanel';
import { WorkQueuePanel } from '@/features/account-hub/components/WorkQueuePanel';
import { WorkspaceListPanel } from '@/features/account-hub/components/WorkspaceListPanel';
import { accountHubApi } from '@/features/account-hub/api/accountHubApi';
import type { AccountHome } from '@/features/account-hub/types/accountHub.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function DashboardPage() {
  const [accountHome, setAccountHome] = useState<AccountHome | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const loadAccountHome = async () => {
      try {
        const response = await accountHubApi.getHome(controller.signal);
        setAccountHome(response);
        setErrorMessage('');
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : 'Unable to load account hub.');
      }
    };

    void loadAccountHome();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <div className="space-y-6 px-5 pb-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold text-mono">My Work</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Track approvals, recent tasks, and the workspaces you move across from one account-level hub.
        </p>
      </section>

      {errorMessage ? (
        <Card>
          <CardHeader>
            <CardTitle>Account Hub Unavailable</CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {accountHome ? (
        <>
          <AccountSummaryCards accountHome={accountHome} />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
            <WorkQueuePanel recentTasks={accountHome.recent_tasks} waitingOnMe={accountHome.waiting_on_me} />
            <WorkspaceListPanel
              defaultWorkspaceId={accountHome.default_workspace_id}
              workspaces={accountHome.workspaces}
            />
          </div>

          <PlaybookShortcutPanel playbookShortcuts={accountHome.playbook_shortcuts} />
        </>
      ) : errorMessage ? null : (
        <Card>
          <CardHeader>
            <CardTitle>Loading account hub</CardTitle>
            <CardDescription>Fetching cross-workspace tasks, approvals, and shortcuts.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-24 animate-pulse rounded-lg bg-muted" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
