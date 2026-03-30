-- Task execution traces
CREATE TABLE task_traces (
    task_id TEXT PRIMARY KEY,
    playbook_version_id TEXT NOT NULL,
    workspace_id TEXT NOT NULL,
    status TEXT NOT NULL,
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    total_duration_ms INTEGER,
    step_count INTEGER NOT NULL DEFAULT 0,
    failed_step_index INTEGER,
    failure_category TEXT,
    trace_data TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step-level traces
CREATE TABLE step_traces (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id TEXT NOT NULL,
    step_id TEXT NOT NULL,
    step_name TEXT NOT NULL,
    sequence INTEGER NOT NULL,
    status TEXT NOT NULL,
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    duration_ms INTEGER,
    retry_count INTEGER DEFAULT 0,
    resources_files INTEGER,
    resources_tokens INTEGER,
    resources_memory INTEGER,
    error_type TEXT,
    error_message TEXT,
    input_snapshot TEXT,
    output_snapshot TEXT,
    FOREIGN KEY (task_id) REFERENCES task_traces(task_id) ON DELETE CASCADE
);

-- Failure attributions
CREATE TABLE attributions (
    task_id TEXT PRIMARY KEY,
    failure_category TEXT NOT NULL,
    attribution_target TEXT NOT NULL,
    root_cause TEXT NOT NULL,
    suggested_fix TEXT NOT NULL,
    relevant_cards TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES task_traces(task_id) ON DELETE CASCADE
);

-- Indexes for efficient querying
CREATE INDEX idx_task_traces_version ON task_traces(playbook_version_id);
CREATE INDEX idx_task_traces_workspace ON task_traces(workspace_id);
CREATE INDEX idx_task_traces_status ON task_traces(status);
CREATE INDEX idx_task_traces_started ON task_traces(started_at);
CREATE INDEX idx_step_traces_task ON step_traces(task_id);
