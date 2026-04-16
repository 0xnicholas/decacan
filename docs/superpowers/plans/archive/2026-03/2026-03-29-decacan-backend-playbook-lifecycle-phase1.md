# Decacan Backend Playbook Lifecycle Phase 1 Implementation Plan

> **历史备注（2026-04-16）**：本文档为归档计划。项目已全面迁移至 TypeScript/Node.js，后端核心位于 `packages/orchestrator`。文中的 Rust/crates 实现细节反映的是迁移前的技术选型。


> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the first production backend slice for Playbook lifecycle: `StoreEntry -> fork/copy -> Draft -> synchronous Publish -> immutable Version -> task creation from published version`.

**Architecture:** Build the lifecycle as runtime-owned domain services and expose them through `decacan-app` product APIs. Keep phase 1 strictly on `single` execution path and builtin references only; defer team execution, extension-provided resources, and advanced validator/plugin infrastructure to follow-up plans.

**Tech Stack:** Rust, axum, serde, tokio, `decacan-runtime`, `decacan-app`, `decacan-infra` (memory-first persistence adapters), cargo test.

---

## Scope Check

The approved specs describe multiple subsystems (`store/versioning`, `authoring`, `capability registry`, `team`, `extension`, `workspace policy`). This plan intentionally implements only the first executable subproject:

- Playbook lifecycle + publish pipeline + version-bound task creation (`single` path)

Deferred to later plans:

- minimal team runtime execution
- extension registry install lifecycle
- advanced validator registry extensibility
- workspace policy deepening beyond current gateway boundaries

## File Structure

### Runtime files to create

- `crates/decacan-runtime/src/playbook/lifecycle.rs`
- `crates/decacan-runtime/src/playbook/authoring.rs`
- `crates/decacan-runtime/src/playbook/publish.rs`
- `crates/decacan-runtime/src/playbook/capability_refs.rs`

### Runtime files to modify

- `crates/decacan-runtime/src/playbook/entity.rs`
- `crates/decacan-runtime/src/playbook/mod.rs`
- `crates/decacan-runtime/src/playbook/execution.rs`
- `crates/decacan-runtime/src/lib.rs`

### App files to modify

- `crates/decacan-app/src/dto/playbook.rs`
- `crates/decacan-app/src/dto/task.rs`
- `crates/decacan-app/src/api/playbooks.rs`
- `crates/decacan-app/src/api/tasks.rs`
- `crates/decacan-app/src/app/state.rs`

### Tests to create/modify

- `crates/decacan-runtime/tests/playbook_lifecycle.rs` (new)
- `crates/decacan-runtime/tests/playbook_publish.rs` (new)
- `crates/decacan-app/tests/http_smoke.rs` (modify)

## Task 1: Add Runtime Playbook Lifecycle Domain Types

**Files:**
- Create: `crates/decacan-runtime/src/playbook/lifecycle.rs`
- Modify: `crates/decacan-runtime/src/playbook/entity.rs`
- Modify: `crates/decacan-runtime/src/playbook/mod.rs`
- Test: `crates/decacan-runtime/tests/playbook_lifecycle.rs`

- [ ] **Step 1: Write failing lifecycle roundtrip tests**

Add tests for:
- `StoreEntry`
- `PlaybookHandle`
- `PlaybookDraft`
- `PlaybookVersion`
- `DraftHealthReport`

- [ ] **Step 2: Run focused tests to confirm failure**

Run: `cargo test -p decacan-runtime --test playbook_lifecycle -- --nocapture`  
Expected: FAIL because lifecycle types are not implemented.

- [ ] **Step 3: Implement minimal lifecycle entity types**

Define the new lifecycle structs/enums with serde support and stable identifiers.

- [ ] **Step 4: Re-run focused tests**

Run: `cargo test -p decacan-runtime --test playbook_lifecycle -- --nocapture`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add crates/decacan-runtime/src/playbook/lifecycle.rs crates/decacan-runtime/src/playbook/entity.rs crates/decacan-runtime/src/playbook/mod.rs crates/decacan-runtime/tests/playbook_lifecycle.rs
git commit -m "feat: add playbook lifecycle domain types"
```

## Task 2: Implement Authoring Service For Draft Save + Health

**Files:**
- Create: `crates/decacan-runtime/src/playbook/authoring.rs`
- Create: `crates/decacan-runtime/src/playbook/capability_refs.rs`
- Modify: `crates/decacan-runtime/src/playbook/mod.rs`
- Test: `crates/decacan-runtime/tests/playbook_publish.rs`

- [ ] **Step 1: Write failing tests for draft save and health**

Cover:
- full-document draft replacement
- health recomputation on save
- unresolved capability ref detection (builtin-only in phase 1)

- [ ] **Step 2: Run focused tests to confirm failure**

Run: `cargo test -p decacan-runtime --test playbook_publish draft -- --nocapture`  
Expected: FAIL due missing authoring service.

- [ ] **Step 3: Implement minimal authoring service**

Implement:
- save draft (whole document)
- compute `DraftHealthReport`
- capability ref checks against builtin registry entries only

- [ ] **Step 4: Re-run focused tests**

Run: `cargo test -p decacan-runtime --test playbook_publish draft -- --nocapture`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add crates/decacan-runtime/src/playbook/authoring.rs crates/decacan-runtime/src/playbook/capability_refs.rs crates/decacan-runtime/src/playbook/mod.rs crates/decacan-runtime/tests/playbook_publish.rs
git commit -m "feat: add draft authoring and health service"
```

## Task 3: Implement Synchronous Publish Pipeline

**Files:**
- Create: `crates/decacan-runtime/src/playbook/publish.rs`
- Modify: `crates/decacan-runtime/src/playbook/mod.rs`
- Test: `crates/decacan-runtime/tests/playbook_publish.rs`

