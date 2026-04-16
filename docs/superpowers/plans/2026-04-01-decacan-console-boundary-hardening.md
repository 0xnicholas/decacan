# Decacan Console Boundary Hardening Implementation Plan

> **架构更新（2026-04-16）**：项目已全面迁移至 TypeScript/Node.js，后端核心位于 `packages/orchestrator`。本文档中的 Rust/crates 相关实现细节为历史记录，当前技术栈为 Hono + Drizzle ORM + Zod。


> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hard-code the product boundary between `Console` and `workspaces` by making account APIs user-scoped, using an explicit default workspace contract, removing infrastructure leaks from account DTOs, moving playbook authoring fully out of workspace launch, and only then layering permissions onto `Console`.

**Architecture:** Execute this as four sequential, mergeable batches. Batch A introduces a real account-scoped contract around `/api/account/home` and makes workspace entry consume that contract. Batch B removes backend path leakage from account DTOs. Batch C splits playbook authoring/publishing from workspace task launch so the execution surface only consumes published playbooks. Batch D adds permissions on top of those now-stable boundaries instead of using permissions to mask unclear product ownership.

**Tech Stack:** Rust, Axum, Serde, Tokio, React 19, TypeScript, React Router v7, Vitest, Testing Library, pnpm

---

## Scope Check

This route touches multiple subsystems, but they are tightly ordered and share the same product boundary. Do **not** implement this as one giant patch. Each batch below must land independently, with fresh verification before moving to the next batch.

Recommended merge order:
1. Batch A: account context + default workspace contract
2. Batch B: DTO/UI desensitization
3. Batch C: published-playbook execution-only launch flow
4. Batch D: `Console` permissions and route/menu gating

## File Structure

### Batch A: Account Aggregation And Default Workspace Contract
- Modify: `crates/decacan-app/src/api/account.rs`
  - Accept a shared request-scoped current-user context and route `/api/account/home` through a user-aware builder.
- Modify: `crates/decacan-app/src/api/policy.rs`
  - Reuse the same current-user extraction path for `/api/me/permissions` so account home and permission reads cannot drift.
- Modify: `crates/decacan-app/src/app/state.rs`
  - Split `build_account_home` into a user-aware builder and supporting query helpers.
- Modify: `crates/decacan-app/src/dto/account.rs`
  - Keep `default_workspace_id` as the explicit contract the frontend consumes.
- Modify: `crates/decacan-app/tests/account_hub_api_test.rs`
  - Cover deterministic `default_workspace_id` and user-scoped shape.
- Create or modify auth/context extraction files under `crates/decacan-app/src/` as needed
  - Introduce a minimal `CurrentUserContext` extractor shared by account and permission routes instead of wiring either route directly to global state or route-local test stubs.
- Modify: `apps/workspaces/src/features/launch/WorkspaceEntryRedirect.tsx`
  - Stop deriving the default workspace from `/api/workspaces`; consume `/api/account/home`.
- Modify: `apps/workspaces/src/shared/api/catalog.ts`
  - Add a client for account home if no frontend account summary fetcher exists in workspaces.
- Modify: `apps/workspaces/src/test/launch-page.test.tsx`
  - Cover redirect via `default_workspace_id`, including non-first defaults.

### Batch B: DTO Desensitization And Console UI Cleanup
- Modify: `crates/decacan-app/src/dto/workspace.rs`
  - Keep `WorkspaceDto` for `/api/workspaces`, but add a separate account-facing workspace summary DTO for `/api/account/home`.
- Modify: `crates/decacan-app/src/dto/account.rs`
  - Change `AccountHomeDto.workspaces` to a reduced account-facing DTO.
- Modify: `crates/decacan-app/src/app/state.rs`
  - Stop serializing server filesystem paths into account DTOs.
- Modify: `apps/admin/src/features/account-hub/types/accountHub.types.ts`
  - Match the reduced account-facing workspace DTO.
- Modify: `apps/admin/src/features/account-hub/components/WorkspaceListPanel.tsx`
  - Remove `root_path` rendering and replace with user-relevant metadata or no secondary line.
