import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { buildWorkspaceAppUrl } from '@/shared/config/workspacesApp';
import { type ConsoleMember, workspacesConsoleApi } from '../api/workspacesConsoleApi';

export function MembersPage() {
  const [members, setMembers] = useState<ConsoleMember[]>([]);
  const [query, setQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const loadPage = async () => {
      try {
        const nextMembers = await workspacesConsoleApi.listMembers(controller.signal);
        setMembers(nextMembers);
        setErrorMessage('');
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : 'Unable to load members.');
      }
    };

    void loadPage();

    return () => {
      controller.abort();
    };
  }, []);

  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return members.filter((member) => {
      if (!normalizedQuery) {
        return true;
      }

      return (
        member.name.toLowerCase().includes(normalizedQuery) ||
        member.email.toLowerCase().includes(normalizedQuery) ||
        member.workspace_title.toLowerCase().includes(normalizedQuery) ||
        member.role.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [members, query]);

  return (
    <div className="space-y-6 px-5 pb-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold text-mono">Members</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          See who is active across workspaces and where they currently hold access.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Member Directory</CardTitle>
          <CardDescription>Filter membership rows by person, workspace, role, or email.</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            aria-label="Filter members"
            placeholder="Filter members"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </CardContent>
      </Card>

      {errorMessage ? (
        <Card>
          <CardHeader>
            <CardTitle>Members Unavailable</CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <div className="grid gap-4">
        {filteredMembers.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              No members match the current filter.
            </CardContent>
          </Card>
        ) : (
          filteredMembers.map((member) => (
            <Card key={member.id}>
              <CardContent className="flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-mono">{member.name}</h2>
                    <Badge variant="secondary" appearance="light">
                      {member.role}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                  <p className="text-xs text-muted-foreground">{member.workspace_title}</p>
                </div>
                <a
                  className="inline-flex h-10 items-center justify-center rounded-md border border-input px-4 text-sm font-medium hover:bg-muted"
                  href={buildWorkspaceAppUrl(member.workspace_id)}
                >
                  Open workspace
                </a>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
