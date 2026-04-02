import { type ReactNode, useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { routes } from '../app/routes';
import { Demo4Layout } from '../layouts/demo4/layout';
import { AuthProvider, useAuth } from '../features/auth/auth-context';
import { SettingsProvider } from '../providers/settings-provider';

type PermissionShape = {
  console_home: boolean;
  studio_playbooks: boolean;
};

const fetchMock = vi.fn<typeof fetch>();

vi.stubGlobal('fetch', fetchMock);

function installBackendFixtures(permissionShape: PermissionShape) {
  fetchMock.mockImplementation(async (input, init) => {
    const url = typeof input === 'string' ? input : input.toString();
    const method = init?.method ?? 'GET';

    if (url.endsWith('/api/me/permissions') && method === 'GET') {
      return new Response(JSON.stringify(permissionShape), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }

    if (url.endsWith('/api/account/home') && method === 'GET') {
      return new Response(
        JSON.stringify({
          default_workspace_id: 'workspace-1',
          workspaces: [
            {
              id: 'workspace-1',
              title: 'Default Workspace',
            },
          ],
          waiting_on_me: [],
          recent_tasks: [],
          playbook_shortcuts: [],
        }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        },
      );
    }

    if (url.endsWith('/api/studio/playbooks') && method === 'GET') {
      return new Response(
        JSON.stringify([
          {
            handle: {
              playbook_handle_id: 'handle-1',
              title: 'Summary',
            },
            draft: {
              draft_id: 'draft-1',
              playbook_handle_id: 'handle-1',
              spec_document: 'metadata:\n  title: "Summary"\n  description: "Create summaries"\n  mode: standard\n',
              validation_state: 'validated',
            },
            latest_version: null,
            publishable: true,
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

function renderConsoleApp(initialPath: string, permissionShape: PermissionShape) {
  installBackendFixtures(permissionShape);
  window.history.replaceState({}, '', initialPath);

  const router = createMemoryRouter(
    [
      {
        element: <Demo4Layout />,
        children: routes,
      },
    ],
    {
      initialEntries: [initialPath],
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

describe('console permissions', () => {
  beforeEach(() => {
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

  it('keeps console home visible and hides studio surfaces for normal users', async () => {
    renderConsoleApp('/playbooks', {
      console_home: true,
      studio_playbooks: false,
    });

    expect(await screen.findByRole('heading', { name: 'My Work' })).toBeInTheDocument();
    expect(screen.queryByText('Playbook Studio')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Playbook Studio' })).not.toBeInTheDocument();
  });

  it('shows studio navigation and route content for users with studio access', async () => {
    renderConsoleApp('/playbooks', {
      console_home: true,
      studio_playbooks: true,
    });

    expect(await screen.findByRole('heading', { name: 'Playbook Studio' })).toBeInTheDocument();
    expect(screen.getAllByText('Playbook Studio').length).toBeGreaterThan(0);
    expect(screen.queryByRole('heading', { name: 'My Work' })).not.toBeInTheDocument();
  });

  it('fetches console permissions through the relative api path', async () => {
    renderConsoleApp('/playbooks', {
      console_home: true,
      studio_playbooks: false,
    });

    await screen.findByRole('heading', { name: 'My Work' });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/me/permissions',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer dev-mode-mock-token',
        }),
      }),
    );
  });
});
