# Decacan App Frontend Implementation Plan

> **历史备注（2026-04-16）**：本文档为归档计划。项目已全面迁移至 TypeScript/Node.js，后端核心位于 `packages/orchestrator`。文中的 Rust/crates 实现细节反映的是迁移前的技术选型。


> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first usable `decacan-app` frontend as a two-column local workstation that supports playbook launch, short-plan preview, task detail, approvals, artifacts, and SSE-driven task updates.

**Architecture:** Keep `decacan-app` as the local Rust application shell and API/SSE host. Add a standalone `frontend/` React + TypeScript app for the workstation UI, and expand `decacan-app` DTOs and endpoints from minimal entities into product-facing launch and task-detail aggregates.

**Tech Stack:** Rust, `axum`, `tokio`, `serde`, `tower-http`, React, TypeScript, Vite, TanStack Router, TanStack Query, native `EventSource`, `react-hook-form`, `zod`, Vitest, React Testing Library

---

## File Structure

### Backend files to modify

- `crates/decacan-app/Cargo.toml`
- `crates/decacan-app/src/api/mod.rs`
- `crates/decacan-app/src/api/workspaces.rs`
- `crates/decacan-app/src/api/playbooks.rs`
- `crates/decacan-app/src/api/tasks.rs`
- `crates/decacan-app/src/api/approvals.rs`
- `crates/decacan-app/src/api/artifacts.rs`
- `crates/decacan-app/src/app/state.rs`
- `crates/decacan-app/src/app/wiring.rs`
- `crates/decacan-app/src/dto/workspace.rs`
- `crates/decacan-app/src/dto/playbook.rs`
- `crates/decacan-app/src/dto/task.rs`
- `crates/decacan-app/src/dto/approval.rs`
- `crates/decacan-app/src/dto/artifact.rs`
- `crates/decacan-app/src/streams/task_events.rs`
- `crates/decacan-app/tests/http_smoke.rs`

### Frontend files to create

- `frontend/package.json`
- `frontend/tsconfig.json`
- `frontend/tsconfig.node.json`
- `frontend/vite.config.ts`
- `frontend/index.html`
- `frontend/src/main.tsx`
- `frontend/src/app/App.tsx`
- `frontend/src/app/router.tsx`
- `frontend/src/app/providers.tsx`
- `frontend/src/app/styles.css`
- `frontend/src/test/setup.ts`
- `frontend/src/entities/playbook/types.ts`
- `frontend/src/entities/task/types.ts`
- `frontend/src/entities/artifact/types.ts`
- `frontend/src/entities/approval/types.ts`
- `frontend/src/shared/api/client.ts`
- `frontend/src/shared/api/catalog.ts`
- `frontend/src/shared/api/tasks.ts`
- `frontend/src/shared/api/artifacts.ts`
- `frontend/src/shared/sse/taskStream.ts`
- `frontend/src/features/launch/LaunchPage.tsx`
- `frontend/src/features/launch/PlaybookCards.tsx`
- `frontend/src/features/launch/TaskDraftForm.tsx`
- `frontend/src/features/launch/TaskPreviewPanel.tsx`
- `frontend/src/features/task-detail/TaskPage.tsx`
- `frontend/src/features/task-detail/TaskHeader.tsx`
- `frontend/src/features/task-detail/PlanProgressPanel.tsx`
- `frontend/src/features/task-detail/TimelinePanel.tsx`
- `frontend/src/features/task-detail/ApprovalPanel.tsx`
- `frontend/src/features/task-detail/ArtifactPanel.tsx`
- `frontend/src/features/task-detail/useTaskDetail.ts`
- `frontend/src/test/launch-page.test.tsx`
- `frontend/src/test/task-page.test.tsx`

## Task 1: Bootstrap The Frontend Workspace And Static App Shell

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/tsconfig.json`
- Create: `frontend/tsconfig.node.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/index.html`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/app/App.tsx`
- Create: `frontend/src/app/router.tsx`
- Create: `frontend/src/app/providers.tsx`
- Create: `frontend/src/app/styles.css`
- Create: `frontend/src/test/setup.ts`
- Test: `frontend/src/test/launch-page.test.tsx`
- Test: `crates/decacan-app/tests/http_smoke.rs`

