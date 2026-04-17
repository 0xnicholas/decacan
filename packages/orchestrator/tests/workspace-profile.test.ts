import { describe, expect, it } from 'vitest';
import { createServer } from '../src/api/server.js';

describe('workspace profile runtime support', () => {
  it('serves profile for a workspace via GET /workspaces/:id/profile', async () => {
    const app = createServer();
    // Create a workspace first
    const createRes = await app.request('/workspaces', {
      method: 'POST',
      body: JSON.stringify({ slug: 'test-ws', name: 'Test Workspace' }),
    });
    expect(createRes.status).toBe(201);
    const { workspace } = await createRes.json();

    // Assign a profile
    const profileRes = await app.request(`/workspaces/${workspace.id}/profile`, {
      method: 'PUT',
      body: JSON.stringify({ workspace_profile_id: 'film-production-v1' }),
    });
    expect(profileRes.status).toBe(200);

    // Fetch profile
    const getRes = await app.request(`/workspaces/${workspace.id}/profile`);
    expect(getRes.status).toBe(200);
    const { profile } = await getRes.json();
    expect(profile.workspace_profile_id).toBe('film-production-v1');
  });

  it('returns 404 for profile of nonexistent workspace', async () => {
    const app = createServer();
    const res = await app.request('/workspaces/nonexistent-id/profile');
    expect(res.status).toBe(404);
  });

  it('returns profile with null workspace_profile_id when not set', async () => {
    const app = createServer();
    // Create a workspace without setting profile
    const createRes = await app.request('/workspaces', {
      method: 'POST',
      body: JSON.stringify({ slug: 'no-profile-ws', name: 'No Profile Workspace' }),
    });
    expect(createRes.status).toBe(201);
    const { workspace } = await createRes.json();

    const getRes = await app.request(`/workspaces/${workspace.id}/profile`);
    expect(getRes.status).toBe(200);
    const { profile } = await getRes.json();
    expect(profile.workspace_profile_id).toBeNull();
  });
});