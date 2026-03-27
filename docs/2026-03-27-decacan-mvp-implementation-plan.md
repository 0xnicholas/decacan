# Decacan MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Rust-first local MVP of `decacan` that can run one standard-mode playbook (`总结资料`) end-to-end, expose a minimal local web panel, and leave the architecture ready for a second discovery-mode playbook.

**Architecture:** Implement `decacan` as a Rust workspace with three crates: `decacan-app`, `decacan-runtime`, and `decacan-infra`. Keep the product center in `decacan-runtime`; keep the semantic executor as an internal `semantic/` module inside runtime rather than a separate `psi` crate. Build the system runtime-first: product entities and state machines first, then workflow/policy/gateway, then the semantic executor, then the app shell.

**Tech Stack:** Rust workspace, `axum`, `tokio`, `serde`, `uuid`, `time`, `thiserror`, `tracing`, `askama`, `htmx`, `rusqlite`, `tempfile`

---

## Scope Check

This plan stays within one MVP system:

- one local-first app
- one runtime crate
- one infra crate
- one fully working standard-mode playbook
- one lightweight discovery-mode playbook added after the standard-mode slice is stable

This is still one product plan, not multiple unrelated sub-projects.

## Planned Repository Structure

```text
decacan/
├── Cargo.toml
├── docs/
└── crates/
    ├── decacan-app/
    │   ├── Cargo.toml
    │   ├── src/
    │   │   ├── main.rs
    │   │   ├── lib.rs
    │   │   ├── app/
    │   │   │   ├── mod.rs
    │   │   │   ├── state.rs
    │   │   │   └── wiring.rs
    │   │   ├── api/
    │   │   │   ├── mod.rs
    │   │   │   ├── workspaces.rs
    │   │   │   ├── playbooks.rs
    │   │   │   ├── tasks.rs
    │   │   │   ├── approvals.rs
    │   │   │   └── artifacts.rs
    │   │   ├── dto/
    │   │   │   ├── mod.rs
    │   │   │   ├── workspace.rs
    │   │   │   ├── playbook.rs
    │   │   │   ├── task.rs
    │   │   │   ├── approval.rs
    │   │   │   └── artifact.rs
    │   │   └── streams/
    │   │       ├── mod.rs
    │   │       └── task_events.rs
    │   ├── templates/
    │   │   ├── index.html
    │   │   ├── playbooks.html
    │   │   └── task_detail.html
    │   ├── static/
    │   │   └── app.js
    │   └── tests/
    │       └── http_smoke.rs
    ├── decacan-runtime/
    │   ├── Cargo.toml
    │   ├── src/
    │   │   ├── lib.rs
    │   │   ├── workspace/
    │   │   ├── playbook/
    │   │   ├── task/
    │   │   ├── approval/
    │   │   ├── artifact/
    │   │   ├── workflow/
    │   │   ├── run/
    │   │   ├── routine/
    │   │   ├── policy/
    │   │   ├── gateway/
    │   │   ├── events/
    │   │   ├── outputs/
    │   │   ├── semantic/
    │   │   └── ports/
    │   └── tests/
    │       ├── task_state_machine.rs
    │       ├── playbook_summary_workflow.rs
    │       ├── gateway_policy.rs
    │       ├── events_projection.rs
    │       ├── semantic_invocation.rs
    │       ├── summary_playbook_e2e.rs
    │       └── discovery_playbook.rs
    └── decacan-infra/
        ├── Cargo.toml
        └── src/
            ├── lib.rs
            ├── filesystem/
            ├── commands/
            ├── models/
            ├── storage/
            ├── clock/
            ├── logging/
            └── config/
```

## Architecture Constraints To Preserve During Implementation

- `decacan-app` may depend on `decacan-runtime` and `decacan-infra`.
- `decacan-runtime` owns product meaning: playbooks, tasks, runs, approvals, artifacts, workflow, events, policy.
- `semantic/` stays inside `decacan-runtime` for MVP. Do not split it into a separate crate yet.
- `decacan-infra` may implement runtime ports, but must not own product objects.
- No runtime path may bypass `gateway/tool_gateway.rs` for real side effects.
- The user-visible plan belongs to runtime/workflow compilation, not to `semantic/`.
- `Artifact` registration belongs to runtime, not to `semantic/`.
- `Approval` creation belongs to runtime, not to `semantic/`.

