import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { AccountHome } from '../types/accountHub.types';

type AccountSummaryCardsProps = {
  accountHome: AccountHome;
};

export function AccountSummaryCards({ accountHome }: AccountSummaryCardsProps) {
  const runningWorkCount = accountHome.recent_tasks.filter((task) => task.status !== 'completed').length;
  const recentOutputCount = accountHome.recent_tasks.filter((task) => task.status === 'completed').length;

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
      title: 'Recent Outputs',
      value: recentOutputCount,
      description: 'Completed work ready for review or handoff.',
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
