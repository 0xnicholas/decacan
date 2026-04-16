import { describe, expect, it } from 'vitest';
import {
  createRun,
  createTask,
  ExecutionCoordinator,
  InMemoryExecutionStore,
} from '../src/runtime/index.js';
import { MockExecutionEngine } from '../src/infra/mock-engine.js';
import { PROTOCOL_VERSION } from '../src/contract/index.js';

describe('orchestrator e2e', () => {
  it('launches execution and projects events into store', async () => {
    const engine = new MockExecutionEngine();
    const store = new InMemoryExecutionStore();
    const coordinator = new ExecutionCoordinator(engine, store);

    const task = createTask('task-1', 'ws-1', 'pb-1', 'v1');
    const run = createRun('run-1', 'task-1', 'wf-1', 'policy-1');
    const snapshot = {
      playbook_id: 'pb-1',
      playbook_version_id: 'v1',
      playbook_key: 'playbook.summary',
      execution_profile: 'standard' as const,
      workflow: {
        id: 'wf-1',
        steps: [
          {
            id: 'step-1',
            name: 'draft_summary',
            description: 'Draft summary',
            capability_ref: {
              kind: 'routine' as const,
              class: 'builtin',
              name: 'draft_summary',
              version: '1.0.0',
            },
            input_mapping: {},
            output_mapping: {},
            transition: { type: 'end' as const },
          },
        ],
        compiled_at: new Date().toISOString(),
      },
      policy_profile_id: 'policy-1',
      capability_refs: [],
    };

    await coordinator.launch('exec-1', task, run, snapshot, []);

    await new Promise((r) => setTimeout(r, 100));

    const storedTask = store.getTask('task-1');
    const storedRun = store.getRun('run-1');
    const artifacts = store.getArtifactsForTask('task-1');

    expect(storedTask?.status).toBe('completed');
    expect(storedRun?.status).toBe('completed');
    expect(artifacts).toHaveLength(1);
    expect(artifacts[0]).toMatchObject({
      artifact_id: 'artifact-exec-1',
      name: 'summary.md',
      path: 'output/summary.md',
    });
  });
});

export { PROTOCOL_VERSION };
