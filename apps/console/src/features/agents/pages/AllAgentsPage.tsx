import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { agentsConsoleApi, type ConsoleAgent } from '../api/agentsConsoleApi';

function formatStatus(status: ConsoleAgent['status']) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getStatusVariant(status: ConsoleAgent['status']): 'secondary' | 'success' | 'warning' {
  if (status === 'active') {
    return 'success';
  }

  if (status === 'ready') {
    return 'warning';
  }

  return 'secondary';
}

export function AllAgentsPage() {
  const [agents, setAgents] = useState<ConsoleAgent[]>([]);
  const [query, setQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const loadAgents = async () => {
      try {
        const nextAgents = await agentsConsoleApi.listAgents(controller.signal);
        setAgents(nextAgents);
        setErrorMessage('');
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : 'Unable to load agents.');
      }
    };

    void loadAgents();

    return () => {
      controller.abort();
    };
  }, []);

  const filteredAgents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return agents.filter((agent) => {
      if (!normalizedQuery) {
        return true;
      }

      return (
        agent.name.toLowerCase().includes(normalizedQuery) ||
        agent.summary.toLowerCase().includes(normalizedQuery) ||
        agent.playbookName.toLowerCase().includes(normalizedQuery) ||
        agent.teamName.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [agents, query]);

  return (
    <div className="space-y-6 px-5 pb-6">
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card px-6 py-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-mono">All Agents</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Browse the account-level agent directory, then open a single agent for configuration detail and activity.
          </p>
        </div>
        <Button asChild>
          <Link to="/agents/new">Create Agent</Link>
        </Button>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Directory Filter</CardTitle>
          <CardDescription>Filter by agent name, playbook, team, or summary.</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            aria-label="Filter agents"
            placeholder="Filter agents"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </CardContent>
      </Card>

      {errorMessage ? (
        <Card>
          <CardHeader>
            <CardTitle>Agents Unavailable</CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <div className="grid gap-4">
        {filteredAgents.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              No agents match the current filter.
            </CardContent>
          </Card>
        ) : (
          filteredAgents.map((agent) => (
            <Card key={agent.id}>
              <CardContent className="flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-mono">{agent.name}</h2>
                    <Badge variant={getStatusVariant(agent.status)} appearance="light">
                      {formatStatus(agent.status)}
                    </Badge>
                  </div>
                  <p className="max-w-3xl text-sm text-muted-foreground">{agent.summary}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>Playbook: {agent.playbookName}</span>
                    <span>Team: {agent.teamName}</span>
                    <span>Owner: {agent.owner}</span>
                  </div>
                </div>
                <Button asChild variant="outline">
                  <Link aria-label={`Open ${agent.name}`} to={`/agents/${agent.id}`}>
                    Open Detail
                    <ArrowRight />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