- Modify: `apps/admin/src/test/account-hub-page.test.tsx`
  - Assert no filesystem path is shown.

### Batch C: Published Playbook Execution Boundary
- Modify: `crates/decacan-app/src/api/playbooks.rs`
  - Add or expose a workspace-safe published playbook catalog route distinct from studio lifecycle routes.
- Modify: `crates/decacan-app/src/api/tasks.rs`
  - Align preview/task creation contracts so both workspace preview and task launch consume published handle/version ids.
- Modify: `crates/decacan-app/src/dto/playbook.rs`
  - Add an execution-facing published-playbook DTO that references stable handle/version ids.
- Modify: `crates/decacan-app/src/dto/task.rs`
  - Replace preview request dependence on `playbook_key` with published playbook handle/version references.
- Modify: `crates/decacan-app/src/app/state.rs`
  - Implement published playbook listing without creating drafts/handles during workspace launch.
- Modify: `crates/decacan-app/tests/playbook_studio_api_test.rs`
  - Keep studio lifecycle tests focused on authoring routes only.
- Create: `crates/decacan-app/tests/published_playbook_catalog_test.rs`
  - Cover the execution-facing catalog route and published-only filtering.
- Modify: `apps/workspaces/src/shared/api/catalog.ts`
  - Stop calling studio lifecycle endpoints from launch.
- Modify: `apps/workspaces/src/shared/api/tasks.ts`
  - Move preview requests onto published playbook handle/version ids so preview and create-task use the same contract.
- Modify: `apps/workspaces/src/features/launch/LaunchPage.tsx`
  - Remove fork/save/publish sequence and create tasks from published playbook references only.
- Modify: `apps/workspaces/src/entities/playbook/types.ts`
  - Add the published execution DTO shape.
- Modify: `apps/workspaces/src/test/launch-page.test.tsx`
  - Assert launch no longer calls fork/save/publish and instead consumes the execution catalog.

### Batch D: Console Permissions
- Modify: `crates/decacan-app/src/dto/policy.rs`
  - Add explicit permissions for `console.home` and `studio.playbooks` visibility.
- Modify: `crates/decacan-app/src/api/policy.rs`
  - Extend `/api/me/permissions` with the surface-level flags required by the admin shell.
- Modify: `crates/decacan-app/src/app/state.rs`
  - Extend `get_current_user_permissions()` to populate those flags from the same current-user context introduced in Batch A.
- Modify: `apps/admin/src/config/menu.config.tsx`
  - Make `Playbook Studio` menu entries permission-aware.
- Modify: `apps/admin/src/app/routes.tsx`
  - Add route guards or fallback pages for hidden/forbidden modules.
- Modify: `apps/admin/src/features/dashboard/dashboard-page.tsx`
  - Keep `Console` home visible to normal users regardless of studio permissions.
- Modify: `apps/admin/src/features/auth/auth-context.tsx`
  - Extend the existing auth context to consume `/api/me/permissions` instead of introducing a second permission store.
- Modify: `apps/admin/src/features/auth/PermissionGuard.tsx`
  - Reuse the existing guard with the new surface-level permission flags.
- Create tests under `apps/admin/src/test/`
  - Cover normal-user and studio-user menu/route visibility.

### Supporting Documentation
- Modify: `docs/superpowers/specs/2026-04-01-decacan-account-hub-and-workspace-boundaries-design.md`
  - Record the shift from conceptual boundary to enforced contract once batches land.
- Modify: `README.md`
  - Update frontend handoff/API contract docs if route or env usage changes.

## Batch A: Account Aggregation And Default Workspace Contract

### Task 1: Introduce A Current-User Account Home Builder

**Files:**
- Modify: `crates/decacan-app/src/app/state.rs`
- Modify: `crates/decacan-app/src/api/account.rs`
- Modify: `crates/decacan-app/src/api/policy.rs` or shared auth extraction files under `crates/decacan-app/src/`
- Test: `crates/decacan-app/tests/account_hub_api_test.rs`

