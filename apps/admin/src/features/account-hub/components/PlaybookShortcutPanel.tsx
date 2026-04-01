import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { AccountPlaybookShortcut } from '../types/accountHub.types';

type PlaybookShortcutPanelProps = {
  playbookShortcuts: AccountPlaybookShortcut[];
};

export function PlaybookShortcutPanel({ playbookShortcuts }: PlaybookShortcutPanelProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Playbook Shortcuts</CardTitle>
        <CardDescription>Frequently used playbooks and the mode they support for your account.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {playbookShortcuts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No playbooks are pinned for quick access yet.</p>
        ) : (
          playbookShortcuts.map((playbook) => (
            <div key={playbook.playbook_key} className="space-y-2 rounded-lg border border-border px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-mono">{playbook.title}</p>
                <Badge variant="info" appearance="light">
                  {playbook.mode_label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{playbook.summary}</p>
              <p className="text-xs text-muted-foreground">Key: {playbook.playbook_key}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
