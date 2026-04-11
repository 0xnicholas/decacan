import { AlertTriangle, BriefcaseBusiness } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AccountSummaryCards } from '@/features/account-hub/components/AccountSummaryCards';
import { PlaybookShortcutPanel } from '@/features/account-hub/components/PlaybookShortcutPanel';
import { WorkQueuePanel } from '@/features/account-hub/components/WorkQueuePanel';
import { WorkspaceListPanel } from '@/features/account-hub/components/WorkspaceListPanel';
import { useDashboardAccountHome } from './dashboardPageData';

export function MyWorkPage() {
  const { accountHome, errorMessage } = useDashboardAccountHome();

  return (
    <div className="space-y-6 px-5 pb-6">
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card px-6 py-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-mono">My Work</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Track approvals, recent tasks, and the workspaces you manage from a single console.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/dashboard/attention">
              <AlertTriangle />
              Review Attention Queue
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/workspaces/workbench">
              <BriefcaseBusiness />
              Open Workbench
            </Link>
          </Button>
        </div>
      </section>

      {errorMessage ? (
        <Card>
          <CardHeader>
            <CardTitle>Console Unavailable</CardTitle>
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
            <CardTitle>Loading console</CardTitle>
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
