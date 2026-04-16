# Decacan Playbook 执行追踪与归因系统 Phase 1 Implementation Plan

> **历史备注（2026-04-16）**：本文档为归档计划。项目已全面迁移至 TypeScript/Node.js，后端核心位于 `packages/orchestrator`。文中的 Rust/crates 实现细节反映的是迁移前的技术选型。


> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建完整的执行追踪与归因系统，实现 Step Trace 记录、5 种失败类型归因引擎、版本成功率统计，让 Playbook 成为可调试的知识容器。

**Architecture:** 扩展 decacan-runtime 的 workflow execution，在 Task/Run 执行过程中记录详细追踪数据；新增归因引擎分析失败原因并映射到 PlaybookDraft 具体位置；SQLite 存储 trace 数据支持复杂查询和聚合统计。

**Tech Stack:** Rust, tokio, axum, serde, rusqlite (async), time, uuid, decacan-runtime, decacan-app, cargo test

**Reference Spec:** `docs/superpowers/specs/2026-03-30-decacan-playbook-knowledge-cards-design.md`

---

## Scope Check

This plan implements **Phase 1 only** from the spec:

- Step Trace 记录系统（输入/输出快照、执行元数据、资源消耗）
- 5 种失败类型的归因引擎（Runtime, Contract, Quality, Policy, PartialCompletion）
- 版本成功率统计和对比
- 归因 API 和前端展示

**Deferred to Phase 2/3:**
- 知识卡片系统（三种使用方式）
- 意图驱动创作
- 自动卡片生成

## File Structure

### New Files to Create

**Runtime Core:**
- `crates/decacan-runtime/src/trace/mod.rs` - Trace 模块入口
- `crates/decacan-runtime/src/trace/entities.rs` - StepTrace, TaskExecutionTrace 等实体
- `crates/decacan-runtime/src/trace/recorder.rs` - Trace 记录器 trait 和实现
- `crates/decacan-runtime/src/trace/attribution.rs` - 归因引擎
- `crates/decacan-runtime/src/trace/stats.rs` - 版本统计计算

**Storage Layer:**
- `crates/decacan-runtime/src/storage/trace_store.rs` - SQLite trace 存储
- `crates/decacan-runtime/src/storage/migrations/trace_001.sql` - 数据库迁移

**App Layer:**
- `crates/decacan-app/src/api/traces.rs` - Trace HTTP API
- `crates/decacan-app/src/dto/trace.rs` - Trace DTOs

**Tests:**
- `crates/decacan-runtime/tests/trace_recording.rs` - Trace 记录测试
- `crates/decacan-runtime/tests/attribution.rs` - 归因引擎测试
- `crates/decacan-app/tests/trace_api_smoke.rs` - API 集成测试

### Files to Modify

**Runtime:**
- `crates/decacan-runtime/src/lib.rs` - 导出 trace 模块
- `crates/decacan-runtime/src/workflow/compiler.rs` - 集成 trace 记录点
- `crates/decacan-runtime/src/run/executor.rs` - Step 执行时记录 trace

**App:**
- `crates/decacan-app/src/api/mod.rs` - 注册 trace routes
- `crates/decacan-app/src/app/state.rs` - 添加 trace store
- `crates/decacan-app/src/dto/mod.rs` - 导出 trace DTOs

**Tests:**
- `crates/decacan-app/tests/http_smoke.rs` - 添加 trace 端点测试

---

## Week 1: Trace Recording Infrastructure

### Task 1: Define Trace Entity Types

**Files:**
- Create: `crates/decacan-runtime/src/trace/entities.rs`
- Create: `crates/decacan-runtime/src/trace/mod.rs`
- Modify: `crates/decacan-runtime/src/lib.rs`
- Test: `crates/decacan-runtime/tests/trace_recording.rs`

**Rationale:** 先定义数据结构，所有后续实现都依赖这些类型。

- [ ] **Step 1: Write failing test for StepTrace creation**

```rust
// crates/decacan-runtime/tests/trace_recording.rs
use decacan_runtime::trace::entities::{StepTrace, StepStatus};
use serde_json::json;

#[test]
fn test_step_trace_creation() {
    let trace = StepTrace {
        step_id: "scan".to_string(),
        step_name: "扫描文件".to_string(),
        sequence: 1,
        input_snapshot: json!({"directory": "/docs"}),
        output_snapshot: json!({"files": ["a.md", "b.md"]}),
        started_at: OffsetDateTime::now_utc(),
        completed_at: None,
        duration_ms: None,
        retry_count: 0,
        resources_used: Default::default(),
        status: StepStatus::Running,
        error: None,
        invoked_cards: vec![],
    };
    
    assert_eq!(trace.step_id, "scan");
    assert_eq!(trace.sequence, 1);
}
```

- [ ] **Step 2: Run test to confirm failure**

