import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { buildWorkspaceAppUrl } from '@/shared/config/workspacesApp';
import type { AccountWorkspace } from '../types/accountHub.types';

type WorkspaceListPanelProps = {
  defaultWorkspaceId: string;
  workspaces: AccountWorkspace[];
};

export function WorkspaceListPanel({ defaultWorkspaceId, workspaces }: WorkspaceListPanelProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Workspaces</CardTitle>
        <CardDescription>Jump back into the spaces where you are actively executing work.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {workspaces.length === 0 ? (
          <p className="text-sm text-muted-foreground">No workspaces are available for this account yet.</p>
        ) : (
          workspaces.map((workspace) => (
            <div
              key={workspace.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-border px-4 py-3"
            >
              <div className="space-y-1">
                <p className="font-medium text-mono">{workspace.title}</p>
                <p className="text-xs text-muted-foreground">{workspace.root_path}</p>
              </div>
              <div className="flex items-center gap-2">
                {workspace.id === defaultWorkspaceId ? (
                  <Badge variant="success" appearance="light">
                    Default
                  </Badge>
                ) : null}
                <a
                  aria-label={`Open ${workspace.title}`}
                  className="text-sm font-medium text-primary hover:underline"
                  href={buildWorkspaceAppUrl(workspace.id)}
                >
                  Open
                </a>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
