import type { ExecutionEvent, ExecutionInput, ExecutionRequest } from '../contract/index.js';

export interface ExecutionHandle {
  execution_id: string;
}

export interface ExecutionStatus {
  execution_id: string;
  state: 'running' | 'blocked_on_input' | 'blocked_on_approval' | 'completed' | 'failed';
  phase?: string;
}

export interface ExecutionEnginePort {
  start(req: ExecutionRequest): Promise<ExecutionHandle>;
  submit(execution_id: string, input: ExecutionInput): Promise<void>;
  getStatus(execution_id: string): Promise<ExecutionStatus | null>;
  subscribeEvents(
    execution_id: string,
    onEvent: (event: ExecutionEvent) => void | Promise<void>
  ): Promise<() => void>;
}
