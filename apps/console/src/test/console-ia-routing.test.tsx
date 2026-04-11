import { type ReactNode, useEffect } from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { createMemoryRouter, Navigate, RouterProvider, type RouteObject } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { routes } from '../app/routes';
import { AGENTS_STORAGE_KEY, agentsConsoleApi } from '../features/agents/api/agentsConsoleApi';
import { AuthProvider, useAuth } from '../features/auth/auth-context';
import { agentContentRoutes } from '../features/console-ia/route-defaults';
import { Demo4Layout } from '../layouts/demo4/layout';
import { SettingsProvider } from '../providers/settings-provider';

function findRouteByPath(routeObjects: RouteObject[], path: string): RouteObject | undefined {
  for (const route of routeObjects) {
    if (route.path === path) {
      return route;
    }

    if (route.children) {
      const childRoute = findRouteByPath(route.children, path);
      if (childRoute) {
        return childRoute;
      }
    }
  }

  return undefined;
}

function expectRedirect(path: string, target: string) {
  const route = findRouteByPath(routes, path);

  expect(route, `route for ${path}`).toBeDefined();
  expect(route?.element).toMatchObject({
    type: Navigate,
    props: expect.objectContaining({
      to: target,
      replace: true,
    }),
  });
}

const fetchMock = vi.fn<typeof fetch>();

vi.stubGlobal('fetch', fetchMock);

type WorkspaceFixtureOptions = {
  approvalsAccountStatus?: number;
  membersAccountStatus?: number;
  studioPlaybooks?: boolean;
};

function installAgentFixtures() {
  localStorage.setItem(
    AGENTS_STORAGE_KEY,
    JSON.stringify([
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
    ]),
  );
}

function getHeaderValue(headers: HeadersInit | undefined, key: string) {
  if (!headers) {
    return undefined;
  }

  if (headers instanceof Headers) {
    return headers.get(key);
  }

  if (Array.isArray(headers)) {
    const entry = headers.find(([name]) => name.toLowerCase() === key.toLowerCase());
    return entry?.[1];
  }

  return Object.entries(headers).find(([name]) => name.toLowerCase() === key.toLowerCase())?.[1];
}

