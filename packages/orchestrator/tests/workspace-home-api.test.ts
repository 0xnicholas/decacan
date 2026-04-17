import { describe, expect, it } from 'vitest';
import { createServer } from '../src/api/server.js';

describe('workspace home API', () => {
  it('serves workspace home data via GET /workspaces/:id/home', async () => {
    const app = createServer();
    const createRes = await app.request('/workspaces', {
      method: 'POST',
      body: JSON.stringify({ slug: 'home-test', name: 'Home Test' }),
    });
    expect(createRes.status).toBe(201);
    const { workspace } = await createRes.json();

    const res = await app.request(`/workspaces/${workspace.id}/home`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('attention');
    expect(data).toHaveProperty('task_health');
    expect(data).toHaveProperty('activity');
    expect(data).toHaveProperty('deliverables');
    expect(data).toHaveProperty('team_snapshot');
  });

  it('returns 404 for nonexistent workspace home', async () => {
    const app = createServer();
    const res = await app.request('/workspaces/nonexistent-id/home');
    expect(res.status).toBe(404);
  });

  it('returns task_health with correct counts', async () => {
    const app = createServer();
    const createRes = await app.request('/workspaces', {
      method: 'POST',
      body: JSON.stringify({ slug: 'health-test', name: 'Health Test' }),
    });
    expect(createRes.status).toBe(201);
    const { workspace } = await createRes.json();

    const res = await app.request(`/workspaces/${workspace.id}/home`);
    expect(res.status).toBe(200);
    const { task_health } = await res.json();
    expect(task_health).toHaveProperty('running');
    expect(task_health).toHaveProperty('waiting_approval');
    expect(task_health).toHaveProperty('blocked');
    expect(task_health).toHaveProperty('completed_today');
  });
});