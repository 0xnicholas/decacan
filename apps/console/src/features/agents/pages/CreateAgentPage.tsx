import { type FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/features/auth/auth-context';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { agentsConsoleApi, type ConsoleAgentStatus } from '../api/agentsConsoleApi';

type AgentFormState = {
  name: string;
  summary: string;
  objective: string;
  status: ConsoleAgentStatus;
  playbookId: string;
  teamId: string;
  owner: string;
  capabilityIds: string[];
  policyIds: string[];
};

export function CreateAgentPage() {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const referenceData = useMemo(() => agentsConsoleApi.getReferenceData(), []);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formState, setFormState] = useState<AgentFormState>({
    name: '',
    summary: '',
    objective: '',
    status: 'draft',
    playbookId: referenceData.playbooks[0]?.id ?? '',
    teamId: referenceData.teams[0]?.id ?? '',
    owner: 'Console Team',
    capabilityIds: ['triage'],
    policyIds: ['account-safety'],
  });

  const toggleSelection = (
    field: 'capabilityIds' | 'policyIds',
    value: string,
    checked: boolean,
  ) => {
    setFormState((current) => ({
      ...current,
      [field]: checked
        ? [...current[field], value]
        : current[field].filter((entry) => entry !== value),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage('');

    try {
      const agent = await agentsConsoleApi.createAgent(formState);
      navigate(`/agents/${agent.id}`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to create agent.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 px-5 pb-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold text-mono">Create Agent</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Capture a minimal agent contract in the console, then continue configuration from the detail shell.
        </p>
      </section>

      <form className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]" onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Agent Definition</CardTitle>
            <CardDescription>These fields are stored in the console persistence layer and power the list/detail flow.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="agent-name">Agent Name</Label>
              <Input
                id="agent-name"
                required
                value={formState.name}
                onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="agent-summary">Summary</Label>
              <Textarea
                id="agent-summary"
                required
                rows={3}
                value={formState.summary}
                onChange={(event) => setFormState((current) => ({ ...current, summary: event.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="agent-objective">Objective</Label>
              <Textarea
                id="agent-objective"
                required
                rows={4}
                value={formState.objective}
                onChange={(event) => setFormState((current) => ({ ...current, objective: event.target.value }))}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="agent-status">Status</Label>
                <select
                  id="agent-status"
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={formState.status}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      status: event.target.value as ConsoleAgentStatus,
                    }))
                  }
                >
                  <option value="draft">Draft</option>
                  <option value="ready">Ready</option>
                  <option value="active">Active</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="agent-owner">Owner</Label>
                <Input
                  id="agent-owner"
                  required
                  value={formState.owner}
                  onChange={(event) => setFormState((current) => ({ ...current, owner: event.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="agent-playbook">Playbook</Label>
                <select
                  id="agent-playbook"
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={formState.playbookId}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, playbookId: event.target.value }))
                  }
                >
                  {referenceData.playbooks.map((playbook) => (
                    <option key={playbook.id} value={playbook.id}>
                      {playbook.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="agent-team">Team</Label>
                <select
                  id="agent-team"
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={formState.teamId}
                  onChange={(event) => setFormState((current) => ({ ...current, teamId: event.target.value }))}
                >
                  {referenceData.teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <fieldset className="grid gap-3">
                <legend className="text-sm font-medium">Capabilities</legend>
                {referenceData.capabilities.map((capability) => (
                  <label key={capability.id} className="flex items-start gap-3 rounded-md border border-border p-3 text-sm">
                    <input
                      checked={formState.capabilityIds.includes(capability.id)}
                      className="mt-1"
                      type="checkbox"
                      onChange={(event) =>
                        toggleSelection('capabilityIds', capability.id, event.target.checked)
                      }
                    />
                    <span>
                      <span className="block font-medium text-foreground">{capability.name}</span>
                      <span className="text-muted-foreground">{capability.description}</span>
                    </span>
                  </label>
                ))}
              </fieldset>

              <fieldset className="grid gap-3">
                <legend className="text-sm font-medium">Policies</legend>
                {referenceData.policies.map((policy) => (
                  <label key={policy.id} className="flex items-start gap-3 rounded-md border border-border p-3 text-sm">
                    <input
                      checked={formState.policyIds.includes(policy.id)}
                      className="mt-1"
                      type="checkbox"
                      onChange={(event) => toggleSelection('policyIds', policy.id, event.target.checked)}
                    />
                    <span>
                      <span className="block font-medium text-foreground">{policy.name}</span>
                      <span className="text-muted-foreground">{policy.description}</span>
                    </span>
                  </label>
                ))}
              </fieldset>
            </div>

            {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

            <div className="flex flex-wrap gap-3">
              <Button disabled={isSaving} type="submit">
                {isSaving ? 'Creating…' : 'Create Agent'}
              </Button>
              <Button asChild variant="outline">
                <Link to="/agents/all">Browse All Agents</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asset Libraries</CardTitle>
            <CardDescription>Keep supporting assets under the agents domain while you create this record.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            {hasPermission('studio.playbooks') ? (
              <Link className="font-medium text-primary" to="/agents/playbooks">
                Open Playbooks
              </Link>
            ) : null}
            <Link className="font-medium text-primary" to="/agents/teams">
              Open Teams
            </Link>
            <Link className="font-medium text-primary" to="/agents/capabilities">
              Open Capabilities
            </Link>
            <Link className="font-medium text-primary" to="/agents/policies">
              Open Policies
            </Link>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