- [ ] **Step 1: Write a failing backend test for explicit default workspace selection**

Extend the account home API test so it asserts `default_workspace_id` is present and does not need to match the first item in the array.

```rust
assert_eq!(json["default_workspace_id"], Value::String("workspace-2".to_owned()));
assert_eq!(json["workspaces"][0]["id"], Value::String("workspace-1".to_owned()));
```

- [ ] **Step 2: Run the focused backend test to verify it fails**

Run: `cargo test -p decacan-app --test account_hub_api_test -- --nocapture`
Expected: FAIL because `build_account_home` still derives the default from `workspaces.first()`.

- [ ] **Step 3: Add a shared current-user abstraction used by both account and permission routes**

Implement the smallest possible layer that allows both account home and `/api/me/permissions` to be built for a specific user, even if tests stub the user. Do not leave this as a route-local test helper.

```rust
pub struct CurrentUserContext {
    pub user_id: String,
    pub default_workspace_id: String,
}

async fn get_account_home(
    State(state): State<AppState>,
    current_user: CurrentUserContext,
) -> Json<AccountHomeDto> {
    Json(state.build_account_home_for_user(&current_user))
}
```

Route `get_my_permissions` through the same extractor/context so both endpoints depend on one request-scoped user source.

- [ ] **Step 4: Split the state helper into a user-aware builder**

Replace `build_account_home()` with a user-aware method that uses explicit user defaults instead of list order.

```rust
pub fn build_account_home_for_user(&self, current_user: &CurrentUserContext) -> AccountHomeDto {
    AccountHomeDto {
        default_workspace_id: current_user.default_workspace_id.clone(),
        workspaces: self.workspaces_for_user(&current_user.user_id),
        waiting_on_me: self.waiting_on_me_for_user(&current_user.user_id),
        recent_tasks: self.recent_tasks_for_user(&current_user.user_id),
        playbook_shortcuts: self.playbook_shortcuts_for_user(&current_user.user_id),
    }
}
```

- [ ] **Step 5: Run the backend account-home test and make it pass**

Run: `cargo test -p decacan-app --test account_hub_api_test -- --nocapture`
Expected: PASS

- [ ] **Step 6: Commit Batch A backend contract groundwork**

```bash
git add crates/decacan-app/src/api/account.rs crates/decacan-app/src/api/policy.rs crates/decacan-app/src/app/state.rs crates/decacan-app/tests/account_hub_api_test.rs
git commit -m "feat(app): make account home use explicit default workspace"
```

### Task 2: Make Workspace Entry Consume Account Home

**Files:**
- Modify: `apps/workspaces/src/features/launch/WorkspaceEntryRedirect.tsx`
- Modify: `apps/workspaces/src/shared/api/catalog.ts`
- Test: `apps/workspaces/src/test/launch-page.test.tsx`

- [ ] **Step 1: Write a failing frontend test for non-first default workspace redirect**

Add a redirect test where `/api/account/home` returns `default_workspace_id = workspace-2` while `/api/workspaces` would list `workspace-1` first.

```ts
expect(window.location.pathname).toBe('/workspaces/workspace-2');
```

- [ ] **Step 2: Run the focused launch test to verify it fails**

Run: `pnpm -C apps/workspaces exec vitest run src/test/launch-page.test.tsx`
Expected: FAIL because `WorkspaceEntryRedirect` still reads `workspaces[0]`.

- [ ] **Step 3: Add an account-home fetcher to the workspaces app**

Create the smallest API client needed:

```ts
export function fetchAccountHome() {
  return getJson<AccountHome>('/api/account/home');
}
```

- [ ] **Step 4: Rewrite `WorkspaceEntryRedirect` to use `default_workspace_id`**

```tsx
const accountHome = await fetchAccountHome();
const nextWorkspaceId = accountHome.default_workspace_id;
```

Keep the existing empty/error UI behavior, but key it to the account-home contract.

- [ ] **Step 5: Run the focused launch test and make it pass**

