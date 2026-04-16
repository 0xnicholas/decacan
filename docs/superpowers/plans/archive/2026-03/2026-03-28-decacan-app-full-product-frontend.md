# Decacan App Full Product Frontend Implementation Plan

> **历史备注（2026-04-16）**：本文档为归档计划。项目已全面迁移至 TypeScript/Node.js，后端核心位于 `packages/orchestrator`。文中的 Rust/crates 实现细节反映的是迁移前的技术选型。


> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend `decacan-app` from the current MVP task workstation into the full workspace-based team frontend defined in `2026-03-28-decacan-app-full-product-frontend-design.md`.

**Architecture:** Build on top of the existing React + Rust implementation that already lives in the `mvp-plan-execution` line, not the `main` branch docs-only snapshot. Keep `crates/decacan-app` as the API/SSE/static shell, expand its DTOs from task-centric aggregates toward workspace, deliverable, approval, inbox, and activity aggregates, and evolve the frontend into a persistent workspace shell with role-aware landing pages and deep task/deliverable collaboration rails.

**Tech Stack:** Rust, `axum`, `tokio`, `serde`, React, TypeScript, Vite, TanStack Router, TanStack Query, native `EventSource`, Vitest, React Testing Library

---

## Execution Context

This plan assumes implementation happens in a dedicated worktree created from `mvp-plan-execution`, because that branch already contains:

- `frontend/` React app
- `crates/decacan-app` richer task/detail DTOs
- task workstation UI
- artifact preview drawer
- execution activity baseline

Do **not** execute this plan from `main`, which currently only contains the design docs and not the full frontend codebase.

## File Structure

### Existing backend files to extend

- `crates/decacan-app/src/api/mod.rs`
- `crates/decacan-app/src/api/workspaces.rs`
- `crates/decacan-app/src/api/tasks.rs`
- `crates/decacan-app/src/api/approvals.rs`
- `crates/decacan-app/src/api/artifacts.rs`
- `crates/decacan-app/src/app/state.rs`
- `crates/decacan-app/src/app/wiring.rs`
- `crates/decacan-app/src/dto/mod.rs`
- `crates/decacan-app/src/dto/workspace.rs`
- `crates/decacan-app/src/dto/task.rs`
- `crates/decacan-app/src/dto/approval.rs`
- `crates/decacan-app/src/dto/artifact.rs`
- `crates/decacan-app/src/streams/task_events.rs`
- `crates/decacan-app/tests/http_smoke.rs`

### Existing frontend files to evolve

- `frontend/src/app/App.tsx`
- `frontend/src/app/router.tsx`
- `frontend/src/app/providers.tsx`
- `frontend/src/app/styles.css`
- `frontend/src/entities/task/types.ts`
- `frontend/src/entities/artifact/types.ts`
- `frontend/src/entities/approval/types.ts`
- `frontend/src/features/launch/LaunchPage.tsx`
- `frontend/src/features/task-detail/TaskPage.tsx`
- `frontend/src/features/task-detail/TaskHeader.tsx`
- `frontend/src/features/task-detail/PlanProgressPanel.tsx`
- `frontend/src/features/task-detail/ApprovalPanel.tsx`
- `frontend/src/features/task-detail/ArtifactPanel.tsx`
- `frontend/src/features/task-detail/ArtifactPreviewDrawer.tsx`
- `frontend/src/features/task-detail/TimelinePanel.tsx`
- `frontend/src/features/task-detail/useTaskDetail.ts`
- `frontend/src/shared/api/catalog.ts`
- `frontend/src/shared/api/tasks.ts`
- `frontend/src/shared/api/artifacts.ts`
- `frontend/src/test/launch-page.test.tsx`
- `frontend/src/test/task-page.test.tsx`

### New backend files likely needed

- `crates/decacan-app/src/dto/deliverable.rs`
- `crates/decacan-app/src/dto/activity.rs`
- `crates/decacan-app/src/dto/member.rs`
- `crates/decacan-app/src/api/deliverables.rs`
- `crates/decacan-app/src/api/activity.rs`
- `crates/decacan-app/src/api/members.rs`
- `crates/decacan-app/src/api/inbox.rs`

### New frontend files likely needed

