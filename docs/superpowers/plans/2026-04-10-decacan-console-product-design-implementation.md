# Decacan Console Product Design Alignment Implementation Plan

> **架构更新（2026-04-16）**：项目已全面迁移至 TypeScript/Node.js，后端核心位于 `packages/orchestrator`。本文档中的 Rust/crates 相关实现细节为历史记录，当前技术栈为 Hono + Drizzle ORM + Zod。


> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **注意:** 本计划中的代码示例需要从 Rust 转换为 TypeScript 实现。核心逻辑和架构保持不变，仅变更语言实现。

**Goal:** Align `apps/console` to the approved Console product design by shipping the 4-domain IA (`Workspaces`, `Agents`, `Dashboard`, `Manage`), predictable route prefixes, and permission-aware navigation with an MVP-usable Agents + Workspaces loop.

**Architecture:** Deliver this in sequential batches so each merge keeps the Console operable. First lock IA behavior in tests, then introduce a single route/menu contract module, then implement domain pages (deepest in Agents and Workspaces, medium in Dashboard, shallow-but-official in Manage), and finally align backend/frontend permission contracts to navigation boundaries. Keep left sidebar limited to stable entry pages; create/edit/detail stay in content routes only.

**Tech Stack:** React 19, TypeScript, React Router, Vitest, Testing Library, TypeScript (Hono, Drizzle ORM, Zod)

---

## Scope Check

This spec intentionally leaves `Workspaces` internal IA and the final split with `apps/workspaces` as open questions. This plan only implements account-level Console IA and cross-surface handoff points. Do not expand into deep workspace-detail design in this plan.

## File Structure

### Frontend IA Contract + Routing
- Create: `apps/console/src/features/console-ia/console-nav.ts`
  - Canonical 4-domain navigation definition (domain IDs, sidebar entries, route paths, default redirects).
- Create: `apps/console/src/features/console-ia/route-defaults.ts`
  - Helpers for deterministic redirects (`/workspaces -> /workspaces/workbench`, etc.).
- Modify: `apps/console/src/config/menu.config.tsx`
  - Build sidebar from the canonical nav contract; remove old single-surface menu shape.
- Modify: `apps/console/src/app/routes.tsx`
  - Replace legacy flat routes with domain-prefixed routes and explicit create/detail/edit routes outside sidebar menus.
- Modify: `apps/console/src/layouts/demo4/layout.tsx`
  - Keep toolbar actions aligned with new `Manage` paths.

### Frontend Domain Pages (MVP depth by spec)
- Create: `apps/console/src/features/workspaces/pages/WorkbenchPage.tsx`
- Create: `apps/console/src/features/workspaces/pages/AllWorkspacesPage.tsx`
- Create: `apps/console/src/features/workspaces/pages/ApprovalsPage.tsx`
- Create: `apps/console/src/features/workspaces/pages/RunsPage.tsx`
- Create: `apps/console/src/features/workspaces/pages/MembersPage.tsx`
- Create: `apps/console/src/features/agents/pages/QuickstartPage.tsx`
- Create: `apps/console/src/features/agents/pages/AllAgentsPage.tsx`
- Create: `apps/console/src/features/agents/pages/CreateAgentPage.tsx`
- Create: `apps/console/src/features/agents/pages/AgentDetailPage.tsx`
- Create: `apps/console/src/features/dashboard/pages/AnalyticsPage.tsx`
- Create: `apps/console/src/features/dashboard/pages/MyWorkPage.tsx`
- Create: `apps/console/src/features/dashboard/pages/AttentionPage.tsx`
- Create: `apps/console/src/features/manage/pages/AccountPage.tsx`
- Create: `apps/console/src/features/manage/pages/UsersPage.tsx`
- Create: `apps/console/src/features/manage/pages/AuditLogsPage.tsx`
- Create: `apps/console/src/features/manage/pages/IntegrationsPage.tsx`
- Create: `apps/console/src/features/manage/pages/SettingsPage.tsx`
- Modify: `apps/console/src/features/dashboard/dashboard-page.tsx`
  - Convert current account summary into `Dashboard/My Work` implementation, or replace with `MyWorkPage` composition.