Run: `pnpm -C apps/workspaces exec vitest run src/test/launch-page.test.tsx`
Expected: PASS

- [ ] **Step 6: Run workspace build as a contract check**

Run: `pnpm -C apps/workspaces build`
Expected: PASS

- [ ] **Step 7: Commit the workspace entry redirect fix**

```bash
git add apps/workspaces/src/features/launch/WorkspaceEntryRedirect.tsx apps/workspaces/src/shared/api/catalog.ts apps/workspaces/src/test/launch-page.test.tsx
git commit -m "feat(workspaces): use account home for default workspace redirect"
```

## Batch B: DTO Desensitization And Console UI Cleanup

### Task 3: Remove Filesystem Paths From Account DTOs

**Files:**
- Modify: `crates/decacan-app/src/dto/workspace.rs`
- Modify: `crates/decacan-app/src/dto/account.rs`
- Modify: `crates/decacan-app/src/app/state.rs`
- Test: `crates/decacan-app/tests/account_hub_api_test.rs`

- [ ] **Step 1: Write a failing backend test that rejects `root_path` in account home workspaces**

```rust
assert!(json["workspaces"][0].get("root_path").is_none());
```

- [ ] **Step 2: Run the focused account-home test to verify it fails**

Run: `cargo test -p decacan-app --test account_hub_api_test -- --nocapture`
Expected: FAIL because account home still serializes `WorkspaceDto` with `root_path`.

- [ ] **Step 3: Split account-facing workspace data from execution-facing workspace data**

Keep `WorkspaceDto` unchanged for `/api/workspaces`. Add a reduced account DTO instead of reusing the execution DTO.

```rust
pub struct AccountWorkspaceDto {
    pub id: String,
    pub title: String,
}
```

Update `AccountHomeDto.workspaces` to use `Vec<AccountWorkspaceDto>`.

- [ ] **Step 4: Update the account-home builder to map into the reduced DTO**

```rust
workspaces: self
    .workspaces_for_user(&current_user.user_id)
    .into_iter()
    .map(|workspace| AccountWorkspaceDto { id: workspace.id, title: workspace.title })
    .collect(),
```

- [ ] **Step 5: Run the focused backend test and make it pass**

Run: `cargo test -p decacan-app --test account_hub_api_test -- --nocapture`
Expected: PASS

- [ ] **Step 6: Commit the DTO desensitization**

```bash
git add crates/decacan-app/src/dto/workspace.rs crates/decacan-app/src/dto/account.rs crates/decacan-app/src/app/state.rs crates/decacan-app/tests/account_hub_api_test.rs
git commit -m "fix(app): remove workspace filesystem paths from account dto"
```

### Task 4: Remove Path Rendering From Console

**Files:**
- Modify: `apps/admin/src/features/account-hub/types/accountHub.types.ts`
- Modify: `apps/admin/src/features/account-hub/components/WorkspaceListPanel.tsx`
- Test: `apps/admin/src/test/account-hub-page.test.tsx`

- [ ] **Step 1: Write a failing admin test that rejects workspace filesystem paths**

```ts
expect(screen.queryByText('/tmp/workspace-1')).not.toBeInTheDocument();
```

- [ ] **Step 2: Run the focused admin test to verify it fails**

Run: `pnpm -C apps/admin exec vitest run src/test/account-hub-page.test.tsx`
Expected: FAIL because the panel still renders `root_path`.

- [ ] **Step 3: Update account-home frontend types to the reduced DTO**

Remove `root_path` from the account-facing workspace type.

- [ ] **Step 4: Rewrite `WorkspaceListPanel` secondary copy**

Keep the panel useful without leaking infrastructure. The simplest acceptable fallback is no secondary path line.

```tsx
<p className="font-medium text-mono">{workspace.title}</p>
```

If product metadata exists by then, prefer role/team text. Do not invent fake path-like values.

- [ ] **Step 5: Run the focused admin test and make it pass**

Run: `pnpm -C apps/admin exec vitest run src/test/account-hub-page.test.tsx`
Expected: PASS

- [ ] **Step 6: Run the targeted admin rename suite and build**

