# Decacan App Artifact Preview Drawer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the inline artifact preview block with an operation-first right-side drawer that works from both sidebar and artifact panel entry points.

**Architecture:** Keep task routing unchanged and centralize artifact-preview UI state inside `TaskPage`. Add a dedicated drawer component, let open actions feed a shared preview controller, and preserve the current artifact content API.

**Tech Stack:** React, TypeScript, Vitest, React Testing Library

---

## File Structure

### Frontend files to modify

- `frontend/src/app/styles.css`
- `frontend/src/features/task-detail/TaskPage.tsx`
- `frontend/src/features/task-detail/ArtifactPanel.tsx`
- `frontend/src/features/task-detail/ContextSidebar.tsx`
- `frontend/src/test/task-page.test.tsx`

### Frontend files to create

- `frontend/src/features/task-detail/ArtifactPreviewDrawer.tsx`

## Task 1: Add Drawer Open And Close Behavior

**Files:**
- Create: `frontend/src/features/task-detail/ArtifactPreviewDrawer.tsx`
- Modify: `frontend/src/features/task-detail/TaskPage.tsx`
- Modify: `frontend/src/features/task-detail/ArtifactPanel.tsx`
- Modify: `frontend/src/features/task-detail/ContextSidebar.tsx`
- Test: `frontend/src/test/task-page.test.tsx`

- [ ] **Step 1: Write the failing drawer test**

Add a task-page test that opens artifact preview and expects:
- a right-side preview drawer
- artifact path and status in the drawer
- a close button that dismisses the drawer

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm test -- --run src/test/task-page.test.tsx`
Expected: FAIL because the current preview is still inline.

- [ ] **Step 3: Implement shared drawer state**

Move preview display responsibility into `TaskPage` and add `ArtifactPreviewDrawer.tsx`. The drawer should open from both sidebar and artifact panel actions.

- [ ] **Step 4: Verify the focused test passes**

Run: `npm test -- --run src/test/task-page.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/task-detail/ArtifactPreviewDrawer.tsx frontend/src/features/task-detail/TaskPage.tsx frontend/src/features/task-detail/ArtifactPanel.tsx frontend/src/features/task-detail/ContextSidebar.tsx frontend/src/test/task-page.test.tsx
git commit -m "feat: add artifact preview drawer"
```

## Task 2: Add Operation-First Actions And Preview States

**Files:**
- Modify: `frontend/src/features/task-detail/ArtifactPreviewDrawer.tsx`
- Modify: `frontend/src/features/task-detail/TaskPage.tsx`
- Modify: `frontend/src/app/styles.css`
- Test: `frontend/src/test/task-page.test.tsx`

- [ ] **Step 1: Write the failing action-state test**

Add a task-page test that asserts:
- copy path is available
- refresh preview re-fetches content
- loading, empty, and error states render clear UI

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm test -- --run src/test/task-page.test.tsx`
Expected: FAIL because the drawer does not yet model operation and fetch states.

- [ ] **Step 3: Implement operation-first drawer content**

Add copy-path and refresh actions plus preview loading/error/empty states. Keep the drawer visually action-first but readable.

- [ ] **Step 4: Verify the focused test passes**

Run: `npm test -- --run src/test/task-page.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/task-detail/ArtifactPreviewDrawer.tsx frontend/src/features/task-detail/TaskPage.tsx frontend/src/app/styles.css frontend/src/test/task-page.test.tsx
git commit -m "feat: polish artifact preview drawer actions"
```

## Final Verification

- [ ] Run: `npm test`
- [ ] Run: `npm run build`