### Frontend API + Auth/Permission Wiring
- Create: `apps/console/src/features/workspaces/api/workspacesConsoleApi.ts`
- Create: `apps/console/src/features/agents/api/agentsConsoleApi.ts`
- Modify: `apps/console/src/features/auth/auth.types.ts`
- Modify: `apps/console/src/features/auth/auth-context.tsx`
- Modify: `apps/console/src/config/menu.config.tsx`
- Modify: `apps/console/src/features/auth/PermissionGuard.tsx`

### Backend Permission Contract
- Modify: `crates/decacan-app/src/dto/policy.rs`
  - Add domain-level and module-level Console visibility flags required by the new IA.
- Modify: `crates/decacan-app/src/app/state.rs`
  - Populate new flags from current-user context and role capabilities.
- Modify: `crates/decacan-app/tests/console_permissions_test.rs`
  - Cover default user vs owner/admin visibility across new domains/modules.

### Tests
- Modify: `apps/console/src/test/menu-config.test.ts`
- Create: `apps/console/src/test/console-ia-routing.test.tsx`
- Modify: `apps/console/src/test/console-permissions.test.tsx`
- Modify: `apps/console/src/test/account-hub-page.test.tsx`

### Documentation
- Modify: `docs/superpowers/specs/2026-04-10-decacan-console-product-design.md`
  - Add implementation status notes once phase is complete.
- Modify: `README.md`
  - Reflect real Console route prefixes and surface boundaries.

## Task 1: Lock IA Rules In Failing Tests

**Files:**
- Modify: `apps/console/src/test/menu-config.test.ts`
- Create: `apps/console/src/test/console-ia-routing.test.tsx`

- [ ] **Step 1: Add a failing menu test for 4 top-level domains and stable second-level entries**

Assert sidebar includes exactly `Workspaces`, `Agents`, `Dashboard`, `Manage` and domain-specific children from spec.

```ts
expect(domainTitles).toEqual(['Workspaces', 'Agents', 'Dashboard', 'Manage']);
expect(agentsChildren).toEqual([
  'Quickstart',
  'All Agents',
  'Playbooks',
  'Teams',
  'Capabilities',
  'Policies',
]);
```

- [ ] **Step 2: Add failing route-redirect tests for domain defaults**

```ts
expect(renderAt('/workspaces')).toRedirectTo('/workspaces/workbench');
expect(renderAt('/agents')).toRedirectTo('/agents/quickstart');
expect(renderAt('/dashboard')).toRedirectTo('/dashboard/analytics');
expect(renderAt('/manage')).toRedirectTo('/manage/account');
```

- [ ] **Step 3: Add failing tests proving create/detail/edit routes are not left-nav items**

```ts
expect(navText).not.toContain('Create Agent');
expect(navText).not.toContain('Agent Detail');
```

- [ ] **Step 4: Run focused frontend tests and verify failure**

Run: `pnpm -C apps/console exec vitest run src/test/menu-config.test.ts src/test/console-ia-routing.test.tsx`
Expected: FAIL due to legacy `Console + Playbook Studio` menu and missing domain redirects.

- [ ] **Step 5: Commit test checkpoint**

```bash
git add apps/console/src/test/menu-config.test.ts apps/console/src/test/console-ia-routing.test.tsx
git commit -m "test(console): capture 4-domain IA and redirect rules"
```

## Task 2: Introduce Canonical Console IA Contract And Route Prefixes

**Files:**
- Create: `apps/console/src/features/console-ia/console-nav.ts`
- Create: `apps/console/src/features/console-ia/route-defaults.ts`
- Modify: `apps/console/src/config/menu.config.tsx`
- Modify: `apps/console/src/app/routes.tsx`
- Modify: `apps/console/src/layouts/demo4/layout.tsx`

- [ ] **Step 1: Create a single source of truth for domain nav and paths**

Define route constants and nav metadata once:

```ts
export const consoleRouteDefaults = {
  workspaces: '/workspaces/workbench',
  agents: '/agents/quickstart',
  dashboard: '/dashboard/analytics',
  manage: '/manage/account',
} as const;
```

- [ ] **Step 2: Rebuild sidebar config from this contract**

Keep left-nav entries to stable pages only. Do not add `/agents/new`, `/agents/:agentId`, or edit/detail routes to sidebar.

