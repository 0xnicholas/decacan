-- Migration: Add Agent Team tables
-- Date: 2026-04-17
-- Description: Creates tables for team sessions, delegations, and decision records

-- Team Sessions
CREATE TABLE IF NOT EXISTS team_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  task_id UUID NOT NULL,
  execution_id VARCHAR(255) NOT NULL,
  phase VARCHAR(50) NOT NULL DEFAULT 'initialized',
  blocked_reason TEXT,
  snapshot JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_team_sessions_workspace_id ON team_sessions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_team_sessions_task_id ON team_sessions(task_id);
CREATE INDEX IF NOT EXISTS idx_team_sessions_phase ON team_sessions(phase);

-- Team Delegations
CREATE TABLE IF NOT EXISTS team_delegations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_session_id UUID NOT NULL REFERENCES team_sessions(id) ON DELETE CASCADE,
  delegator_id VARCHAR(255) NOT NULL,
  delegate_id VARCHAR(255) NOT NULL,
  capability VARCHAR(255) NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_team_delegations_team_session_id ON team_delegations(team_session_id);
CREATE INDEX IF NOT EXISTS idx_team_delegations_delegate_id ON team_delegations(delegate_id);

-- Decision Records
CREATE TABLE IF NOT EXISTS decision_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_session_id UUID NOT NULL,
  task_id UUID NOT NULL,
  execution_id VARCHAR(255) NOT NULL,
  decision_type VARCHAR(50) NOT NULL,
  decision VARCHAR(255) NOT NULL,
  reason TEXT,
  policy_id VARCHAR(255),
  risk_level VARCHAR(50),
  decided_by VARCHAR(255) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_decision_records_task_id ON decision_records(task_id);
CREATE INDEX IF NOT EXISTS idx_decision_records_team_session_id ON decision_records(team_session_id);
CREATE INDEX IF NOT EXISTS idx_decision_records_execution_id ON decision_records(execution_id);

-- Verification query (should return 3 tables)
-- SELECT count(*) FROM information_schema.tables WHERE table_name LIKE 'team_%' OR table_name = 'decision_records';