Run:
```bash
pnpm -C apps/admin exec vitest run src/test/account-hub-page.test.tsx src/test/menu-config.test.ts src/test/branded-layout.test.tsx
pnpm -C apps/admin build
```
Expected: PASS

- [ ] **Step 7: Commit the Console UI cleanup**

```bash
git add apps/admin/src/features/account-hub/types/accountHub.types.ts apps/admin/src/features/account-hub/components/WorkspaceListPanel.tsx apps/admin/src/test/account-hub-page.test.tsx
git commit -m "fix(admin): hide workspace filesystem paths in console"
```

## Batch C: Published Playbook Execution Boundary

### Task 5: Add A Published Playbook Catalog Route

**Files:**
- Modify: `crates/decacan-app/src/api/playbooks.rs`
- Modify: `crates/decacan-app/src/api/tasks.rs`
- Modify: `crates/decacan-app/src/dto/playbook.rs`
- Modify: `crates/decacan-app/src/dto/task.rs`
- Modify: `crates/decacan-app/src/app/state.rs`
- Create: `crates/decacan-app/tests/published_playbook_catalog_test.rs`

- [ ] **Step 1: Write a failing backend test for a published-only execution catalog**

Create a new test that asserts the execution catalog route only returns published playbooks with stable `handle_id` + `version_id` references.

```rust
assert_eq!(json[0]["playbook_handle_id"], Value::String(handle_id));
assert!(json[0]["playbook_version_id"].is_string());
assert!(json[0].get("draft_id").is_none());
```

- [ ] **Step 2: Run the new catalog test to verify it fails**

Run: `cargo test -p decacan-app --test published_playbook_catalog_test -- --nocapture`
Expected: FAIL because no such route/DTO exists yet.

- [ ] **Step 3: Define an execution-facing published playbook DTO**

```rust
pub struct PublishedPlaybookDto {
    pub playbook_handle_id: String,
    pub playbook_version_id: String,
    pub title: String,
    pub summary: String,
    pub mode_label: String,
}
```

- [ ] **Step 4: Add a published-playbook catalog route separate from studio routes**

Keep it read-only and execution-facing, for example:

```rust
.route("/api/published-playbooks", get(list_published_playbooks))
```

- [ ] **Step 5: Implement state-level published-only filtering**

Do not synthesize drafts on read. The catalog should only expose already-published versions.

- [ ] **Step 6: Run the new backend test and make it pass**

Run: `cargo test -p decacan-app --test published_playbook_catalog_test -- --nocapture`
Expected: PASS

- [ ] **Step 7: Commit the execution catalog route**

```bash
git add crates/decacan-app/src/api/playbooks.rs crates/decacan-app/src/api/tasks.rs crates/decacan-app/src/dto/playbook.rs crates/decacan-app/src/dto/task.rs crates/decacan-app/src/app/state.rs crates/decacan-app/tests/published_playbook_catalog_test.rs
git commit -m "feat(app): add published playbook execution catalog"
```

### Task 6: Remove Studio Lifecycle Calls From Workspace Launch

**Files:**
- Modify: `apps/workspaces/src/shared/api/catalog.ts`
- Modify: `apps/workspaces/src/shared/api/tasks.ts`
- Modify: `apps/workspaces/src/entities/playbook/types.ts`
- Modify: `apps/workspaces/src/features/launch/LaunchPage.tsx`
- Test: `apps/workspaces/src/test/launch-page.test.tsx`

- [ ] **Step 1: Write a failing launch test that rejects studio lifecycle calls during task start**

Make the test fail if any of these endpoints are called during workspace launch:
- `/api/playbooks/fork`
- `/api/studio/playbooks/:id/draft`
- `/api/studio/playbooks/:id/publish`

And assert the task request is built from published ids.
Also assert preview requests are built from those same published ids rather than `playbook_key`.

```ts
expect(createTaskPreviewRequest).toMatchObject({
  playbook_handle_id: 'pb-1',
  playbook_version_id: 'version-1',
});
expect(createTaskRequest).toMatchObject({
  playbook_handle_id: 'pb-1',
  playbook_version_id: 'version-1',
});
```

