-- Migration: Create assistant_delegations table for agent team recovery
-- Stores active delegation bindings between assistant sessions and team sessions

CREATE TABLE IF NOT EXISTS assistant_delegations (
    assistant_session_id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    team_session_id TEXT NOT NULL,
    task_id TEXT NOT NULL,
    run_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for listing all active delegations (for recovery)
CREATE INDEX IF NOT EXISTS idx_assistant_delegations_status 
    ON assistant_delegations(status);
CREATE INDEX IF NOT EXISTS idx_assistant_delegations_created_at 
    ON assistant_delegations(created_at);