```bash
cd /Users/nicholasl/Documents/build-whatever/decacan
cargo test -p decacan-runtime --test trace_recording -- --nocapture
```

Expected: FAIL - entities module doesn't exist

- [ ] **Step 3: Implement StepTrace and TaskExecutionTrace entities**

```rust
// crates/decacan-runtime/src/trace/entities.rs
use serde::{Deserialize, Serialize};
use serde_json::Value;
use time::OffsetDateTime;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StepTrace {
    pub step_id: String,
    pub step_name: String,
    pub sequence: u32,
    pub input_snapshot: Value,
    pub output_snapshot: Value,
    pub started_at: OffsetDateTime,
    pub completed_at: Option<OffsetDateTime>,
    pub duration_ms: Option<u64>,
    pub retry_count: u32,
    pub resources_used: ResourceMetrics,
    pub status: StepStatus,
    pub error: Option<StepError>,
    pub invoked_cards: Vec<CardInvocation>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskExecutionTrace {
    pub task_id: String,
    pub playbook_version_id: Uuid,
    pub workspace_id: String,
    pub steps: Vec<StepTrace>,
    pub overall_status: TaskStatus,
    pub total_duration_ms: u64,
    pub step_count: u32,
    pub failed_step_index: Option<u32>,
    pub created_at: OffsetDateTime,
    pub completed_at: Option<OffsetDateTime>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum StepStatus {
    Running,
    Success,
    Failed,
    Skipped,
    Timeout,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "status")]
pub enum TaskStatus {
    Succeeded,
    Running,
    Paused,
    Failed { category: FailureCategory },
    Cancelled,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceMetrics {
    pub files_processed: u32,
    pub tokens_consumed: u32,
    pub memory_peak_mb: u32,
}

impl Default for ResourceMetrics {
    fn default() -> Self {
        Self {
            files_processed: 0,
            tokens_consumed: 0,
            memory_peak_mb: 0,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StepError {
    pub error_type: String,
    pub message: String,
    pub stack_trace: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CardInvocation {
    pub card_id: String,
    pub invoked_at: OffsetDateTime,
    pub trigger_reason: String,
    pub details: Option<String>,
}

// Failure categories for attribution
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "category", rename_all = "snake_case")]
pub enum FailureCategory {
    Runtime(RuntimeError),
    Contract(ContractViolation),
    Quality(QualityIssue),
    Policy(PolicyViolation),
    PartialCompletion(PartialFailure),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RuntimeError {
    pub error_type: String,
    pub capability_ref: Option<String>,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContractViolation {
    pub field: String,
    pub expected: String,
    pub actual: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QualityIssue {
    pub dimension: String,
    pub score: f64,
    pub threshold: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PolicyViolation {
    pub policy_type: String,
    pub violation_detail: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PartialFailure {
    pub completed_steps: Vec<String>,
    pub failed_step: String,
    pub partial_output: Option<Value>,
}

// Attribution entities
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum AttributionTarget {
    DraftCapabilityRef {
        ref_name: String,
        location: String,
    },
    DraftWorkflowStep {
        step_index: u32,
        field: String,
    },
    DraftInputSchema {
        field_name: String,
    },
    DraftOutputContract {
        contract_type: String,
    },
    DraftPolicyProfile {
        policy_name: String,
    },
    KnowledgeCard {
        card_id: String,
        dimension: String,
    },
    RuntimeEnvironment,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FailureAttribution {
    pub task_id: String,
    pub failed_step_id: String,
    pub failure_category: FailureCategory,
    pub attribution: AttributionTarget,
    pub root_cause: String,
    pub suggested_fix: String,
    pub relevant_card_refs: Vec<String>,
}

// Statistics entities
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VersionExecutionStats {
    pub playbook_version_id: Uuid,
    pub version_number: u32,
    pub total_executions: u32,
    pub success_count: u32,
    pub failure_count: u32,
    pub success_rate: f64,
    pub avg_duration_ms: u64,
    pub min_duration_ms: u64,
    pub max_duration_ms: u64,
    pub failure_breakdown: HashMap<String, u32>,
    pub step_stats: Vec<StepStats>,
    pub period_start: OffsetDateTime,
    pub period_end: OffsetDateTime,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StepStats {
    pub step_id: String,
    pub total_count: u32,
    pub success_count: u32,
    pub avg_duration_ms: u64,
}
```

- [ ] **Step 4: Create trace module entry point**

```rust
// crates/decacan-runtime/src/trace/mod.rs
pub mod entities;
pub mod recorder;
pub mod attribution;
pub mod stats;

pub use entities::*;
```

- [ ] **Step 5: Export trace module from runtime**

```rust
// crates/decacan-runtime/src/lib.rs
// Add at the end of existing pub mod statements:
pub mod trace;
```

- [ ] **Step 6: Re-run tests to verify entities compile**