## MVP Functional Slice Order

The working slices should be built in this order:

1. runtime object model
2. workflow/policy/state transitions
3. event system
4. tool gateway and ports
5. semantic invocation module
6. standard-mode playbook end-to-end
7. minimal app API and web surface
8. discovery-mode playbook

The first truly complete milestone is:

`总结资料` can scan markdown in a workspace and produce `output/summary.md` with backup behavior, task events, and artifact registration.

## Assumptions For MVP

- The product is local-first and runs on one machine.
- The first supported source format is markdown only.
- The first primary artifact is `output/summary.md`.
- If `output/summary.md` already exists, the runtime automatically backs it up before overwriting.
- The first discovery-mode playbook writes `output/discovery.md`.
- The initial web UX is intentionally minimal and server-rendered.
- The current workspace is not yet a Git repository. Treat each `git add` / `git commit` step below as a checkpoint to execute only after the repository is initialized under Git.

## Task 1: Initialize Rust Workspace Skeleton

**Files:**
- Create: `Cargo.toml`
- Create: `crates/decacan-app/Cargo.toml`
- Create: `crates/decacan-app/src/main.rs`
- Create: `crates/decacan-app/src/lib.rs`
- Create: `crates/decacan-runtime/Cargo.toml`
- Create: `crates/decacan-runtime/src/lib.rs`
- Create: `crates/decacan-infra/Cargo.toml`
- Create: `crates/decacan-infra/src/lib.rs`

- [ ] **Step 1: Create the workspace manifest and crate manifests**

Define a Rust workspace with three members:
- `crates/decacan-app`
- `crates/decacan-runtime`
- `crates/decacan-infra`

- [ ] **Step 2: Create minimal crate entry files**

Add empty `lib.rs` files and a minimal `main.rs` that starts and exits cleanly.

- [ ] **Step 3: Run workspace compile check**

Run: `cargo check`
Expected: PASS with all three crates discovered by Cargo.

- [ ] **Step 4: Commit**

```bash
git add Cargo.toml crates/decacan-app crates/decacan-runtime crates/decacan-infra
git commit -m "chore: initialize decacan rust workspace"
```

## Task 2: Define Core Product Entities

**Files:**
- Create: `crates/decacan-runtime/src/workspace/mod.rs`
- Create: `crates/decacan-runtime/src/workspace/entity.rs`
- Create: `crates/decacan-runtime/src/playbook/mod.rs`
- Create: `crates/decacan-runtime/src/playbook/entity.rs`
- Create: `crates/decacan-runtime/src/playbook/modes.rs`
- Create: `crates/decacan-runtime/src/task/mod.rs`
- Create: `crates/decacan-runtime/src/task/entity.rs`
- Create: `crates/decacan-runtime/src/approval/mod.rs`
- Create: `crates/decacan-runtime/src/approval/entity.rs`
- Create: `crates/decacan-runtime/src/artifact/mod.rs`
- Create: `crates/decacan-runtime/src/artifact/entity.rs`
- Test: `crates/decacan-runtime/tests/entities_roundtrip.rs`

- [ ] **Step 1: Write the failing entity roundtrip test**

```rust
#[test]
fn task_and_artifact_entities_roundtrip_through_serde() {
    use decacan_runtime::artifact::entity::{Artifact, ArtifactKind, ArtifactStatus, ArtifactType};
    use decacan_runtime::task::entity::{Task, TaskStatus};

    let task = Task::new_for_test("task-1", "workspace-1", "playbook.summary");
    let encoded = serde_json::to_string(&task).unwrap();
    let decoded: Task = serde_json::from_str(&encoded).unwrap();
    assert_eq!(decoded.status, TaskStatus::Created);

    let artifact = Artifact::new_primary_for_test("artifact-1", "task-1", "output/summary.md");
    let encoded = serde_json::to_string(&artifact).unwrap();
    let decoded: Artifact = serde_json::from_str(&encoded).unwrap();
    assert_eq!(decoded.kind, ArtifactKind::Primary);
    assert_eq!(decoded.status, ArtifactStatus::Ready);
    assert_eq!(decoded.r#type, ArtifactType::Summary);
}
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cargo test -p decacan-runtime --test entities_roundtrip`
Expected: FAIL because the entity modules and constructors do not exist yet.