- [ ] **Step 1: Add the minimal frontend test harness and write the failing shell test**

Create the smallest usable Vite/Vitest setup plus:

```tsx
it("renders the launch shell heading", async () => {
  render(<App />);
  expect(await screen.findByText("Choose a playbook")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the frontend test to verify it fails**

Run: `npm test -- --run frontend/src/test/launch-page.test.tsx`
Expected: FAIL because `App` and the workstation shell do not exist yet, not because the test runner is missing.

- [ ] **Step 3: Add the minimal app shell**

Create a Vite React app with:

```tsx
export function App() {
  return (
    <div className="workspace-shell">
      <aside className="sidebar">Workspace</aside>
      <main className="main-panel">
        <h1>Choose a playbook</h1>
      </main>
    </div>
  );
}
```

- [ ] **Step 4: Run focused verifications**

Run: `npm test -- --run frontend/src/test/launch-page.test.tsx`
Expected: PASS

Run: `cargo test -p decacan-app --test http_smoke`
Expected: PASS with existing API smoke coverage still green.

- [ ] **Step 5: Commit**

```bash
git add frontend
git commit -m "feat: bootstrap decacan app frontend shell"
```

## Task 2: Expand Catalog And Launch Preview Contracts

**Files:**
- Modify: `crates/decacan-app/src/api/playbooks.rs`
- Modify: `crates/decacan-app/src/api/tasks.rs`
- Modify: `crates/decacan-app/src/app/state.rs`
- Modify: `crates/decacan-app/src/dto/playbook.rs`
- Modify: `crates/decacan-app/src/dto/task.rs`
- Modify: `crates/decacan-app/tests/http_smoke.rs`
- Create: `frontend/src/entities/playbook/types.ts`
- Create: `frontend/src/shared/api/catalog.ts`
- Create: `frontend/src/features/launch/PlaybookCards.tsx`
- Create: `frontend/src/features/launch/TaskDraftForm.tsx`
- Create: `frontend/src/features/launch/TaskPreviewPanel.tsx`
- Modify: `frontend/src/test/launch-page.test.tsx`

- [ ] **Step 1: Write the failing catalog and preview contract test**

```rust
#[tokio::test]
async fn playbooks_endpoint_returns_card_metadata_and_preview_endpoint_returns_short_plan() {
    // GET /api/playbooks should include summary and expected_output_label.
    // POST /api/task-previews should return plan_steps and expected_artifact.
}
```

- [ ] **Step 2: Run the backend smoke test to verify it fails**

Run: `cargo test -p decacan-app --test http_smoke playbooks_endpoint_returns_card_metadata_and_preview_endpoint_returns_short_plan -- --exact`
Expected: FAIL because the richer DTOs and preview route do not exist yet.

- [ ] **Step 3: Implement richer launch DTOs and preview route**

Expand `PlaybookDto` toward a product card shape:

```rust
pub struct PlaybookDto {
    pub key: String,
    pub title: String,
    pub summary: String,
    pub mode_label: String,
    pub expected_output_label: String,
    pub expected_output_path: String,
}
```

Add `POST /api/task-previews` that returns:

```rust
pub struct TaskPreviewDto {
    pub preview_id: String,
    pub plan_steps: Vec<String>,
    pub expected_artifact_label: String,
    pub expected_artifact_path: String,
    pub will_auto_start: bool,
}
```

Use `AppState` to hold generated preview tokens and a deterministic short-plan stub for each playbook.

- [ ] **Step 4: Verify backend and launch tests pass**

Run: `cargo test -p decacan-app --test http_smoke`
Expected: PASS

Run: `npm test -- --run frontend/src/test/launch-page.test.tsx`
Expected: PASS after launch components render playbook cards and preview content from fixtures.

- [ ] **Step 5: Commit**

```bash
git add crates/decacan-app/src crates/decacan-app/tests/http_smoke.rs frontend/src/entities/playbook/types.ts frontend/src/shared/api/catalog.ts frontend/src/features/launch frontend/src/test/launch-page.test.tsx
git commit -m "feat: add launch catalog and preview contracts"
```

## Task 3: Build The Launch Flow In The React Workstation

**Files:**
- Modify: `frontend/src/app/App.tsx`
- Modify: `frontend/src/app/router.tsx`
- Modify: `frontend/src/app/providers.tsx`
- Modify: `frontend/src/app/styles.css`
- Modify: `frontend/src/features/launch/LaunchPage.tsx`
- Modify: `frontend/src/features/launch/PlaybookCards.tsx`
- Modify: `frontend/src/features/launch/TaskDraftForm.tsx`
- Modify: `frontend/src/features/launch/TaskPreviewPanel.tsx`
- Create: `frontend/src/shared/api/tasks.ts`
- Modify: `frontend/src/test/launch-page.test.tsx`

- [ ] **Step 1: Write the failing launch flow test**

```tsx
it("creates a task from preview and redirects to the task route", async () => {
  render(<App />);
  await user.click(screen.getByText("Summary"));
  await user.type(screen.getByLabelText("Goal"), "Summarize notes");
  await user.click(screen.getByText("Preview plan"));
  await screen.findByText("Plan preview");
  await user.click(screen.getByText("Start task"));
  expect(mockNavigate).toHaveBeenCalledWith("/tasks/task-1");
});
```

- [ ] **Step 2: Run the launch test to verify it fails**

Run: `npm test -- --run frontend/src/test/launch-page.test.tsx`
Expected: FAIL because the form, preview action, and create-task redirect do not exist yet.

- [ ] **Step 3: Implement the launch page flow**

Wire TanStack Query mutations for:

- loading workspaces and playbooks
- requesting a preview
- creating a task from `preview_id`

The launch page should keep the right-column flow ordered:

1. choose playbook
2. fill structured inputs
3. preview plan
4. start task

- [ ] **Step 4: Verify the launch flow**

Run: `npm test -- --run frontend/src/test/launch-page.test.tsx`
Expected: PASS

Run: `cargo test -p decacan-app --test http_smoke post_tasks_returns_202_from_router_for_test -- --exact`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app frontend/src/features/launch frontend/src/shared/api/tasks.ts frontend/src/test/launch-page.test.tsx
git commit -m "feat: implement launch flow in frontend workstation"
```

