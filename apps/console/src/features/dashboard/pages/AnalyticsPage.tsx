import { ArrowRight, BarChart3, BriefcaseBusiness, ListTodo } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AccountSummaryCards } from '@/features/account-hub/components/AccountSummaryCards';
import { getFinishedWorkCount, getRunningWorkCount, useDashboardAccountHome } from './dashboardPageData';

export function AnalyticsPage() {
  const { accountHome, errorMessage } = useDashboardAccountHome();

  return (
    <div className="space-y-6 px-5 pb-6">
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card px-6 py-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-mono">Analytics</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Track throughput, review load, and workspace coverage across the account.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/dashboard/my-work">
              <ListTodo />
              Open My Work
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/workspaces/all">
              <BriefcaseBusiness />
              Open All Workspaces
            </Link>
          </Button>
        </div>
      </section>

      {errorMessage ? (
        <Card>
          <CardHeader>
            <CardTitle>Analytics Unavailable</CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {accountHome ? (
        <>
          <AccountSummaryCards accountHome={accountHome} />

          <div className="grid gap-4 xl:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Throughput
                </CardTitle>
                <CardDescription>How much work is still moving versus already landed.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>{getRunningWorkCount(accountHome.recent_tasks)} active runs are still moving.</p>
                <p>{getFinishedWorkCount(accountHome.recent_tasks)} recent runs reached a terminal state.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Workspace Coverage</CardTitle>
                <CardDescription>Which operating surfaces are contributing signal into the console.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>{accountHome.workspaces.length} workspaces are visible to this account.</p>
                <p>Default workspace: {accountHome.default_workspace_id}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Next Moves</CardTitle>
                <CardDescription>Use the dashboard as an index, then jump to the right execution surface.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Link className="inline-flex items-center gap-1 font-medium text-primary" to="/dashboard/attention">
                  Review attention queue
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link className="inline-flex items-center gap-1 font-medium text-primary" to="/manage/account">
                  Hand off to account governance
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </>
      ) : errorMessage ? null : (
        <Card>
          <CardHeader>
            <CardTitle>Loading analytics</CardTitle>
            <CardDescription>Collecting summary counts from the account home feed.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-24 animate-pulse rounded-lg bg-muted" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
