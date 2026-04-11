import { ArrowRight, BellRing, Cable, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function SettingsPage() {
  return (
    <div className="space-y-6 px-5 pb-6">
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card px-6 py-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-mono">Settings</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Control shell defaults, notifications, and export posture for the console.
          </p>
        </div>
        <Button asChild size="lg">
          <Link to="/manage/integrations">
            <Cable />
            Review Integrations
          </Link>
        </Button>
      </section>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Shell Defaults
            </CardTitle>
            <CardDescription>Control the default environment operators land in when they open the console.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            This route becomes the stable destination for account-level console configuration.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellRing className="h-4 w-4" />
              Notification Posture
            </CardTitle>
            <CardDescription>Keep approval, failure, and export notifications aligned with human ownership.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            <Link className="inline-flex items-center gap-1 font-medium text-primary" to="/dashboard/attention">
              Open attention queue
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cable className="h-4 w-4" />
              Integration Boundaries
            </CardTitle>
            <CardDescription>Connected systems inherit defaults and export rules from this governance surface.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            <Link className="inline-flex items-center gap-1 font-medium text-primary" to="/manage/integrations">
              Open integrations
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