```bash
cargo test -p decacan-runtime --test trace_recording -- --nocapture
```

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add crates/decacan-runtime/src/trace/
git add crates/decacan-runtime/tests/trace_recording.rs
git add crates/decacan-runtime/src/lib.rs
git commit -m "feat(trace): add StepTrace and TaskExecutionTrace entities

- Define core trace data structures
- Support 5 failure categories for attribution
- Include resource metrics and card invocation tracking"
```

---

### Task 2: SQLite Storage Schema and Migration

**Files:**
- Create: `crates/decacan-runtime/src/storage/migrations/trace_001.sql`
- Create: `crates/decacan-runtime/src/storage/trace_store.rs`
- Modify: `crates/decacan-runtime/src/storage/mod.rs` (or create)

**Rationale:** 先定义数据库 schema，再实现存储逻辑。

- [ ] **Step 1: Write failing test for trace persistence**

```rust
// crates/decacan-runtime/tests/trace_recording.rs
#[tokio::test]
async fn test_trace_persistence() {
    use decacan_runtime::storage::trace_store::TraceStore;
    
    let store = TraceStore::new_in_memory().await.unwrap();
    
    let trace = TaskExecutionTrace {
        task_id: "task-test-001".to_string(),
        playbook_version_id: Uuid::new_v4(),
        workspace_id: "ws-1".to_string(),
        steps: vec![],
        overall_status: TaskStatus::Succeeded,
        total_duration_ms: 1000,
        step_count: 0,
        failed_step_index: None,
        created_at: OffsetDateTime::now_utc(),
    };
    
    store.save_trace(&trace).await.unwrap();
    
    let retrieved = store.get_trace(&trace.task_id).await.unwrap();
    assert_eq!(retrieved.task_id, trace.task_id);
}
```

- [ ] **Step 2: Run test to confirm failure**

```bash
cargo test -p decacan-runtime --test trace_recording test_trace_persistence -- --nocapture
```

Expected: FAIL - TraceStore doesn't exist

- [ ] **Step 3: Create database migration schema**

```sql
-- crates/decacan-runtime/src/storage/migrations/trace_001.sql
-- Task execution traces
CREATE TABLE task_traces (
    task_id TEXT PRIMARY KEY,
    playbook_version_id TEXT NOT NULL,
    workspace_id TEXT NOT NULL,
    status TEXT NOT NULL,  -- 'succeeded', 'failed', 'running', etc
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    total_duration_ms INTEGER,
    step_count INTEGER NOT NULL DEFAULT 0,
    failed_step_index INTEGER,
    failure_category TEXT,  -- JSON serialized FailureCategory
    trace_data TEXT NOT NULL,  -- JSON serialized TaskExecutionTrace
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
    input_snapshot TEXT,  -- JSON
    output_snapshot TEXT,  -- JSON
    FOREIGN KEY (task_id) REFERENCES task_traces(task_id) ON DELETE CASCADE
);

-- Failure attributions
CREATE TABLE attributions (
    task_id TEXT PRIMARY KEY,
    failure_category TEXT NOT NULL,
    attribution_target TEXT NOT NULL,  -- JSON
    root_cause TEXT NOT NULL,
    suggested_fix TEXT NOT NULL,
    relevant_cards TEXT,  -- JSON array of card IDs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES task_traces(task_id) ON DELETE CASCADE
);

-- Indexes for efficient querying
CREATE INDEX idx_task_traces_version ON task_traces(playbook_version_id);
CREATE INDEX idx_task_traces_workspace ON task_traces(workspace_id);
CREATE INDEX idx_task_traces_status ON task_traces(status);
CREATE INDEX idx_task_traces_started ON task_traces(started_at);
CREATE INDEX idx_step_traces_task ON step_traces(task_id);
```

- [ ] **Step 4: Implement TraceStore with SQLite**

```rust
// crates/decacan-runtime/src/storage/trace_store.rs
use rusqlite::{params, Connection, OptionalExtension};
use serde_json;
use std::sync::Arc;
use tokio::sync::Mutex;

use crate::trace::entities::TaskExecutionTrace;

pub struct TraceStore {
    conn: Arc<Mutex<Connection>>,
}

impl TraceStore {
    pub async fn new_in_memory() -> Result<Self, rusqlite::Error> {
        let conn = Connection::open_in_memory()?;
        let store = Self {
            conn: Arc::new(Mutex::new(conn)),
        };
        store.run_migrations().await?;
        Ok(store)
    }
    
    pub async fn new_with_path<P: AsRef<std::path::Path>>(
        path: P
    ) -> Result<Self, rusqlite::Error> {
        let conn = Connection::open(path)?;
        let store = Self {
            conn: Arc::new(Mutex::new(conn)),
        };
        store.run_migrations().await?;
        Ok(store)
    }
    
