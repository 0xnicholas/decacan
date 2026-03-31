CREATE TABLE IF NOT EXISTS workspace_memberships (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL,
    invited_by TEXT,
    invited_at TIMESTAMP,
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    
    UNIQUE(workspace_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_memberships_workspace ON workspace_memberships(workspace_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON workspace_memberships(user_id);