- [ ] **Step 3: Implement the core entities**

Implement:
- `Workspace`
- `Playbook`
- `PlaybookMode`
- `Task`
- `Approval`
- `Artifact`

Include `serde` derives, `uuid`/time fields, and explicit status enums.

- [ ] **Step 4: Run the test to verify it passes**

Run: `cargo test -p decacan-runtime --test entities_roundtrip`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add crates/decacan-runtime/src/workspace crates/decacan-runtime/src/playbook crates/decacan-runtime/src/task crates/decacan-runtime/src/approval crates/decacan-runtime/src/artifact crates/decacan-runtime/tests/entities_roundtrip.rs
git commit -m "feat: add core decacan product entities"
```

## Task 3: Add Workflow, Run, And Policy Types

**Files:**
- Create: `crates/decacan-runtime/src/workflow/entity.rs`
- Create: `crates/decacan-runtime/src/workflow/step.rs`
- Create: `crates/decacan-runtime/src/workflow/mod.rs`
- Create: `crates/decacan-runtime/src/run/mod.rs`
- Create: `crates/decacan-runtime/src/run/entity.rs`
- Create: `crates/decacan-runtime/src/policy/mod.rs`
- Create: `crates/decacan-runtime/src/policy/entity.rs`
- Test: `crates/decacan-runtime/tests/run_and_workflow_types.rs`

- [ ] **Step 1: Write the failing workflow typing test**

```rust
#[test]
fn summary_workflow_steps_have_explicit_types() {
    use decacan_runtime::workflow::step::WorkflowStepType;

    let steps = decacan_runtime::workflow::entity::summary_workflow_step_types_for_test();
    assert_eq!(steps[0], WorkflowStepType::Deterministic);
    assert_eq!(steps[1], WorkflowStepType::Tool);
    assert_eq!(steps[2], WorkflowStepType::Psi);
    assert_eq!(steps[3], WorkflowStepType::Psi);
    assert_eq!(steps[4], WorkflowStepType::Deterministic);
    assert_eq!(steps[5], WorkflowStepType::Tool);
}
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cargo test -p decacan-runtime --test run_and_workflow_types`
Expected: FAIL because workflow/run/policy types do not exist yet.

- [ ] **Step 3: Implement workflow, run, and policy entities**

Add:
- `Workflow`
- `WorkflowStep`
- `WorkflowStepType`
- `Run`
- `RunStatus`
- `PolicyProfile`

Use `output_candidates` instead of `suggested_artifacts`.

- [ ] **Step 4: Run the test to verify it passes**

Run: `cargo test -p decacan-runtime --test run_and_workflow_types`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add crates/decacan-runtime/src/workflow crates/decacan-runtime/src/run crates/decacan-runtime/src/policy crates/decacan-runtime/tests/run_and_workflow_types.rs
git commit -m "feat: add workflow run and policy core types"
```

## Task 4: Implement Task/Run State Machines

**Files:**
- Create: `crates/decacan-runtime/src/task/service.rs`
- Create: `crates/decacan-runtime/src/task/state_machine.rs`
- Create: `crates/decacan-runtime/src/run/service.rs`
- Create: `crates/decacan-runtime/src/run/supervisor.rs`
- Test: `crates/decacan-runtime/tests/task_state_machine.rs`

- [ ] **Step 1: Write the failing task/run transition test**

```rust
#[test]
fn task_and_run_follow_expected_lifecycle() {
    use decacan_runtime::run::entity::RunStatus;
    use decacan_runtime::task::entity::TaskStatus;

    let (task, run) = decacan_runtime::task::service::start_summary_task_for_test();
    assert_eq!(task.status, TaskStatus::Planning);
    assert_eq!(run.status, RunStatus::Initialized);
}
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cargo test -p decacan-runtime --test task_state_machine`
Expected: FAIL because services and state transitions do not exist yet.

