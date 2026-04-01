import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { AccountTaskSummary, AccountWorkItem } from '../types/accountHub.types';

type WorkQueuePanelProps = {
  recentTasks: AccountTaskSummary[];
  waitingOnMe: AccountWorkItem[];
};

function getStatusVariant(status: string): 'secondary' | 'success' | 'warning' {
  if (status === 'completed') {
    return 'success';
  }

  if (status.includes('approval') || status === 'blocked') {
    return 'warning';
  }

  return 'secondary';
}

export function WorkQueuePanel({ recentTasks, waitingOnMe }: WorkQueuePanelProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Work Queue</CardTitle>
        <CardDescription>Cross-workspace approvals and recent tasks assigned to this account.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-mono">Waiting On Me</h2>
            <p className="text-sm text-muted-foreground">Approvals and actions requiring a response.</p>
          </div>
          {waitingOnMe.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing is blocked on your input right now.</p>
          ) : (
            waitingOnMe.map((item) => (
              <div key={item.id} className="space-y-2 rounded-lg border border-border px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{item.title}</p>
                  <Badge variant={getStatusVariant(item.status)} appearance="light">
                    {item.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Workspace {item.workspace_id} / Task {item.task_id}
                </p>
              </div>
            ))
          )}
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-mono">Recent Tasks</h2>
            <p className="text-sm text-muted-foreground">The latest runs you may need to revisit.</p>
          </div>
          {recentTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent tasks have been recorded yet.</p>
          ) : (
            recentTasks.map((task) => (
              <div key={task.id} className="space-y-2 rounded-lg border border-border px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-mono">{task.playbook_key}</p>
                  <Badge variant={getStatusVariant(task.status)} appearance="light">
                    {task.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{task.status_summary}</p>
                <p className="text-xs text-muted-foreground">Workspace {task.workspace_id}</p>
              </div>
            ))
          )}
        </section>
      </CardContent>
    </Card>
  );
}
