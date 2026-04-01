import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { AccountHome } from '../types/accountHub.types';

type AccountSummaryCardsProps = {
  accountHome: AccountHome;
};

const ACTIVE_TASK_STATUSES = new Set([
  'created',
  'planning',
  'accepted',
  'running',
  'paused',
  'pending',
  'waiting_approval',
]);
const FINISHED_TASK_STATUSES = new Set(['completed', 'succeeded', 'failed', 'cancelled']);

export function AccountSummaryCards({ accountHome }: AccountSummaryCardsProps) {
  const runningWorkCount = accountHome.recent_tasks.filter((task) => ACTIVE_TASK_STATUSES.has(task.status)).length;
  const finishedWorkCount = accountHome.recent_tasks.filter((task) => FINISHED_TASK_STATUSES.has(task.status)).length;

  const cards = [
    {
      title: 'Waiting On Me',
      value: accountHome.waiting_on_me.length,
      description: 'Approvals and decisions that need attention now.',
    },
    {
      title: 'Running Work',
      value: runningWorkCount,
      description: 'Recent tasks still moving across your workspaces.',
    },
    {
      title: 'Finished Work',
      value: finishedWorkCount,
      description: 'Tasks that reached a finished state across your active workspaces.',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader>
            <CardTitle>{card.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-semibold text-mono">{card.value}</div>
            <CardDescription>{card.description}</CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
