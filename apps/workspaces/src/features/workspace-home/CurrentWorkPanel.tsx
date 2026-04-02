import { Card, CardContent, CardHeader } from "@decacan/ui";

import type { WorkspaceWorkbenchModel } from "../../entities/workbench/types";

interface CurrentWorkPanelProps {
  currentWork: WorkspaceWorkbenchModel["current_work"];
}

export function CurrentWorkPanel({ currentWork }: CurrentWorkPanelProps) {
  return (
    <section aria-label="Current work">
      <Card className="h-full">
        <CardHeader>
          <h2 className="text-base font-semibold leading-none tracking-tight">Current Work</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Running: {currentWork.task_health.running} | Waiting approval:{" "}
            {currentWork.task_health.waiting_approval} | Blocked: {currentWork.task_health.blocked} |
            Completed today: {currentWork.task_health.completed_today}
          </p>
          <ul className="space-y-3">
            {currentWork.deliverables.map((deliverable) => (
              <li className="rounded-lg border border-border px-4 py-3" key={deliverable.id}>
                <p className="font-medium">{deliverable.label}</p>
                <p className="text-sm text-muted-foreground">{deliverable.canonical_path}</p>
                <p className="text-sm text-muted-foreground">Status: {deliverable.status}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