- [ ] **Step 3: Implement state machines and services**

Implement:
- task transitions
- run transitions
- pause/resume hooks
- failure transitions

Do not add retries yet.

- [ ] **Step 4: Run the test to verify it passes**

Run: `cargo test -p decacan-runtime --test task_state_machine`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add crates/decacan-runtime/src/task crates/decacan-runtime/src/run crates/decacan-runtime/tests/task_state_machine.rs
git commit -m "feat: add task and run state machines"
```

## Task 5: Register Playbooks And Compile Workflows

**Files:**
- Create: `crates/decacan-runtime/src/playbook/registry.rs`
- Create: `crates/decacan-runtime/src/workflow/compiler.rs`
- Test: `crates/decacan-runtime/tests/playbook_summary_workflow.rs`

- [ ] **Step 1: Write the failing playbook compilation test**

```rust
#[test]
fn summary_playbook_compiles_to_expected_workflow() {
    let workflow = decacan_runtime::workflow::compiler::compile_summary_playbook_for_test();
    let step_ids: Vec<_> = workflow.steps.iter().map(|s| s.id.as_str()).collect();
    assert_eq!(
        step_ids,
        vec![
            "scan_markdown_files",
            "read_markdown_contents",
            "discover_topics",
            "draft_summary",
            "backup_existing_summary",
            "write_summary",
            "register_artifact"
        ]
    );
}
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cargo test -p decacan-runtime --test playbook_summary_workflow`
Expected: FAIL because the registry and compiler do not exist yet.

- [ ] **Step 3: Implement playbook registry and compiler**

Register:
- `总结资料` as standard mode
- `发现资料主题` as discovery mode shell

Compile the standard-mode workflow first with the fixed step list above.

- [ ] **Step 4: Run the test to verify it passes**

Run: `cargo test -p decacan-runtime --test playbook_summary_workflow`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add crates/decacan-runtime/src/playbook/registry.rs crates/decacan-runtime/src/workflow/compiler.rs crates/decacan-runtime/tests/playbook_summary_workflow.rs
git commit -m "feat: add playbook registry and summary workflow compiler"
```

## Task 6: Add Task Event Model And Projection

**Files:**
- Create: `crates/decacan-runtime/src/events/mod.rs`
- Create: `crates/decacan-runtime/src/events/execution.rs`
- Create: `crates/decacan-runtime/src/events/runtime.rs`
- Create: `crates/decacan-runtime/src/events/task.rs`
- Create: `crates/decacan-runtime/src/events/projector.rs`
- Test: `crates/decacan-runtime/tests/events_projection.rs`

- [ ] **Step 1: Write the failing projector test**

```rust
#[test]
fn output_candidate_becomes_artifact_ready_task_event() {
    let task_event = decacan_runtime::events::projector::project_output_candidate_for_test();
    assert_eq!(task_event.event_type.as_str(), "artifact.ready");
}
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cargo test -p decacan-runtime --test events_projection`
Expected: FAIL because event modules do not exist yet.

- [ ] **Step 3: Implement execution/runtime/task events and projector**

Add:
- execution events
- runtime events
- task events
- projector rules

Keep raw semantic events internal. Do not stream them directly to the UI.

- [ ] **Step 4: Run the test to verify it passes**

