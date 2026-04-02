import { Card, CardContent, CardHeader } from "@decacan/ui";

import type { QueueModel } from "../../entities/workbench/types";

interface MyQueuePanelProps {
  queue: QueueModel;
}

export function MyQueuePanel({ queue }: MyQueuePanelProps) {
  return (
    <section aria-label="My queue">
      <Card className="h-full">
        <CardHeader>
          <h2 className="text-base font-semibold leading-none tracking-tight">My Queue</h2>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {queue.items.map((item) => (
              <li className="rounded-lg border border-border px-4 py-3" key={item.id}>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.reason}</p>
                <p className="text-sm text-muted-foreground">Severity: {item.severity}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
