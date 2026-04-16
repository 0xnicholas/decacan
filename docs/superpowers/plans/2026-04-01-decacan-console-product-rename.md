# Decacan Console Product Rename Implementation Plan

> **架构更新（2026-04-16）**：项目已全面迁移至 TypeScript/Node.js，后端核心位于 `packages/orchestrator`。本文档中的 Rust/crates 相关实现细节为历史记录，当前技术栈为 Hono + Drizzle ORM + Zod。


> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the user-visible `apps/admin` product surface from "Account Hub" to "Console" while keeping the engineering surface (`apps/admin`, `dev:admin`, package names, env vars) unchanged for now.

**Architecture:** This change is product-layer only. Update user-facing labels, page copy, navigation text, and supporting docs so the account-level surface is consistently presented as `Console`, while preserving existing routes, package names, Vite ports, and cross-surface handoff contracts. Protect the rename with narrow UI tests and avoid pulling engineering renames into this pass.

**Tech Stack:** React, TypeScript, Vite, Vitest, Testing Library, Markdown docs

---

## File Structure

### Product-facing UI files
- Modify: `apps/admin/src/config/menu.config.tsx`
  - Primary sidebar and compact navigation labels for the account-level surface.
- Modify: `apps/admin/src/features/dashboard/dashboard-page.tsx`
  - Main landing-page copy, loading state copy, and error state copy for the renamed surface.
- Modify: `apps/admin/src/auth/layouts/branded.tsx`
  - Authentication-side product wording that still says `Dashboard`.
- Modify: `apps/workspaces/src/shared/layout/TopBar.tsx`
  - The workspace-to-account handoff link text currently labeled `Account Hub`.

### Tests
- Modify: `apps/admin/src/test/account-hub-page.test.tsx`
  - Assert renamed copy on the main page and retain the workspace handoff assertion.
- Modify: `apps/workspaces/src/test/workspace-shell.test.tsx`
  - Assert the top-bar handoff label uses `Console`.

### Documentation
- Modify: `README.md`
  - Describe the product surface as `Console` while explicitly preserving engineering names such as `apps/admin` and `pnpm dev:admin`.
- Modify: `docs/superpowers/specs/2026-04-01-decacan-account-hub-and-workspace-boundaries-design.md`
  - Add a note that the user-visible account-level surface should be presented as `Console`, with `apps/admin` retained as an implementation name.

### Out of Scope
- Do not rename `apps/admin`.
- Do not rename `decacan-admin`, `pnpm dev:admin`, or `VITE_ACCOUNT_HUB_URL`.
- Do not change routes, backend DTO names, or API paths.
- Do not introduce a separate privileged Studio/Admin surface in this plan.

## Task 1: Lock The Rename In Tests First

**Files:**
- Modify: `apps/admin/src/test/account-hub-page.test.tsx`
- Modify: `apps/workspaces/src/test/workspace-shell.test.tsx`

- [ ] **Step 1: Update the admin page test to expect `Console` copy**

Change the existing expectations so the page asserts the renamed surface without changing the page component yet.

```ts
expect(await screen.findByRole('heading', { name: 'My Work' })).toBeInTheDocument();
expect(screen.getByText(/from one account-level console/i)).toBeInTheDocument();
expect(await screen.findByText('Console Unavailable')).toBeInTheDocument();
expect(screen.queryByText('Loading console')).not.toBeInTheDocument();
```

- [ ] **Step 2: Run the admin test to verify it fails on old copy**

Run: `pnpm -C apps/admin test -- src/test/account-hub-page.test.tsx`
Expected: FAIL because the current component still renders `account hub` strings.

- [ ] **Step 3: Update the workspace shell test to expect a `Console` handoff label**

Change the existing assertion from `Account Hub` to `Console`.

```ts
expect(await screen.findByRole('link', { name: 'Console' })).toHaveAttribute(
  'href',
  'http://localhost:3001',
);
```

- [ ] **Step 4: Run the workspace shell test to verify it fails on old copy**

Run: `pnpm -C apps/workspaces test -- src/test/workspace-shell.test.tsx`
Expected: FAIL because the top bar still renders `Account Hub`.

- [ ] **Step 5: Commit the failing-test checkpoint**

```bash
git add apps/admin/src/test/account-hub-page.test.tsx apps/workspaces/src/test/workspace-shell.test.tsx
git commit -m "test(console): capture product rename expectations"
```

## Task 2: Rename The Product Surface In Admin UI

**Files:**
- Modify: `apps/admin/src/config/menu.config.tsx`
- Modify: `apps/admin/src/features/dashboard/dashboard-page.tsx`
- Modify: `apps/admin/src/auth/layouts/branded.tsx`
- Test: `apps/admin/src/test/account-hub-page.test.tsx`

- [ ] **Step 1: Rename sidebar and compact navigation labels to `Console`**

Update both menu configs so the root entry is consistently named `Console`.

```ts
{
  title: 'Console',
  icon: LayoutDashboard,
  path: '/',
}
```

- [ ] **Step 2: Rename landing-page copy, loading state, and error state**

Change the user-facing strings in `DashboardPage` without renaming the component or route.

```tsx
<p>
  Track approvals, recent tasks, and the workspaces you move across from one account-level console.
</p>
<CardTitle>Console Unavailable</CardTitle>
<CardTitle>Loading console</CardTitle>
<CardDescription>Fetching cross-workspace tasks, approvals, and shortcuts.</CardDescription>
```