- [ ] **Step 3: Replace flat routes with domain-prefixed route tree**

Add all required prefix families and default redirects:

```tsx
{ path: '/agents', element: <Navigate to="/agents/quickstart" replace /> }
{ path: '/agents/new', element: <CreateAgentPage /> }
{ path: '/agents/:agentId', element: <AgentDetailPage /> }
```

- [ ] **Step 4: Align hard-coded toolbar links to Manage routes**

Replace stale `/settings` links with `/manage/settings` to preserve IA consistency.

- [ ] **Step 5: Run IA tests and make them pass**

Run: `pnpm -C apps/console exec vitest run src/test/menu-config.test.ts src/test/console-ia-routing.test.tsx`
Expected: PASS

- [ ] **Step 6: Run console build**

Run: `pnpm -C apps/console build`
Expected: PASS

- [ ] **Step 7: Commit IA contract + route alignment**

```bash
git add apps/console/src/features/console-ia apps/console/src/config/menu.config.tsx apps/console/src/app/routes.tsx apps/console/src/layouts/demo4/layout.tsx
git commit -m "feat(console): align navigation and route prefixes to product IA"
```

## Task 3: Implement Workspaces Domain MVP Entry Loop

**Files:**
- Create: `apps/console/src/features/workspaces/api/workspacesConsoleApi.ts`
- Create: `apps/console/src/features/workspaces/pages/WorkbenchPage.tsx`
- Create: `apps/console/src/features/workspaces/pages/AllWorkspacesPage.tsx`
- Create: `apps/console/src/features/workspaces/pages/ApprovalsPage.tsx`
- Create: `apps/console/src/features/workspaces/pages/RunsPage.tsx`
- Create: `apps/console/src/features/workspaces/pages/MembersPage.tsx`
- Modify: `apps/console/src/app/routes.tsx`
- Modify: `apps/console/src/test/console-ia-routing.test.tsx`

- [ ] **Step 1: Add failing tests for account-level workspace pages and handoff links**

```ts
expect(await screen.findByRole('heading', { name: 'Workbench' })).toBeInTheDocument();
expect(screen.getByRole('link', { name: /open workspace/i })).toHaveAttribute(
  'href',
  'http://localhost:5173/workspaces/workspace-1',
);
```

- [ ] **Step 2: Run focused tests and verify failure**

Run: `pnpm -C apps/console exec vitest run src/test/console-ia-routing.test.tsx`
Expected: FAIL because pages/routes do not exist yet.

- [ ] **Step 3: Build minimal API client for account-level workspace data**

Use existing backend routes (`/api/workspaces`, `/api/approvals`, `/api/tasks`, `/api/members`) with `shared/api/client.ts`.

- [ ] **Step 4: Implement pages with account-level list/filter semantics**

`WorkbenchPage` and `AllWorkspacesPage` must guide users to either account-level triage or jump into `apps/workspaces`.

- [ ] **Step 5: Wire routes**

Add:
- `/workspaces/workbench`
- `/workspaces/all`
- `/workspaces/approvals`
- `/workspaces/runs`
- `/workspaces/members`

- [ ] **Step 6: Run focused tests and make them pass**

Run: `pnpm -C apps/console exec vitest run src/test/console-ia-routing.test.tsx`
Expected: PASS

- [ ] **Step 7: Commit Workspaces domain**

```bash
git add apps/console/src/features/workspaces apps/console/src/app/routes.tsx apps/console/src/test/console-ia-routing.test.tsx
git commit -m "feat(console): implement workspaces domain account-level entry pages"
```

## Task 4: Implement Agents Domain First-Class MVP Loop

**Files:**
- Create: `apps/console/src/features/agents/api/agentsConsoleApi.ts`
- Create: `apps/console/src/features/agents/pages/QuickstartPage.tsx`
- Create: `apps/console/src/features/agents/pages/AllAgentsPage.tsx`
- Create: `apps/console/src/features/agents/pages/CreateAgentPage.tsx`
- Create: `apps/console/src/features/agents/pages/AgentDetailPage.tsx`
- Modify: `apps/console/src/features/playbook-studio/pages/PlaybookListPage.tsx`
- Modify: `apps/console/src/app/routes.tsx`
- Modify: `apps/console/src/test/console-ia-routing.test.tsx`