## Task 4: Expand Task Detail Aggregate And SSE Event Envelope

**Files:**
- Modify: `crates/decacan-app/src/api/tasks.rs`
- Modify: `crates/decacan-app/src/api/approvals.rs`
- Modify: `crates/decacan-app/src/api/artifacts.rs`
- Modify: `crates/decacan-app/src/app/state.rs`
- Modify: `crates/decacan-app/src/dto/task.rs`
- Modify: `crates/decacan-app/src/dto/approval.rs`
- Modify: `crates/decacan-app/src/dto/artifact.rs`
- Modify: `crates/decacan-app/src/streams/task_events.rs`
- Modify: `crates/decacan-app/tests/http_smoke.rs`
- Create: `frontend/src/entities/task/types.ts`
- Create: `frontend/src/entities/artifact/types.ts`
- Create: `frontend/src/entities/approval/types.ts`
- Modify: `frontend/src/shared/api/tasks.ts`
- Create: `frontend/src/shared/sse/taskStream.ts`

- [ ] **Step 1: Write the failing task detail aggregate test**

```rust
#[tokio::test]
async fn task_detail_endpoint_returns_plan_approvals_artifacts_and_timeline() {
    // GET /api/tasks/:id should return a task aggregate instead of the old flat TaskDto.
}
```

- [ ] **Step 2: Run the focused task detail test to verify it fails**

Run: `cargo test -p decacan-app --test http_smoke task_detail_endpoint_returns_plan_approvals_artifacts_and_timeline -- --exact`
Expected: FAIL because the aggregate DTO and envelope stream do not exist yet.

- [ ] **Step 3: Implement task detail aggregation and typed SSE events**

Replace the flat task response with a product-facing aggregate:

```rust
pub struct TaskDetailDto {
    pub task: TaskSummaryDto,
    pub plan: TaskPlanDto,
    pub approvals: Vec<ApprovalDto>,
    pub artifacts: Vec<ArtifactDto>,
    pub timeline: Vec<TaskEventEnvelopeDto>,
}
```

Return SSE envelopes shaped like:

```rust
pub struct TaskEventEnvelopeDto {
    pub event_id: String,
    pub task_id: String,
    pub sequence: u64,
    pub event_type: String,
    pub snapshot_version: u64,
    pub message: String,
}
```

Use `AppState` to keep a per-task `snapshot_version`, synthetic plan steps, and approval/action state.

- [ ] **Step 4: Verify aggregate contracts**

Run: `cargo test -p decacan-app --test http_smoke`
Expected: PASS

Run: `cargo test --workspace`
Expected: PASS with runtime tests unchanged.

- [ ] **Step 5: Commit**

```bash
git add crates/decacan-app/src crates/decacan-app/tests/http_smoke.rs frontend/src/entities/task/types.ts frontend/src/entities/artifact/types.ts frontend/src/entities/approval/types.ts frontend/src/shared/api/tasks.ts frontend/src/shared/sse/taskStream.ts
git commit -m "feat: add task detail aggregate and typed task events"
```

## Task 5: Implement The Task Detail Workstation UI

**Files:**
- Create: `frontend/src/features/task-detail/TaskPage.tsx`
- Create: `frontend/src/features/task-detail/TaskHeader.tsx`
- Create: `frontend/src/features/task-detail/PlanProgressPanel.tsx`
- Create: `frontend/src/features/task-detail/TimelinePanel.tsx`
- Create: `frontend/src/features/task-detail/ApprovalPanel.tsx`
- Create: `frontend/src/features/task-detail/ArtifactPanel.tsx`
- Create: `frontend/src/features/task-detail/useTaskDetail.ts`
- Modify: `frontend/src/app/router.tsx`
- Modify: `frontend/src/app/styles.css`
- Create: `frontend/src/test/task-page.test.tsx`

- [ ] **Step 1: Write the failing task page rendering test**

```tsx
it("renders task header, plan, approvals, and artifact panels from the aggregate payload", async () => {
  render(<TaskPage />);
  expect(await screen.findByText("Running")).toBeInTheDocument();
  expect(screen.getByText("Plan")).toBeInTheDocument();
  expect(screen.getByText("Approvals")).toBeInTheDocument();
  expect(screen.getByText("Artifacts")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the task page test to verify it fails**

Run: `npm test -- --run frontend/src/test/task-page.test.tsx`
Expected: FAIL because the task detail route and panels do not exist yet.

- [ ] **Step 3: Implement the task detail page and SSE refresh flow**

Build the right-column task surface with:

- header status band
- plan progress panel
- timeline panel
- approval panel
- artifact panel

`useTaskDetail` should:

- fetch the task snapshot
- subscribe to `EventSource`
- append visible events to the local timeline
- invalidate the task query when `snapshot_version` advances

- [ ] **Step 4: Verify the task page**

Run: `npm test -- --run frontend/src/test/task-page.test.tsx`
Expected: PASS

Run: `cargo test -p decacan-app --test http_smoke`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/task-detail frontend/src/app/router.tsx frontend/src/app/styles.css frontend/src/test/task-page.test.tsx
git commit -m "feat: render task detail workstation page"
```

## Task 6: Add Approval Actions, Artifact Preview, And Retry Recovery

**Files:**
- Modify: `crates/decacan-app/src/api/approvals.rs`
- Modify: `crates/decacan-app/src/api/artifacts.rs`
- Modify: `crates/decacan-app/src/api/tasks.rs`
- Modify: `crates/decacan-app/src/app/state.rs`
- Modify: `crates/decacan-app/src/dto/approval.rs`
- Modify: `crates/decacan-app/src/dto/artifact.rs`
- Modify: `crates/decacan-app/src/dto/task.rs`
- Modify: `crates/decacan-app/tests/http_smoke.rs`
- Modify: `frontend/src/features/task-detail/ApprovalPanel.tsx`
- Modify: `frontend/src/features/task-detail/ArtifactPanel.tsx`
- Modify: `frontend/src/features/task-detail/TaskPage.tsx`
- Modify: `frontend/src/shared/api/tasks.ts`
- Modify: `frontend/src/shared/api/artifacts.ts`
- Modify: `frontend/src/test/task-page.test.tsx`