    async fn run_migrations(&self) -> Result<(), rusqlite::Error> {
        let sql = include_str!("migrations/trace_001.sql");
        let conn = self.conn.lock().await;
        conn.execute_batch(sql)?;
        Ok(())
    }
    
    pub async fn save_trace(
        &self,
        trace: &TaskExecutionTrace
    ) -> Result<(), rusqlite::Error> {
        let conn = self.conn.lock().await;
        let trace_json = serde_json::to_string(trace).unwrap();
        
        conn.execute(
            "INSERT INTO task_traces 
             (task_id, playbook_version_id, workspace_id, status, 
              started_at, completed_at, total_duration_ms, step_count,
              failed_step_index, trace_data)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
             ON CONFLICT(task_id) DO UPDATE SET
             status = excluded.status,
             completed_at = excluded.completed_at,
             total_duration_ms = excluded.total_duration_ms,
             trace_data = excluded.trace_data",
            params![
                trace.task_id,
                trace.playbook_version_id.to_string(),
                trace.workspace_id,
                format!("{:?}", trace.overall_status),
                trace.created_at.unix_timestamp(),
                trace.completed_at.map(|dt| dt.unix_timestamp()),
                trace.total_duration_ms as i64,
                trace.step_count as i64,
                trace.failed_step_index.map(|i| i as i64),
                trace_json,
            ],
        )?;
        
        Ok(())
    }
    
    pub async fn get_trace(
        &self,
        task_id: &str
    ) -> Result<Option<TaskExecutionTrace>, rusqlite::Error> {
        let conn = self.conn.lock().await;
        
        let trace_json: Option<String> = conn.query_row(
            "SELECT trace_data FROM task_traces WHERE task_id = ?1",
            params![task_id],
            |row| row.get(0),
        ).optional()?;
        
        match trace_json {
            Some(json) => {
                let trace: TaskExecutionTrace = serde_json::from_str(&json)
                    .map_err(|e| rusqlite::Error::InvalidParameterName(e.to_string()))?;
                Ok(Some(trace))
            }
            None => Ok(None),
        }
    }
}
```

- [ ] **Step 5: Create storage module entry**

```rust
// crates/decacan-runtime/src/storage/mod.rs (create if not exists)
pub mod trace_store;
```

- [ ] **Step 6: Add rusqlite to Cargo.toml**

```toml
# crates/decacan-runtime/Cargo.toml
[dependencies]
# ... existing deps
rusqlite = { version = "0.30", features = ["bundled", "chrono", "serde_json", "uuid"] }
```

- [ ] **Step 7: Re-run tests**

```bash
cargo test -p decacan-runtime --test trace_recording test_trace_persistence -- --nocapture
```

Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add crates/decacan-runtime/src/storage/
git add crates/decacan-runtime/Cargo.toml
git commit -m "feat(trace): add SQLite storage for execution traces

- Create trace_001.sql migration with task_traces, step_traces, attributions tables
- Implement TraceStore with async SQLite operations
- Support in-memory and file-based storage"
```

---

### Task 3: Integrate Trace Recording into Workflow Execution

**Files:**
- Create: `crates/decacan-runtime/src/trace/recorder.rs`
- Modify: `crates/decacan-runtime/src/workflow/compiler.rs`
- Modify: `crates/decacan-runtime/src/run/executor.rs`

**Rationale:** 将 trace 记录点集成到现有执行流程中。

- [ ] **Step 1: Write failing integration test**

```rust
// crates/decacan-runtime/tests/trace_recording.rs
#[tokio::test]
async fn test_trace_integration_with_execution() {
    use decacan_runtime::trace::recorder::TraceRecorder;
    use decacan_runtime::storage::trace_store::TraceStore;
    
    // Setup
    let store = TraceStore::new_in_memory().await.unwrap();
    let recorder = TraceRecorder::new(store);
    
    // Simulate task start
    let task_id = recorder.start_task("task-001", Uuid::new_v4(), "ws-1").await;
    
    // Simulate step execution
    recorder.start_step(&task_id, "scan", "扫描文件", 1).await;
    recorder.complete_step(&task_id, "scan", json!({"files": ["a.md"]})).await;
    
    // Complete task
    let trace = recorder.complete_task(&task_id, TaskStatus::Succeeded).await;
    
    assert_eq!(trace.step_count, 1);
    assert!(matches!(trace.overall_status, TaskStatus::Succeeded));
}
```

- [ ] **Step 2: Run test to confirm failure**

```bash
cargo test -p decacan-runtime --test trace_recording test_trace_integration -- --nocapture
```

Expected: FAIL - TraceRecorder doesn't exist

- [ ] **Step 3: Implement TraceRecorder**