- [ ] **Step 1: Add failing tests for required Agents flow**

Cover:
- `/agents/quickstart` shows primary CTA to `/agents/new`
- `/agents/all` supports open-detail navigation
- `/agents/:agentId` loads detail shell with tabs/sections

```ts
expect(screen.getByRole('link', { name: 'Create Agent' })).toHaveAttribute('href', '/agents/new');
expect(await screen.findByRole('heading', { name: 'All Agents' })).toBeInTheDocument();
```

- [ ] **Step 2: Run focused tests and verify failure**

Run: `pnpm -C apps/console exec vitest run src/test/console-ia-routing.test.tsx`
Expected: FAIL because agents routes/pages are missing.

- [ ] **Step 3: Implement `Quickstart`, `All Agents`, `Create Agent`, `Agent Detail` pages**

Keep scope MVP:
- real create form + local/server persistence contract
- real list/detail navigation
- detail page uses right-side tabs/sections, not left-nav entries

- [ ] **Step 4: Keep asset libraries under `/agents/*`**

Map existing `Playbook Studio` to `/agents/playbooks`; wire `/agents/teams`, `/agents/capabilities`, `/agents/policies` with stable entry pages (real where backend exists, shallow where pending).

- [ ] **Step 5: Run focused tests and make them pass**

Run: `pnpm -C apps/console exec vitest run src/test/console-ia-routing.test.tsx src/test/menu-config.test.ts`
Expected: PASS

- [ ] **Step 6: Commit Agents domain**

```bash
git add apps/console/src/features/agents apps/console/src/features/playbook-studio/pages/PlaybookListPage.tsx apps/console/src/app/routes.tsx apps/console/src/test/console-ia-routing.test.tsx apps/console/src/test/menu-config.test.ts
git commit -m "feat(console): make agents a first-class domain with create/list/detail flow"
```

## Task 5: Deliver Dashboard + Manage Domain Pages At Target Depth

**Files:**
- Create: `apps/console/src/features/dashboard/pages/AnalyticsPage.tsx`
- Create: `apps/console/src/features/dashboard/pages/MyWorkPage.tsx`
- Create: `apps/console/src/features/dashboard/pages/AttentionPage.tsx`
- Create: `apps/console/src/features/manage/pages/AccountPage.tsx`
- Create: `apps/console/src/features/manage/pages/UsersPage.tsx`
- Create: `apps/console/src/features/manage/pages/AuditLogsPage.tsx`
- Create: `apps/console/src/features/manage/pages/IntegrationsPage.tsx`
- Create: `apps/console/src/features/manage/pages/SettingsPage.tsx`
- Modify: `apps/console/src/features/dashboard/dashboard-page.tsx`
- Modify: `apps/console/src/app/routes.tsx`

- [ ] **Step 1: Add failing tests for Dashboard triage behavior**

```ts
expect(await screen.findByRole('heading', { name: 'Analytics' })).toBeInTheDocument();
expect(await screen.findByRole('heading', { name: 'My Work' })).toBeInTheDocument();
expect(await screen.findByRole('heading', { name: 'Attention' })).toBeInTheDocument();
```

- [ ] **Step 2: Add failing tests for Manage stable governance entry pages**

```ts
expect(await screen.findByRole('heading', { name: 'Users' })).toBeInTheDocument();
expect(await screen.findByRole('heading', { name: 'Audit Logs' })).toBeInTheDocument();
```

- [ ] **Step 3: Run focused tests and verify failure**

Run: `pnpm -C apps/console exec vitest run src/test/console-ia-routing.test.tsx src/test/account-hub-page.test.tsx`
Expected: FAIL because these routes/pages are not implemented.

- [ ] **Step 4: Implement Dashboard pages with “next action” orientation**

`MyWorkPage` can compose current account summary widgets; `AnalyticsPage` and `AttentionPage` stay lightweight but actionable.

- [ ] **Step 5: Implement Manage pages with official governance entry points**

`Audit Logs` can be shallow v1, but route/menu and page contract must exist.

- [ ] **Step 6: Run focused tests and make them pass**

