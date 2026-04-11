import { ArrowRight, Cable, Settings2, ShieldEllipsis } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function IntegrationsPage() {
  return (
    <div className="space-y-6 px-5 pb-6">
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card px-6 py-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-mono">Integrations</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Track the systems connected to the console and keep credential ownership visible.
          </p>
        </div>
        <Button asChild size="lg">
          <Link to="/manage/settings">
            <Settings2 />
            Open Settings
          </Link>
        </Button>
      </section>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cable className="h-4 w-4" />
              Connected Systems
            </CardTitle>
            <CardDescription>Inventory the external systems that influence account-level operations.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Typical ownership includes SSO, notifications, exports, and delivery sinks.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldEllipsis className="h-4 w-4" />
              Credential Ownership
            </CardTitle>
            <CardDescription>Surface who is responsible for keys, tokens, and emergency rotation.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            <Link className="inline-flex items-center gap-1 font-medium text-primary" to="/manage/audit-logs">
              Review change trail
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Console Defaults</CardTitle>
            <CardDescription>Settings owns environment-level defaults used across connected systems.</CardDescription>
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