Run: `cargo test -p decacan-runtime --test events_projection`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add crates/decacan-runtime/src/events crates/decacan-runtime/tests/events_projection.rs
git commit -m "feat: add task event projection system"
```

## Task 7: Add Runtime Ports And Tool Gateway

**Files:**
- Create: `crates/decacan-runtime/src/ports/mod.rs`
- Create: `crates/decacan-runtime/src/ports/filesystem.rs`
- Create: `crates/decacan-runtime/src/ports/model.rs`
- Create: `crates/decacan-runtime/src/ports/storage.rs`
- Create: `crates/decacan-runtime/src/ports/clock.rs`
- Create: `crates/decacan-runtime/src/gateway/mod.rs`
- Create: `crates/decacan-runtime/src/gateway/descriptor.rs`
- Create: `crates/decacan-runtime/src/gateway/request.rs`
- Create: `crates/decacan-runtime/src/gateway/result.rs`
- Create: `crates/decacan-runtime/src/gateway/execution_record.rs`
- Create: `crates/decacan-runtime/src/gateway/tool_gateway.rs`
- Test: `crates/decacan-runtime/tests/gateway_policy.rs`

- [ ] **Step 1: Write the failing tool gateway policy test**

```rust
#[test]
fn overwrite_outside_output_requires_approval() {
    let result = decacan_runtime::gateway::tool_gateway::evaluate_overwrite_for_test();
    assert!(matches!(result, decacan_runtime::gateway::result::ToolResult::ApprovalRequired { .. }));
}
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cargo test -p decacan-runtime --test gateway_policy`
Expected: FAIL because gateway types and policy integration do not exist yet.

- [ ] **Step 3: Implement ports and tool gateway**

Implement:
- runtime ports
- `ToolDescriptor`
- `ToolRequest`
- `PolicyDecision`
- `ToolResult`
- `ToolExecutionRecord`
- `ToolGateway`

Ensure the gateway owns:
- `allow`
- `approval_required`
- `deny`

- [ ] **Step 4: Run the test to verify it passes**

Run: `cargo test -p decacan-runtime --test gateway_policy`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add crates/decacan-runtime/src/ports crates/decacan-runtime/src/gateway crates/decacan-runtime/tests/gateway_policy.rs
git commit -m "feat: add runtime ports and tool gateway"
```

## Task 8: Add Infra Adapters With Memory-First Test Support

**Files:**
- Create: `crates/decacan-infra/src/filesystem/mod.rs`
- Create: `crates/decacan-infra/src/filesystem/local.rs`
- Create: `crates/decacan-infra/src/models/mod.rs`
- Create: `crates/decacan-infra/src/models/mock.rs`
- Create: `crates/decacan-infra/src/models/openai_compatible.rs`
- Create: `crates/decacan-infra/src/storage/mod.rs`
- Create: `crates/decacan-infra/src/storage/memory.rs`
- Create: `crates/decacan-infra/src/storage/sqlite.rs`
- Create: `crates/decacan-infra/src/clock/mod.rs`
- Create: `crates/decacan-infra/src/clock/system.rs`
- Create: `crates/decacan-infra/src/logging/mod.rs`
- Create: `crates/decacan-infra/src/config/mod.rs`
- Test: `crates/decacan-runtime/tests/filesystem_and_storage_integration.rs`

- [ ] **Step 1: Write the failing runtime-to-infra integration test**

```rust
#[test]
fn local_fs_and_memory_storage_support_runtime_ports() {
    let result = decacan_runtime::ports::filesystem::filesystem_port_smoke_for_test();
    assert!(result.is_ok());
}
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cargo test -p decacan-runtime --test filesystem_and_storage_integration`
Expected: FAIL because infra implementations do not exist yet.

- [ ] **Step 3: Implement memory-first adapters**

Implement:
- local filesystem port
- memory storage port
- mock model port
- system clock

Add the OpenAI-compatible model adapter as a non-default path after the mock.

- [ ] **Step 4: Run the test to verify it passes**