- [ ] **Step 2: Run the focused launch test to verify it fails**

Run: `pnpm -C apps/workspaces exec vitest run src/test/launch-page.test.tsx`
Expected: FAIL because `LaunchPage` still forks/saves/publishes.

- [ ] **Step 3: Replace launch catalog reads with the published execution catalog**

Add a minimal client:

```ts
export function fetchPublishedPlaybooks() {
  return getJson<PublishedPlaybook[]>('/api/published-playbooks');
}
```

Update preview requests to match the same published contract:

```ts
export interface TaskPreviewRequest {
  workspace_id: string;
  playbook_handle_id: string;
  playbook_version_id: string;
  input: string;
}
```

- [ ] **Step 4: Remove fork/save/publish from `handleStart`**

The launch flow should become:
1. choose published playbook
2. preview
3. create task
4. navigate to task route

```ts
const response = await createTask({
  workspace_id: selectedWorkspaceId,
  playbook_handle_id: selectedPlaybook.playbook_handle_id,
  playbook_version_id: selectedPlaybook.playbook_version_id,
  input_payload: goal.trim(),
});
```

The preview path must use the same selected published ids, not a legacy `playbook_key`.

- [ ] **Step 5: Run the focused launch test and make it pass**

Run: `pnpm -C apps/workspaces exec vitest run src/test/launch-page.test.tsx`
Expected: PASS

- [ ] **Step 6: Run the full workspace suite and build**

Run:
```bash
pnpm -C apps/workspaces test
pnpm -C apps/workspaces build
```
Expected: PASS

- [ ] **Step 7: Commit the launch boundary split**

```bash
git add apps/workspaces/src/shared/api/catalog.ts apps/workspaces/src/shared/api/tasks.ts apps/workspaces/src/entities/playbook/types.ts apps/workspaces/src/features/launch/LaunchPage.tsx apps/workspaces/src/test/launch-page.test.tsx
git commit -m "refactor(workspaces): launch tasks from published playbooks only"
```

## Batch D: Console Permissions

### Task 7: Introduce Console Permission Flags In Backend DTOs

**Files:**
- Modify: `crates/decacan-app/src/dto/policy.rs`
- Modify: `crates/decacan-app/src/api/policy.rs`
- Modify: `crates/decacan-app/src/app/state.rs`
- Test: permission-focused backend tests in `crates/decacan-app/tests/`

- [ ] **Step 1: Write a failing backend test for `console.home` vs `studio.playbooks` permissions**

```rust
assert_eq!(json["console_home"], Value::Bool(true));
assert_eq!(json["studio_playbooks"], Value::Bool(false));
```

- [ ] **Step 2: Run the new permission test to verify it fails**

Run: `cargo test -p decacan-app --test console_permissions_test -- --nocapture`
Expected: FAIL because the flags do not exist yet.

- [ ] **Step 3: Extend the existing `/api/me/permissions` contract with explicit Console flags**

Keep the fields small and surface-oriented. Do not expose raw backend role names to the admin shell if a simple boolean contract will do. Extend the existing `UserPermissionsResponseDto` and `get_current_user_permissions()` path instead of adding a second endpoint or duplicate permission source.

- [ ] **Step 4: Run the permission test and make it pass**

Run: `cargo test -p decacan-app --test console_permissions_test -- --nocapture`
Expected: PASS

- [ ] **Step 5: Commit backend permission flags**

```bash
git add crates/decacan-app/src/dto/policy.rs crates/decacan-app/src/api/policy.rs crates/decacan-app/src/app/state.rs crates/decacan-app/tests/console_permissions_test.rs
git commit -m "feat(app): add console surface permission flags"
```

### Task 8: Gate Console Menus And Routes By Permission

**Files:**
- Modify: `apps/admin/src/config/menu.config.tsx`
- Modify: `apps/admin/src/app/routes.tsx`
- Modify: `apps/admin/src/features/auth/auth-context.tsx`
- Modify: `apps/admin/src/features/auth/PermissionGuard.tsx`
- Create tests under `apps/admin/src/test/`

