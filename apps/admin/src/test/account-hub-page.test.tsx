import { render, screen } from '@testing-library/react';
import { beforeEach, vi } from 'vitest';

import { DashboardPage } from '../features/dashboard/dashboard-page';

const fetchMock = vi.fn<typeof fetch>();

vi.stubGlobal('fetch', fetchMock);

describe('DashboardPage', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    window.history.replaceState({}, '', '/');

    fetchMock.mockImplementation(async (input, init) => {
      const url = typeof input === 'string' ? input : input.toString();
      const method = init?.method ?? 'GET';

      if (url.endsWith('/api/account/home') && method === 'GET') {
        return new Response(
          JSON.stringify({
            default_workspace_id: 'workspace-1',
            workspaces: [
              {
                id: 'workspace-1',
                title: 'Default Workspace',
                root_path: '/tmp/workspace-1',
              },
            ],
            waiting_on_me: [
              {
                id: 'approval-1',
                workspace_id: 'workspace-1',
                task_id: 'task-1',
                title: 'Approval needed for Summary',
                kind: 'approval',
                status: 'waiting_approval',
              },
            ],
            recent_tasks: [
              {
                id: 'task-2',
                workspace_id: 'workspace-1',
                playbook_key: 'summarize',
                status: 'running',
                status_summary: 'Preparing the summary',
              },
            ],
            playbook_shortcuts: [
              {
                playbook_key: 'summarize',
                title: 'Summarize',
                summary: 'Create a concise summary from source material.',
                mode_label: 'My Work',
              },
            ],
          }),
          {
            status: 200,
            headers: { 'content-type': 'application/json' },
          },
        );
      }

      throw new Error(`Unhandled request: ${url}`);
    });
  });

  it('shows the account hub summary content', async () => {
    render(<DashboardPage />);

    expect(await screen.findByRole('heading', { name: 'My Work' })).toBeInTheDocument();
    expect(screen.getByText('Approval needed for Summary')).toBeInTheDocument();
    expect(screen.getByText('Default Workspace')).toBeInTheDocument();
  });
});