Run: `cargo test -p decacan-runtime --test filesystem_and_storage_integration`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add crates/decacan-infra crates/decacan-runtime/tests/filesystem_and_storage_integration.rs
git commit -m "feat: add infra adapters for filesystem storage and models"
```

## Task 9: Implement The Internal Semantic Module

**Files:**
- Create: `crates/decacan-runtime/src/semantic/mod.rs`
- Create: `crates/decacan-runtime/src/semantic/invocation.rs`
- Create: `crates/decacan-runtime/src/semantic/planner.rs`
- Create: `crates/decacan-runtime/src/semantic/executor.rs`
- Create: `crates/decacan-runtime/src/semantic/model.rs`
- Create: `crates/decacan-runtime/src/semantic/tool_protocol.rs`
- Create: `crates/decacan-runtime/src/semantic/events.rs`
- Create: `crates/decacan-runtime/src/gateway/semantic_adapter.rs`
- Test: `crates/decacan-runtime/tests/semantic_invocation.rs`

- [ ] **Step 1: Write the failing semantic invocation test**

```rust
#[test]
fn semantic_invocation_requests_tool_and_returns_output_candidate() {
    let result = decacan_runtime::semantic::executor::run_summary_invocation_for_test();
    assert_eq!(result.output_candidates.len(), 1);
}
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cargo test -p decacan-runtime --test semantic_invocation`
Expected: FAIL because the semantic module does not exist yet.

- [ ] **Step 3: Implement the semantic invocation module**

Implement:
- invocation state
- local planning when needed
- tool request protocol
- continuation handling
- output candidate return

Do not let this module own task/run lifecycle.

- [ ] **Step 4: Run the test to verify it passes**

Run: `cargo test -p decacan-runtime --test semantic_invocation`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add crates/decacan-runtime/src/semantic crates/decacan-runtime/src/gateway/semantic_adapter.rs crates/decacan-runtime/tests/semantic_invocation.rs
git commit -m "feat: add internal semantic invocation module"
```

## Task 10: Implement Output Writing, Backup, And Artifact Registration

**Files:**
- Create: `crates/decacan-runtime/src/outputs/mod.rs`
- Create: `crates/decacan-runtime/src/outputs/writer.rs`
- Create: `crates/decacan-runtime/src/outputs/backup.rs`
- Create: `crates/decacan-runtime/src/artifact/service.rs`
- Create: `crates/decacan-runtime/src/artifact/relations.rs`
- Test: `crates/decacan-runtime/tests/output_backup_and_artifacts.rs`

- [ ] **Step 1: Write the failing backup/artifact test**

```rust
#[test]
fn existing_summary_is_backed_up_before_primary_artifact_is_overwritten() {
    let result = decacan_runtime::outputs::writer::write_summary_with_backup_for_test();
    assert_eq!(result.primary_path, "output/summary.md");
    assert!(result.backup_path.is_some());
}
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cargo test -p decacan-runtime --test output_backup_and_artifacts`
Expected: FAIL because output writer and backup manager do not exist yet.

- [ ] **Step 3: Implement writer, backup manager, and artifact registration**

Make runtime responsible for:
- writing the primary output
- backing up the old file
- registering primary and backup artifacts

- [ ] **Step 4: Run the test to verify it passes**

Run: `cargo test -p decacan-runtime --test output_backup_and_artifacts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add crates/decacan-runtime/src/outputs crates/decacan-runtime/src/artifact/service.rs crates/decacan-runtime/src/artifact/relations.rs crates/decacan-runtime/tests/output_backup_and_artifacts.rs
git commit -m "feat: add output writing backup and artifact registration"
```

## Task 11: Build The Standard-Mode Playbook End-To-End

**Files:**
- Modify: `crates/decacan-runtime/src/playbook/registry.rs`
- Modify: `crates/decacan-runtime/src/workflow/compiler.rs`
- Modify: `crates/decacan-runtime/src/run/service.rs`
- Modify: `crates/decacan-runtime/src/routine/mod.rs`
- Create: `crates/decacan-runtime/src/routine/entity.rs`
- Create: `crates/decacan-runtime/src/routine/registry.rs`
- Create: `crates/decacan-runtime/src/routine/executor.rs`
- Test: `crates/decacan-runtime/tests/summary_playbook_e2e.rs`

- [ ] **Step 1: Write the failing end-to-end standard-mode test**

```rust
#[test]
fn summary_playbook_creates_output_summary_md_from_markdown_workspace() {
    let result = decacan_runtime::run::service::execute_summary_playbook_e2e_for_test();
    assert_eq!(result.task_status.as_str(), "completed");
    assert_eq!(result.primary_artifact_path.as_str(), "output/summary.md");
}
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cargo test -p decacan-runtime --test summary_playbook_e2e -- --nocapture`
Expected: FAIL because the standard-mode execution slice is not wired yet.

- [ ] **Step 3: Implement the end-to-end standard-mode slice**

