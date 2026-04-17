-- Migration: 002_assistant_sessions
-- Description: Add assistant_sessions table for tracking delegation sessions

CREATE TABLE IF NOT EXISTS assistant_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  task_id UUID NOT NULL,
  team_session_id UUID NOT NULL,
  objective JSONB DEFAULT '{}',
  execution_mode VARCHAR(50) NOT NULL DEFAULT 'interactive',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS assistant_sessions_workspace_id_idx ON assistant_sessions(workspace_id);
CREATE INDEX IF NOT EXISTS assistant_sessions_task_id_idx ON assistant_sessions(task_id);
CREATE INDEX IF NOT EXISTS assistant_sessions_team_session_id_idx ON assistant_sessions(team_session_id);