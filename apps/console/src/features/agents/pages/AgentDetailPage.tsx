import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { agentsConsoleApi, type ConsoleAgent } from '../api/agentsConsoleApi';

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString();
}

function formatList(values: string[]) {
  return values.length ? values.join(', ') : 'Not configured';
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

export function AgentDetailPage() {
  const { agentId = '' } = useParams();
  const [agent, setAgent] = useState<ConsoleAgent | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const loadAgent = async () => {
      try {
        const nextAgent = await agentsConsoleApi.getAgent(agentId, controller.signal);
        setAgent(nextAgent);
        setErrorMessage('');
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : 'Unable to load agent.');
      }
    };

    void loadAgent();

    return () => {
      controller.abort();
    };
  }, [agentId]);

  const activityItems = useMemo(
    () =>
      agent
        ? [
            {
              id: 'created',
              title: 'Agent created',
              detail: `Owned by ${agent.owner} and saved to the console contract.`,
              timestamp: agent.createdAt,
            },
            {
              id: 'configuration',
              title: 'Configuration synced',
              detail: `${agent.playbookName} + ${agent.teamName} bound on the current detail shell.`,
              timestamp: agent.updatedAt,
            },
          ]
        : [],
    [agent],
  );

  if (errorMessage) {
    return (
      <div className="space-y-6 px-5 pb-6">
        <Card>
          <CardHeader>
            <CardTitle>Agent Unavailable</CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link to="/agents/all">Back to All Agents</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="space-y-6 px-5 pb-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading Agent</CardTitle>
            <CardDescription>Fetching the latest agent detail shell.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-5 pb-6">
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card px-6 py-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold text-mono">{agent.name}</h1>
            <Badge variant={getStatusVariant(agent.status)} appearance="light">
              {agent.status}
            </Badge>
          </div>
          <p className="max-w-3xl text-sm text-muted-foreground">{agent.summary}</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/agents/all">Back to All Agents</Link>
        </Button>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Objective</CardTitle>
              <CardDescription>The operating intent currently captured for this agent.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{agent.objective}</CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Playbook</CardTitle>
                <CardDescription>{agent.playbookId}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{agent.playbookName}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Team</CardTitle>
                <CardDescription>{agent.teamId}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{agent.teamName}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Capabilities</CardTitle>
                <CardDescription>Enabled execution surface</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{formatList(agent.capabilities)}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Policies</CardTitle>
                <CardDescription>Current governance bindings</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{formatList(agent.policies)}</CardContent>
            </Card>
          </div>
        </div>

        <Tabs className="w-full" defaultValue="overview" orientation="vertical">
          <Card className="sticky top-5">
            <CardHeader>
              <CardTitle>Agent Sections</CardTitle>
              <CardDescription>Configuration detail stays on the right-side shell instead of the left nav.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TabsList
                className="flex w-full flex-col items-stretch rounded-lg bg-muted p-1"
                shape="default"
                variant="default"
              >
                <TabsTrigger className="justify-start" value="overview">
                  Overview
                </TabsTrigger>
                <TabsTrigger className="justify-start" value="configuration">
                  Configuration
                </TabsTrigger>
                <TabsTrigger className="justify-start" value="activity">
                  Activity
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>Owner: {agent.owner}</p>
                  <p>Created: {formatTimestamp(agent.createdAt)}</p>
                  <p>Last updated: {formatTimestamp(agent.updatedAt)}</p>
                </div>
              </TabsContent>

              <TabsContent value="configuration">
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>Playbook binding: {agent.playbookName}</p>
                  <p>Team binding: {agent.teamName}</p>
                  <p>Capability coverage: {formatList(agent.capabilities)}</p>
                  <p>Policy coverage: {formatList(agent.policies)}</p>
                </div>
              </TabsContent>

              <TabsContent value="activity">
                <div className="space-y-3 text-sm text-muted-foreground">
                  {activityItems.map((item) => (
                    <div key={item.id} className="rounded-md border border-border px-3 py-3">
                      <p className="font-medium text-foreground">{item.title}</p>
                      <p>{item.detail}</p>
                      <p className="text-xs text-muted-foreground">{formatTimestamp(item.timestamp)}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
}
