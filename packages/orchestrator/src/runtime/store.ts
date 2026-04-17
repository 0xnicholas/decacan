import type { ExecutionStore } from './coordinator.js';

export interface StoredTask {
  id: string;
  status: string;
  status_summary?: string;
}

export interface StoredRun {
  id: string;
  status: string;
}

export interface StoredArtifact {
  task_id: string;
  artifact_id: string;
  name: string;
  path: string;
}

export interface StoredApproval {
  id: string;
  task_id: string;
  execution_id: string;
  step_id: string;
  prompt: string;
  decision?: string;
  comment?: string;
}

export class InMemoryExecutionStore implements ExecutionStore {
  private executions = new Map<
    string,
    { task_id: string; run_id: string }
  >();
  private tasks = new Map<string, StoredTask>();
  private runs = new Map<string, StoredRun>();
  private artifacts: StoredArtifact[] = [];
  private fileWrites: Array<{
    task_id: string;
    relative_path: string;
    size_bytes: number;
    content_hash: string;
  }> = [];
  private approvals: StoredApproval[] = [];

  async registerExecution(
    execution_id: string,
    task_id: string,
    run_id: string
  ): Promise<void> {
    this.executions.set(execution_id, { task_id, run_id });
  }

  async getTaskIdByExecution(execution_id: string): Promise<string | null> {
    return this.executions.get(execution_id)?.task_id ?? null;
  }

  async getRunIdByExecution(execution_id: string): Promise<string | null> {
    return this.executions.get(execution_id)?.run_id ?? null;
  }

  async updateTaskStatus(
    task_id: string,
    status: string,
    summary?: string
  ): Promise<void> {
    const existing = this.tasks.get(task_id);
    this.tasks.set(task_id, {
      id: task_id,
      status,
      status_summary: summary ?? existing?.status_summary,
    });
  }

  async updateRunStatus(run_id: string, status: string): Promise<void> {
    this.runs.set(run_id, { id: run_id, status });
  }

  async recordArtifact(
    task_id: string,
    artifact_id: string,
    name: string,
    path: string
  ): Promise<void> {
    this.artifacts.push({ task_id, artifact_id, name, path });
  }

  async recordFileWrite(
    task_id: string,
    relative_path: string,
    size_bytes: number,
    content_hash: string
  ): Promise<void> {
    this.fileWrites.push({ task_id, relative_path, size_bytes, content_hash });
  }

  async recordApproval(
    approval_id: string,
    task_id: string,
    execution_id: string,
    step_id: string,
    prompt: string
  ): Promise<void> {
    this.approvals.push({ id: approval_id, task_id, execution_id, step_id, prompt });
  }

  async getExecutionIdByApproval(approval_id: string): Promise<string | null> {
    const approval = this.approvals.find((a) => a.id === approval_id);
    return approval?.execution_id ?? null;
  }

  async updateApprovalDecision(approval_id: string, decision: string, comment?: string): Promise<void> {
    const approval = this.approvals.find((a) => a.id === approval_id);
    if (approval) {
      approval.decision = decision;
      approval.comment = comment;
    }
  }

  async getApprovalById(approval_id: string): Promise<StoredApproval | null> {
    return this.approvals.find((a) => a.id === approval_id) ?? null;
  }

  async getAllApprovals(): Promise<StoredApproval[]> {
    return this.approvals;
  }

  async recordTaskEvent(
    _task_id: string,
    _event_type: string,
    _message: string | null,
    _payload: unknown,
    _sequence: number
  ): Promise<void> {
    return;
  }

  getTask(task_id: string): StoredTask | undefined {
    return this.tasks.get(task_id);
  }

  getRun(run_id: string): StoredRun | undefined {
    return this.runs.get(run_id);
  }

  getArtifactsForTask(task_id: string): StoredArtifact[] {
    return this.artifacts.filter((a) => a.task_id === task_id);
  }

  getApprovalsForTask(task_id: string): StoredApproval[] {
    return this.approvals.filter((a) => a.task_id === task_id);
  }
}
