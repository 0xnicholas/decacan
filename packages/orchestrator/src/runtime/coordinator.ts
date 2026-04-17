import { v4 as uuidv4 } from 'uuid';
import type { ExecutionEvent, ExecutionInput, PlaybookSnapshot } from '../contract/index.js';
import { PROTOCOL_VERSION } from '../contract/index.js';
import type { Run, Task } from './entities.js';
import { transitionRun } from './entities.js';
import type { ExecutionEnginePort, ExecutionHandle } from './ports.js';

export interface ExecutionStore {
  registerExecution(execution_id: string, task_id: string, run_id: string): Promise<void>;
  getTaskIdByExecution(execution_id: string): Promise<string | null>;
  getRunIdByExecution(execution_id: string): Promise<string | null>;
  getExecutionIdByApproval(approval_id: string): Promise<string | null>;
  updateTaskStatus(task_id: string, status: string, summary?: string): Promise<void>;
  updateRunStatus(run_id: string, status: string): Promise<void>;
  recordArtifact(task_id: string, artifact_id: string, name: string, path: string): Promise<void>;
  recordFileWrite(task_id: string, relative_path: string, size_bytes: number, content_hash: string): Promise<void>;
  recordApproval(approval_id: string, task_id: string, execution_id: string, step_id: string, prompt: string): Promise<void>;
  updateApprovalDecision(approval_id: string, decision: string, comment?: string): Promise<void>;
  getApprovalById(approval_id: string): Promise<{ id: string; task_id: string; execution_id: string; step_id: string; prompt: string; decision?: string; comment?: string } | null>;
  getAllApprovals(): Promise<{ id: string; task_id: string; execution_id: string; step_id: string; prompt: string; decision?: string; comment?: string }[]>;
  recordTaskEvent(task_id: string, event_type: string, message: string | null, payload: unknown, sequence: number): Promise<void>;
}

export class ExecutionCoordinator {
  private sequenceCounters = new Map<string, number>();

  constructor(
    private engine: ExecutionEnginePort,
    private store: ExecutionStore,
    private eventBus?: { publish: (task_id: string, event: Record<string, unknown>) => void }
  ) {}

  async launch(
    execution_id: string,
    task: Task,
    run: Run,
    snapshot: PlaybookSnapshot,
    initialInputs: ExecutionInput[] = []
  ): Promise<ExecutionHandle> {
    const request = {
      execution_id,
      protocol_version: PROTOCOL_VERSION,
      snapshot,
      context: {
        workspace_id: task.workspace_id,
        playbook_id: task.playbook_id,
        task_id: task.id,
        run_id: run.id,
        initiated_by: 'system',
      },
      initial_inputs: initialInputs,
    };

    await this.store.registerExecution(execution_id, task.id, run.id);
    await this.store.updateTaskStatus(task.id, 'running', 'Runtime execution started');
    transitionRun(run, 'running');
    await this.store.updateRunStatus(run.id, run.status);
    this.sequenceCounters.set(task.id, 0);

    const handle = await this.engine.start(request);

    this.engine.subscribeEvents(execution_id, (event) =>
      this.handleEvent(execution_id, event)
    );

    return handle;
  }

  private nextSequence(task_id: string): number {
    const next = (this.sequenceCounters.get(task_id) ?? 0) + 1;
    this.sequenceCounters.set(task_id, next);
    return next;
  }

  private async emit(task_id: string, event: ExecutionEvent): Promise<void> {
    const sequence = this.nextSequence(task_id);
    await this.store.recordTaskEvent(
      task_id,
      event.event_type,
      'message' in event ? (event.message as string | null) ?? null : null,
      event,
      sequence
    );
    this.eventBus?.publish(task_id, { ...event, sequence });
  }

  async submit(execution_id: string, input: ExecutionInput): Promise<void> {
    await this.engine.submit(execution_id, input);
  }

  private async handleEvent(
    execution_id: string,
    event: ExecutionEvent
  ): Promise<void> {
    const task_id = await this.store.getTaskIdByExecution(execution_id);
    const run_id = await this.store.getRunIdByExecution(execution_id);
    if (!task_id || !run_id) return;

    await this.emit(task_id, event);

    switch (event.event_type) {
      case 'step_started':
        break;
      case 'step_completed':
        break;
      case 'tool_will_execute':
        break;
      case 'tool_did_execute':
        break;
      case 'artifact_produced':
        await this.store.recordArtifact(
          task_id,
          event.artifact_id,
          event.artifact_name,
          event.canonical_path
        );
        break;
      case 'file_write':
        await this.store.recordFileWrite(
          task_id,
          event.relative_path,
          event.size_bytes,
          event.content_hash
        );
        break;
      case 'approval_required':
        await this.store.recordApproval(
          uuidv4(),
          task_id,
          execution_id,
          event.step_id,
          event.prompt
        );
        await this.store.updateTaskStatus(task_id, 'paused', 'Awaiting approval');
        break;
      case 'input_required':
        await this.store.updateTaskStatus(task_id, 'paused', 'Awaiting input');
        break;
      case 'failed':
        await this.store.updateTaskStatus(task_id, 'failed', event.reason);
        await this.store.updateRunStatus(run_id, 'failed');
        break;
      case 'completed':
        await this.store.updateTaskStatus(task_id, 'completed', 'Execution completed');
        await this.store.updateRunStatus(run_id, 'completed');
        break;
    }
  }
}