- [ ] **Step 1: Write failing publish pipeline tests**

Cover:
- publish success creates immutable version
- publish failure returns structured issues
- no half-created version on failure

- [ ] **Step 2: Run focused tests to confirm failure**

Run: `cargo test -p decacan-runtime --test playbook_publish publish -- --nocapture`  
Expected: FAIL due missing publish service.

- [ ] **Step 3: Implement publish service**

Implement synchronous pipeline:
- validate draft
- resolve refs
- compile workflow for `single` path
- snapshot bindings
- persist version

- [ ] **Step 4: Re-run focused tests**

Run: `cargo test -p decacan-runtime --test playbook_publish publish -- --nocapture`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add crates/decacan-runtime/src/playbook/publish.rs crates/decacan-runtime/src/playbook/mod.rs crates/decacan-runtime/tests/playbook_publish.rs
git commit -m "feat: add synchronous playbook publish pipeline"
```

## Task 4: Expose Playbook Lifecycle APIs In decacan-app

**Files:**
- Modify: `crates/decacan-app/src/dto/playbook.rs`
- Modify: `crates/decacan-app/src/api/playbooks.rs`
- Modify: `crates/decacan-app/src/app/state.rs`
- Modify: `crates/decacan-app/src/api/mod.rs`
- Test: `crates/decacan-app/tests/http_smoke.rs`

- [ ] **Step 1: Write failing HTTP smoke tests**

Add endpoint tests for:
- `GET /api/playbook-store`
- `POST /api/playbooks/fork`
- `GET /api/playbooks/:handle_id`
- `PUT /api/playbooks/:handle_id/draft`
- `POST /api/playbooks/:handle_id/publish`

- [ ] **Step 2: Run focused HTTP tests to confirm failure**

Run: `cargo test -p decacan-app --test http_smoke playbook_ -- --nocapture`  
Expected: FAIL because lifecycle endpoints are incomplete.

- [ ] **Step 3: Implement app API handlers and DTOs**

Map runtime lifecycle services into product-facing APIs and return structured health/publish responses.

- [ ] **Step 4: Re-run focused HTTP tests**

Run: `cargo test -p decacan-app --test http_smoke playbook_ -- --nocapture`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add crates/decacan-app/src/dto/playbook.rs crates/decacan-app/src/api/playbooks.rs crates/decacan-app/src/app/state.rs crates/decacan-app/src/api/mod.rs crates/decacan-app/tests/http_smoke.rs
git commit -m "feat: expose playbook lifecycle apis"
```

## Task 5: Bind Task Creation To Published Playbook Version

**Files:**
- Modify: `crates/decacan-app/src/dto/task.rs`
- Modify: `crates/decacan-app/src/api/tasks.rs`
- Modify: `crates/decacan-app/src/app/state.rs`
- Modify: `crates/decacan-runtime/src/playbook/execution.rs`
- Test: `crates/decacan-app/tests/http_smoke.rs`
- Test: `crates/decacan-runtime/tests/registered_playbook_execution.rs`

- [ ] **Step 1: Write failing tests for version-bound task creation**

Cover:
- task rejects direct `StoreEntry` execution
- task rejects Draft execution
- task accepts `handle_id + version_id + input_payload`

- [ ] **Step 2: Run focused tests to confirm failure**

Run: `cargo test -p decacan-app --test http_smoke task_creation_requires_published_playbook_version -- --exact`  
Expected: FAIL because tasks still key off legacy playbook key path.

- [ ] **Step 3: Implement task creation binding**

Update creation flow to:
- load exact version
- validate `version belongs to handle`
- bind input payload
- compile execution package for single path

- [ ] **Step 4: Re-run focused tests**

Run: `cargo test -p decacan-app --test http_smoke task_creation_requires_published_playbook_version -- --exact`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add crates/decacan-app/src/dto/task.rs crates/decacan-app/src/api/tasks.rs crates/decacan-app/src/app/state.rs crates/decacan-runtime/src/playbook/execution.rs crates/decacan-app/tests/http_smoke.rs crates/decacan-runtime/tests/registered_playbook_execution.rs
git commit -m "feat: require published playbook version for task creation"
```

## Task 6: Verify End-to-End Single Path With Published Versions

**Files:**
- Modify: `crates/decacan-app/tests/http_smoke.rs`
- Modify: `crates/decacan-runtime/tests/summary_playbook_e2e.rs`
- Modify: `crates/decacan-runtime/tests/discovery_playbook.rs`

- [ ] **Step 1: Add end-to-end publish-then-run tests**

Add tests that execute:
- fork official playbook
- save/update draft
- publish version
- create task from version
- verify artifact completion path for `single` runtime flow

- [ ] **Step 2: Run focused end-to-end tests**

Run: `cargo test -p decacan-app --test http_smoke -- --nocapture`  
Expected: PASS.

Run: `cargo test -p decacan-runtime --test summary_playbook_e2e --test discovery_playbook -- --nocapture`  
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add crates/decacan-app/tests/http_smoke.rs crates/decacan-runtime/tests/summary_playbook_e2e.rs crates/decacan-runtime/tests/discovery_playbook.rs
git commit -m "test: verify publish-to-version single-path execution"
```

## Final Verification

- [ ] Run: `cargo test --workspace`
- [ ] Run: `cargo run -p decacan-app` and manually verify:
- create handle from store entry
- edit draft
- publish version
- create task from version
- verify task reaches artifact output

## Follow-up Plans (Not In This Plan)

1. Minimal team execution (`parallel_role_group -> merge`) on published versions
2. Extension manifest installation lifecycle and registry projection
3. Validator registry plugin-style expansion beyond builtin validators
4. Workspace policy deepening and task-level policy resolution hardening
