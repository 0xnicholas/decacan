import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  integer,
  boolean,
} from 'drizzle-orm/pg-core';

export const workspaces = pgTable('workspaces', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  ownerId: varchar('owner_id', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  workspaceProfileId: varchar('workspace_profile_id', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const playbookStoreEntries = pgTable('playbook_store_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: varchar('key', { length: 255 }).notNull().unique(),
  title: varchar('title', { length: 255 }),
  description: text('description'),
  content: jsonb('content').default({}),
  tags: jsonb('tags').default([]),
  isPublic: boolean('is_public').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const playbooks = pgTable('playbooks', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull(),
  key: varchar('key', { length: 255 }).notNull(),
  mode: varchar('mode', { length: 50 }).notNull().default('standard'),
  versionId: uuid('version_id').notNull(),
  title: varchar('title', { length: 255 }),
  content: jsonb('content').default({}),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const playbookVersions = pgTable('playbook_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  playbookId: uuid('playbook_id').notNull(),
  content: jsonb('content').default({}),
  publishedAt: timestamp('published_at', { withTimezone: true }).defaultNow().notNull(),
});

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull(),
  playbookId: uuid('playbook_id').notNull(),
  playbookVersionId: uuid('playbook_version_id').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  statusSummary: text('status_summary'),
  inputPayload: text('input_payload'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const runs = pgTable('runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id').notNull(),
  workflowId: varchar('workflow_id', { length: 255 }).notNull(),
  policyProfileId: varchar('policy_profile_id', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('initialized'),
  pauseReason: text('pause_reason'),
  errorDetails: text('error_details'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }),
  finishedAt: timestamp('finished_at', { withTimezone: true }),
});

export const executions = pgTable('executions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  taskId: uuid('task_id').notNull(),
  runId: uuid('run_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const approvals = pgTable('approvals', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id').notNull(),
  executionId: varchar('execution_id', { length: 255 }).notNull(),
  stepId: varchar('step_id', { length: 255 }).notNull(),
  prompt: text('prompt').notNull(),
  riskLevel: varchar('risk_level', { length: 50 }).default('low'),
  decision: varchar('decision', { length: 50 }),
  comment: text('comment'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
});

export const artifacts = pgTable('artifacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id').notNull(),
  artifactId: varchar('artifact_id', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  canonicalPath: varchar('canonical_path', { length: 1024 }).notNull(),
  physicalPath: varchar('physical_path', { length: 1024 }),
  artifactType: varchar('artifact_type', { length: 100 }),
  status: varchar('status', { length: 50 }).default('ready'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const fileWrites = pgTable('file_writes', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id').notNull(),
  relativePath: varchar('relative_path', { length: 1024 }).notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  contentHash: varchar('content_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const taskEvents = pgTable('task_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id').notNull(),
  eventType: varchar('event_type', { length: 255 }).notNull(),
  message: text('message'),
  payload: jsonb('payload').default({}),
  sequence: integer('sequence').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const teamSessions = pgTable('team_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull(),
  taskId: uuid('task_id').notNull(),
  executionId: varchar('execution_id', { length: 255 }).notNull(),
  phase: varchar('phase', { length: 50 }).notNull().default('initialized'),
  blockedReason: text('blocked_reason'),
  snapshot: jsonb('snapshot').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
});

export const teamDelegations = pgTable('team_delegations', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamSessionId: uuid('team_session_id').notNull(),
  delegatorId: varchar('delegator_id', { length: 255 }).notNull(),
  delegateId: varchar('delegate_id', { length: 255 }).notNull(),
  capability: varchar('capability', { length: 255 }).notNull(),
  grantedAt: timestamp('granted_at', { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
});

export const decisionRecords = pgTable('decision_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamSessionId: uuid('team_session_id').notNull(),
  taskId: uuid('task_id').notNull(),
  executionId: varchar('execution_id', { length: 255 }).notNull(),
  decisionType: varchar('decision_type', { length: 50 }).notNull(),
  decision: varchar('decision', { length: 255 }).notNull(),
  reason: text('reason'),
  policyId: varchar('policy_id', { length: 255 }),
  riskLevel: varchar('risk_level', { length: 50 }),
  decidedBy: varchar('decided_by', { length: 255 }).notNull(),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