Run: `pnpm -C apps/console exec vitest run src/test/console-ia-routing.test.tsx src/test/account-hub-page.test.tsx`
Expected: PASS

- [ ] **Step 7: Commit Dashboard + Manage**

```bash
git add apps/console/src/features/dashboard apps/console/src/features/manage apps/console/src/app/routes.tsx apps/console/src/test/console-ia-routing.test.tsx apps/console/src/test/account-hub-page.test.tsx
git commit -m "feat(console): add dashboard and manage domain pages"
```

## Task 6: Align Permission Contract To Navigation Boundaries

**Files:**
- Modify: `crates/decacan-app/src/dto/policy.rs`
- Modify: `crates/decacan-app/src/app/state.rs`
- Modify: `crates/decacan-app/tests/console_permissions_test.rs`
- Modify: `apps/console/src/features/auth/auth.types.ts`
- Modify: `apps/console/src/features/auth/auth-context.tsx`
- Modify: `apps/console/src/test/console-permissions.test.tsx`
- Modify: `apps/console/src/config/menu.config.tsx`
- Modify: `apps/console/src/app/routes.tsx`

- [ ] **Step 1: Add failing backend tests for domain/module visibility flags**

Extend `/api/me/permissions` test expectations:

```rust
assert_eq!(json["domain_agents"], Value::Bool(true));
assert_eq!(json["agents_policies"], Value::Bool(false));
```

- [ ] **Step 2: Run backend permission tests and verify failure**

Run: `cargo test -p decacan-app --test console_permissions_test -- --nocapture`
Expected: FAIL because new fields are absent.

- [ ] **Step 3: Extend policy DTO + state permission builder**

Add explicit booleans for:
- 4 top domains (`domain_workspaces`, `domain_agents`, `domain_dashboard`, `domain_manage`)
- second-level capabilities (for example `agents_playbooks`, `agents_teams`, `agents_capabilities`, `agents_policies`).

- [ ] **Step 4: Extend frontend auth permission types and hasPermission mapping**

Menu visibility must be hide-first:
- no permission => menu hidden
- no domain permission => whole top-level domain hidden

- [ ] **Step 5: Add/adjust route guards for unauthorized domain/module routes**

Unauthorized deep links should redirect to the highest allowed default route.

- [ ] **Step 6: Run backend and frontend permission tests**

Run:
`cargo test -p decacan-app --test console_permissions_test -- --nocapture`
`pnpm -C apps/console exec vitest run src/test/console-permissions.test.tsx`

Expected: PASS

- [ ] **Step 7: Commit permission-boundary alignment**

```bash
git add crates/decacan-app/src/dto/policy.rs crates/decacan-app/src/app/state.rs crates/decacan-app/tests/console_permissions_test.rs apps/console/src/features/auth/auth.types.ts apps/console/src/features/auth/auth-context.tsx apps/console/src/test/console-permissions.test.tsx apps/console/src/config/menu.config.tsx apps/console/src/app/routes.tsx
git commit -m "feat(console): align permissions with domain navigation boundaries"
```

## Task 7: Full Verification, Rust Baseline Clean, And Docs Sync

**Files:**
- Modify: `README.md`
- Modify: `docs/superpowers/specs/2026-04-10-decacan-console-product-design.md`

- [ ] **Step 1: Run frontend verification**

Run:
`pnpm -C apps/console exec vitest run`
`pnpm -C apps/console build`

Expected: PASS

- [ ] **Step 2: Run backend verification and Rust baseline checks**

Run:
`cargo test --workspace`
`cargo clippy --workspace -- -D warnings`
`cargo fmt --check`

Expected: PASS with zero clippy warnings and formatted workspace.

- [ ] **Step 3: Run API smoke tests for app compatibility**

Run:
`cargo test -p decacan-app --test http_smoke -- --nocapture`

Expected: PASS

- [ ] **Step 4: Update docs to match shipped IA**

Document:
- official route prefixes
- left-nav inclusion rule
- Console vs `apps/workspaces` boundary
- known deferred items (workspace deep details, heavy observability, advanced audit search)

- [ ] **Step 5: Commit verification + docs**

```bash
git add README.md docs/superpowers/specs/2026-04-10-decacan-console-product-design.md
git commit -m "docs(console): sync product design and verification baseline"
```