- [ ] **Step 3: Remove stale `Dashboard` product wording from the auth brand layout**

Replace the current hero copy with product-neutral `Console` language.

```tsx
<h3 className="text-2xl font-semibold text-mono">Secure Console Access</h3>
<div className="text-base font-medium text-secondary-foreground">
  A robust authentication gateway ensuring
  <br /> secure <span className="text-mono font-semibold">efficient user access</span>
  &nbsp;to the Console experience.
</div>
```

- [ ] **Step 4: Run the focused admin test to verify the rename passes**

Run: `pnpm -C apps/admin test -- src/test/account-hub-page.test.tsx`
Expected: PASS

- [ ] **Step 5: Run the admin production build to catch missed string/import regressions**

Run: `pnpm -C apps/admin build`
Expected: PASS

- [ ] **Step 6: Commit the admin-side rename**

```bash
git add apps/admin/src/config/menu.config.tsx apps/admin/src/features/dashboard/dashboard-page.tsx apps/admin/src/auth/layouts/branded.tsx apps/admin/src/test/account-hub-page.test.tsx
git commit -m "feat(admin): present account hub as console"
```

## Task 3: Rename The Workspace Handoff Copy

**Files:**
- Modify: `apps/workspaces/src/shared/layout/TopBar.tsx`
- Test: `apps/workspaces/src/test/workspace-shell.test.tsx`

- [ ] **Step 1: Change the top-bar handoff label from `Account Hub` to `Console`**

Only change the label text. Keep the existing URL source and navigation behavior.

```tsx
<a href={accountHubUrl}>Console</a>
```

- [ ] **Step 2: Run the focused workspace shell test**

Run: `pnpm -C apps/workspaces test -- src/test/workspace-shell.test.tsx`
Expected: PASS

- [ ] **Step 3: Run the full workspace test suite to catch broader copy assumptions**

Run: `pnpm -C apps/workspaces test`
Expected: PASS

- [ ] **Step 4: Run the workspace production build**

Run: `pnpm -C apps/workspaces build`
Expected: PASS

- [ ] **Step 5: Commit the workspace-side rename**

```bash
git add apps/workspaces/src/shared/layout/TopBar.tsx apps/workspaces/src/test/workspace-shell.test.tsx
git commit -m "feat(workspaces): rename account handoff to console"
```

## Task 4: Align Docs Without Renaming Engineering Surfaces

**Files:**
- Modify: `README.md`
- Modify: `docs/superpowers/specs/2026-04-01-decacan-account-hub-and-workspace-boundaries-design.md`

- [ ] **Step 1: Update README product descriptions to use `Console`**

Keep engineering names explicit so contributors do not confuse product naming with repo naming.

```md
| `apps/admin` | Account-level Console for cross-workspace work aggregation plus playbook design and publishing |
```

Also update the handoff section so it says the workspace top bar links to `Console`, while examples still use `pnpm dev:admin` and `VITE_ACCOUNT_HUB_URL`.

- [ ] **Step 2: Add a naming note to the approved spec**

Add a short section near the surface definition or navigation model:

```md
## Naming Note

The user-visible account-level surface should be called `Console`.
The implementation surface remains `apps/admin` until the permission model and future surface split are settled.
```

- [ ] **Step 3: Run a targeted grep to ensure no user-facing `Account Hub` strings remain in the active surfaces**

Run:
`rg -n "Account Hub|account hub|Secure Dashboard Access|Dashboard interface" apps/admin/src apps/workspaces/src README.md docs/superpowers/specs/2026-04-01-decacan-account-hub-and-workspace-boundaries-design.md`

Expected: no matches in intentionally user-facing copy; any remaining hits should be engineering-only references that you consciously keep.

- [ ] **Step 4: Commit the documentation pass**

```bash
git add README.md docs/superpowers/specs/2026-04-01-decacan-account-hub-and-workspace-boundaries-design.md
git commit -m "docs(console): align product naming"
```

## Task 5: Final Verification And Handoff

**Files:**
- Verify only

- [ ] **Step 1: Run the combined verification commands**

Run:

```bash
pnpm -C apps/admin test -- src/test/account-hub-page.test.tsx
pnpm -C apps/admin build
pnpm -C apps/workspaces test
pnpm -C apps/workspaces build
```

Expected: all commands PASS.

- [ ] **Step 2: Manual smoke-check the two product surfaces**

Run the local dev servers if they are not already running:

```bash
cargo run -p decacan-app
pnpm dev:admin
pnpm dev:workspaces
```

Then verify in a browser:
- `http://localhost:3001/` shows `Console` in the admin surface navigation or page copy.
- `http://localhost:5173/` shows a `Console` handoff in the workspace top bar.
- The workspace-to-console handoff still opens `http://localhost:3001`.

- [ ] **Step 3: Inspect the working tree for accidental engineering renames**

Run: `git status --short`
Expected: only the intended product-copy and docs files are modified.

- [ ] **Step 4: Write the implementation summary for code review**

Capture:
- exact files changed
- tests run
- confirmation that engineering names such as `apps/admin`, `dev:admin`, and `VITE_ACCOUNT_HUB_URL` were intentionally preserved

- [ ] **Step 5: Create the final integration commit if you executed without per-task commits**

```bash
git add README.md apps/admin/src apps/workspaces/src docs/superpowers/specs/2026-04-01-decacan-account-hub-and-workspace-boundaries-design.md
git commit -m "feat(console): rename admin product surface"
```

Use this only if you intentionally skipped the intermediate commits above.