```rust
// crates/decacan-runtime/src/trace/recorder.rs
use std::collections::HashMap;
use tokio::sync::RwLock;
use time::OffsetDateTime;
use uuid::Uuid;

use crate::trace::entities::*;
use crate::storage::trace_store::TraceStore;

pub struct TraceRecorder {
    store: TraceStore,
    active_traces: RwLock<HashMap<String, TaskExecutionTrace>>,
}

impl TraceRecorder {
    pub fn new(store: TraceStore) -> Self {
        Self {
            store,
            active_traces: RwLock::new(HashMap::new()),
        }
    }
    
    pub async fn start_task(
        &self,
        task_id: impl Into<String>,
        playbook_version_id: Uuid,
        workspace_id: impl Into<String>,
    ) -> String {
        let task_id = task_id.into();
        let trace = TaskExecutionTrace {
            task_id: task_id.clone(),
            playbook_version_id,
            workspace_id: workspace_id.into(),
            steps: vec![],
            overall_status: TaskStatus::Running,
            total_duration_ms: 0,
            step_count: 0,
            failed_step_index: None,
            created_at: OffsetDateTime::now_utc(),
        };
        
        self.active_traces.write().await.insert(task_id.clone(), trace);
        task_id
    }
    
    pub async fn start_step(
        &self,
        task_id: &str,
        step_id: impl Into<String>,
        step_name: impl Into<String>,
        sequence: u32,
    ) {
        let step = StepTrace {
            step_id: step_id.into(),
            step_name: step_name.into(),
            sequence,
            input_snapshot: serde_json::Value::Null,
            output_snapshot: serde_json::Value::Null,
            started_at: OffsetDateTime::now_utc(),
            completed_at: None,
            duration_ms: None,
            retry_count: 0,
            resources_used: Default::default(),
            status: StepStatus::Running,
            error: None,
            invoked_cards: vec![],
        };
        
        let mut traces = self.active_traces.write().await;
        if let Some(trace) = traces.get_mut(task_id) {
            trace.steps.push(step);
        }
    }
    
    pub async fn complete_step(
        &self,
        task_id: &str,
        step_id: &str,
        output: serde_json::Value,
    ) {
        let mut traces = self.active_traces.write().await;
        if let Some(trace) = traces.get_mut(task_id) {
            if let Some(step) = trace.steps.iter_mut().find(|s| s.step_id == step_id) {
                step.output_snapshot = output;
                step.completed_at = Some(OffsetDateTime::now_utc());
                step.status = StepStatus::Success;
                // Calculate duration
                step.duration_ms = Some(
                    (step.completed_at.unwrap() - step.started_at).whole_milliseconds() as u64
                );
            }
        }
    }
    
    pub async fn fail_step(
        &self,
        task_id: &str,
        step_id: &str,
        error: StepError,
    ) {
        let mut traces = self.active_traces.write().await;
        if let Some(trace) = traces.get_mut(task_id) {
            if let Some(step) = trace.steps.iter_mut().find(|s| s.step_id == step_id) {
                step.error = Some(error);
                step.completed_at = Some(OffsetDateTime::now_utc());
                step.status = StepStatus::Failed;
            }
        }
    }
    
    pub async fn complete_task(
        &self,
        task_id: &str,
        status: TaskStatus,
    ) -> TaskExecutionTrace {
        let mut traces = self.active_traces.write().await;
        let mut trace = traces.remove(task_id).expect("Task trace not found");
        
        trace.overall_status = status;
        trace.completed_at = Some(OffsetDateTime::now_utc());
        trace.step_count = trace.steps.len() as u32;
        trace.total_duration_ms = trace.steps.iter()
            .filter_map(|s| s.duration_ms)
            .sum();
        
        // Find failed step
        trace.failed_step_index = trace.steps.iter()
            .position(|s| matches!(s.status, StepStatus::Failed))
            .map(|i| i as u32);
        
        // Persist to store
        self.store.save_trace(&trace).await.expect("Failed to save trace");
        
        trace
    }
}
```

- [ ] **Step 4: Add TraceRecorder to trace module**

```rust
// crates/decacan-runtime/src/trace/mod.rs
pub mod recorder;

pub use recorder::TraceRecorder;
```

- [ ] **Step 5: Re-run integration tests**

```bash
cargo test -p decacan-runtime --test trace_recording test_trace_integration -- --nocapture
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add crates/decacan-runtime/src/trace/recorder.rs
git commit -m "feat(trace): implement TraceRecorder for execution tracking

- Start/complete task and step lifecycle
- Automatic duration calculation
- In-memory active trace tracking with persistent storage"
```

---

## Week 2: Attribution Engine

### Task 4: Implement Attribution Engine

**Files:**
- Create: `crates/decacan-runtime/src/trace/attribution.rs`
- Test: `crates/decacan-runtime/tests/attribution.rs`

**Rationale:** 归因引擎是 Phase 1 的核心，将失败映射到 PlaybookDraft 的具体位置。

