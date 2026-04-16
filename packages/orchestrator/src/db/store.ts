import { eq } from 'drizzle-orm';
import type { ExecutionStore } from '../runtime/coordinator.js';
import { db } from './client.js';
import {
  approvals,
  artifacts,
  executions,
  fileWrites,
  runs,
  taskEvents,
  tasks,
} from './schema.js';

export class DbExecutionStore implements ExecutionStore {
  async registerExecution(
    execution_id: string,
    task_id: string,
    run_id: string
  ): Promise<void> {
    await db.insert(executions).values({
      id: execution_id,
      taskId: task_id,
      runId: run_id,
    });
  }

  async getTaskIdByExecution(execution_id: string): Promise<string | null> {
    const row = await db.query.executions.findFirst({
      where: eq(executions.id, execution_id),
    });
    return row?.taskId ?? null;
  }

  async getRunIdByExecution(execution_id: string): Promise<string | null> {
    const row = await db.query.executions.findFirst({
      where: eq(executions.id, execution_id),
    });
    return row?.runId ?? null;
  }

  async getExecutionIdByApproval(approval_id: string): Promise<string | null> {
    const row = await db.query.approvals.findFirst({
      where: eq(approvals.id, approval_id),
    });
    return row?.executionId ?? null;
  }

  async updateTaskStatus(
    task_id: string,
    status: string,
    summary?: string
  ): Promise<void> {
    await db
      .update(tasks)
      .set({
        status,
        statusSummary: summary ?? undefined,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, task_id));
  }

  async updateRunStatus(run_id: string, status: string): Promise<void> {
    const setFields: { status: string; updatedAt: Date; startedAt?: Date; finishedAt?: Date } = {
      status,
      updatedAt: new Date(),
    };
    if (status === 'running') {
      setFields.startedAt = new Date();
    }
    if (['completed', 'failed', 'cancelled'].includes(status)) {
      setFields.finishedAt = new Date();
    }
    await db.update(runs).set(setFields).where(eq(runs.id, run_id));
  }

  async recordArtifact(
    task_id: string,
    artifact_id: string,
    name: string,
    path: string
  ): Promise<void> {
    await db.insert(artifacts).values({
      taskId: task_id,
      artifactId: artifact_id,
      name,
      canonicalPath: path,
    });
  }

  async recordFileWrite(
    task_id: string,
    relative_path: string,
    size_bytes: number,
    content_hash: string
  ): Promise<void> {
    await db.insert(fileWrites).values({
      taskId: task_id,
      relativePath: relative_path,
      sizeBytes: size_bytes,
      contentHash: content_hash,
    });
  }

  async recordApproval(
    approval_id: string,
    task_id: string,
    execution_id: string,
    step_id: string,
    prompt: string
  ): Promise<void> {
    await db.insert(approvals).values({
      id: approval_id,
      taskId: task_id,
      executionId: execution_id,
      stepId: step_id,
      prompt,
    });
  }

  async recordTaskEvent(
    task_id: string,
    event_type: string,
    message: string | null,
    payload: unknown,
    sequence: number
  ): Promise<void> {
    await db.insert(taskEvents).values({
      taskId: task_id,
      eventType: event_type,
      message,
      payload: payload as Record<string, unknown>,
      sequence,
    });
  }
}