Wire together:
- summary playbook
- workflow compiler
- routines
- semantic invocation
- tool gateway
- backup writer
- artifact registration
- task event projection

- [ ] **Step 4: Run the test to verify it passes**

Run: `cargo test -p decacan-runtime --test summary_playbook_e2e -- --nocapture`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add crates/decacan-runtime/src/playbook/registry.rs crates/decacan-runtime/src/workflow/compiler.rs crates/decacan-runtime/src/run/service.rs crates/decacan-runtime/src/routine crates/decacan-runtime/tests/summary_playbook_e2e.rs
git commit -m "feat: deliver standard-mode summary playbook end to end"
```

## Task 12: Add The Discovery-Mode Playbook

**Files:**
- Modify: `crates/decacan-runtime/src/playbook/registry.rs`
- Modify: `crates/decacan-runtime/src/workflow/compiler.rs`
- Modify: `crates/decacan-runtime/src/routine/registry.rs`
- Test: `crates/decacan-runtime/tests/discovery_playbook.rs`

- [ ] **Step 1: Write the failing discovery-mode test**

```rust
#[test]
fn discovery_playbook_writes_discovery_md() {
    let result = decacan_runtime::run::service::execute_discovery_playbook_for_test();
    assert_eq!(result.primary_artifact_path.as_str(), "output/discovery.md");
}
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cargo test -p decacan-runtime --test discovery_playbook -- --nocapture`
Expected: FAIL because the discovery playbook is only registered as a shell so far.

- [ ] **Step 3: Implement the discovery-mode workflow**

Implement a lightweight discovery playbook that:
- scans markdown files
- asks the semantic module for theme discovery
- writes `output/discovery.md`
- registers the artifact

- [ ] **Step 4: Run the test to verify it passes**

Run: `cargo test -p decacan-runtime --test discovery_playbook -- --nocapture`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add crates/decacan-runtime/src/playbook/registry.rs crates/decacan-runtime/src/workflow/compiler.rs crates/decacan-runtime/src/routine/registry.rs crates/decacan-runtime/tests/discovery_playbook.rs
git commit -m "feat: add discovery-mode playbook"
```

## Task 13: Add App API And Task Event Streaming

**Files:**
- Create: `crates/decacan-app/src/app/mod.rs`
- Create: `crates/decacan-app/src/app/state.rs`
- Create: `crates/decacan-app/src/app/wiring.rs`
- Create: `crates/decacan-app/src/api/mod.rs`
- Create: `crates/decacan-app/src/api/workspaces.rs`
- Create: `crates/decacan-app/src/api/playbooks.rs`
- Create: `crates/decacan-app/src/api/tasks.rs`
- Create: `crates/decacan-app/src/api/approvals.rs`
- Create: `crates/decacan-app/src/api/artifacts.rs`
- Create: `crates/decacan-app/src/streams/mod.rs`
- Create: `crates/decacan-app/src/streams/task_events.rs`
- Create: `crates/decacan-app/src/dto/mod.rs`
- Create: `crates/decacan-app/src/dto/workspace.rs`
- Create: `crates/decacan-app/src/dto/playbook.rs`
- Create: `crates/decacan-app/src/dto/task.rs`
- Create: `crates/decacan-app/src/dto/approval.rs`
- Create: `crates/decacan-app/src/dto/artifact.rs`
- Test: `crates/decacan-app/tests/http_smoke.rs`

- [ ] **Step 1: Write the failing HTTP smoke test**

```rust
#[tokio::test]
async fn tasks_endpoint_creates_task_and_returns_202() {
    let app = decacan_app::app::wiring::router_for_test();
    let response = tower::ServiceExt::oneshot(
        app,
        http::Request::post("/api/tasks")
            .header("content-type", "application/json")
            .body(r#"{"playbook_id":"playbook.summary","workspace_path":"/tmp/demo"}"#.into())
            .unwrap(),
    )
    .await
    .unwrap();

    assert_eq!(response.status(), http::StatusCode::ACCEPTED);
}
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cargo test -p decacan-app --test http_smoke`
Expected: FAIL because the router and task endpoints do not exist yet.

- [ ] **Step 3: Implement API routes and SSE stream**