- [ ] **Step 1: Write failing attribution test**

```rust
// crates/decacan-runtime/tests/attribution.rs
use decacan_runtime::trace::attribution::AttributionEngine;
use decacan_runtime::trace::entities::*;

#[test]
fn test_runtime_error_attribution() {
    let error = RuntimeError {
        error_type: "CapabilityNotFound".to_string(),
        capability_ref: Some("builtin.nonexistent".to_string()),
        message: "Capability not registered".to_string(),
    };
    
    let attribution = AttributionEngine::analyze_runtime_error(&error);
    
    assert!(matches!(attribution.attribution, AttributionTarget::DraftCapabilityRef { .. }));
    assert!(attribution.suggested_fix.contains("检查 capability_ref"));
}
```

- [ ] **Step 2: Run test to confirm failure**

```bash
cargo test -p decacan-runtime --test attribution -- --nocapture
```

Expected: FAIL - AttributionEngine doesn't exist

- [ ] **Step 3: Implement AttributionEngine**

```rust
// crates/decacan-runtime/src/trace/attribution.rs
use crate::trace::entities::*;

pub struct AttributionEngine;

impl AttributionEngine {
    pub fn analyze(failure: &FailureCategory) -> FailureAttribution {
        match failure {
            FailureCategory::Runtime(err) => Self::analyze_runtime_error(err),
            FailureCategory::Contract(violation) => Self::analyze_contract_violation(violation),
            FailureCategory::Quality(issue) => Self::analyze_quality_issue(issue),
            FailureCategory::Policy(violation) => Self::analyze_policy_violation(violation),
            FailureCategory::PartialCompletion(partial) => Self::analyze_partial_completion(partial),
        }
    }
    
    pub fn analyze_runtime_error(error: &RuntimeError) -> FailureAttribution {
        let attribution = match error.error_type.as_str() {
            "CapabilityNotFound" => AttributionTarget::DraftCapabilityRef {
                ref_name: error.capability_ref.clone().unwrap_or_default(),
                location: format!("capability_refs.{}"),
            },
            "CapabilityExecutionError" => AttributionTarget::DraftWorkflowStep {
                step_index: 0, // Would need context
                field: "routine".to_string(),
            },
            "Timeout" => AttributionTarget::DraftPolicyProfile {
                policy_name: "timeout".to_string(),
            },
            "ResourceExceeded" => AttributionTarget::DraftPolicyProfile {
                policy_name: "resource_limits".to_string(),
            },
            _ => AttributionTarget::RuntimeEnvironment,
        };
        
        FailureAttribution {
            task_id: "".to_string(), // Would be filled by caller
            failed_step_id: "".to_string(),
            failure_category: FailureCategory::Runtime(error.clone()),
            attribution,
            root_cause: error.message.clone(),
            suggested_fix: Self::suggest_fix_for_runtime_error(error),
            relevant_card_refs: vec![],
        }
    }
    
    fn suggest_fix_for_runtime_error(error: &RuntimeError) -> String {
        match error.error_type.as_str() {
            "CapabilityNotFound" => format!(
                "1. 检查 capability_ref '{}' 拼写是否正确\n\
                 2. 确认该 capability 已在系统中注册\n\
                 3. 或更换为其他可用的 capability",
                error.capability_ref.as_deref().unwrap_or("unknown")
            ),
            "Timeout" => "建议：\n1. 增加 execution_profile.timeout_seconds\n2. 优化 workflow 减少处理量\n3. 或添加分批处理逻辑".to_string(),
            _ => "请查看错误详情并调整相关配置".to_string(),
        }
    }
    
    pub fn analyze_contract_violation(violation: &ContractViolation) -> FailureAttribution {
        FailureAttribution {
            task_id: "".to_string(),
            failed_step_id: "".to_string(),
            failure_category: FailureCategory::Contract(violation.clone()),
            attribution: AttributionTarget::DraftOutputContract {
                contract_type: violation.field.clone(),
            },
            root_cause: format!("输出字段 '{}' 不符合契约", violation.field),
            suggested_fix: format!(
                "字段 '{}' 期望 '{}'，实际得到 '{}'\n\
                 建议检查 output_contract 定义或调整生成逻辑",
                violation.field, violation.expected, violation.actual
            ),
            relevant_card_refs: vec!["card-output-contract".to_string()],
        }
    }
    
    pub fn analyze_quality_issue(issue: &QualityIssue) -> FailureAttribution {
        FailureAttribution {
            task_id: "".to_string(),
            failed_step_id: "".to_string(),
            failure_category: FailureCategory::Quality(issue.clone()),
            attribution: AttributionTarget::KnowledgeCard {
                card_id: format!("card-quality-{}", issue.dimension),
                dimension: issue.dimension.clone(),
            },
            root_cause: format!(
                "质量维度 '{}' 得分 {:.2} 低于阈值 {:.2}",
                issue.dimension, issue.score, issue.threshold
            ),
            suggested_fix: format!(
                "质量维度 '{}' 不达标\n\
                 建议：\n\
                 1. 检查相关知识卡片 'card-quality-{}'\n\
                 2. 增加该维度的约束\n\
                 3. 考虑增加预处理步骤提升输入质量",
                issue.dimension, issue.dimension
            ),
            relevant_card_refs: vec![format!("card-quality-{}", issue.dimension)],
        }
    }
    
    pub fn analyze_policy_violation(violation: &PolicyViolation) -> FailureAttribution {
        FailureAttribution {
            task_id: "".to_string(),
            failed_step_id: "".to_string(),
            failure_category: FailureCategory::Policy(violation.clone()),
            attribution: AttributionTarget::DraftPolicyProfile {
                policy_name: violation.policy_type.clone(),
            },
            root_cause: format!("违反策略: {}", violation.policy_type),
            suggested_fix: format!(
                "策略 '{}' 被违反: {}\n\
                 建议：\n\
                 1. 调整 policy_profile 放宽限制\n\
                 2. 或修改执行逻辑避免触发该策略",
                violation.policy_type, violation.violation_detail
            ),
            relevant_card_refs: vec![],
        }
    }
    
    pub fn analyze_partial_completion(partial: &PartialFailure) -> FailureAttribution {
        FailureAttribution {
            task_id: "".to_string(),
            failed_step_id: partial.failed_step.clone(),
            failure_category: FailureCategory::PartialCompletion(partial.clone()),
            attribution: AttributionTarget::DraftWorkflowStep {
                step_index: 0, // Would calculate from completed_steps
                field: "error_handling".to_string(),
            },
            root_cause: format!(
                "部分完成: 已完成 {} 个步骤，在 '{}' 失败",
                partial.completed_steps.len(),
                partial.failed_step
            ),
            suggested_fix: format!(
                "部分数据成功，部分失败\n\
                 建议：\n\
                 1. 增加分批处理逻辑\n\
                 2. 增加错误恢复机制（如跳过失败项继续）\n\
                 3. 或降低单批次数据量",
            ),
            relevant_card_refs: vec!["card-batch-processing".to_string()],
        }
    }
}
```

