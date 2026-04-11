import { ArrowRight, Settings2, Users, Workflow } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function AccountPage() {
  return (
    <div className="space-y-6 px-5 pb-6">
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card px-6 py-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-mono">Account</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Operate the account boundary and hand governance work to the right management surface.
          </p>
        </div>
        <Button asChild size="lg">
          <Link to="/manage/users">
            <Users />
            Manage Users
          </Link>
        </Button>
      </section>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Access Governance
            </CardTitle>
            <CardDescription>Review who can operate inside the console and where approvals should land.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            <Link className="inline-flex items-center gap-1 font-medium text-primary" to="/manage/users">
              Open user governance
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-4 w-4" />
              Connected Systems
            </CardTitle>
            <CardDescription>Track which integrations influence routing, notifications, and exports.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            <Link className="inline-flex items-center gap-1 font-medium text-primary" to="/manage/integrations">
              Review integrations
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              Console Defaults
            </CardTitle>
            <CardDescription>Keep shell settings and exports consistent with the governance model.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            <Link className="inline-flex items-center gap-1 font-medium text-primary" to="/manage/settings">
              Open settings
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
