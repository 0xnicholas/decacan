import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WorkspaceProfileProvider, useWorkspaceProfile } from '../app/providers/WorkspaceProfileContext';

const fetchMock = vi.fn<typeof fetch>();
vi.stubGlobal('fetch', fetchMock);

const mockProfile = {
  profile: {
    workspace_profile_id: 'short-drama-v1',
  },
};

function TestComponent() {
  const { profile, isLoading } = useWorkspaceProfile();
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="profile-id">{profile?.workspace_profile_id ?? 'none'}</span>
    </div>
  );
}

describe('WorkspaceProfileContext', () => {
  beforeEach(() => fetchMock.mockReset());

  it('fetches and exposes workspace profile', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(mockProfile), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );

    render(
      <WorkspaceProfileProvider workspaceId="ws-1">
        <TestComponent />
      </WorkspaceProfileProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('profile-id')).toHaveTextContent('short-drama-v1');
    });
  });

  it('returns null profile_id when none is set', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ profile: { workspace_profile_id: null } }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );

    render(
      <WorkspaceProfileProvider workspaceId="ws-2">
        <TestComponent />
      </WorkspaceProfileProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('profile-id')).toHaveTextContent('none');
    });
  });

  it('uses default profile when fetch fails', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network error'));

    render(
      <WorkspaceProfileProvider workspaceId="ws-3">
        <TestComponent />
      </WorkspaceProfileProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('profile-id')).toHaveTextContent('none');
    });
  });
});