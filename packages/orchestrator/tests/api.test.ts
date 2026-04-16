import { describe, expect, it } from 'vitest';
import { createServer } from '../src/server.js';
import type { ExecutionEnginePort, ExecutionHandle, ExecutionStatus } from '../src/runtime/ports.js';
import type { ExecutionEvent, ExecutionInput, ExecutionRequest } from '../src/contract/index.js';

describe('api routes', () => {
  const app = createServer();

  it('returns health check', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok' });
  });

  it('creates and retrieves a task', async () => {
    const createRes = await app.request('/tasks', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        workspace_id: 'ws-1',
        playbook_id: 'pb-1',
        playbook_version_id: 'v1',
      }),
    });
    expect(createRes.status).toBe(201);
    const { task } = (await createRes.json()) as { task: { id: string } };

    const getRes = await app.request(`/tasks/${task.id}`);
    expect(getRes.status).toBe(200);
    const body = (await getRes.json()) as { task: { id: string }; runs: [] };
    expect(body.task.id).toBe(task.id);
    expect(body.runs).toEqual([]);
  });

  it('launches execution and produces artifacts', async () => {
    const createRes = await app.request('/tasks', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        workspace_id: 'ws-1',
        playbook_id: 'pb-1',
        playbook_version_id: 'v1',
      }),
    });
    const { task } = (await createRes.json()) as { task: { id: string } };

    const execRes = await app.request(`/tasks/${task.id}/executions`, {
      method: 'POST',
    });
    expect(execRes.status).toBe(202);

    await new Promise((r) => setTimeout(r, 100));

    const artifactsRes = await app.request(`/tasks/${task.id}/artifacts`);
    expect(artifactsRes.status).toBe(200);
    const body = (await artifactsRes.json()) as {
      artifacts: Array<{ name: string }>;
    };
    expect(body.artifacts.length).toBeGreaterThanOrEqual(1);
    expect(body.artifacts[0].name).toBe('summary.md');
  });

  it('streams execution events via SSE', async () => {
    const createRes = await app.request('/tasks', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        workspace_id: 'ws-1',
        playbook_id: 'pb-1',
        playbook_version_id: 'v1',
      }),
    });
    const { task } = (await createRes.json()) as { task: { id: string } };

    const sseRes = await app.request(`/tasks/${task.id}/events/stream`);
    expect(sseRes.status).toBe(200);
    expect(sseRes.headers.get('content-type')).toBe('text/event-stream');

    const execRes = await app.request(`/tasks/${task.id}/executions`, {
      method: 'POST',
    });
    expect(execRes.status).toBe(202);

    const reader = sseRes.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    const events: Array<{ event_type: string }> = [];

    while (events.length < 3) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() ?? '';
      for (const chunk of lines) {
        const dataLine = chunk.split('\n').find((l) => l.startsWith('data: '));
        if (dataLine) {
          events.push(JSON.parse(dataLine.slice(6)));
        }
      }
    }
    await reader.cancel();

    expect(events.map((e) => e.event_type)).toEqual([
      'step_started',
      'artifact_produced',
      'completed',
    ]);
  });

  it('resumes execution after approval decision', async () => {
    class ApprovalTestEngine implements ExecutionEnginePort {
      private listeners = new Map<string, ((event: ExecutionEvent) => void | Promise<void>)[]>();

      async start(req: ExecutionRequest): Promise<ExecutionHandle> {
        this.listeners.set(req.execution_id, []);
        setTimeout(() => {
          this.emit(req.execution_id, {
            event_type: 'approval_required',
            execution_id: req.execution_id,
            step_id: 'step-1',
            prompt: 'Approve this?',
            risk_level: 'medium',
            timestamp_ms: Date.now(),
          });
        }, 10);
        return { execution_id: req.execution_id };
      }

      async submit(execution_id: string, _input: ExecutionInput): Promise<void> {
        setTimeout(() => {
          this.emit(execution_id, {
            event_type: 'completed',
            execution_id,
            timestamp_ms: Date.now(),
          });
        }, 20);
      }

      async getStatus(_execution_id: string): Promise<ExecutionStatus | null> {
        return null;
      }

      async subscribeEvents(
        execution_id: string,
        onEvent: (event: ExecutionEvent) => void | Promise<void>
      ): Promise<() => void> {
        const list = this.listeners.get(execution_id) ?? [];
        list.push(onEvent);
        this.listeners.set(execution_id, list);
        return () => {
          const updated = (this.listeners.get(execution_id) ?? []).filter((fn) => fn !== onEvent);
          this.listeners.set(execution_id, updated);
        };
      }

      emit(execution_id: string, event: ExecutionEvent): void {
        const list = this.listeners.get(execution_id) ?? [];
        for (const fn of list) void fn(event);
      }
    }

    const app = createServer(new ApprovalTestEngine());
    const taskRes = await app.request('/tasks', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        workspace_id: 'ws-1',
        playbook_id: 'pb-1',
        playbook_version_id: 'v1',
      }),
    });
    const { task } = (await taskRes.json()) as { task: { id: string } };

    const execRes = await app.request(`/tasks/${task.id}/executions`, {
      method: 'POST',
    });
    expect(execRes.status).toBe(202);

    await new Promise((r) => setTimeout(r, 50));

    const approvalsRes = await app.request(`/approvals?task_id=${task.id}`);
    const { approvals } = (await approvalsRes.json()) as {
      approvals: Array<{ id: string }>;
    };
    expect(approvals.length).toBe(1);

    const decisionRes = await app.request(`/approvals/${approvals[0].id}/decision`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ decision: 'approved' }),
    });
    expect(decisionRes.status).toBe(200);

    await new Promise((r) => setTimeout(r, 100));

    const taskStatusRes = await app.request(`/tasks/${task.id}`);
    const body = (await taskStatusRes.json()) as { task: { status: string } };
    expect(body.task.status).toBe('completed');
  });
});