Add:
- workspace routes
- playbook routes
- task creation/query routes
- approval routes
- artifact routes
- task event SSE

- [ ] **Step 4: Run the test to verify it passes**

Run: `cargo test -p decacan-app --test http_smoke`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add crates/decacan-app/src crates/decacan-app/tests/http_smoke.rs
git commit -m "feat: add decacan app api and task event streaming"
```

## Task 14: Add The Minimal Local Web Panel

**Files:**
- Create: `crates/decacan-app/templates/index.html`
- Create: `crates/decacan-app/templates/playbooks.html`
- Create: `crates/decacan-app/templates/task_detail.html`
- Create: `crates/decacan-app/static/app.js`

- [ ] **Step 1: Add minimal template rendering smoke coverage**

Create a basic smoke assertion inside `crates/decacan-app/tests/http_smoke.rs` that checks `GET /` returns HTML and includes the string `Playbooks`.

- [ ] **Step 2: Run the smoke test to verify it fails**

Run: `cargo test -p decacan-app --test http_smoke`
Expected: FAIL because the templates and page route do not exist yet.

- [ ] **Step 3: Implement the minimal web panel**

The MVP web panel must support:
- workspace selection
- playbook list
- task creation form
- task detail with plan, status, approvals, and artifacts

Use server-rendered templates plus HTMX/EventSource rather than a separate SPA.

- [ ] **Step 4: Run the smoke test to verify it passes**

Run: `cargo test -p decacan-app --test http_smoke`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add crates/decacan-app/templates crates/decacan-app/static crates/decacan-app/tests/http_smoke.rs
git commit -m "feat: add minimal local web panel"
```

## Task 15: Verification And MVP Hardening

**Files:**
- Modify: `crates/decacan-runtime/tests/summary_playbook_e2e.rs`
- Modify: `crates/decacan-runtime/tests/discovery_playbook.rs`
- Modify: `crates/decacan-app/tests/http_smoke.rs`
- Modify: `docs/2026-03-27-decacan-runtime-object-model.md`
- Modify: `docs/2026-03-27-decacan-mvp-implementation-plan.md`

- [ ] **Step 1: Run the complete test suite**

Run: `cargo test --workspace`
Expected: PASS

- [ ] **Step 2: Run a manual smoke scenario**

Run:

```bash
cargo run -p decacan-app
```

Expected:
- local server starts
- workspace can be selected
- `总结资料` can produce `output/summary.md`
- previous `summary.md` is backed up before overwrite

- [ ] **Step 3: Verify the discovery-mode slice manually**

Expected:
- `发现资料主题` can produce `output/discovery.md`
- task detail shows events and final artifact

- [ ] **Step 4: Update docs if implementation forced boundary changes**

Synchronize the architecture docs if any real implementation decision diverged.

- [ ] **Step 5: Commit**

```bash
git add crates/decacan-runtime/tests crates/decacan-app/tests docs
git commit -m "chore: verify decacan mvp and sync docs"
```

## Verification Checklist

The MVP is not complete until all of the following are true:

- `cargo test --workspace` passes
- the standard-mode `总结资料` playbook produces `output/summary.md`
- overwrite behavior creates a backup before replacement
- the resulting summary contains:
  - `总览`
  - `主题分组`
  - `关键结论`
  - `信息缺口 / 待确认事项`
  - `建议下一步`
- source markdown paths are preserved in the output
- the discovery-mode playbook produces `output/discovery.md`
- task events stream from backend to app surface
- the UI shows current task status, artifacts, and approvals

## Risks To Watch While Executing

- letting `semantic/` take over task/run orchestration
- leaking raw semantic events directly into the UI
- letting `Tool Gateway` become a thin adapter instead of a policy boundary
- letting `Artifact` degrade into “whatever file got written”
- building the web panel before the runtime event and artifact model is stable

## Execution Recommendation

Implement in this exact order:

1. runtime entities and state
2. workflow/policy compiler
3. event projection
4. tool gateway and ports
5. semantic invocation module
6. standard-mode end-to-end slice
7. app API and event stream
8. minimal web panel
9. discovery-mode playbook
10. final verification