- `frontend/src/entities/workspace/types.ts`
- `frontend/src/entities/deliverable/types.ts`
- `frontend/src/entities/activity/types.ts`
- `frontend/src/entities/member/types.ts`
- `frontend/src/features/workspace-home/WorkspaceHomePage.tsx`
- `frontend/src/features/workspace-home/NeedsAttentionPanel.tsx`
- `frontend/src/features/workspace-home/ExecutionOverviewPanel.tsx`
- `frontend/src/features/workspace-home/WorkspaceDeliverablesPanel.tsx`
- `frontend/src/features/workspace-home/TeamSnapshotPanel.tsx`
- `frontend/src/features/tasks/TasksPage.tsx`
- `frontend/src/features/tasks/TaskListView.tsx`
- `frontend/src/features/tasks/TaskBoardView.tsx`
- `frontend/src/features/tasks/MyTasksView.tsx`
- `frontend/src/features/deliverables/DeliverablesPage.tsx`
- `frontend/src/features/deliverables/DeliverableDetailPage.tsx`
- `frontend/src/features/deliverables/DeliverablePreviewPanel.tsx`
- `frontend/src/features/approvals/ApprovalsPage.tsx`
- `frontend/src/features/activity/ActivityPage.tsx`
- `frontend/src/features/members/MembersPage.tsx`
- `frontend/src/features/inbox/InboxPage.tsx`
- `frontend/src/features/my-work/MyWorkPage.tsx`
- `frontend/src/features/task-detail/AgentRail.tsx`
- `frontend/src/features/task-detail/ContextRail.tsx`
- `frontend/src/features/task-detail/HistoryRail.tsx`
- `frontend/src/shared/layout/WorkspaceShell.tsx`
- `frontend/src/shared/layout/TopBar.tsx`
- `frontend/src/shared/layout/WorkspaceNav.tsx`
- `frontend/src/shared/api/workspaces.ts`
- `frontend/src/shared/api/deliverables.ts`
- `frontend/src/shared/api/activity.ts`
- `frontend/src/shared/api/members.ts`
- `frontend/src/shared/api/inbox.ts`
- `frontend/src/test/workspace-home-page.test.tsx`
- `frontend/src/test/tasks-page.test.tsx`
- `frontend/src/test/deliverables-page.test.tsx`
- `frontend/src/test/approvals-page.test.tsx`
- `frontend/src/test/inbox-page.test.tsx`

## Task 1: Create The Persistent Workspace Shell And Route Model

**Files:**
- Modify: `frontend/src/app/App.tsx`
- Modify: `frontend/src/app/router.tsx`
- Modify: `frontend/src/app/styles.css`
- Create: `frontend/src/shared/layout/WorkspaceShell.tsx`
- Create: `frontend/src/shared/layout/TopBar.tsx`
- Create: `frontend/src/shared/layout/WorkspaceNav.tsx`
- Create: `frontend/src/entities/workspace/types.ts`
- Create: `frontend/src/shared/api/workspaces.ts`
- Create: `frontend/src/test/workspace-shell.test.tsx`

- [ ] **Step 1: Write the failing workspace shell test**

```tsx
it("renders the full workspace shell around workspace routes", async () => {
  window.history.replaceState({}, "", "/workspaces/workspace-1");
  render(<App />);
  expect(await screen.findByText("Home")).toBeInTheDocument();
  expect(screen.getByText("Tasks")).toBeInTheDocument();
  expect(screen.getByText("Deliverables")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "New Task" })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --run src/test/workspace-shell.test.tsx`
Expected: FAIL because the app still routes directly to launch/task pages and has no persistent workspace shell.

- [ ] **Step 3: Implement the minimal shell**

Add:

- top bar with workspace switcher, inbox, user placeholder, `New Task`
- left nav with `Home`, `Tasks`, `Deliverables`, `Approvals`, `Activity`, `Members`
- nested route structure under `/workspaces/:workspaceId/...`

Keep placeholder page bodies simple. This task is only about the product shell and route frame.

- [ ] **Step 4: Verify shell tests pass**

Run: `npm test -- --run src/test/workspace-shell.test.tsx`
Expected: PASS

