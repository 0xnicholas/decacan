import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';
import { randomBytes, scryptSync, timingSafeEqual, createHmac } from 'crypto';
import { createRun, createTask, ExecutionCoordinator, InMemoryExecutionStore } from '../runtime/index.js';
import { MockExecutionEngine } from '../infra/mock-engine.js';
import { HttpExecutionEngineClient } from '../infra/http-engine.js';
import { DbExecutionStore } from '../db/store.js';
import { db } from '../db/client.js';
import * as schema from '../db/schema.js';
import type { PlaybookSnapshot } from '../contract/index.js';
import { EventBus } from '../infra/event-bus.js';
import type { ExecutionEnginePort } from '../runtime/ports.js';

declare module 'hono' {
  interface ContextVariableMap {
    userId: string;
  }
}

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';
const REQUIRE_AUTH = process.env.REQUIRE_AUTH === 'true';

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  const derived = scryptSync(password, salt, 64);
  const storedBuf = Buffer.from(hash, 'hex');
  return timingSafeEqual(derived, storedBuf);
}

function createToken(payload: object): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyToken(token: string): Record<string, unknown> {
  const [header, body, signature] = token.split('.');
  if (!header || !body || !signature) throw new Error('Invalid token');
  const expected = createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  if (signature !== expected) throw new Error('Invalid signature');
  return JSON.parse(Buffer.from(body, 'base64url').toString());
}

async function authMiddleware(c: any, next: any) {
  const auth = c.req.header('authorization');
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : undefined;
  if (!token) {
    if (REQUIRE_AUTH) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    c.set('userId', 'test-user');
    return next();
  }
  try {
    const payload = verifyToken(token);
    c.set('userId', payload.userId as string);
    await next();
  } catch {
    return c.json({ error: 'Unauthorized' }, 401);
  }
}

function createCoordinator(eventBus: EventBus, engineOverride?: ExecutionEnginePort) {
  const engineUrl = process.env.EXECUTION_ENGINE_URL;
  const useDb = process.env.DATABASE_URL !== undefined;

  const engine =
    engineOverride ??
    (engineUrl
      ? new HttpExecutionEngineClient({ baseUrl: engineUrl })
      : new MockExecutionEngine());

  const store = useDb ? new DbExecutionStore() : new InMemoryExecutionStore();

  return new ExecutionCoordinator(engine, store, eventBus);
}

function buildSummarySnapshot(playbookId: string, versionId: string): PlaybookSnapshot {
  return {
    playbook_id: playbookId,
    playbook_version_id: versionId,
    playbook_key: 'playbook.summary',
    execution_profile: 'standard',
    workflow: {
      id: `wf-${playbookId}`,
      steps: [
        {
          id: 'scan',
          name: 'scan_markdown',
          description: 'Scan workspace markdown files',
          capability_ref: {
            kind: 'routine',
            class: 'builtin',
            name: 'scan_markdown',
            version: '1.0.0',
          },
          input_mapping: {},
          output_mapping: {},
          transition: { type: 'next', step_id: 'draft' },
        },
        {
          id: 'draft',
          name: 'draft_summary',
          description: 'Draft summary',
          capability_ref: {
            kind: 'routine',
            class: 'builtin',
            name: 'draft_summary',
            version: '1.0.0',
          },
          input_mapping: {},
          output_mapping: {},
          transition: { type: 'end' },
        },
      ],
      compiled_at: new Date().toISOString(),
    },
    policy_profile_id: 'default',
    capability_refs: [],
  };
}