- [ ] **Step 1: Write the failing approval and recovery tests**

```rust
#[tokio::test]
async fn approval_decision_and_retry_routes_update_task_snapshot() {
    // approve a waiting task, retry a failed task, and verify the aggregate status changes.
}
```

```tsx
it("submits an approval decision and opens the primary artifact preview", async () => {
  render(<TaskPage />);
  await user.click(screen.getByText("Approve"));
  expect(await screen.findByText("summary.md")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the focused tests to verify they fail**

Run: `cargo test -p decacan-app --test http_smoke approval_decision_and_retry_routes_update_task_snapshot -- --exact`
Expected: FAIL because the new mutation endpoints and task transitions are not present yet.

Run: `npm test -- --run frontend/src/test/task-page.test.tsx`
Expected: FAIL because approval submission and artifact preview behavior are not wired yet.

- [ ] **Step 3: Implement approval, artifact content, and retry flows**

Add:

- `POST /api/approvals/:approval_id/decision`
- `POST /api/tasks/:task_id/retry`
- `GET /api/artifacts/:artifact_id/content`

The frontend should:

- submit approval decisions from the panel
- refresh the task aggregate after mutation success
- preview the primary artifact content in-place
- allow retry notes for paused or failed tasks

- [ ] **Step 4: Run end-to-end verification for the slice**

Run: `cargo test -p decacan-app --test http_smoke`
Expected: PASS

Run: `npm test -- --run frontend/src/test/task-page.test.tsx`
Expected: PASS

Run: `cargo test --workspace`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add crates/decacan-app/src crates/decacan-app/tests/http_smoke.rs frontend/src/features/task-detail frontend/src/shared/api frontend/src/test/task-page.test.tsx
git commit -m "feat: add approval actions artifact preview and retry flows"
```

## Task 7: Wire Production Asset Serving And Final Verification

**Files:**
- Modify: `crates/decacan-app/src/main.rs`
- Modify: `crates/decacan-app/src/app/wiring.rs`
- Modify: `crates/decacan-app/tests/http_smoke.rs`
- Modify: `frontend/package.json`
- Create: `frontend/.gitignore`
- Modify: `docs/superpowers/specs/2026-03-28-decacan-app-frontend-design.md`

- [ ] **Step 1: Write the failing frontend serving smoke test**

```rust
#[tokio::test]
async fn root_route_serves_frontend_html_shell() {
    // GET / should return HTML and include a frontend mount node.
}
```

- [ ] **Step 2: Run the smoke test to verify it fails**

Run: `cargo test -p decacan-app --test http_smoke root_route_serves_frontend_html_shell -- --exact`
Expected: FAIL because the root route does not yet serve the built frontend app.

- [ ] **Step 3: Implement static asset serving and build scripts**

Add a frontend build script such as:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest run"
  }
}
```

Update `main.rs` and `wiring.rs` so the built frontend assets are served from `/` while `/api/*` and SSE remain intact.

- [ ] **Step 4: Run final verifications**

Run: `npm test`
Expected: PASS

Run: `npm run build`
Expected: PASS and produce `frontend/dist`

Run: `cargo test --workspace`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend crates/decacan-app/src/main.rs crates/decacan-app/src/app/wiring.rs crates/decacan-app/tests/http_smoke.rs docs/superpowers/specs/2026-03-28-decacan-app-frontend-design.md
git commit -m "feat: serve decacan frontend workstation"
```

## Manual Review Notes

- The plan intentionally upgrades `decacan-app` DTOs before building most of the UI. This avoids duplicating product semantics in the React app.
- The plan keeps runtime changes minimal and app-layer focused. `decacan-runtime` remains stable unless a later implementation step proves it needs richer product projections.
- The frontend build introduces a Node toolchain into a Rust repository. Expect `npm install` and `npm run build` to require network access and to potentially need sandbox escalation.
