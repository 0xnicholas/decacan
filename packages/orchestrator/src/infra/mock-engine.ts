import type {
  ExecutionEvent,
  ExecutionInput,
  ExecutionRequest,
} from '../contract/index.js';
import type { ExecutionEnginePort, ExecutionHandle, ExecutionStatus } from '../runtime/ports.js';

export class MockExecutionEngine implements ExecutionEnginePort {
  private executions = new Map<string, ExecutionRequest>();
  private listeners = new Map<
    string,
    ((event: ExecutionEvent) => void | Promise<void>)[]
  >();
  private paused = new Map<string, boolean>();

  async start(req: ExecutionRequest): Promise<ExecutionHandle> {
    this.executions.set(req.execution_id, req);
    this.listeners.set(req.execution_id, []);
    this.paused.set(req.execution_id, false);

    setTimeout(() => {
      this.emit(req.execution_id, {
        event_type: 'step_started',
        execution_id: req.execution_id,
        step_id: 'step-1',
        phase: 'running',
        timestamp_ms: Date.now(),
      });

      setTimeout(() => {
        this.emit(req.execution_id, {
          event_type: 'artifact_produced',
          execution_id: req.execution_id,
          step_id: 'step-1',
          artifact_id: `artifact-${req.execution_id}`,
          artifact_name: 'summary.md',
          artifact_type: 'summary',
          canonical_path: 'output/summary.md',
          timestamp_ms: Date.now(),
        });

        setTimeout(() => {
          this.emit(req.execution_id, {
            event_type: 'completed',
            execution_id: req.execution_id,
            timestamp_ms: Date.now(),
          });
        }, 10);
      }, 10);
    }, 10);

    return { execution_id: req.execution_id };
  }

  async submit(execution_id: string, _input: ExecutionInput): Promise<void> {
    this.paused.set(execution_id, false);

    setTimeout(() => {
      this.emit(execution_id, {
        event_type: 'completed',
        execution_id,
        timestamp_ms: Date.now(),
      });
    }, 20);
  }

  async getStatus(execution_id: string): Promise<ExecutionStatus | null> {
    if (!this.executions.has(execution_id)) return null;
    return {
      execution_id,
      state: this.paused.get(execution_id) ? 'blocked_on_approval' : 'running',
    };
  }

  async subscribeEvents(
    execution_id: string,
    onEvent: (event: ExecutionEvent) => void | Promise<void>
  ): Promise<() => void> {
    const list = this.listeners.get(execution_id) ?? [];
    list.push(onEvent);
    this.listeners.set(execution_id, list);
    return () => {
      const updated = (this.listeners.get(execution_id) ?? []).filter(
        (fn) => fn !== onEvent
      );
      this.listeners.set(execution_id, updated);
    };
  }

  emit(execution_id: string, event: ExecutionEvent): void {
    const list = this.listeners.get(execution_id) ?? [];
    for (const fn of list) {
      void fn(event);
    }
  }
}
