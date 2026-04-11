import { ArrowRight, ShieldCheck, Users, Waypoints } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function UsersPage() {
  return (
    <div className="space-y-6 px-5 pb-6">
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card px-6 py-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-mono">Users</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Review access posture, workspace coverage, and operator ownership.
          </p>
        </div>
        <Button asChild size="lg">
          <Link to="/manage/audit-logs">
            <ShieldCheck />
            Review Audit Logs
          </Link>
        </Button>
      </section>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Role Lanes
            </CardTitle>
            <CardDescription>Keep account owners, operators, and reviewers separated by responsibility.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Use this surface as the entry point before deeper policy work lands in Task 6.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Waypoints className="h-4 w-4" />
              Workspace Coverage
            </CardTitle>
            <CardDescription>Map user ownership back to the workspaces they supervise or unblock.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            <Link className="inline-flex items-center gap-1 font-medium text-primary" to="/manage/account">
              Return to account governance
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audit Trail</CardTitle>
            <CardDescription>Validate role changes and operator decisions against the governance log.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            <Link className="inline-flex items-center gap-1 font-medium text-primary" to="/manage/audit-logs">
              Open audit logs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