function installWorkspaceFixtures(options: WorkspaceFixtureOptions = {}) {
  const approvalsAccountStatus = options.approvalsAccountStatus ?? 404;
  const membersAccountStatus = options.membersAccountStatus ?? 404;
  const studioPlaybooks = options.studioPlaybooks ?? true;

  fetchMock.mockImplementation(async (input, init) => {
    const url = typeof input === 'string' ? input : input.toString();
    const method = init?.method ?? 'GET';

    if (url.endsWith('/api/me/permissions') && method === 'GET') {
      return new Response(
        JSON.stringify({
          console_home: true,
          studio_playbooks: studioPlaybooks,
        }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        },
      );
    }

    if (url.endsWith('/api/workspaces') && method === 'GET') {
      return new Response(
        JSON.stringify([
          {
            id: 'workspace-1',
            title: 'Default Workspace',
            root_path: '/tmp/workspace-1',
          },
          {
            id: 'workspace-2',
            title: 'Ops Workspace',
            root_path: '/tmp/workspace-2',
          },
        ]),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        },
      );
    }

    if (url.endsWith('/api/tasks') && method === 'GET') {
      return new Response(
        JSON.stringify([
          {
            id: 'task-1',
            workspace_id: 'workspace-1',
            playbook_key: 'summarize',
            input: 'Quarterly report',
            status: 'running',
            status_summary: 'Summarizing source notes',
            artifact_id: null,
          },
          {
            id: 'task-2',
            workspace_id: 'workspace-2',
            playbook_key: 'review',
            input: 'Risk register',
            status: 'waiting_approval',
            status_summary: 'Awaiting sign-off',
            artifact_id: null,
          },
        ]),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        },
      );
    }

    if (url.endsWith('/api/approvals') && method === 'GET') {
      return new Response(JSON.stringify({ error: approvalsAccountStatus === 404 ? 'not_found' : 'server_error' }), {
        status: approvalsAccountStatus,
        headers: { 'content-type': 'application/json' },
      });
    }

    if (url.endsWith('/api/workspaces/workspace-1/approvals') && method === 'GET') {
      return new Response(
        JSON.stringify([
          {
            id: 'approval-1',
            workspace_id: 'workspace-1',
            task_id: 'task-1',
            task_playbook_key: 'summarize',
            decision: 'pending',
            comment: null,
            status: 'waiting_approval',
          },
        ]),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        },
      );
    }

    if (url.endsWith('/api/workspaces/workspace-2/approvals') && method === 'GET') {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }

    if (url.endsWith('/api/members') && method === 'GET') {
      return new Response(JSON.stringify({ error: membersAccountStatus === 404 ? 'not_found' : 'server_error' }), {
        status: membersAccountStatus,
        headers: { 'content-type': 'application/json' },
      });
    }

    if (url.endsWith('/api/workspaces/workspace-1/members') && method === 'GET') {
      expect(getHeaderValue(init?.headers as HeadersInit | undefined, 'authorization')).toBe(
        'Bearer dev-mode-mock-token',
      );

      return new Response(
        JSON.stringify([
          {
            id: 'member-1',
            user_id: 'dev-user-001',
            name: 'Developer',
            email: 'dev@decacan.local',
            role: 'Owner',
            invited_by: null,
            joined_at: '2026-04-10T00:00:00Z',
          },
        ]),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        },
      );
    }

    if (url.endsWith('/api/workspaces/workspace-2/members') && method === 'GET') {
      expect(getHeaderValue(init?.headers as HeadersInit | undefined, 'authorization')).toBe(
        'Bearer dev-mode-mock-token',
      );

      return new Response(
        JSON.stringify([
          {
            id: 'member-2',
            user_id: 'ops-user-001',
            name: 'Ops Lead',
            email: 'ops@decacan.local',
            role: 'Editor',
            invited_by: 'dev-user-001',
            joined_at: '2026-04-09T00:00:00Z',
          },
        ]),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        },
      );
    }

    throw new Error(`Unhandled request: ${method} ${url}`);
  });
}

function AuthBootstrap({ children }: { children: ReactNode }) {
  const { verify } = useAuth();

  useEffect(() => {
    void verify();
  }, [verify]);

  return children;
}

function renderConsoleRoute(path: string, options: WorkspaceFixtureOptions = {}) {
  installWorkspaceFixtures(options);
  window.history.replaceState({}, '', path);

  const router = createMemoryRouter(
    [
      {
        element: <Demo4Layout />,
        children: routes,
      },
    ],
    {
      initialEntries: [path],
    },
  );

  render(
    <SettingsProvider>
      <HelmetProvider>
        <AuthProvider>
          <AuthBootstrap>
            <RouterProvider router={router} />
          </AuthBootstrap>
        </AuthProvider>
      </HelmetProvider>
    </SettingsProvider>,
  );
}

async function findPageHeading(name: string) {
  const headings = await screen.findAllByRole('heading', { name });

  return headings.find((heading) => heading.tagName === 'H1') ?? headings[0];
}

