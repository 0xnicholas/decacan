# Decacan App Task Workspace Polish Implementation Plan

> **历史备注（2026-04-16）**：本文档为归档计划。项目已全面迁移至 TypeScript/Node.js，后端核心位于 `packages/orchestrator`。文中的 Rust/crates 实现细节反映的是迁移前的技术选型。


> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the existing task detail page into a clearer two-column workstation with a summary-first sidebar and basic SSE-driven live status feedback.

**Architecture:** Keep the current route structure and task aggregate contract. Reshape the task-detail frontend around a `ContextSidebar` and `LiveActivityStrip`, and extend the task-detail hook to pair task snapshots with lightweight SSE state. If recent tasks need extra data, add only a minimal backend endpoint or reuse the existing task list.

**Tech Stack:** React, TypeScript, Vitest, React Testing Library, EventSource, Rust, axum

---

## File Structure

### Backend files to modify if needed

- `crates/decacan-app/src/api/tasks.rs`
- `crates/decacan-app/tests/http_smoke.rs`

### Frontend files to modify

- `frontend/src/app/styles.css`
- `frontend/src/entities/task/types.ts`
- `frontend/src/shared/api/tasks.ts`
- `frontend/src/features/task-detail/TaskPage.tsx`
- `frontend/src/features/task-detail/useTaskDetail.ts`
- `frontend/src/features/task-detail/TaskHeader.tsx`
- `frontend/src/features/task-detail/ArtifactPanel.tsx`
- `frontend/src/features/task-detail/ApprovalPanel.tsx`
- `frontend/src/features/task-detail/TimelinePanel.tsx`
- `frontend/src/test/task-page.test.tsx`

### Frontend files to create

- `frontend/src/features/task-detail/ContextSidebar.tsx`
- `frontend/src/features/task-detail/LiveActivityStrip.tsx`

## Task 1: Reshape Task Detail Into A Two-Column Workstation

**Files:**
- Create: `frontend/src/features/task-detail/ContextSidebar.tsx`
- Modify: `frontend/src/features/task-detail/TaskPage.tsx`
- Modify: `frontend/src/app/styles.css`
- Test: `frontend/src/test/task-page.test.tsx`

- [ ] **Step 1: Write the failing layout test**

Add a task-page test that asserts the task route renders:
- workspace and playbook details in a sidebar region
- status summary and progress summary in the sidebar
- main task panels in the right-hand region

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm test -- --run src/test/task-page.test.tsx`
Expected: FAIL because the current task page is a single-column panel grid without the sidebar content.

- [ ] **Step 3: Implement the two-column workstation**

Create `ContextSidebar.tsx` and update `TaskPage.tsx` so the task route renders:

```tsx
<main className="workspace-shell task-workspace-shell">
  <ContextSidebar ... />
  <section className="task-main-column">...</section>
</main>
```

The sidebar should render workspace, playbook, status summary, progress summary, primary artifact shortcut, and a placeholder recent-tasks block.

- [ ] **Step 4: Verify the test passes**

Run: `npm test -- --run src/test/task-page.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/task-detail/ContextSidebar.tsx frontend/src/features/task-detail/TaskPage.tsx frontend/src/app/styles.css frontend/src/test/task-page.test.tsx
git commit -m "feat: reshape task page into workstation layout"
```

## Task 2: Add Live Activity Strip And SSE Task Refresh

**Files:**
- Create: `frontend/src/features/task-detail/LiveActivityStrip.tsx`
- Modify: `frontend/src/features/task-detail/useTaskDetail.ts`
- Modify: `frontend/src/features/task-detail/TaskPage.tsx`
- Modify: `frontend/src/entities/task/types.ts`
- Test: `frontend/src/test/task-page.test.tsx`

- [ ] **Step 1: Write the failing live-activity test**

Extend the task-page test suite with a case that:
- renders the latest timeline event in a live strip
- simulates an SSE event
- verifies the page refetches task detail and updates connection state

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm test -- --run src/test/task-page.test.tsx`
Expected: FAIL because no live strip or SSE behavior exists yet.

- [ ] **Step 3: Implement minimal SSE-driven refresh**

Add `LiveActivityStrip.tsx` and extend `useTaskDetail.ts` to:
- open `EventSource` against the task stream endpoint
- track `live`, `reconnecting`, and `offline` states
- capture the most recent event message
- refetch the task detail snapshot when an event arrives

Keep snapshot fetches as the source of truth; do not patch task detail in memory.

- [ ] **Step 4: Verify the test passes**

Run: `npm test -- --run src/test/task-page.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/task-detail/LiveActivityStrip.tsx frontend/src/features/task-detail/useTaskDetail.ts frontend/src/features/task-detail/TaskPage.tsx frontend/src/entities/task/types.ts frontend/src/test/task-page.test.tsx
git commit -m "feat: add live activity to task workstation"
```

## Task 3: Finish Sidebar Context And Recent Tasks Support

**Files:**
- Modify: `frontend/src/shared/api/tasks.ts`
- Modify: `frontend/src/features/task-detail/ContextSidebar.tsx`
- Modify: `frontend/src/features/task-detail/ArtifactPanel.tsx`
- Modify: `frontend/src/features/task-detail/ApprovalPanel.tsx`
- Modify: `frontend/src/app/styles.css`
- Modify: `frontend/src/test/task-page.test.tsx`
- Optional modify: `crates/decacan-app/src/api/tasks.rs`
- Optional test: `crates/decacan-app/tests/http_smoke.rs`

- [ ] **Step 1: Write the failing recent-tasks and priority test**

Add a task-page test that asserts:
- recent tasks render in the sidebar when task-list data exists
- pending approvals appear before artifact content in the main column
- the primary artifact is discoverable from both sidebar and artifact panel

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm test -- --run src/test/task-page.test.tsx`
Expected: FAIL because recent tasks are not yet wired and panel ordering is not asserted.

- [ ] **Step 3: Implement recent tasks and final polish**

Use the existing task list API if possible. If not, add the smallest backend support needed. Update the sidebar and task-page layout so recent tasks remain secondary and artifact shortcuts are explicit.

- [ ] **Step 4: Verify the focused and backend tests pass**

Run: `npm test -- --run src/test/task-page.test.tsx`
Expected: PASS

If backend API changed, run: `cargo test -p decacan-app --test http_smoke`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/shared/api/tasks.ts frontend/src/features/task-detail/ContextSidebar.tsx frontend/src/features/task-detail/ArtifactPanel.tsx frontend/src/features/task-detail/ApprovalPanel.tsx frontend/src/app/styles.css frontend/src/test/task-page.test.tsx crates/decacan-app/src/api/tasks.rs crates/decacan-app/tests/http_smoke.rs
git commit -m "feat: finish task workstation sidebar context"
```

## Final Verification

- [ ] Run: `npm test`
- [ ] Run: `npm run build`
- [ ] Run: `cargo test -p decacan-app --test http_smoke`
- [ ] Run: `cargo test --workspace`
