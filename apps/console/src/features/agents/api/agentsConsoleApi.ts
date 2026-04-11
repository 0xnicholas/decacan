export const AGENTS_STORAGE_KEY = 'decacan.console.agents.v1';

export type ConsoleAgentStatus = 'draft' | 'ready' | 'active';
export type AgentLibraryKind = 'playbooks' | 'teams' | 'capabilities' | 'policies';

export interface ConsoleLibraryEntry {
  id: string;
  name: string;
  description: string;
}

export interface ConsoleAgent {
  id: string;
  name: string;
  summary: string;
  objective: string;
  status: ConsoleAgentStatus;
  playbookId: string;
  playbookName: string;
  teamId: string;
  teamName: string;
  capabilities: string[];
  policies: string[];
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConsoleAgentInput {
  name: string;
  summary: string;
  objective: string;
  status: ConsoleAgentStatus;
  playbookId: string;
  teamId: string;
  capabilityIds: string[];
  policyIds: string[];
  owner: string;
}

class AgentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AgentValidationError';
  }
}

const agentReferenceData = {
  playbooks: [
    {
      id: 'playbook-ops-triage',
      name: 'Ops Triage',
      description: 'Standard intake and routing logic for account-level operator requests.',
    },
    {
      id: 'playbook-risk-review',
      name: 'Risk Review',
      description: 'Escalation flow for requests that need policy or compliance review.',
    },
    {
      id: 'playbook-launch-qa',
      name: 'Launch QA',
      description: 'Launch-readiness checklist for agents before broader rollout.',
    },
  ],
  teams: [
    {
      id: 'team-operations',
      name: 'Operations',
      description: 'Owns intake, routing, and queue health across account-level work.',
    },
    {
      id: 'team-risk',
      name: 'Risk',
      description: 'Reviews sensitive requests and policy exceptions before approval.',
    },
    {
      id: 'team-launch',
      name: 'Launch',
      description: 'Runs readiness checks and validates production rollouts.',
    },
  ],
  capabilities: [
    {
      id: 'triage',
      name: 'Triage',
      description: 'Classify incoming requests and route them to the right workflow.',
    },
    {
      id: 'routing',
      name: 'Routing',
      description: 'Hand work off to the correct team, playbook, or approval path.',
    },
    {
      id: 'handoff',
      name: 'Handoff',
      description: 'Package context cleanly for operators and downstream systems.',
    },
    {
      id: 'qa',
      name: 'QA',
      description: 'Validate launch readiness and catch missing agent configuration.',
    },
  ],
  policies: [
    {
      id: 'account-safety',
      name: 'Account Safety',
      description: 'Prevents unsafe account actions from bypassing review.',
    },
    {
      id: 'operator-review',
      name: 'Operator Review',
      description: 'Requires human sign-off on sensitive changes before execution.',
    },
    {
      id: 'launch-readiness',
      name: 'Launch Readiness',
      description: 'Checks readiness gates before an agent moves into active use.',
    },
  ],
} satisfies Record<AgentLibraryKind, ConsoleLibraryEntry[]>;

const defaultAgents: ConsoleAgent[] = [
  {
    id: 'agent-ops-concierge',
    name: 'Ops Concierge',
    summary: 'Routes operational asks through the right playbook and team.',
    objective: 'Speed up operator handoff for common account-level support requests.',
    status: 'ready',
    playbookId: 'playbook-ops-triage',
    playbookName: 'Ops Triage',
    teamId: 'team-operations',
    teamName: 'Operations',
    capabilities: ['triage', 'routing', 'handoff'],
    policies: ['account-safety', 'operator-review'],
    owner: 'Console Team',
    createdAt: '2026-04-10T08:00:00.000Z',
    updatedAt: '2026-04-10T08:00:00.000Z',
  },
  {
    id: 'agent-launch-guardian',
    name: 'Launch Guardian',
    summary: 'Validates launch-readiness checks before agents move into production.',
    objective: 'Catch missing capability, policy, and playbook wiring before rollout.',
    status: 'active',
    playbookId: 'playbook-launch-qa',
    playbookName: 'Launch QA',
    teamId: 'team-launch',
    teamName: 'Launch',
    capabilities: ['qa', 'handoff'],
    policies: ['launch-readiness'],
    owner: 'Release Ops',
    createdAt: '2026-04-09T11:00:00.000Z',
    updatedAt: '2026-04-10T09:30:00.000Z',
  },
];