- [ ] **Step 4: Add to trace module**

```rust
// crates/decacan-runtime/src/trace/mod.rs
pub mod attribution;

pub use attribution::AttributionEngine;
```

- [ ] **Step 5: Run attribution tests**

```bash
cargo test -p decacan-runtime --test attribution -- --nocapture
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add crates/decacan-runtime/src/trace/attribution.rs
git add crates/decacan-runtime/tests/attribution.rs
git commit -m "feat(trace): implement attribution engine for 5 failure categories

- Analyze Runtime, Contract, Quality, Policy, PartialCompletion errors
- Map each failure type to specific Draft location
- Generate human-readable fix suggestions"
```

---

## Week 3: API Layer and Statistics

### Task 5: Version Statistics and API Endpoints

**Files:**
- Create: `crates/decacan-runtime/src/trace/stats.rs`
- Create: `crates/decacan-app/src/dto/trace.rs`
- Create: `crates/decacan-app/src/api/traces.rs`
- Modify: `crates/decacan-app/src/api/mod.rs`

**Rationale:** 暴露统计数据和归因结果给前端。

- [ ] **Step 1: Write failing API test**

```rust
// crates/decacan-app/tests/trace_api_smoke.rs
use decacan_app::dto::trace::TaskTraceResponse;

#[tokio::test]
async fn test_get_task_trace_api() {
    // This would test the actual HTTP endpoint
    // For now, just verify the types compile
    let _response = TaskTraceResponse {
        task_id: "test".to_string(),
        status: "succeeded".to_string(),
        steps: vec![],
    };
}
```

- [ ] **Step 2: Implement version statistics**

```rust
// crates/decacan-runtime/src/trace/stats.rs
use crate::storage::trace_store::TraceStore;
use crate::trace::entities::*;
use uuid::Uuid;

pub struct VersionStatsCalculator;

impl VersionStatsCalculator {
    pub async fn calculate(
        store: &TraceStore,
        version_id: Uuid,
    ) -> Result<VersionExecutionStats, rusqlite::Error> {
        // Query traces for this version
        // Implementation would query the store
        // For now, return placeholder
        Ok(VersionExecutionStats {
            playbook_version_id: version_id,
            version_number: 1,
            total_executions: 0,
            success_count: 0,
            failure_count: 0,
            success_rate: 0.0,
            avg_duration_ms: 0,
            min_duration_ms: 0,
            max_duration_ms: 0,
            failure_breakdown: Default::default(),
            step_stats: vec![],
            period_start: time::OffsetDateTime::now_utc(),
            period_end: time::OffsetDateTime::now_utc(),
        })
    }
}
```

