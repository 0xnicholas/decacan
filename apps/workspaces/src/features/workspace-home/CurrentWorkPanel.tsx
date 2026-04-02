import { Card, CardContent, CardHeader } from "@decacan/ui";

import type { WorkspaceWorkbenchModel } from "../../entities/workbench/types";

interface CurrentWorkPanelProps {
  currentWork: WorkspaceWorkbenchModel["current_work"];
  template: WorkspaceWorkbenchModel["template"];
}

function pluralizeLabel(label: string) {
  return `${label.toLowerCase()}s`;
}

export function CurrentWorkPanel({ currentWork, template }: CurrentWorkPanelProps) {
  return (
    <section aria-label="Current work">
      <Card className="h-full">
        <CardHeader>
          <h2 className="text-base font-semibold leading-none tracking-tight">Current Work</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Track active {pluralizeLabel(template.labels.task)} and {pluralizeLabel(template.labels.deliverable)} for{" "}
            {template.title}.
          </p>
          <p className="text-sm text-muted-foreground">
            Running: {currentWork.task_health.running} | Waiting approval:{" "}
            {currentWork.task_health.waiting_approval} | Blocked: {currentWork.task_health.blocked} |
            Completed today: {currentWork.task_health.completed_today}
          </p>
          <ul className="space-y-3">
            {currentWork.deliverables.map((deliverable) => (
              <li className="rounded-lg border border-border px-4 py-3" key={deliverable.id}>
                <p className="font-medium">{deliverable.label}</p>
                <p className="text-sm text-muted-foreground">
                  {template.labels.deliverable} path: {deliverable.canonical_path}
                </p>
                <p className="text-sm text-muted-foreground">Status: {deliverable.status}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