function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function getStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
}

function assertNotAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException('The operation was aborted.', 'AbortError');
  }
}

function readStoredAgents(): ConsoleAgent[] {
  const storage = getStorage();

  if (!storage) {
    return cloneValue(defaultAgents);
  }

  const rawValue = storage.getItem(AGENTS_STORAGE_KEY);

  if (!rawValue) {
    storage.setItem(AGENTS_STORAGE_KEY, JSON.stringify(defaultAgents));
    return cloneValue(defaultAgents);
  }

  try {
    const parsed = JSON.parse(rawValue) as ConsoleAgent[];
    return Array.isArray(parsed) ? cloneValue(parsed) : cloneValue(defaultAgents);
  } catch {
    storage.setItem(AGENTS_STORAGE_KEY, JSON.stringify(defaultAgents));
    return cloneValue(defaultAgents);
  }
}

function writeStoredAgents(agents: ConsoleAgent[]) {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.setItem(AGENTS_STORAGE_KEY, JSON.stringify(agents));
}

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'agent';
}

function createAgentId(name: string, agents: ConsoleAgent[]) {
  const baseId = `agent-${slugify(name)}`;
  let nextId = baseId;
  let suffix = 2;

  while (agents.some((agent) => agent.id === nextId)) {
    nextId = `${baseId}-${suffix}`;
    suffix += 1;
  }

  return nextId;
}

function getLibraryItem(kind: AgentLibraryKind, id: string) {
  return agentReferenceData[kind].find((entry) => entry.id === id) ?? null;
}

function sortAgents(agents: ConsoleAgent[]) {
  return [...agents].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

async function listAgents(signal?: AbortSignal): Promise<ConsoleAgent[]> {
  assertNotAborted(signal);
  return sortAgents(readStoredAgents());
}

async function getAgent(agentId: string, signal?: AbortSignal): Promise<ConsoleAgent> {
  assertNotAborted(signal);

  const agent = readStoredAgents().find((entry) => entry.id === agentId);

  if (!agent) {
    throw new Error(`Agent ${agentId} was not found.`);
  }

  return agent;
}

async function createAgent(input: CreateConsoleAgentInput, signal?: AbortSignal): Promise<ConsoleAgent> {
  assertNotAborted(signal);

  const agents = readStoredAgents();
  const name = input.name.trim();
  const summary = input.summary.trim();
  const objective = input.objective.trim();
  const owner = input.owner.trim();

  if (!name) {
    throw new AgentValidationError('Agent name is required.');
  }

  if (!summary) {
    throw new AgentValidationError('Agent summary is required.');
  }

  if (!objective) {
    throw new AgentValidationError('Agent objective is required.');
  }

  if (!owner) {
    throw new AgentValidationError('Agent owner is required.');
  }

  const playbook = getLibraryItem('playbooks', input.playbookId);
  if (!playbook) {
    throw new AgentValidationError('Selected playbook was not found.');
  }

  const team = getLibraryItem('teams', input.teamId);
  if (!team) {
    throw new AgentValidationError('Selected team was not found.');
  }

  const now = new Date().toISOString();

  const nextAgent: ConsoleAgent = {
    id: createAgentId(name, agents),
    name,
    summary,
    objective,
    status: input.status,
    playbookId: playbook.id,
    playbookName: playbook.name,
    teamId: team.id,
    teamName: team.name,
    capabilities: input.capabilityIds,
    policies: input.policyIds,
    owner,
    createdAt: now,
    updatedAt: now,
  };

  writeStoredAgents([nextAgent, ...agents]);

  return nextAgent;
}

function getReferenceData() {
  return cloneValue(agentReferenceData);
}

export const agentsConsoleApi = {
  listAgents,
  getAgent,
  createAgent,
  getReferenceData,
};