describe('console IA routing', () => {
  beforeEach(() => {
    cleanup();
    fetchMock.mockReset();
    localStorage.clear();
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: vi.fn(() => ({
        matches: false,
        media: '',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it.each([
    ['/workspaces', '/workspaces/workbench'],
    ['/agents', '/agents/quickstart'],
    ['/dashboard', '/dashboard/analytics'],
    ['/manage', '/manage/account'],
  ])('redirects %s to %s', (path, target) => {
    expectRedirect(path, target);
  });

  it.each([
    ['/audit-logs', '/manage/audit-logs'],
    ['/capabilities', '/agents/capabilities'],
    ['/policies/*', '/agents/policies'],
  ])('preserves legacy redirect %s to %s', (path, target) => {
    expectRedirect(path, target);
  });

  it('defines non-nav agent creation and detail routes under the agents prefix', () => {
    expect(agentContentRoutes).toEqual({
      create: '/agents/new',
      detail: '/agents/:agentId',
    });
    expect(findRouteByPath(routes, agentContentRoutes.create)).toBeDefined();
    expect(findRouteByPath(routes, agentContentRoutes.detail)).toBeDefined();
  });

  it('renders the agents quickstart page with a primary create-agent CTA', async () => {
    renderConsoleRoute('/agents/quickstart');

    expect(await findPageHeading('Quickstart')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Create Agent' })).toHaveAttribute('href', '/agents/new');
    expect(screen.queryByText('Coming Soon')).not.toBeInTheDocument();
  });

  it('hides playbook links on agents surfaces for users without studio access', async () => {
    renderConsoleRoute('/agents/quickstart', { studioPlaybooks: false });

    expect(await findPageHeading('Quickstart')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Playbooks' })).not.toBeInTheDocument();

    cleanup();
    renderConsoleRoute('/agents/new', { studioPlaybooks: false });

    expect(await findPageHeading('Create Agent')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Open Playbooks' })).not.toBeInTheDocument();
  });

  it('renders the all-agents page with navigation into agent detail', async () => {
    installAgentFixtures();
    renderConsoleRoute('/agents/all');

    expect(await findPageHeading('All Agents')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open Ops Concierge' })).toHaveAttribute(
      'href',
      '/agents/agent-ops-concierge',
    );
    expect(screen.queryByText('Coming Soon')).not.toBeInTheDocument();
  });

  it('renders the agent detail shell with right-side tabs and sections', async () => {
    installAgentFixtures();
    renderConsoleRoute('/agents/agent-ops-concierge');

    expect(await findPageHeading('Ops Concierge')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Overview' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Configuration' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Activity' })).toBeInTheDocument();
    expect(screen.getByText('Playbook')).toBeInTheDocument();
    expect(screen.queryByText('Coming Soon')).not.toBeInTheDocument();
  });

  it.each([
    [
      'name',
      {
        name: '   ',
        summary: 'Routes work.',
        objective: 'Keep queues moving.',
        owner: 'Console Team',
      },
      'Agent name is required.',
    ],
    [
      'summary',
      {
        name: 'Routing Agent',
        summary: '   ',
        objective: 'Keep queues moving.',
        owner: 'Console Team',
      },
      'Agent summary is required.',
    ],
    [
      'objective',
      {
        name: 'Routing Agent',
        summary: 'Routes work.',
        objective: '   ',
        owner: 'Console Team',
      },
      'Agent objective is required.',
    ],
    [
      'owner',
      {
        name: 'Routing Agent',
        summary: 'Routes work.',
        objective: 'Keep queues moving.',
        owner: '   ',
      },
      'Agent owner is required.',
    ],
  ])('rejects agent creation when required %s is empty after trim', async (_field, input, message) => {
    await expect(
      agentsConsoleApi.createAgent({
        ...input,
        status: 'draft',
        playbookId: 'playbook-ops-triage',
        teamId: 'team-operations',
        capabilityIds: ['triage'],
        policyIds: ['account-safety'],
      }),
    ).rejects.toThrow(message);
  });

  it('rejects invalid library ids during agent creation', async () => {
    await expect(
      agentsConsoleApi.createAgent({
        name: '  Routing Agent  ',
        summary: '  Routes work.  ',
        objective: '  Keep queues moving.  ',
        status: 'draft',
        playbookId: 'playbook-missing',
        teamId: 'team-operations',
        capabilityIds: ['triage'],
        policyIds: ['account-safety'],
        owner: '  Console Team  ',
      }),
    ).rejects.toThrow('Selected playbook was not found.');

    await expect(
      agentsConsoleApi.createAgent({
        name: '  Routing Agent  ',
        summary: '  Routes work.  ',
        objective: '  Keep queues moving.  ',
        status: 'draft',
        playbookId: 'playbook-ops-triage',
        teamId: 'team-missing',
        capabilityIds: ['triage'],
        policyIds: ['account-safety'],
        owner: '  Console Team  ',
      }),
    ).rejects.toThrow('Selected team was not found.');
  });

  it.each([
    ['/workspaces/workbench', 'Workbench', 'Keep active work moving across the account before you drop into a specific workspace.'],
    ['/workspaces/all', 'All Workspaces', 'Browse every workspace in this account, then jump into the execution app when you need detail.'],
    ['/workspaces/approvals', 'Approvals', 'Review pending decisions across every workspace without losing account-level context.'],
    ['/workspaces/runs', 'Runs', 'Track recent task runs across workspaces and reopen the workspace that owns the run.'],
    ['/workspaces/members', 'Members', 'See who is active across workspaces and where they currently hold access.'],
  ])('renders workspace account page %s with heading %s', async (path, heading, description) => {
    renderConsoleRoute(path);

    const pageHeading = await findPageHeading(heading);
    expect(pageHeading).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();
    expect(screen.queryByText('Coming Soon')).not.toBeInTheDocument();
  });

  it('exposes workspace handoff links into the workspaces app from account-level surfaces', async () => {
    renderConsoleRoute('/workspaces/workbench');

    await findPageHeading('Workbench');
    const workbenchSection = screen
      .getByText('Keep active work moving across the account before you drop into a specific workspace.')
      .closest('section');

    expect(workbenchSection).not.toBeNull();
    expect(within(workbenchSection as HTMLElement).getByRole('link', { name: 'Open workspace' })).toHaveAttribute(
      'href',
      'http://localhost:5173/workspaces/workspace-1',
    );

    cleanup();
    renderConsoleRoute('/workspaces/all');

    expect(await findPageHeading('All Workspaces')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open Default Workspace' })).toHaveAttribute(
      'href',
      'http://localhost:5173/workspaces/workspace-1',
    );
    expect(screen.getByRole('link', { name: 'Open Ops Workspace' })).toHaveAttribute(
      'href',
      'http://localhost:5173/workspaces/workspace-2',
    );
  });

  it.each([
    ['/workspaces/approvals', 'Open workspace', '/api/approvals'],
    ['/workspaces/runs', 'Open workspace', '/api/tasks'],
    ['/workspaces/members', 'Open workspace', '/api/members'],
  ])('exposes a valid handoff link on %s', async (path, linkName, requiredEndpoint) => {
    renderConsoleRoute(path);

    const links = await screen.findAllByRole('link', { name: linkName });
    expect(links.some((link) => link.getAttribute('href') === 'http://localhost:5173/workspaces/workspace-1')).toBe(
      true,
    );
    expect(fetchMock).toHaveBeenCalledWith(
      requiredEndpoint,
      expect.anything(),
    );
  });

  it('tries account-level approvals and members endpoints before workspace fallback fan-out', async () => {
    renderConsoleRoute('/workspaces/approvals', { approvalsAccountStatus: 404 });

    await screen.findByRole('link', { name: 'Open workspace' });
    expect(fetchMock).toHaveBeenCalledWith('/api/approvals', expect.anything());
    expect(fetchMock).toHaveBeenCalledWith('/api/workspaces/workspace-1/approvals', expect.anything());

    cleanup();
    fetchMock.mockClear();

    renderConsoleRoute('/workspaces/members', { membersAccountStatus: 404 });

    await screen.findAllByRole('link', { name: 'Open workspace' });
    expect(fetchMock).toHaveBeenCalledWith('/api/members', expect.anything());
    expect(fetchMock).toHaveBeenCalledWith('/api/workspaces/workspace-1/members', expect.anything());
  });

  it('does not fallback for approvals when account-level endpoint returns 500', async () => {
    renderConsoleRoute('/workspaces/approvals', { approvalsAccountStatus: 500 });

    expect(await screen.findByText('Approvals Unavailable')).toBeInTheDocument();
    expect(screen.getByText('Request failed with status 500')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/api/approvals', expect.anything());
    expect(fetchMock).not.toHaveBeenCalledWith('/api/workspaces/workspace-1/approvals', expect.anything());
  });

  it('does not fallback for members when account-level endpoint returns 500', async () => {
    renderConsoleRoute('/workspaces/members', { membersAccountStatus: 500 });

    expect(await screen.findByText('Members Unavailable')).toBeInTheDocument();
    expect(screen.getByText('Request failed with status 500')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/api/members', expect.anything());
    expect(fetchMock).not.toHaveBeenCalledWith('/api/workspaces/workspace-1/members', expect.anything());
  });
});
