import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Library, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/features/auth/auth-context';
import { agentsConsoleApi, type ConsoleAgent } from '../api/agentsConsoleApi';

function getReadyAgentCount(agents: ConsoleAgent[]) {
  return agents.filter((agent) => agent.status === 'ready' || agent.status === 'active').length;
}

export function QuickstartPage() {
  const { hasPermission } = useAuth();
  const [agents, setAgents] = useState<ConsoleAgent[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    void agentsConsoleApi.listAgents(controller.signal).then(setAgents).catch(() => undefined);

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <div className="space-y-6 px-5 pb-6">
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card px-6 py-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-mono">Quickstart</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Create the next agent, wire it to the right assets, and keep the full account-level loop inside the
            Agents domain.
          </p>
        </div>
        <Button asChild size="lg">
          <Link to="/agents/new">
            <PlusCircle />
            Create Agent
          </Link>
        </Button>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Agents tracked</CardDescription>
            <CardTitle>{agents.length}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Agents already available in the console today.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Ready or active</CardDescription>
            <CardTitle>{getReadyAgentCount(agents)}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Agents with enough configuration to move into production flow.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Asset libraries</CardDescription>
            <CardTitle>4</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Playbooks, teams, capabilities, and policies stay under `/agents/*`.
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              New agent loop
            </CardTitle>
            <CardDescription>Start from a real form, then land directly on the detail shell.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Capture name, objective, team ownership, playbook binding, capabilities, and policies in one flow.</p>
            <Link className="inline-flex items-center gap-1 font-medium text-primary" to="/agents/new">
              Open create form
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Library className="h-4 w-4" />
              Browse current agents
            </CardTitle>
            <CardDescription>Review the account-level directory and jump into detail for a single agent.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Use the all-agents view when you need list-to-detail navigation without leaving the console shell.</p>
            <Link className="inline-flex items-center gap-1 font-medium text-primary" to="/agents/all">
              Open all agents
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asset libraries</CardTitle>
            <CardDescription>Stable entry points for every asset that powers an agent.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            {hasPermission('studio.playbooks') ? (
              <Link className="font-medium text-primary" to="/agents/playbooks">
                Playbooks
              </Link>
            ) : null}
            <Link className="font-medium text-primary" to="/agents/teams">
              Teams
            </Link>
            <Link className="font-medium text-primary" to="/agents/capabilities">
              Capabilities
            </Link>
            <Link className="font-medium text-primary" to="/agents/policies">
              Policies
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
