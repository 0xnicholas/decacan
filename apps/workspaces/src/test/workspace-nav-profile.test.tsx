import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WorkspaceNav } from '../shared/layout/WorkspaceNav';
import { WorkspaceProfileProvider } from '../app/providers/WorkspaceProfileContext';

const fetchMock = vi.fn<typeof fetch>();
vi.stubGlobal('fetch', fetchMock);

function renderNav(currentSection: string = 'home') {
  return render(
    <WorkspaceProfileProvider workspaceId="ws-profile-test">
      <WorkspaceNav
        currentSection={currentSection as any}
        onNavigate={() => {}}
      />
    </WorkspaceProfileProvider>
  );
}

describe('WorkspaceNav with runtime profile', () => {
  beforeEach(() => fetchMock.mockReset());

  it('renders default nav items without profile', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ profile: { workspace_profile_id: null } }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );
    renderNav();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getByText('Deliverables')).toBeInTheDocument();
  });

  it('renders profile-extended nav items when short-drama profile is set', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ profile: { workspace_profile_id: 'short-drama-v1' } }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );
    renderNav();
    await screen.findByText('Home');
    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getByText('剧本管理')).toBeInTheDocument();
    expect(screen.getByText('分镜板')).toBeInTheDocument();
    expect(screen.getByText('美术资源库')).toBeInTheDocument();
  });

  it('highlights current section', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ profile: { workspace_profile_id: null } }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );
    renderNav('tasks');
    const tasksButton = screen.getByText('Tasks');
    expect(tasksButton.className).toContain('bg-foreground/10');
  });
});