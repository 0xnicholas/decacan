import { describe, expect, it } from 'vitest';
import { createServer } from '../src/server.js';

describe('extended api routes', () => {
  const app = createServer();

  it('creates and lists workspaces', async () => {
    const createRes = await app.request('/workspaces', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ slug: 'ws-1', name: 'Workspace 1' }),
    });
    expect(createRes.status).toBe(201);
    const { workspace } = (await createRes.json()) as { workspace: { id: string } };

    const listRes = await app.request('/workspaces');
    expect(listRes.status).toBe(200);
    const body = (await listRes.json()) as { workspaces: Array<{ id: string }> };
    expect(body.workspaces.some((w) => w.id === workspace.id)).toBe(true);

    const getRes = await app.request(`/workspaces/${workspace.id}`);
    expect(getRes.status).toBe(200);
  });

  it('creates and filters playbooks by workspace', async () => {
    const createRes = await app.request('/playbooks', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        workspace_id: 'ws-1',
        key: 'playbook.summary',
        mode: 'standard',
        title: 'Summary Playbook',
      }),
    });
    expect(createRes.status).toBe(201);
    const { playbook } = (await createRes.json()) as { playbook: { id: string } };

    const filterRes = await app.request(`/playbooks?workspace_id=ws-1`);
    expect(filterRes.status).toBe(200);
    const body = (await filterRes.json()) as { playbooks: Array<{ id: string }> };
    expect(body.playbooks.some((p) => p.id === playbook.id)).toBe(true);
  });

  it('returns policy profile stub', async () => {
    const res = await app.request('/policy/profiles/default');
    expect(res.status).toBe(200);
    const body = (await res.json()) as { profile: { id: string } };
    expect(body.profile.id).toBe('default');
  });

  it('forks a playbook from store, drafts, and publishes', async () => {
    const storeRes = await app.request('/playbook-store', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        key: 'store.summary',
        title: 'Store Summary',
        content: { steps: [] },
      }),
    });
    expect(storeRes.status).toBe(201);
    const { entry } = (await storeRes.json()) as { entry: { id: string } };

    const forkRes = await app.request(`/playbooks/${entry.id}/fork`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ workspace_id: 'ws-1' }),
    });
    expect(forkRes.status).toBe(201);
    const { playbook } = (await forkRes.json()) as { playbook: { id: string } };

    const draftRes = await app.request(`/playbooks/${playbook.id}/draft`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ content: { steps: [{ id: 's1' }] } }),
    });
    expect(draftRes.status).toBe(200);
    const draftBody = (await draftRes.json()) as { content: unknown };
    expect(draftBody.content).toEqual({ steps: [{ id: 's1' }] });

    const publishRes = await app.request(`/playbooks/${playbook.id}/publish`, {
      method: 'POST',
    });
    expect(publishRes.status).toBe(200);
    const publishBody = (await publishRes.json()) as { version_id: string };
    expect(publishBody.version_id).toBeTruthy();

    const getRes = await app.request(`/playbooks/${playbook.id}`);
    const getBody = (await getRes.json()) as { playbook: { published_at: string } };
    expect(getBody.playbook.published_at).toBeTruthy();
  });

  it('registers and logs in a user', async () => {
    const registerRes = await app.request('/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'secret123', name: 'Test' }),
    });
    expect(registerRes.status).toBe(200);
    const registerBody = (await registerRes.json()) as { token: string; user: { email: string } };
    expect(registerBody.user.email).toBe('test@example.com');
    expect(registerBody.token).toBeTruthy();

    const loginRes = await app.request('/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'secret123' }),
    });
    expect(loginRes.status).toBe(200);
    const loginBody = (await loginRes.json()) as { token: string };
    expect(loginBody.token).toBeTruthy();

    const badLoginRes = await app.request('/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'wrong' }),
    });
    expect(badLoginRes.status).toBe(401);
  });
});
