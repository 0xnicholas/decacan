import { Card, CardContent, CardHeader } from "@decacan/ui";

import type { WorkspaceWorkbenchModel } from "../../../entities/workbench/types";

interface TeamActivityPanelProps {
  items: WorkspaceWorkbenchModel["activity"];
  team: WorkspaceWorkbenchModel["team_snapshot"];
}

export function TeamActivityPanel({ items, team }: TeamActivityPanelProps) {
  const hasActivity = items.length > 0;
  const hasTeam = team.length > 0;

  return (
    <section aria-label="Team activity">
      <Card className="h-full">
        <CardHeader>
          <h2 className="text-base font-semibold leading-none tracking-tight">Team Activity</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasActivity && !hasTeam ? (
            <div className="rounded-lg border border-dashed border-border px-4 py-6">
              <p className="font-medium">No team activity yet</p>
              <p className="text-sm text-muted-foreground">
                Activity updates and teammate focus will appear here as work starts moving.
              </p>
            </div>
          ) : (
            <>
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
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
