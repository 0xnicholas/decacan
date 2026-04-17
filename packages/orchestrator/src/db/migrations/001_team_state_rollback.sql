-- Rollback: Remove Agent Team tables
-- Date: 2026-04-17
-- Warning: This will delete all team session data. Do not run in production without backup.

-- Remove tables in reverse order of creation (respecting foreign keys)
DROP TABLE IF EXISTS decision_records;
DROP TABLE IF EXISTS team_delegations;
DROP TABLE IF EXISTS team_sessions;
