import { Card, CardContent, CardHeader } from "@decacan/ui";

import type { WorkspaceDiscussionItem } from "../../entities/workspace-home/types";
import { EmptyState } from "../../shared/ui";

interface DiscussionPanelProps {
  items: WorkspaceDiscussionItem[];
}

export function DiscussionPanel({ items }: DiscussionPanelProps) {
  if (!items.length) {
    return (
      <section aria-label="Discussion">
        <h2 className="sr-only">Discussion</h2>
        <EmptyState
          title="No discussion yet"
          message="Discussion threads and follow-ups will appear here when the backend provides them."
        />
      </section>
    );
  }

  return (
    <section aria-label="Discussion">
      <Card className="h-full">
        <CardHeader>
          <h2 className="text-base font-semibold leading-none tracking-tight">Discussion</h2>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {items.map((item) => (
              <li className="rounded-lg border border-border px-4 py-3" key={item.id}>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.summary}</p>
                <p className="text-sm text-muted-foreground">Status: {item.status}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
