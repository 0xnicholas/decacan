import { AlertTriangle, ArrowRight, ShieldAlert, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { buildWorkspaceAppUrl } from '@/shared/config/workspacesApp';
import { getAttentionTaskCount, getAttentionWorkspaceIds, useDashboardAccountHome } from './dashboardPageData';

export function AttentionPage() {
  const { accountHome, errorMessage } = useDashboardAccountHome();

  return (
    <div className="space-y-6 px-5 pb-6">
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card px-6 py-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-mono">Attention</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Resolve approvals, blocked work, and account risks before they spread.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/workspaces/approvals">
              <AlertTriangle />
              Open Approvals
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/manage/users">
              <Users />
              Manage Users
            </Link>
          </Button>
        </div>
      </section>

      {errorMessage ? (
        <Card>
          <CardHeader>
            <CardTitle>Attention Queue Unavailable</CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {accountHome ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Needs Decision</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-3xl font-semibold text-mono">{accountHome.waiting_on_me.length}</div>
                <CardDescription>Approvals and manual decisions blocked on this account.</CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Needs Rescue</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-3xl font-semibold text-mono">{getAttentionTaskCount(accountHome.recent_tasks)}</div>
                <CardDescription>Recent tasks with statuses that typically require intervention.</CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Workspaces Impacted</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-3xl font-semibold text-mono">{getAttentionWorkspaceIds(accountHome).size}</div>
                <CardDescription>Unique workspaces currently represented in the attention queue.</CardDescription>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4" />
                  Waiting On Me
                </CardTitle>
                <CardDescription>Respond here first when the queue needs a human decision.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {accountHome.waiting_on_me.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nothing is blocked on manual review right now.</p>
                ) : (
                  accountHome.waiting_on_me.map((item) => (
                    <div key={item.id} className="space-y-2 rounded-lg border border-border px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">{item.title}</p>
                        <Badge variant="warning" appearance="light">
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Workspace {item.workspace_id} / Task {item.task_id}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Escalate Fast</CardTitle>
                <CardDescription>Shortcut out of the console when execution needs to resume inside a workspace.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {accountHome.default_workspace_id ? (
                  <a
                    className="inline-flex items-center gap-1 font-medium text-primary"
                    href={buildWorkspaceAppUrl(accountHome.default_workspace_id)}
                  >
                    Open default workspace
                    <ArrowRight className="h-4 w-4" />
                  </a>
                ) : null}
                <Link className="inline-flex items-center gap-1 font-medium text-primary" to="/manage/audit-logs">
                  Review governance trail
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </>
      ) : errorMessage ? null : (
        <Card>
          <CardHeader>
            <CardTitle>Loading attention queue</CardTitle>
            <CardDescription>Collecting approvals and flagged task states.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-24 animate-pulse rounded-lg bg-muted" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