- [ ] **Step 1: Write a failing admin test for normal-user vs studio-user visibility**

```ts
expect(screen.getByText('Console')).toBeInTheDocument();
expect(screen.queryByText('Playbook Studio')).not.toBeInTheDocument();
```

And a complementary privileged-user test where `Playbook Studio` is visible.

- [ ] **Step 2: Run the focused admin permission tests to verify they fail**

Run: `pnpm -C apps/admin exec vitest run src/test/console-permissions.test.tsx`
Expected: FAIL because menu/routes are unconditional.

- [ ] **Step 3: Extend the existing admin auth context and guard**

Avoid scattering permission conditionals across components. Reuse `AuthProvider` and `PermissionGuard` rather than introducing a second permission provider.

```ts
const { canViewConsoleHome, canManagePlaybooks } = useConsolePermissions();
```

- [ ] **Step 4: Gate menu config and routes**

Keep `Console` home visible. Hide or guard `Playbook Studio` routes when permission is absent.

- [ ] **Step 5: Run the focused admin permission tests and make them pass**

Run: `pnpm -C apps/admin exec vitest run src/test/console-permissions.test.tsx`
Expected: PASS

- [ ] **Step 6: Run the existing admin rename suite and build**

Run:
```bash
pnpm -C apps/admin exec vitest run src/test/account-hub-page.test.tsx src/test/menu-config.test.ts src/test/branded-layout.test.tsx src/test/console-permissions.test.tsx
pnpm -C apps/admin build
```
Expected: PASS

- [ ] **Step 7: Commit the Console permission gate**

```bash
git add apps/admin/src/config/menu.config.tsx apps/admin/src/app/routes.tsx apps/admin/src/features/auth/auth-context.tsx apps/admin/src/features/auth/PermissionGuard.tsx apps/admin/src/test
# stage only the permission-related files you changed
git commit -m "feat(admin): gate console studio surfaces by permission"
```

## Final Verification And Handoff

### Task 9: Cross-Batch Verification

**Files:**
- Verify only

- [ ] **Step 1: Run backend verification for the new account and playbook contracts**

Run:
```bash
cargo test -p decacan-app --test account_hub_api_test -- --nocapture
cargo test -p decacan-app --test published_playbook_catalog_test -- --nocapture
cargo test -p decacan-app --test console_permissions_test -- --nocapture
cargo test -p decacan-app --test playbook_studio_api_test -- --nocapture
```
Expected: PASS for all tests that exist by the time this batch completes.

- [ ] **Step 2: Run frontend verification for both surfaces**

Run:
```bash
pnpm -C apps/admin test -- src/test/account-hub-page.test.tsx src/test/menu-config.test.ts src/test/branded-layout.test.tsx src/test/console-permissions.test.tsx
pnpm -C apps/admin build
pnpm -C apps/workspaces test
pnpm -C apps/workspaces build
```
Expected: PASS

- [ ] **Step 3: Manual smoke-check the product boundary**

Run the local stack:
```bash
cargo run -p decacan-app
pnpm dev:admin
pnpm dev:workspaces
```

Then verify:
- `/` in workspaces redirects to the explicit account default workspace
- `Console` shows no server filesystem paths
- workspace launch uses published playbooks without creating drafts/versions on the fly
- studio menus/routes only appear for authorized users

- [ ] **Step 4: Update docs if any endpoint or contract shifted during implementation**

At minimum re-read:
- `README.md`
- `docs/superpowers/specs/2026-04-01-decacan-account-hub-and-workspace-boundaries-design.md`

If implementation diverged from the approved boundary, patch the docs before closing the batch.

- [ ] **Step 5: Inspect the working tree and summarize the merge state**

Run: `git status --short`
Expected: clean, or only intentionally staged docs.

Capture in the handoff:
- commits per batch
- exact tests run
- whether any remaining auth/user scoping is still stubbed versus real
