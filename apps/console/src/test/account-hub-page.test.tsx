import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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
              {
                id: 'task-3',
                workspace_id: 'workspace-1',
                playbook_key: 'review',
                status: 'succeeded',
                status_summary: 'Review package is ready',
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

  it('shows the console summary content with stable navigation and status totals', async () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: 'My Work' })).toBeInTheDocument();
    expect(screen.queryByText('Welcome to Decacan Admin')).not.toBeInTheDocument();
    expect(
      screen.getByText(
        'Track approvals, recent tasks, and the workspaces you manage from a single console.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Review Attention Queue' })).toHaveAttribute(
      'href',
      '/dashboard/attention',
    );
    expect(screen.queryByText(/account hub/i)).not.toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Work Queue' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Workspaces' })).toBeInTheDocument();
    expect(screen.getByText('Approval needed for Summary')).toBeInTheDocument();
    expect(screen.getByText('Default Workspace')).toBeInTheDocument();
    expect(screen.queryByText('/tmp/workspace-1')).not.toBeInTheDocument();

    const runningWorkCard = screen.getByText('Running Work').closest('[data-slot="card"]');
    const finishedWorkCard = screen.getByText('Finished Work').closest('[data-slot="card"]');
    const workspaceLink = screen.getByRole('link', { name: 'Open Default Workspace' });

    expect(runningWorkCard).not.toBeNull();
    expect(finishedWorkCard).not.toBeNull();
    expect(within(runningWorkCard as HTMLElement).getByText('1')).toBeInTheDocument();
    expect(within(finishedWorkCard as HTMLElement).getByText('1')).toBeInTheDocument();
    expect(workspaceLink).toHaveAttribute('href', 'http://localhost:5173/workspaces/workspace-1');
  });

  it('shows an error card without leaving the loading state visible', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Account API unavailable'));

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Console Unavailable')).toBeInTheDocument();
    expect(screen.getByText('Account API unavailable')).toBeInTheDocument();
    expect(screen.queryByText(/account hub/i)).not.toBeInTheDocument();
    expect(screen.queryByText('Loading console')).not.toBeInTheDocument();
  });
});
