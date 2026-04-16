import { z } from 'zod';

export const PROTOCOL_VERSION = '1.0';

export function isCompatible(remoteVersion: string): boolean {
  return remoteVersion.startsWith('1.');
}

export const ExecutionPhaseSchema = z.enum([
  'initialized',
  'running',
  'blocked_on_input',
  'blocked_on_approval',
  'completed',
  'failed',
  'cancelled',
]);
export type ExecutionPhase = z.infer<typeof ExecutionPhaseSchema>;

export const StepOutputSchema = z.object({
  key: z.string(),
  value: z.unknown(),
});
export type StepOutput = z.infer<typeof StepOutputSchema>;

export const ExecutionEventSchema = z.discriminatedUnion('event_type', [
  z.object({
    event_type: z.literal('step_started'),
    execution_id: z.string(),
    step_id: z.string(),
    phase: ExecutionPhaseSchema,
    timestamp_ms: z.number(),
  }),
  z.object({
    event_type: z.literal('step_completed'),
    execution_id: z.string(),
    step_id: z.string(),
    outputs: z.array(StepOutputSchema),
    phase: ExecutionPhaseSchema,
    timestamp_ms: z.number(),
  }),
  z.object({
    event_type: z.literal('tool_will_execute'),
    execution_id: z.string(),
    step_id: z.string(),
    tool_name: z.string(),
    timestamp_ms: z.number(),
  }),
  z.object({
    event_type: z.literal('tool_did_execute'),
    execution_id: z.string(),
    step_id: z.string(),
    tool_name: z.string(),
    result_status: z.enum(['success', 'failure', 'blocked']),
    timestamp_ms: z.number(),
  }),
  z.object({
    event_type: z.literal('file_write'),
    execution_id: z.string(),
    step_id: z.string(),
    relative_path: z.string(),
    size_bytes: z.number(),
    content_hash: z.string(),
    timestamp_ms: z.number(),
  }),
  z.object({
    event_type: z.literal('artifact_produced'),
    execution_id: z.string(),
    step_id: z.string(),
    artifact_id: z.string(),
    artifact_name: z.string(),
    artifact_type: z.string(),
    canonical_path: z.string(),
    timestamp_ms: z.number(),
  }),
  z.object({
    event_type: z.literal('approval_required'),
    execution_id: z.string(),
    step_id: z.string(),
    prompt: z.string(),
    risk_level: z.enum(['low', 'medium', 'high', 'critical']),
    timestamp_ms: z.number(),
  }),
  z.object({
    event_type: z.literal('input_required'),
    execution_id: z.string(),
    step_id: z.string(),
    prompt: z.string(),
    timestamp_ms: z.number(),
  }),
  z.object({
    event_type: z.literal('failed'),
    execution_id: z.string(),
    step_id: z.string().optional(),
    reason: z.string(),
    timestamp_ms: z.number(),
  }),
  z.object({
    event_type: z.literal('completed'),
    execution_id: z.string(),
    timestamp_ms: z.number(),
  }),
]);
export type ExecutionEvent = z.infer<typeof ExecutionEventSchema>;

export const ExecutionContextSchema = z.object({
  workspace_id: z.string(),
  playbook_id: z.string(),
  task_id: z.string(),
  run_id: z.string(),
  initiated_by: z.string(),
});
export type ExecutionContext = z.infer<typeof ExecutionContextSchema>;

export const ExecutionInputSchema = z.object({
  key: z.string(),
  value: z.unknown(),
});
export type ExecutionInput = z.infer<typeof ExecutionInputSchema>;

export const ExecutionRequestSchema = z.object({
  execution_id: z.string(),
  protocol_version: z.string(),
  snapshot: z.lazy(() => PlaybookSnapshotSchema),
  context: ExecutionContextSchema,
  initial_inputs: z.array(ExecutionInputSchema),
});
export type ExecutionRequest = z.infer<typeof ExecutionRequestSchema>;

export const ApprovalDecisionSchema = z.object({
  approved: z.boolean(),
  comment: z.string().optional(),
});
export type ApprovalDecision = z.infer<typeof ApprovalDecisionSchema>;

export const CapabilityKindSchema = z.enum(['routine', 'tool', 'validator']);
export type CapabilityKind = z.infer<typeof CapabilityKindSchema>;

export const CapabilityRefSchema = z.object({
  kind: CapabilityKindSchema,
  class: z.string(),
  name: z.string(),
  version: z.string(),
});
export type CapabilityRef = z.infer<typeof CapabilityRefSchema>;

export const WorkflowStepDefSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  capability_ref: CapabilityRefSchema,
  input_mapping: z.record(z.string()).default({}),
  output_mapping: z.record(z.string()).default({}),
  transition: z.discriminatedUnion('type', [
    z.object({ type: z.literal('next'), step_id: z.string() }),
    z.object({ type: z.literal('conditional'), branches: z.array(z.object({ condition: z.string(), step_id: z.string() })) }),
    z.object({ type: z.literal('end') }),
  ]),
});
export type WorkflowStepDef = z.infer<typeof WorkflowStepDefSchema>;

export const CompiledWorkflowSchema = z.object({
  id: z.string(),
  steps: z.array(WorkflowStepDefSchema),
  compiled_at: z.string().datetime(),
});
export type CompiledWorkflow = z.infer<typeof CompiledWorkflowSchema>;

export const ExecutionProfileSchema = z.enum(['standard', 'discovery']);
export type ExecutionProfile = z.infer<typeof ExecutionProfileSchema>;

export const PlaybookSnapshotSchema = z.object({
  playbook_id: z.string(),
  playbook_version_id: z.string(),
  playbook_key: z.string(),
  execution_profile: ExecutionProfileSchema,
  workflow: CompiledWorkflowSchema,
  policy_profile_id: z.string(),
  capability_refs: z.array(CapabilityRefSchema),
});
export type PlaybookSnapshot = z.infer<typeof PlaybookSnapshotSchema>;