export function createServer(engineOverride?: ExecutionEnginePort): Hono {
  const app = new Hono();
  const eventBus = new EventBus();
  const coordinator = createCoordinator(eventBus, engineOverride);
  const store = coordinator['store'] as InMemoryExecutionStore | DbExecutionStore;
  const useDb = process.env.DATABASE_URL !== undefined;
  const memStore = useDb ? undefined : (store as InMemoryExecutionStore);

  const tasks = new Map<string, ReturnType<typeof createTask>>();
  const runs = new Map<string, ReturnType<typeof createRun>>();
  const workspaces = new Map<
    string,
    { id: string; slug: string; name: string; status: string; workspaceProfileId?: string }
  >();
  const playbooks = new Map<
    string,
    { id: string; workspace_id: string; key: string; mode: 'standard' | 'discovery'; versionId: string; title?: string; content?: unknown; publishedAt?: Date }
  >();
  const users = new Map<
    string,
    { id: string; email: string; passwordHash: string; name?: string }
  >();
  const storeEntries = new Map<
    string,
    {
      id: string;
      key: string;
      title?: string;
      description?: string;
      content: unknown;
      tags: unknown;
      isPublic: boolean;
    }
  >();
  const playbookVersions = new Map<
    string,
    { id: string; playbookId: string; content: unknown; publishedAt: Date }
  >();

  app.use(logger());

  app.get('/health', (c) => c.json({ status: 'ok' }));

  app.post('/auth/register', async (c) => {
    const body = (await c.req.json()) as { email: string; password: string; name?: string };
    if (useDb) {
      const existing = await db.query.users.findFirst({
        where: eq(schema.users.email, body.email),
      });
      if (existing) return c.json({ error: 'Email already registered' }, 409);
      const [user] = await db
        .insert(schema.users)
        .values({
          email: body.email,
          passwordHash: hashPassword(body.password),
          name: body.name,
        })
        .returning();
      const token = createToken({ userId: user.id, exp: Math.floor(Date.now() / 1000) + 86400 });
      return c.json({ user: { id: user.id, email: user.email, name: user.name }, token });
    }
    const existing = Array.from(users.values()).find((u) => u.email === body.email);
    if (existing) return c.json({ error: 'Email already registered' }, 409);
    const user = { id: uuidv4(), email: body.email, passwordHash: hashPassword(body.password), name: body.name };
    users.set(user.id, user);
    const token = createToken({ userId: user.id, exp: Math.floor(Date.now() / 1000) + 86400 });
    return c.json({ user: { id: user.id, email: user.email, name: user.name }, token });
  });

  app.post('/auth/login', async (c) => {
    const body = (await c.req.json()) as { email: string; password: string };
    if (useDb) {
      const user = await db.query.users.findFirst({
        where: eq(schema.users.email, body.email),
      });
      if (!user || !verifyPassword(body.password, user.passwordHash)) {
        return c.json({ error: 'Invalid credentials' }, 401);
      }
      const token = createToken({ userId: user.id, exp: Math.floor(Date.now() / 1000) + 86400 });
      return c.json({ user: { id: user.id, email: user.email, name: user.name }, token });
    }
    const user = Array.from(users.values()).find((u) => u.email === body.email);
    if (!user || !verifyPassword(body.password, user.passwordHash)) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    const token = createToken({ userId: user.id, exp: Math.floor(Date.now() / 1000) + 86400 });
    return c.json({ user: { id: user.id, email: user.email, name: user.name }, token });
  });

  app.use('/workspaces/*', authMiddleware);
  app.use('/playbooks/*', authMiddleware);
  app.use('/playbook-store', authMiddleware);
  app.use('/tasks/*', authMiddleware);
  app.use('/approvals/*', authMiddleware);
  app.use('/artifacts', authMiddleware);
  app.use('/policy/*', authMiddleware);

  app.get('/workspaces', async (c) => {
    if (useDb) {
      const list = await db.select().from(schema.workspaces);
      return c.json({ workspaces: list });
    }
    return c.json({ workspaces: Array.from(workspaces.values()) });
  });

  app.post('/workspaces', async (c) => {
    const body = (await c.req.json()) as { slug: string; name: string };
    if (useDb) {
      const [ws] = await db
        .insert(schema.workspaces)
        .values({
          slug: body.slug,
          name: body.name,
          ownerId: c.get('userId') ?? 'system',
          status: 'active',
        })
        .returning();
      return c.json({ workspace: ws }, 201);
    }
    const ws = { id: uuidv4(), slug: body.slug, name: body.name, status: 'active' };
    workspaces.set(ws.id, ws);
    return c.json({ workspace: ws }, 201);
  });

  app.get('/workspaces/:id', async (c) => {
    if (useDb) {
      const rows = await db
        .select()
        .from(schema.workspaces)
        .where(eq(schema.workspaces.id, c.req.param('id')));
      if (!rows.length) return c.json({ error: 'Not found' }, 404);
      return c.json({ workspace: rows[0] });
    }
    const ws = workspaces.get(c.req.param('id'));
    if (!ws) return c.json({ error: 'Not found' }, 404);
    return c.json({ workspace: ws });
  });

  app.get('/workspaces/:id/profile', async (c) => {
    const id = c.req.param('id');
    if (useDb) {
      const rows = await db
        .select()
        .from(schema.workspaces)
        .where(eq(schema.workspaces.id, id));
      if (!rows.length) return c.json({ error: 'Not found' }, 404);
      return c.json({ profile: { workspace_profile_id: rows[0].workspaceProfileId ?? null } });
    }
    const ws = workspaces.get(id);
    if (!ws) return c.json({ error: 'Not found' }, 404);
    return c.json({ profile: { workspace_profile_id: (ws as any).workspaceProfileId ?? null } });
  });

  app.put('/workspaces/:id/profile', async (c) => {
    const id = c.req.param('id');
    const body = (await c.req.json()) as { workspace_profile_id: string };
    if (useDb) {
      const [updated] = await db
        .update(schema.workspaces)
        .set({ workspaceProfileId: body.workspace_profile_id, updatedAt: new Date() })
        .where(eq(schema.workspaces.id, id))
        .returning();
      if (!updated) return c.json({ error: 'Not found' }, 404);
      return c.json({ profile: { workspace_profile_id: updated.workspaceProfileId } });
    }
    const ws = workspaces.get(id);
    if (!ws) return c.json({ error: 'Not found' }, 404);
    (ws as any).workspaceProfileId = body.workspace_profile_id;
    return c.json({ profile: { workspace_profile_id: body.workspace_profile_id } });
  });

  app.get('/workspaces/:id/home', async (c) => {
    const id = c.req.param('id');

    if (useDb) {
      const wsRows = await db.select().from(schema.workspaces).where(eq(schema.workspaces.id, id));
      if (!wsRows.length) return c.json({ error: 'Not found' }, 404);

      const tasks = await db.select().from(schema.tasks).where(eq(schema.tasks.workspaceId, id));
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const taskHealth = {
        running: tasks.filter(t => t.status === 'running').length,
        waiting_approval: tasks.filter(t => t.status === 'pending_approval').length,
        blocked: tasks.filter(t => t.status === 'blocked').length,
        completed_today: tasks.filter(t => t.status === 'completed' && t.updatedAt >= today).length,
      };

      return c.json({
        attention: [],
        task_health: taskHealth,
        activity: [],
        deliverables: [],
        team_snapshot: [],
      });
    }

    if (!workspaces.has(id)) return c.json({ error: 'Not found' }, 404);

    return c.json({
      attention: [],
      task_health: { running: 0, waiting_approval: 0, blocked: 0, completed_today: 0 },
      activity: [],
      deliverables: [],
      team_snapshot: [],
    });
  });

  app.get('/playbook-store', async (c) => {
    if (useDb) {
      const list = await db
        .select()
        .from(schema.playbookStoreEntries)
        .where(eq(schema.playbookStoreEntries.isPublic, true));
      return c.json({ entries: list });
    }
    const list = Array.from(storeEntries.values()).filter((e) => e.isPublic);
    return c.json({ entries: list });
  });

  app.post('/playbook-store', async (c) => {
    const body = (await c.req.json()) as {
      key: string;
      title?: string;
      description?: string;
      content?: unknown;
      tags?: unknown;
      isPublic?: boolean;
    };
    if (useDb) {
      const [entry] = await db
        .insert(schema.playbookStoreEntries)
        .values({
          key: body.key,
          title: body.title,
          description: body.description,
          content: body.content ?? {},
          tags: body.tags ?? [],
          isPublic: body.isPublic ?? true,
        })
        .returning();
      return c.json({ entry }, 201);
    }
    const entry = {
      id: uuidv4(),
      key: body.key,
      title: body.title,
      description: body.description,
      content: body.content ?? {},
      tags: body.tags ?? [],
      isPublic: body.isPublic ?? true,
    };
    storeEntries.set(entry.id, entry);
    return c.json({ entry }, 201);
  });

  app.post('/playbooks/:id/fork', async (c) => {
    const entryId = c.req.param('id');
    const body = (await c.req.json()) as { workspace_id: string };
    if (useDb) {
      const entryRows = await db
        .select()
        .from(schema.playbookStoreEntries)
        .where(eq(schema.playbookStoreEntries.id, entryId));
      if (!entryRows.length) return c.json({ error: 'Store entry not found' }, 404);
      const entry = entryRows[0];
      const id = uuidv4();
      const [pb] = await db
        .insert(schema.playbooks)
        .values({
          id,
          workspaceId: body.workspace_id,
          key: entry.key,
          mode: 'standard',
          versionId: id,
          title: entry.title,
          content: entry.content ?? {},
        })
        .returning();
      return c.json({ playbook: pb }, 201);
    }
    const entry = storeEntries.get(entryId);
    if (!entry) return c.json({ error: 'Store entry not found' }, 404);
    const id = uuidv4();
    const pb = {
      id,
      workspace_id: body.workspace_id,
      key: entry.key,
      mode: 'standard' as const,
      versionId: id,
      title: entry.title,
      content: entry.content,
    };
    playbooks.set(pb.id, pb);
    return c.json({ playbook: pb }, 201);
  });

  app.get('/playbooks', async (c) => {
    const wsId = c.req.query('workspace_id');
    if (useDb) {
      const query = wsId
        ? db.select().from(schema.playbooks).where(eq(schema.playbooks.workspaceId, wsId))
        : db.select().from(schema.playbooks);
      const list = await query;
      return c.json({
        playbooks: list.map((p) => ({
          id: p.id,
          workspace_id: p.workspaceId,
          key: p.key,
          mode: p.mode,
          title: p.title,
          published_at: p.publishedAt,
        })),
      });
    }
    const list = Array.from(playbooks.values()).filter((p) => (wsId ? p.workspace_id === wsId : true));
    return c.json({
      playbooks: list.map((p) => ({
        id: p.id,
        workspace_id: p.workspace_id,
        key: p.key,
        mode: p.mode,
        title: p.title,
        published_at: p.publishedAt,
      })),
    });
  });

  app.post('/playbooks', async (c) => {
    const body = (await c.req.json()) as {
      workspace_id: string;
      key: string;
      mode?: 'standard' | 'discovery';
      title?: string;
    };
    const id = uuidv4();
    if (useDb) {
      const [pb] = await db
        .insert(schema.playbooks)
        .values({
          id,
          workspaceId: body.workspace_id,
          key: body.key,
          mode: body.mode ?? 'standard',
          versionId: id,
          title: body.title,
        })
        .returning();
      return c.json(
        {
          playbook: {
            id: pb.id,
            workspace_id: pb.workspaceId,
            key: pb.key,
            mode: pb.mode,
            title: pb.title,
            published_at: pb.publishedAt,
          },
        },
        201
      );
    }
    const pb = {
      id,
      workspace_id: body.workspace_id,
      key: body.key,
      mode: body.mode ?? 'standard',
      versionId: id,
      title: body.title,
    };
    playbooks.set(pb.id, pb as any);
    return c.json(
      {
        playbook: {
          id: pb.id,
          workspace_id: pb.workspace_id,
          key: pb.key,
          mode: pb.mode,
          title: pb.title,
          published_at: undefined,
        },
      },
      201
    );
  });

  app.get('/playbooks/:id', async (c) => {
    if (useDb) {
      const rows = await db
        .select()
        .from(schema.playbooks)
        .where(eq(schema.playbooks.id, c.req.param('id')));
      if (!rows.length) return c.json({ error: 'Not found' }, 404);
      const pb = rows[0];
      return c.json({
        playbook: {
          id: pb.id,
          workspace_id: pb.workspaceId,
          key: pb.key,
          mode: pb.mode,
          title: pb.title,
          published_at: pb.publishedAt,
        },
      });
    }
    const pb = playbooks.get(c.req.param('id'));
    if (!pb) return c.json({ error: 'Not found' }, 404);
    return c.json({
      playbook: {
        id: pb.id,
        workspace_id: pb.workspace_id,
        key: pb.key,
        mode: pb.mode,
        title: pb.title,
        published_at: pb.publishedAt,
      },
    });
  });

  app.get('/playbooks/:id/draft', async (c) => {
    const id = c.req.param('id');
    if (useDb) {
      const rows = await db.select().from(schema.playbooks).where(eq(schema.playbooks.id, id));
      if (!rows.length) return c.json({ error: 'Not found' }, 404);
      return c.json({ content: rows[0].content ?? {} });
    }
    const pb = playbooks.get(id);
    if (!pb) return c.json({ error: 'Not found' }, 404);
    return c.json({ content: pb.content ?? {} });
  });

  app.put('/playbooks/:id/draft', async (c) => {
    const id = c.req.param('id');
    const body = (await c.req.json()) as { content: unknown };
    if (useDb) {
      const [updated] = await db
        .update(schema.playbooks)
        .set({ content: body.content, updatedAt: new Date() })
        .where(eq(schema.playbooks.id, id))
        .returning();
      if (!updated) return c.json({ error: 'Not found' }, 404);
      return c.json({ content: updated.content });
    }
    const pb = playbooks.get(id);
    if (!pb) return c.json({ error: 'Not found' }, 404);
    pb.content = body.content;
    return c.json({ content: pb.content });
  });

  app.post('/playbooks/:id/publish', async (c) => {
    const id = c.req.param('id');
    if (useDb) {
      const rows = await db.select().from(schema.playbooks).where(eq(schema.playbooks.id, id));
      if (!rows.length) return c.json({ error: 'Not found' }, 404);
      const pb = rows[0];
      const versionId = uuidv4();
      await db.insert(schema.playbookVersions).values({
        id: versionId,
        playbookId: id,
        content: pb.content ?? {},
      });
      await db
        .update(schema.playbooks)
        .set({ versionId, publishedAt: new Date(), updatedAt: new Date() })
        .where(eq(schema.playbooks.id, id));
      return c.json({ version_id: versionId });
    }
    const pb = playbooks.get(id);
    if (!pb) return c.json({ error: 'Not found' }, 404);
    const versionId = uuidv4();
    playbookVersions.set(versionId, {
      id: versionId,
      playbookId: id,
      content: pb.content ?? {},
      publishedAt: new Date(),
    });
    pb.versionId = versionId;
    pb.publishedAt = new Date();
    return c.json({ version_id: versionId });
  });

  app.get('/tasks', async (c) => {
    const wsId = c.req.query('workspace_id');
    if (useDb) {
      const query = wsId
        ? db.select().from(schema.tasks).where(eq(schema.tasks.workspaceId, wsId))
        : db.select().from(schema.tasks);
      const list = await query;
      return c.json({
        tasks: list.map((t) => ({
          id: t.id,
          workspace_id: t.workspaceId,
          playbook_id: t.playbookId,
          playbook_version_id: t.playbookVersionId,
          status: t.status,
          created_at: t.createdAt,
          updated_at: t.updatedAt,
        })),
      });
    }
    const list = Array.from(tasks.values()).filter((t) => (wsId ? t.workspace_id === wsId : true));
    return c.json({ tasks: list });
  });

  app.post('/tasks', async (c) => {
    const body = (await c.req.json()) as {
      workspace_id: string;
      playbook_id: string;
      playbook_version_id: string;
      input_payload?: string;
    };
    if (useDb) {
      const [task] = await db
        .insert(schema.tasks)
        .values({
          workspaceId: body.workspace_id,
          playbookId: body.playbook_id,
          playbookVersionId: body.playbook_version_id,
          inputPayload: body.input_payload,
        })
        .returning();
      return c.json(
        {
          task: {
            id: task.id,
            workspace_id: task.workspaceId,
            playbook_id: task.playbookId,
            playbook_version_id: task.playbookVersionId,
            status: task.status,
            created_at: task.createdAt,
            updated_at: task.updatedAt,
          },
        },
        201
      );
    }
    const task = createTask(uuidv4(), body.workspace_id, body.playbook_id, body.playbook_version_id);
    tasks.set(task.id, task);
    return c.json({ task }, 201);
  });

  app.get('/tasks/:id', async (c) => {
    const id = c.req.param('id');
    if (useDb) {
      const taskRows = await db.select().from(schema.tasks).where(eq(schema.tasks.id, id));
      if (!taskRows.length) return c.json({ error: 'Task not found' }, 404);
      const task = taskRows[0];
      const runRows = await db.select().from(schema.runs).where(eq(schema.runs.taskId, id));
      return c.json({
        task: {
          id: task.id,
          workspace_id: task.workspaceId,
          playbook_id: task.playbookId,
          playbook_version_id: task.playbookVersionId,
          status: task.status,
          created_at: task.createdAt,
          updated_at: task.updatedAt,
        },
        runs: runRows.map((r) => ({
          id: r.id,
          task_id: r.taskId,
          workflow_id: r.workflowId,
          policy_profile_id: r.policyProfileId,
          status: r.status,
          created_at: r.createdAt,
          updated_at: r.updatedAt,
          started_at: r.startedAt,
          finished_at: r.finishedAt,
          pause_reason: r.pauseReason,
          error_details: r.errorDetails,
        })),
      });
    }
    const task = tasks.get(id);
    if (!task) return c.json({ error: 'Task not found' }, 404);
    const storedTask = memStore?.getTask(id);
    if (storedTask) {
      (task as any).status = storedTask.status;
    }
    const taskRuns = Array.from(runs.values()).filter((r) => r.task_id === id);
    return c.json({ task, runs: taskRuns });
  });

  app.get('/tasks/:id/events/stream', async (c) => {
    const id = c.req.param('id');
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const unsubscribe = eventBus.subscribe(id, (event) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
          );
        });
        c.req.raw.signal.addEventListener('abort', () => {
          unsubscribe();
          controller.close();
        });
      },
    });
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  });

  app.post('/tasks/:id/executions', async (c) => {
    const taskId = c.req.param('id');
    if (useDb) {
      const taskRows = await db.select().from(schema.tasks).where(eq(schema.tasks.id, taskId));
      if (!taskRows.length) return c.json({ error: 'Task not found' }, 404);
      const taskRow = taskRows[0];

      const run = createRun(uuidv4(), taskId, `wf-${taskRow.playbookId}`, 'default');
      await db.insert(schema.runs).values({
        id: run.id,
        taskId: run.task_id,
        workflowId: run.workflow_id,
        policyProfileId: run.policy_profile_id,
        status: run.status,
        createdAt: new Date(run.created_at),
        updatedAt: new Date(run.updated_at),
      });

      const snapshot = buildSummarySnapshot(taskRow.playbookId, taskRow.playbookVersionId);
      const executionId = uuidv4();

      await coordinator.launch(
        executionId,
        {
          id: taskRow.id,
          workspace_id: taskRow.workspaceId,
          playbook_id: taskRow.playbookId,
          playbook_version_id: taskRow.playbookVersionId,
          status: taskRow.status as any,
          created_at: taskRow.createdAt.toISOString(),
          updated_at: taskRow.updatedAt.toISOString(),
        },
        run,
        snapshot,
        []
      );

      return c.json({ execution_id: executionId, run_id: run.id }, 202);
    }

    const task = tasks.get(taskId);
    if (!task) return c.json({ error: 'Task not found' }, 404);

    const run = createRun(uuidv4(), taskId, `wf-${task.playbook_id}`, 'default');
    runs.set(run.id, run);

    const snapshot = buildSummarySnapshot(task.playbook_id, task.playbook_version_id);
    const executionId = uuidv4();

    await coordinator.launch(executionId, task, run, snapshot, []);

    return c.json({ execution_id: executionId, run_id: run.id }, 202);
  });

  app.get('/approvals', async (c) => {
    const taskId = c.req.query('task_id');
    if (useDb) {
      const query = taskId
        ? db.select().from(schema.approvals).where(eq(schema.approvals.taskId, taskId))
        : db.select().from(schema.approvals);
      const list = await query;
      return c.json({
        approvals: list.map((a) => ({
          id: a.id,
          task_id: a.taskId,
          execution_id: a.executionId,
          step_id: a.stepId,
          prompt: a.prompt,
          status: a.decision ?? 'pending',
        })),
      });
    }
    if (memStore) {
      const list = taskId ? memStore.getApprovalsForTask(taskId) : await store.getAllApprovals();
      return c.json({
        approvals: list.map((a) => ({
          id: a.id,
          task_id: a.task_id,
          execution_id: a.execution_id,
          step_id: a.step_id,
          prompt: a.prompt,
          status: a.decision ?? 'pending',
        })),
      });
    }
    return c.json({ approvals: [] });
  });

  app.post('/approvals/:id/decision', async (c) => {
    const id = c.req.param('id');
    const body = (await c.req.json()) as { decision: 'approved' | 'rejected'; comment?: string };
    if (useDb) {
      const [updated] = await db
        .update(schema.approvals)
        .set({ decision: body.decision, comment: body.comment, resolvedAt: new Date() })
        .where(eq(schema.approvals.id, id))
        .returning();
      if (!updated) return c.json({ error: 'Not found' }, 404);
      const executionId = await store.getExecutionIdByApproval(id);
      if (executionId) {
        await coordinator.submit(executionId, { key: 'approval_decision', value: { decision: body.decision, comment: body.comment } });
      }
      return c.json({
        approval: {
          id: updated.id,
          task_id: updated.taskId,
          execution_id: updated.executionId,
          step_id: updated.stepId,
          prompt: updated.prompt,
          status: updated.decision,
        },
      });
    }
    const approval = await store.getApprovalById(id);
    if (!approval) return c.json({ error: 'Not found' }, 404);
    await store.updateApprovalDecision(id, body.decision, body.comment);
    const executionId = await store.getExecutionIdByApproval(id);
    if (executionId) {
      await coordinator.submit(executionId, { key: 'approval_decision', value: { decision: body.decision, comment: body.comment } });
    }
    return c.json({
      approval: {
        id: approval.id,
        task_id: approval.task_id,
        execution_id: approval.execution_id,
        step_id: approval.step_id,
        prompt: approval.prompt,
        status: approval.decision ?? 'pending',
      },
    });
  });

  app.get('/tasks/:id/artifacts', async (c) => {
    const id = c.req.param('id');
    if (useDb) {
      const list = await db
        .select()
        .from(schema.artifacts)
        .where(eq(schema.artifacts.taskId, id));
      return c.json({
        artifacts: list.map((a) => ({
          id: a.id,
          task_id: a.taskId,
          artifact_id: a.artifactId,
          name: a.name,
          canonical_path: a.canonicalPath,
          status: a.status,
        })),
      });
    }
    if (memStore) {
      const list = memStore.getArtifactsForTask(id);
      return c.json({
        artifacts: list.map((a) => ({
          id: a.artifact_id,
          task_id: a.task_id,
          artifact_id: a.artifact_id,
          name: a.name,
          canonical_path: a.path,
          status: 'ready',
        })),
      });
    }
    return c.json({ artifacts: [] });
  });

  app.get('/artifacts', async (c) => {
    if (useDb) {
      const list = await db.select().from(schema.artifacts);
      return c.json({
        artifacts: list.map((a) => ({
          id: a.id,
          task_id: a.taskId,
          artifact_id: a.artifactId,
          name: a.name,
          canonical_path: a.canonicalPath,
          status: a.status,
        })),
      });
    }
    if (memStore) {
      const all: Array<{
        id: string;
        task_id: string;
        artifact_id: string;
        name: string;
        canonical_path: string;
        status: string;
      }> = [];
      for (const taskId of tasks.keys()) {
        const list = memStore.getArtifactsForTask(taskId);
        all.push(
          ...list.map((a) => ({
            id: a.artifact_id,
            task_id: a.task_id,
            artifact_id: a.artifact_id,
            name: a.name,
            canonical_path: a.path,
            status: 'ready',
          }))
        );
      }
      return c.json({ artifacts: all });
    }
    return c.json({ artifacts: [] });
  });

  app.get('/policy/profiles/:id', (c) => {
    return c.json({
      profile: {
        id: c.req.param('id'),
        name: 'default',
        rules: [],
      },
    });
  });

  return app;
}