Run: `npm run build`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app frontend/src/shared/layout frontend/src/entities/workspace/types.ts frontend/src/shared/api/workspaces.ts frontend/src/test/workspace-shell.test.tsx
git commit -m "feat: add workspace shell and route frame"
```

## Task 2: Build Workspace Home As The Project Lead Control Center

**Files:**
- Create: `frontend/src/features/workspace-home/WorkspaceHomePage.tsx`
- Create: `frontend/src/features/workspace-home/NeedsAttentionPanel.tsx`
- Create: `frontend/src/features/workspace-home/ExecutionOverviewPanel.tsx`
- Create: `frontend/src/features/workspace-home/WorkspaceDeliverablesPanel.tsx`
- Create: `frontend/src/features/workspace-home/TeamSnapshotPanel.tsx`
- Create: `frontend/src/test/workspace-home-page.test.tsx`
- Create: `crates/decacan-app/src/dto/activity.rs`
- Create: `crates/decacan-app/src/dto/member.rs`
- Modify: `crates/decacan-app/src/dto/mod.rs`
- Modify: `crates/decacan-app/src/dto/workspace.rs`
- Modify: `crates/decacan-app/src/api/workspaces.rs`
- Modify: `crates/decacan-app/tests/http_smoke.rs`

- [ ] **Step 1: Write the failing backend workspace-home aggregate test**

```rust
#[tokio::test]
async fn workspace_home_endpoint_returns_attention_activity_deliverables_and_team_snapshot() {
    // GET /api/workspaces/workspace-1/home should return:
    // attention, task_health, activity, deliverables, team_snapshot
}
```

- [ ] **Step 2: Run the backend test to verify it fails**

Run: `cargo test -p decacan-app --test http_smoke workspace_home_endpoint_returns_attention_activity_deliverables_and_team_snapshot -- --exact`
Expected: FAIL because the workspace-home aggregate does not exist yet.

- [ ] **Step 3: Implement the minimal workspace-home aggregate and page**

Backend:

- add `WorkspaceHomeDto`
- return product-facing sections rather than raw task lists

Frontend:

- render `Needs Attention`
- render `Execution Overview`
- render `Deliverables`
- render `Team Snapshot`

Use deterministic stub data first. The goal is the control-center shape, not perfect realism.

- [ ] **Step 4: Verify focused tests**

Run: `cargo test -p decacan-app --test http_smoke workspace_home_endpoint_returns_attention_activity_deliverables_and_team_snapshot -- --exact`
Expected: PASS

Run: `npm test -- --run src/test/workspace-home-page.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add crates/decacan-app/src/dto crates/decacan-app/src/api/workspaces.rs crates/decacan-app/tests/http_smoke.rs frontend/src/features/workspace-home frontend/src/test/workspace-home-page.test.tsx
git commit -m "feat: add workspace home control center"
```

## Task 3: Upgrade Task Detail Into The Full Collaboration Surface

**Files:**
- Modify: `frontend/src/features/task-detail/TaskPage.tsx`
- Modify: `frontend/src/features/task-detail/TaskHeader.tsx`
- Modify: `frontend/src/features/task-detail/useTaskDetail.ts`
- Create: `frontend/src/features/task-detail/AgentRail.tsx`
- Create: `frontend/src/features/task-detail/ContextRail.tsx`
- Create: `frontend/src/features/task-detail/HistoryRail.tsx`
- Modify: `frontend/src/entities/task/types.ts`
- Modify: `frontend/src/shared/api/tasks.ts`
- Modify: `frontend/src/test/task-page.test.tsx`
- Modify: `crates/decacan-app/src/dto/task.rs`
- Modify: `crates/decacan-app/src/api/tasks.rs`
- Modify: `crates/decacan-app/src/streams/task_events.rs`
- Modify: `crates/decacan-app/tests/http_smoke.rs`

- [ ] **Step 1: Write the failing task-detail collaboration test**

```tsx
it("renders an agent rail with agent, context, and history tabs on task detail", async () => {
  window.history.replaceState({}, "", "/workspaces/workspace-1/tasks/task-1");
  render(<App />);
  expect(await screen.findByRole("tab", { name: "Agent" })).toBeInTheDocument();
  expect(screen.getByRole("tab", { name: "Context" })).toBeInTheDocument();
  expect(screen.getByRole("tab", { name: "History" })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the task-detail test to verify it fails**

Run: `npm test -- --run src/test/task-page.test.tsx`
Expected: FAIL because the current task page is still the MVP two-column workstation, not the full collaboration surface.

- [ ] **Step 3: Implement the full task page layout**

Keep existing execution activity, approvals, deliverables, and timeline, but reorganize the page to:

- use the workspace shell
- keep main execution content in the center
- add a right rail with `Agent`, `Context`, and `History`
- support lightweight task-scoped agent messages and instruction actions

Do not add open-ended chat behavior. Use structured task collaboration only.

- [ ] **Step 4: Verify task-detail tests**

Run: `npm test -- --run src/test/task-page.test.tsx`
Expected: PASS

Run: `cargo test -p decacan-app --test http_smoke`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/task-detail frontend/src/entities/task/types.ts frontend/src/shared/api/tasks.ts frontend/src/test/task-page.test.tsx crates/decacan-app/src/dto/task.rs crates/decacan-app/src/api/tasks.rs crates/decacan-app/src/streams/task_events.rs crates/decacan-app/tests/http_smoke.rs
git commit -m "feat: upgrade task detail into full collaboration surface"
```

## Task 4: Promote Artifacts Into Deliverables And Build Deliverable Detail

**Files:**
- Create: `crates/decacan-app/src/dto/deliverable.rs`
- Create: `crates/decacan-app/src/api/deliverables.rs`
- Modify: `crates/decacan-app/src/api/mod.rs`
- Modify: `crates/decacan-app/src/dto/mod.rs`
- Modify: `crates/decacan-app/tests/http_smoke.rs`
- Create: `frontend/src/entities/deliverable/types.ts`
- Create: `frontend/src/shared/api/deliverables.ts`
- Create: `frontend/src/features/deliverables/DeliverablesPage.tsx`
- Create: `frontend/src/features/deliverables/DeliverableDetailPage.tsx`
- Create: `frontend/src/features/deliverables/DeliverablePreviewPanel.tsx`
- Create: `frontend/src/test/deliverables-page.test.tsx`
- Modify: `frontend/src/app/router.tsx`

- [ ] **Step 1: Write the failing deliverables test**

```tsx
it("renders deliverables as first-class review objects", async () => {
  window.history.replaceState({}, "", "/workspaces/workspace-1/deliverables");
  render(<App />);
  expect(await screen.findByText("In Review")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Preview" })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the deliverables test to verify it fails**

Run: `npm test -- --run src/test/deliverables-page.test.tsx`
Expected: FAIL because the app does not yet have deliverable routes or DTOs.

- [ ] **Step 3: Implement deliverable DTOs and pages**

Backend:

- add deliverable list/detail aggregates
- map existing artifact concepts into review-oriented deliverable objects

Frontend:

- deliverables list page
- deliverable detail page
- review-ready preview panel
- simplified right-rail collaboration on deliverable detail

- [ ] **Step 4: Verify focused tests**

Run: `cargo test -p decacan-app --test http_smoke`
Expected: PASS

Run: `npm test -- --run src/test/deliverables-page.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add crates/decacan-app/src/api/mod.rs crates/decacan-app/src/api/deliverables.rs crates/decacan-app/src/dto/mod.rs crates/decacan-app/src/dto/deliverable.rs crates/decacan-app/tests/http_smoke.rs frontend/src/entities/deliverable/types.ts frontend/src/shared/api/deliverables.ts frontend/src/features/deliverables frontend/src/test/deliverables-page.test.tsx frontend/src/app/router.tsx
git commit -m "feat: add deliverables as first-class review surfaces"
```

## Task 5: Build The Approvals Center And Global Inbox

**Files:**
- Create: `crates/decacan-app/src/api/inbox.rs`
- Modify: `crates/decacan-app/src/api/approvals.rs`
- Modify: `crates/decacan-app/src/api/mod.rs`
- Modify: `crates/decacan-app/src/dto/approval.rs`
- Modify: `crates/decacan-app/tests/http_smoke.rs`
- Create: `frontend/src/shared/api/inbox.ts`
- Create: `frontend/src/features/approvals/ApprovalsPage.tsx`
- Create: `frontend/src/features/inbox/InboxPage.tsx`
- Create: `frontend/src/test/approvals-page.test.tsx`
- Create: `frontend/src/test/inbox-page.test.tsx`
- Modify: `frontend/src/app/router.tsx`

- [ ] **Step 1: Write the failing approvals-center test**

```tsx
it("shows a pending approval queue with decision actions", async () => {
  window.history.replaceState({}, "", "/workspaces/workspace-1/approvals");
  render(<App />);
  expect(await screen.findByText("Pending")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Reject" })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the approvals and inbox tests to verify they fail**

Run: `npm test -- --run src/test/approvals-page.test.tsx src/test/inbox-page.test.tsx`
Expected: FAIL because there is no approvals page or inbox page yet.

- [ ] **Step 3: Implement approvals center and inbox aggregates**

Backend:

- make approvals first-class list/detail objects
- expose inbox items waiting on the current user

Frontend:

- approvals list with detail pane and decision form
- inbox page with approvals, review, and input-needed sections

- [ ] **Step 4: Verify focused tests**

Run: `cargo test -p decacan-app --test http_smoke`
Expected: PASS

Run: `npm test -- --run src/test/approvals-page.test.tsx src/test/inbox-page.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add crates/decacan-app/src/api/mod.rs crates/decacan-app/src/api/approvals.rs crates/decacan-app/src/api/inbox.rs crates/decacan-app/src/dto/approval.rs crates/decacan-app/tests/http_smoke.rs frontend/src/shared/api/inbox.ts frontend/src/features/approvals frontend/src/features/inbox frontend/src/test/approvals-page.test.tsx frontend/src/test/inbox-page.test.tsx frontend/src/app/router.tsx
git commit -m "feat: add approvals center and inbox"
```

## Task 6: Add Task Pool Management And Executor-Focused My Work

**Files:**
- Create: `frontend/src/features/tasks/TasksPage.tsx`
- Create: `frontend/src/features/tasks/TaskListView.tsx`
- Create: `frontend/src/features/tasks/TaskBoardView.tsx`
- Create: `frontend/src/features/tasks/MyTasksView.tsx`
- Create: `frontend/src/features/my-work/MyWorkPage.tsx`
- Create: `frontend/src/test/tasks-page.test.tsx`
- Modify: `frontend/src/shared/api/tasks.ts`
- Modify: `frontend/src/app/router.tsx`
- Modify: `frontend/src/app/styles.css`
- Modify: `crates/decacan-app/src/api/tasks.rs`
- Modify: `crates/decacan-app/src/dto/task.rs`
- Modify: `crates/decacan-app/tests/http_smoke.rs`

- [ ] **Step 1: Write the failing tasks-page test**

```tsx
it("switches between list and board views for tasks", async () => {
  window.history.replaceState({}, "", "/workspaces/workspace-1/tasks");
  render(<App />);
  expect(await screen.findByRole("tab", { name: "List" })).toBeInTheDocument();
  await user.click(screen.getByRole("tab", { name: "Board" }));
  expect(screen.getByText("Waiting Approval")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the tasks test to verify it fails**

Run: `npm test -- --run src/test/tasks-page.test.tsx`
Expected: FAIL because the app still routes directly to a single task page and has no task-pool views.

- [ ] **Step 3: Implement task pool and my-work surfaces**

Add:

- tasks list page for project leads
- board view grouped by status
- executor-focused `My Work` page

Reuse the existing task summary types instead of inventing separate near-duplicates.

- [ ] **Step 4: Verify focused tests**

Run: `npm test -- --run src/test/tasks-page.test.tsx`
Expected: PASS

Run: `cargo test -p decacan-app --test http_smoke`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/tasks frontend/src/features/my-work frontend/src/test/tasks-page.test.tsx frontend/src/shared/api/tasks.ts frontend/src/app/router.tsx frontend/src/app/styles.css crates/decacan-app/src/api/tasks.rs crates/decacan-app/src/dto/task.rs crates/decacan-app/tests/http_smoke.rs
git commit -m "feat: add task pool and my work surfaces"
```

## Task 7: Add Workspace Activity And Members Pages

**Files:**
- Create: `crates/decacan-app/src/api/activity.rs`
- Create: `crates/decacan-app/src/api/members.rs`
- Modify: `crates/decacan-app/src/api/mod.rs`
- Modify: `crates/decacan-app/src/app/state.rs`
- Modify: `crates/decacan-app/tests/http_smoke.rs`
- Create: `frontend/src/shared/api/activity.ts`
- Create: `frontend/src/shared/api/members.ts`
- Create: `frontend/src/features/activity/ActivityPage.tsx`
- Create: `frontend/src/features/members/MembersPage.tsx`
- Modify: `frontend/src/app/router.tsx`

- [ ] **Step 1: Write the failing activity test**

```tsx
it("renders workspace activity as a product event feed", async () => {
  window.history.replaceState({}, "", "/workspaces/workspace-1/activity");
  render(<App />);
  expect(await screen.findByText("Approval requested")).toBeInTheDocument();
  expect(screen.getByText("Deliverable updated")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the activity test to verify it fails**

Run: `npm test -- --run src/test/activity-page.test.tsx`
Expected: FAIL because there is no activity route or workspace feed yet.

- [ ] **Step 3: Implement activity and members pages**

Backend:

- workspace activity aggregate
- members list aggregate

Frontend:

- activity page with filters and linked object entries
- members page with role, workload, and recent activity

- [ ] **Step 4: Verify focused tests**

Run: `cargo test -p decacan-app --test http_smoke`
Expected: PASS

Run: `npm test -- --run src/test/activity-page.test.tsx src/test/members-page.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add crates/decacan-app/src/api/mod.rs crates/decacan-app/src/api/activity.rs crates/decacan-app/src/api/members.rs crates/decacan-app/src/app/state.rs crates/decacan-app/tests/http_smoke.rs frontend/src/shared/api/activity.ts frontend/src/shared/api/members.ts frontend/src/features/activity frontend/src/features/members frontend/src/app/router.tsx
git commit -m "feat: add activity and members surfaces"
```

## Task 8: Polish States, Copy, And Full-Product Regression Coverage

**Files:**
- Modify: `frontend/src/app/styles.css`
- Modify: `frontend/src/features/workspace-home/*.tsx`
- Modify: `frontend/src/features/tasks/*.tsx`
- Modify: `frontend/src/features/task-detail/*.tsx`
- Modify: `frontend/src/features/deliverables/*.tsx`
- Modify: `frontend/src/features/approvals/*.tsx`
- Modify: `frontend/src/features/inbox/*.tsx`
- Modify: `frontend/src/test/*.test.tsx`

- [ ] **Step 1: Write one failing regression test for empty/loading/error behavior**

```tsx
it("shows a meaningful empty state when no deliverables exist", async () => {
  render(<App />);
  expect(await screen.findByText("Deliverables will appear here once tasks produce reviewable results.")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the focused regression test to verify it fails**

Run: `npm test -- --run src/test/deliverables-page.test.tsx -t "shows a meaningful empty state"`
Expected: FAIL because the empty state copy and layout do not exist yet.

- [ ] **Step 3: Implement polish pass**

Add:

- page skeletons
- empty states
- error states
- unified status copy
- route-level loading states
- tighter object labels and action language

Do not introduce new product objects or routes in this phase.

- [ ] **Step 4: Run full verification**

Run: `npm test`
Expected: PASS

Run: `npm run build`
Expected: PASS

Run: `cargo test --workspace`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/styles.css frontend/src/features frontend/src/test
git commit -m "feat: polish full product frontend states and copy"
```

## Notes For Execution

- Keep the implementation incremental. Every task should end in a working product state, even if later pages are still placeholders.
- Do not implement all routes first and fill them later. Each route should be introduced with real content and a passing focused test.
- Preserve the agent-product boundary. Never let the rail mutate into a global free-form chat product.
- Reuse the MVP task workstation pieces whenever possible. The full product grows around them; it does not throw them away.
- If workspace, deliverable, approval, or inbox contracts become too large for one DTO file, split them by object instead of growing `task.rs` into a catch-all transport module.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-03-28-decacan-app-full-product-frontend.md`.

Two execution options:

1. Subagent-Driven (recommended) - I dispatch a fresh subagent per task, review between tasks, fast iteration
2. Inline Execution - Execute tasks in this session using executing-plans, batch execution with checkpoints

Current limitation: I cannot start the subagent review loop or subagent-driven execution unless you explicitly ask for subagents/delegation.
