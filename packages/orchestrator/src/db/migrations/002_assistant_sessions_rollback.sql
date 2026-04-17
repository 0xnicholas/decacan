-- Rollback: 002_assistant_sessions

DROP INDEX IF EXISTS assistant_sessions_team_session_id_idx;
DROP INDEX IF EXISTS assistant_sessions_task_id_idx;
DROP INDEX IF EXISTS assistant_sessions_workspace_id_idx;
DROP TABLE IF EXISTS assistant_sessions;