- [ ] **Step 3: Create DTOs for API**

```rust
// crates/decacan-app/src/dto/trace.rs
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskTraceResponse {
    pub task_id: String,
    pub playbook_version_id: String,
    pub workspace_id: String,
    pub status: String,
    pub steps: Vec<StepTraceDto>,
    pub total_duration_ms: u64,
    pub step_count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StepTraceDto {
    pub step_id: String,
    pub step_name: String,
    pub sequence: u32,
    pub status: String,
    pub duration_ms: Option<u64>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttributionResponse {
    pub task_id: String,
    pub failure_category: String,
    pub root_cause: String,
    pub suggested_fix: String,
    pub attribution_target: AttributionTargetDto,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum AttributionTargetDto {
    DraftCapabilityRef { ref_name: String, location: String },
    DraftWorkflowStep { step_index: u32, field: String },
    DraftInputSchema { field_name: String },
    DraftOutputContract { contract_type: String },
    DraftPolicyProfile { policy_name: String },
    KnowledgeCard { card_id: String, dimension: String },
    RuntimeEnvironment,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VersionStatsResponse {
    pub playbook_version_id: String,
    pub version_number: u32,
    pub total_executions: u32,
    pub success_count: u32,
    pub failure_count: u32,
    pub success_rate: f64,
    pub avg_duration_ms: u64,
    pub min_duration_ms: u64,
    pub max_duration_ms: u64,
    pub failure_breakdown: HashMap<String, u32>,
    pub period_start: String,
    pub period_end: String,
}
```

- [ ] **Step 4: Create API routes**

```rust
// crates/decacan-app/src/api/traces.rs
use axum::{
    extract::{Path, State},
    routing::get,
    Json, Router,
};

use crate::app::state::AppState;
use crate::dto::trace::*;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/api/tasks/:task_id/trace", get(get_task_trace))
        .route("/api/tasks/:task_id/attribution", get(get_task_attribution))
        .route("/api/playbooks/:handle_id/versions/:version_id/stats", get(get_version_stats))
}

async fn get_task_trace(
    State(state): State<AppState>,
    Path(task_id): Path<String>,
) -> Result<Json<TaskTraceResponse>, StatusCode> {
    // Implementation would query trace store
    Err(StatusCode::NOT_IMPLEMENTED)
}

async fn get_task_attribution(
    State(state): State<AppState>,
    Path(task_id): Path<String>,
) -> Result<Json<AttributionResponse>, StatusCode> {
    Err(StatusCode::NOT_IMPLEMENTED)
}

async fn get_version_stats(
    State(state): State<AppState>,
    Path((handle_id, version_id)): Path<(String, String)>,
) -> Result<Json<VersionStatsResponse>, StatusCode> {
    Err(StatusCode::NOT_IMPLEMENTED)
}
```

- [ ] **Step 5: Register routes in API module**

```rust
// crates/decacan-app/src/api/mod.rs
mod traces; // Add this line

pub fn router() -> Router<AppState> {
    Router::new()
        // ... existing routes
        .merge(traces::router()) // Add this line
}
```

- [ ] **Step 6: Commit**

```bash
git add crates/decacan-app/src/api/traces.rs
git add crates/decacan-app/src/dto/trace.rs
git add crates/decacan-runtime/src/trace/stats.rs
git commit -m "feat(trace): add API endpoints for trace and attribution

- GET /api/tasks/{id}/trace - retrieve execution trace
- GET /api/tasks/{id}/attribution - get failure attribution
- GET /api/playbooks/{handle}/versions/{version}/stats - version statistics
- DTOs for frontend consumption"
```

---

## Verification

### Integration Test Suite

```bash
# Run all trace-related tests
cargo test -p decacan-runtime trace -- --nocapture
cargo test -p decacan-app trace -- --nocapture

# Run smoke tests
cargo test -p decacan-app --test http_smoke -- --nocapture
```

### Manual Verification

```bash
# Start the app server
cargo run -p decacan-app

# Create a task and check trace (after Phase 1 implementation)
curl http://localhost:3000/api/tasks/task-xxx/trace
curl http://localhost:3000/api/tasks/task-xxx/attribution
```

---

## Success Criteria Checklist

- [ ] StepTrace/TaskExecutionTrace entities defined
- [ ] SQLite storage with migrations working
- [ ] TraceRecorder integrated into workflow execution
- [ ] AttributionEngine covers all 5 failure categories
- [ ] Version statistics calculation
- [ ] API endpoints exposed
- [ ] All tests passing

## Next Phase

After Phase 1 completion, proceed to **Phase 2: Knowledge Cards System**:
- System Prompt injection
- RAG retrieval
- Structured validation

See spec: `docs/superpowers/specs/2026-03-30-decacan-playbook-knowledge-cards-design.md`
