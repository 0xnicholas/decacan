import { ArrowRight, FileSearch, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function AuditLogsPage() {
  return (
    <div className="space-y-6 px-5 pb-6">
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card px-6 py-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-mono">Audit Logs</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Review the latest governance events and hand off deeper retention work to settings.
          </p>
        </div>
        <Button asChild size="lg">
          <Link to="/manage/settings">
            <ShieldCheck />
            Review Retention Settings
          </Link>
        </Button>
      </section>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSearch className="h-4 w-4" />
              Governance Events
            </CardTitle>
            <CardDescription>Shallow v1 entry for access changes, exports, and operational interventions.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Use this page as the stable route while deeper event feeds are added behind the same URL.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Retention</CardTitle>
            <CardDescription>Settings owns how long snapshots are kept and how exports are controlled.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            <Link className="inline-flex items-center gap-1 font-medium text-primary" to="/manage/settings">
              Open settings
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Context</CardTitle>
            <CardDescription>Jump back to the account hub when the event trail suggests broader action.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            <Link className="inline-flex items-center gap-1 font-medium text-primary" to="/manage/account">
              Return to account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
