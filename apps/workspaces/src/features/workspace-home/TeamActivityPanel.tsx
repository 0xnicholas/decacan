import { Card, CardContent, CardHeader } from "@decacan/ui";

import type { ActivityItem, TeamMember } from "../../entities/workspace-home/types";

interface TeamActivityPanelProps {
  items: ActivityItem[];
  team: TeamMember[];
}

export function TeamActivityPanel({ items, team }: TeamActivityPanelProps) {
  return (
    <section aria-label="Team activity">
      <Card className="h-full">
        <CardHeader>
          <h2 className="text-base font-semibold leading-none tracking-tight">Team Activity</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-3">
            {items.map((item) => (
              <li className="rounded-lg border border-border px-4 py-3" key={item.id}>
                <p className="font-medium">{item.message}</p>
                <p className="text-sm text-muted-foreground">{item.relative_time}</p>
              </li>
            ))}
          </ul>
          <ul className="space-y-2">
            {team.map((member) => (
              <li className="text-sm text-muted-foreground" key={member.id}>
                {member.name} ({member.role}) - {member.focus} [{member.status}]
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
