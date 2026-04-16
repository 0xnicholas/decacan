import { z } from 'zod';

export const TaskStatusSchema = z.enum([
  'pending',
  'running',
  'paused',
  'completed',
  'failed',
  'cancelled',
]);
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export const TaskSchema = z.object({
  id: z.string(),
  workspace_id: z.string(),
  playbook_id: z.string(),
  playbook_version_id: z.string(),
  status: TaskStatusSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type Task = z.infer<typeof TaskSchema>;

export function createTask(
  id: string,
  workspace_id: string,
  playbook_id: string,
  playbook_version_id: string
): Task {
  const now = new Date().toISOString();
  return {
    id,
    workspace_id,
    playbook_id,
    playbook_version_id,
    status: 'pending',
    created_at: now,
    updated_at: now,
  };
}

export const RunStatusSchema = z.enum([
  'initialized',
  'running',
  'paused',
  'completed',
  'failed',
  'cancelled',
]);
export type RunStatus = z.infer<typeof RunStatusSchema>;

export const RunSchema = z.object({
  id: z.string(),
  task_id: z.string(),
  workflow_id: z.string(),
  policy_profile_id: z.string(),
  status: RunStatusSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  started_at: z.string().datetime().optional(),
  finished_at: z.string().datetime().optional(),
  pause_reason: z.string().optional(),
  error_details: z.string().optional(),
});
export type Run = z.infer<typeof RunSchema>;

export function createRun(
  id: string,
  task_id: string,
  workflow_id: string,
  policy_profile_id: string
): Run {
  const now = new Date().toISOString();
  return {
    id,
    task_id,
    workflow_id,
    policy_profile_id,
    status: 'initialized',
    created_at: now,
    updated_at: now,
  };
}

export function canTransitionRun(current: RunStatus, next: RunStatus): boolean {
  const transitions: Record<RunStatus, RunStatus[]> = {
    initialized: ['running', 'cancelled'],
    running: ['paused', 'completed', 'failed', 'cancelled'],
    paused: ['running', 'failed', 'cancelled'],
    completed: [],
    failed: [],
    cancelled: [],
  };
  return transitions[current].includes(next);
}

export function transitionRun(run: Run, next: RunStatus): void {
  if (!canTransitionRun(run.status, next)) {
    throw new Error(`Invalid run transition: ${run.status} -> ${next}`);
  }
  run.status = next;
  run.updated_at = new Date().toISOString();
  if (next === 'running' && !run.started_at) {
    run.started_at = run.updated_at;
  }
  if (['completed', 'failed', 'cancelled'].includes(next)) {
    run.finished_at = run.updated_at;
    run.pause_reason = undefined;
  }
}

export const PlaybookModeSchema = z.enum(['standard', 'discovery']);
export type PlaybookMode = z.infer<typeof PlaybookModeSchema>;

export const PlaybookSchema = z.object({
  id: z.string(),
  key: z.string(),
  workspace_id: z.string(),
  mode: PlaybookModeSchema,
  version_id: z.string(),
});
export type Playbook = z.infer<typeof PlaybookSchema>;

export const WorkflowStepTypeSchema = z.enum([
  'deterministic',
  'tool',
  'routine',
  'psi',
  'approval',
  'branch',
]);
export type WorkflowStepType = z.infer<typeof WorkflowStepTypeSchema>;

export const WorkflowStepSchema = z.object({
  id: z.string(),
  name: z.string(),
  purpose: z.string(),
  step_type: WorkflowStepTypeSchema,
  next_step_id: z.string().optional(),
});
export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;

export const WorkflowSchema = z.object({
  id: z.string(),
  steps: z.array(WorkflowStepSchema),
});
export type Workflow = z.infer<typeof WorkflowSchema>;
