# Customer Workspace Profile Runtime Support Implementation Plan

> **架构更新（2026-04-16）**：项目已全面迁移至 TypeScript/Node.js，后端核心位于 `packages/orchestrator`。本文档中的 Rust/crates 相关实现细节为历史记录，当前技术栈为 Hono + Drizzle ORM + Zod。


> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **注意:** 本计划中的代码示例需要从 Rust 转换为 TypeScript 实现。核心逻辑和架构保持不变，仅变更语言实现。

**Goal:** Build runtime workspace-profile support so customer-specific workspace behavior is bound per workspace instead of selected by build-time industry env, while also adding the delivery artifacts needed for support-led onboarding.

**Architecture:** Introduce a shared `WorkspaceProfile` contract in the backend and frontend, bind each workspace to a profile id, expose profile-aware API payloads from `decacan-app`, and replace the frontend's build-time industry selection with workspace-scoped profile loading plus a fallback path for local/default use. Keep the first implementation intentionally narrow: profile terminology, home/workbench settings, nav extensions, specialized page bindings, and assistant framing are runtime-configurable; task execution internals remain shared.

**Tech Stack:** TypeScript (Hono, Drizzle ORM, Zod), React 19, React Router 7, TypeScript, Vitest, Testing Library

---

## Design Freeze Alignment

This plan exists to satisfy the runtime side of the Workspaces design freeze checklist defined in [2026-04-02-decacan-workspaces-workbench-design.md](/Users/nicholasl/Documents/build-whatever/decacan/docs/superpowers/specs/2026-04-02-decacan-workspaces-workbench-design.md).

The implementation should explicitly preserve these product decisions:

1. `Workspace Profile` is the primary runtime unit for customer-specific Workspaces.
2. Profile customization is limited to terminology, home/workbench composition, navigation extensions, domain presentation rules, specialized views, and assistant framing.
3. Build-time `industry` configuration remains a migration layer and fallback path, not the long-term delivery model.
4. Support-led customer delivery should resolve to `Create Customer Workspace Profile`, not custom frontend forks.
5. Runtime acceptance must prove default-profile fallback and core-route safety.

### Required Runtime Acceptance Targets

The implementation is not complete until the following are demonstrably true:

- every workspace resolves to exactly one runtime profile
- if no explicit binding exists, the workspace resolves to `default-workspace-profile`
- if a bound profile id cannot be resolved, the workspace still falls back to `default-workspace-profile`
- all core workspace sections remain usable under the default profile
- specialized routes remain optional enhancement layers
- a customer-specific workspace can be delivered by reusing or adapting a profile rather than rewriting the Workspaces application

### Non-Goals For This Plan

This plan does not introduce:

- a generalized page-builder system
- profile-controlled task execution internals
- arbitrary customer-specific code injection
- a requirement to remove build-time industry support in the same change

---

## File Structure Map

### Backend runtime profile model

- Create: `crates/decacan-runtime/src/workspace/entity/profile.rs`
  Runtime entity types for workspace profiles and resolved route/home/assistant metadata.
- Modify: `crates/decacan-runtime/src/workspace/entity/mod.rs`
  Export the new profile module.
- Modify: `crates/decacan-runtime/src/workspace/entity/workspace.rs`
  Bind a workspace to a `workspace_profile_id`.
- Modify: `crates/decacan-runtime/tests/workspace_entity.rs`
  Cover profile binding defaults and serialization.
- Modify: `crates/decacan-runtime/tests/workspace_service.rs`
  Cover workspace creation and retrieval with profile ids.

### App state and API contracts

- Create: `crates/decacan-app/src/dto/workspace_profile.rs`
  API DTOs for the runtime workspace profile.
- Modify: `crates/decacan-app/src/dto/mod.rs`
  Export the new DTOs.
- Modify: `crates/decacan-app/src/dto/workspace.rs`
  Add profile-aware home payload fields.
- Modify: `crates/decacan-app/src/dto/account.rs`
  Add optional profile summary to account-visible workspaces when needed.
- Create: `crates/decacan-app/src/api/workspace_profiles.rs`
  Route handler for `GET /api/workspaces/:workspace_id/profile`.
- Modify: `crates/decacan-app/src/api/mod.rs`
  Register the new router.
- Modify: `crates/decacan-app/src/api/workspaces.rs`
  Keep `/home` profile-aware and share resolution logic.
- Modify: `crates/decacan-app/src/api/workspace_home_builder.rs`
  Replace stub-only home shaping with profile-informed shaping.
- Modify: `crates/decacan-app/src/app/state.rs`
  Seed profile registry and store workspace catalog records with their optional bound profile ids in one place, then expose lookup helpers from that single source of truth.
- Create: `crates/decacan-app/tests/workspace_profile_api_test.rs`
  Focused API coverage for profile lookup and home payload enrichment.
- Modify: `crates/decacan-app/tests/account_hub_api_test.rs`
  Verify account workspace summaries stay compatible.
- Modify: `crates/decacan-app/tests/assistant_api_integration_test.rs`
  Verify workspace home still exposes assistant session data alongside profile data.
- Modify: `crates/decacan-app/tests/http_smoke.rs`
  Cover the new profile route and profile-aware home response.

### Frontend workspace-scoped profile consumption

- Create: `apps/workspaces/src/entities/workspace-profile/types.ts`
  Frontend profile contract and normalized route/nav/home profile types.
- Create: `apps/workspaces/src/shared/api/workspace-profile.ts`
  Fetch `GET /api/workspaces/:workspaceId/profile`.
- Create: `apps/workspaces/src/shared/profile/WorkspaceProfileContext.tsx`
  Workspace-scoped runtime profile provider and hooks.
- Modify: `apps/workspaces/src/app/providers/index.ts`
  Re-export the new provider/hooks while keeping the existing exports available during transition.
- Modify: `apps/workspaces/src/app/providers/IndustryProvider.tsx`
  Downgrade to fallback/default profile loading instead of being the primary runtime source, while keeping `useIndustryConfig` and `useTerminology` compatible for existing consumers.
- Modify: `apps/workspaces/src/main.tsx`
  Wrap the app with the runtime profile provider.
- Modify: `apps/workspaces/src/shared/layout/WorkspaceShell.tsx`
  Resolve the active workspace profile and pass it into shell/navigation behavior.
- Modify: `apps/workspaces/src/shared/layout/WorkspaceNav.tsx`
  Render profile-aware extension navigation instead of only fixed sections.
- Modify: `apps/workspaces/src/entities/workspace/routeModel.ts`
  Support extension routes without losing the core route model.
- Modify: `apps/workspaces/src/core/router/IndustryAwareRouter.tsx`
  Read runtime profile route extensions first and use build-time config only as fallback.
- Modify: `apps/workspaces/src/core/router/dynamicLoader.ts`
  Accept runtime variant resolution instead of reading only build-time `VITE_INDUSTRY`.
- Modify: `apps/workspaces/src/entities/workspace-home/types.ts`
  Add resolved profile/home metadata from the backend contract.
- Modify: `apps/workspaces/src/entities/workbench/normalizeWorkspaceHome.ts`
  Normalize backend-provided runtime home/profile values into the workbench model.
- Modify: `apps/workspaces/src/features/workspace-home/base/WorkspaceHomePage.tsx`
  Use runtime profile data instead of env industry assumptions.
- Modify: `apps/workspaces/src/features/workspace-home/base/WorkspaceAssistantDock.tsx`
  Render assistant framing from the resolved runtime profile/home payload.
- Modify: `apps/workspaces/src/shared/layout/TopBar.tsx`
  Render workspace-scoped shell labels from runtime terminology where appropriate.
- Modify: `apps/workspaces/src/test/renderApp.tsx`
  Mount the runtime profile provider in tests.
- Create: `apps/workspaces/src/test/workspace-profile-provider.test.tsx`
  Provider and fallback behavior coverage.
- Modify: `apps/workspaces/src/test/workspace-home-page.test.tsx`
  Verify home renders profile-driven labels and workbench title.
- Modify: `apps/workspaces/src/test/workspace-shell.test.tsx`
  Verify runtime extension navigation appears and routes correctly.

### Delivery workflow support artifacts

- Create: `docs/superpowers/templates/customer-workspace-profile-task-template.md`
  Reusable operator template for `Create Customer Workspace Profile`.
- Modify: `docs/superpowers/specs/2026-04-10-customer-workspace-profile-delivery-design.md`
  Link the implementation artifacts and runtime assumptions.
- Modify: `README.md`
  Update Workspaces architecture notes to describe runtime workspace profiles rather than build-only industries.

---

## Task 1: Add Backend Workspace Profile Entities And Workspace Binding

**Files:**
- Create: `crates/decacan-runtime/src/workspace/entity/profile.rs`
- Modify: `crates/decacan-runtime/src/workspace/entity/mod.rs`
- Modify: `crates/decacan-runtime/src/workspace/entity/workspace.rs`
- Modify: `crates/decacan-runtime/tests/workspace_entity.rs`
- Modify: `crates/decacan-runtime/tests/workspace_service.rs`

- [ ] **Step 1: Write the failing runtime entity tests**

Add focused tests to `crates/decacan-runtime/tests/workspace_entity.rs` and `crates/decacan-runtime/tests/workspace_service.rs` that expect a workspace to carry a profile id and a profile entity to serialize cleanly.

Example assertions to add:

```rust
use decacan_runtime::workspace::entity::profile::WorkspaceProfile;

#[test]
fn workspace_profile_serializes_with_routes_and_labels() {
    let profile = WorkspaceProfile::new_for_test("profile-content-ops")
        .with_workspace_label("Studio")
        .with_extension_route("calendar", "Calendar");

    let json = serde_json::to_string(&profile).unwrap();
    assert!(json.contains("profile-content-ops"));
    assert!(json.contains("Calendar"));
}
```

```rust
#[tokio::test]
async fn create_workspace_persists_workspace_profile_id() {
    let service = WorkspaceService::new();

    let workspace = service
        .create_workspace(CreateWorkspaceInput {
            owner_id: "tenant-1".to_string(),
            slug: "ops".to_string(),
            name: "Ops".to_string(),
            description: None,
            storage_config: StorageConfig::local("/data/ws"),
            visibility: WorkspaceVisibility::Private,
            settings: WorkspaceSettings::default(),
            created_by: "user-1".to_string(),
            workspace_profile_id: "profile-content-ops".to_string(),
        })
        .await
        .unwrap();

    assert_eq!(workspace.workspace_profile_id, "profile-content-ops");
}
```

- [ ] **Step 2: Run the targeted runtime tests to confirm the seam does not exist yet**

Run:

```bash
cargo test -p decacan-runtime workspace_profile -- --nocapture
```

Expected:
- compile failure for missing `profile` module and/or missing `workspace_profile_id`

- [ ] **Step 3: Create the runtime `WorkspaceProfile` entity**

Create `crates/decacan-runtime/src/workspace/entity/profile.rs` with a small, explicit contract.

Example starting structure:

```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct WorkspaceProfile {
    pub id: String,
    pub title: String,
    pub terminology: WorkspaceTerminology,
    pub home: WorkspaceHomeProfile,
    pub navigation: WorkspaceNavigationProfile,
    pub assistant: WorkspaceAssistantProfile,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct WorkspaceTerminology {
    pub workspace: String,
    pub task: String,
    pub deliverable: String,
    pub approval: String,
    pub member: String,
    pub assistant: String,
}
```

Keep the first version intentionally small. Do not try to model every future extension yet.

- [ ] **Step 4: Export the new module**

Update `crates/decacan-runtime/src/workspace/entity/mod.rs`:

```rust
pub mod profile;
pub use profile::WorkspaceProfile;
```

- [ ] **Step 5: Bind a workspace to a runtime profile id**

Modify `crates/decacan-runtime/src/workspace/entity/workspace.rs`:

```rust
pub struct Workspace {
    pub id: String,
    pub owner_id: String,
    pub workspace_profile_id: String,
    pub slug: String,
    pub name: String,
    // ...
}
```

Set a safe default like `"default-workspace-profile"` in `Workspace::new`, and thread the field through `new_with_config`.

- [ ] **Step 6: Extend service input and storage flow**

Modify `CreateWorkspaceInput` in `crates/decacan-runtime/src/workspace/service/workspace_service.rs`:

```rust
pub struct CreateWorkspaceInput {
    pub owner_id: String,
    pub workspace_profile_id: String,
    pub slug: String,
    pub name: String,
    // ...
}
```

Pass the field through to `Workspace::new_with_config`.

- [ ] **Step 7: Run the runtime tests and make them pass**

Run:

```bash
cargo test -p decacan-runtime workspace_entity -- --nocapture
cargo test -p decacan-runtime workspace_service -- --nocapture
```

Expected:
- all updated workspace entity/service tests pass

- [ ] **Step 8: Commit**

```bash
git add crates/decacan-runtime/src/workspace/entity/mod.rs \
        crates/decacan-runtime/src/workspace/entity/profile.rs \
        crates/decacan-runtime/src/workspace/entity/workspace.rs \
        crates/decacan-runtime/src/workspace/service/workspace_service.rs \
        crates/decacan-runtime/tests/workspace_entity.rs \
        crates/decacan-runtime/tests/workspace_service.rs
git commit -m "feat(workspace): add runtime workspace profile binding"
```

---

## Task 2: Expose Workspace Profiles Through App State And API Contracts

**Files:**
- Create: `crates/decacan-app/src/dto/workspace_profile.rs`
- Modify: `crates/decacan-app/src/dto/mod.rs`
- Modify: `crates/decacan-app/src/dto/workspace.rs`
- Modify: `crates/decacan-app/src/dto/account.rs`
- Create: `crates/decacan-app/src/api/workspace_profiles.rs`
- Modify: `crates/decacan-app/src/api/mod.rs`
- Modify: `crates/decacan-app/src/api/workspaces.rs`
- Modify: `crates/decacan-app/src/api/workspace_home_builder.rs`
- Modify: `crates/decacan-app/src/app/state.rs`
- Create: `crates/decacan-app/tests/workspace_profile_api_test.rs`
- Modify: `crates/decacan-app/tests/account_hub_api_test.rs`
- Modify: `crates/decacan-app/tests/assistant_api_integration_test.rs`
- Modify: `crates/decacan-app/tests/http_smoke.rs`

- [ ] **Step 1: Write the failing API tests**

Create `crates/decacan-app/tests/workspace_profile_api_test.rs` with focused route coverage.

Example test shape:

```rust
#[tokio::test]
async fn workspace_profile_route_returns_bound_profile() {
    let app = decacan_app::app::wiring::router_for_test();

    let response = app
        .oneshot(
            Request::builder()
                .method("GET")
                .uri("/api/workspaces/workspace-1/profile")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);
}
```

Also extend `assistant_api_integration_test.rs` and `http_smoke.rs` to expect profile metadata on `/api/workspaces/workspace-1/home`.

Also add fallback coverage for:
- a workspace with no explicit profile binding
- a workspace with a broken profile binding that must resolve to `default-workspace-profile`

- [ ] **Step 2: Run the targeted app tests to confirm the route and DTOs do not exist yet**

Run:

```bash
cargo test -p decacan-app workspace_profile_api_test -- --nocapture
```

Expected:
- compile failure for missing DTOs and/or missing `/profile` route

- [ ] **Step 3: Add API DTOs for the runtime profile**

Create `crates/decacan-app/src/dto/workspace_profile.rs`.

Use a narrow DTO set like:

```rust
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct WorkspaceProfileDto {
    pub id: String,
    pub title: String,
    pub terminology: WorkspaceTerminologyDto,
    pub navigation: WorkspaceNavigationDto,
    pub home: WorkspaceHomeProfileDto,
    pub assistant: WorkspaceAssistantProfileDto,
}
```

- [ ] **Step 4: Export the new DTOs**

Update `crates/decacan-app/src/dto/mod.rs`:

```rust
mod workspace_profile;
pub use workspace_profile::WorkspaceProfileDto;
```

- [ ] **Step 5: Extend workspace home/account DTOs with profile-aware fields**

Modify `crates/decacan-app/src/dto/workspace.rs` so `WorkspaceHomeDto` can carry resolved home/profile metadata:

```rust
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct WorkspaceHomeDto {
    pub attention: Vec<WorkspaceHomeAttentionItemDto>,
    pub task_health: WorkspaceTaskHealthDto,
    pub activity: Vec<ActivityDto>,
    pub deliverables: Vec<WorkspaceDeliverableDto>,
    pub team_snapshot: Vec<MemberDto>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub profile: Option<WorkspaceProfileDto>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub assistant_session: Option<AssistantSessionSummaryDto>,
}
```

Only add fields needed by the frontend plan. Avoid duplicating the full profile in multiple shapes unless it prevents extra fetches.

- [ ] **Step 6: Seed profile registry and a single workspace-profile binding source in app state**

Modify `crates/decacan-app/src/app/state.rs` to hold:

```rust
workspace_profiles: HashMap<String, WorkspaceProfileDto>,
workspaces: Vec<StoredWorkspaceRecord>,
```

Add helpers such as:

```rust
pub fn workspace_profile_for(&self, workspace_id: &str) -> Option<WorkspaceProfileDto>
pub fn workspace_profile_id_for(&self, workspace_id: &str) -> Option<String>
```

Where `StoredWorkspaceRecord` is an internal app-state type that keeps the public `WorkspaceDto` plus an optional bound `workspace_profile_id`.

Do not introduce a second independent binding map if the workspace catalog itself can own the binding.

Seed a few realistic profiles in `new_for_test` and `new_for_test_with_workspaces`.

Always seed `default-workspace-profile` as a required baseline profile.

- [ ] **Step 7: Add the `/api/workspaces/:workspace_id/profile` route**

Create `crates/decacan-app/src/api/workspace_profiles.rs` and register it in `crates/decacan-app/src/api/mod.rs`.

The handler should:
- validate the workspace exists
- resolve the bound profile when present
- fall back to `default-workspace-profile` if binding is missing
- fall back to `default-workspace-profile` if the bound profile id cannot be resolved
- return `404` only when the workspace does not exist

If the default profile itself cannot be resolved, treat that as application misconfiguration and fail loudly instead of returning partial data.

- [ ] **Step 8: Make `/home` profile-aware**

Refactor `crates/decacan-app/src/api/workspace_home_builder.rs` to accept a resolved profile instead of emitting an unconditional stub.

Minimal direction:

```rust
pub fn build_workspace_home(
    workspace_id: &str,
    profile: &WorkspaceProfileDto,
    assistant_session: Option<AssistantSessionSummaryDto>,
) -> WorkspaceHomeDto
```

Keep the metrics and stub collections for now, but drive:
- home title
- terminology labels
- assistant posture
- route labels relevant to home

from the profile.

The `/home` builder must use the same profile resolution path as `/profile`, including default fallback behavior.

- [ ] **Step 9: Run the app tests and make them pass**

Run:

```bash
cargo test -p decacan-app workspace_profile_api_test -- --nocapture
cargo test -p decacan-app account_hub_api_test -- --nocapture
cargo test -p decacan-app assistant_api_integration_test -- --nocapture
cargo test -p decacan-app http_smoke -- --nocapture
```

Expected:
- new profile route passes
- default-profile fallback cases pass
- existing account and assistant tests still pass after DTO changes

- [ ] **Step 10: Commit**

```bash
git add crates/decacan-app/src/api/mod.rs \
        crates/decacan-app/src/api/workspace_home_builder.rs \
        crates/decacan-app/src/api/workspace_profiles.rs \
        crates/decacan-app/src/api/workspaces.rs \
        crates/decacan-app/src/app/state.rs \
        crates/decacan-app/src/dto/account.rs \
        crates/decacan-app/src/dto/mod.rs \
        crates/decacan-app/src/dto/workspace.rs \
        crates/decacan-app/src/dto/workspace_profile.rs \
        crates/decacan-app/tests/account_hub_api_test.rs \
        crates/decacan-app/tests/assistant_api_integration_test.rs \
        crates/decacan-app/tests/http_smoke.rs \
        crates/decacan-app/tests/workspace_profile_api_test.rs
git commit -m "feat(app): expose runtime workspace profiles via api"
```

---

## Task 3: Replace Build-Time Industry Loading With Workspace-Scoped Runtime Profile Loading

**Files:**
- Create: `apps/workspaces/src/entities/workspace-profile/types.ts`
- Create: `apps/workspaces/src/shared/api/workspace-profile.ts`
- Create: `apps/workspaces/src/shared/profile/WorkspaceProfileContext.tsx`
- Modify: `apps/workspaces/src/app/providers/index.ts`
- Modify: `apps/workspaces/src/app/providers/IndustryProvider.tsx`
- Modify: `apps/workspaces/src/main.tsx`
- Modify: `apps/workspaces/src/test/renderApp.tsx`
- Create: `apps/workspaces/src/test/workspace-profile-provider.test.tsx`

- [ ] **Step 1: Write the failing frontend provider tests**

Create `apps/workspaces/src/test/workspace-profile-provider.test.tsx`.

Cover:
- loading a workspace-scoped profile from `/api/workspaces/:workspaceId/profile`
- falling back to the current env/default config if no workspace id is available
- using the resolved default runtime profile if the active workspace has no explicit binding
- exposing terminology to consumers

Example test skeleton:

```ts
it("loads the runtime workspace profile for the current workspace", async () => {
  renderAppAtRoute("/workspaces/workspace-1");
  expect(await screen.findByText("Studio")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the provider test to confirm the new context does not exist yet**

Run:

```bash
pnpm --filter decacan-workspaces test -- src/test/workspace-profile-provider.test.tsx
```

Expected:
- module-not-found or missing provider/hook exports

- [ ] **Step 3: Add frontend workspace profile types**

Create `apps/workspaces/src/entities/workspace-profile/types.ts`.

Start with a close mirror of the API DTO:

```ts
export interface WorkspaceProfile {
  id: string;
  title: string;
  terminology: {
    workspace: string;
    task: string;
    deliverable: string;
    approval: string;
    member: string;
    assistant: string;
  };
  navigation: {
    extension_routes: Array<{
      path: string;
      label: string;
      component: string;
    }>;
  };
}
```

- [ ] **Step 4: Add the profile fetch seam**

Create `apps/workspaces/src/shared/api/workspace-profile.ts`:

```ts
import { getJson } from "./client";
import type { WorkspaceProfile } from "../../entities/workspace-profile/types";

export function fetchWorkspaceProfile(workspaceId: string) {
  return getJson<WorkspaceProfile>(`/api/workspaces/${workspaceId}/profile`);
}
```

- [ ] **Step 5: Create a workspace-scoped profile provider**

Create `apps/workspaces/src/shared/profile/WorkspaceProfileContext.tsx`.

The provider should:
- detect the current workspace id from the router
- fetch the runtime profile when a workspace route is active
- expose fallback config for non-workspace routes
- accept default-profile fallback responses for workspace routes without overriding them with build-time config
- provide `useWorkspaceProfile()` and `useWorkspaceTerminology()` hooks

- [ ] **Step 6: Thread the provider into the app**

Modify:
- `apps/workspaces/src/main.tsx`
- `apps/workspaces/src/app/providers/index.ts`
- `apps/workspaces/src/test/renderApp.tsx`

Keep the old `IndustryProvider` available as fallback/default support for now, but make the new runtime provider the primary source for workspace routes.

- [ ] **Step 7: Narrow `IndustryProvider` to a fallback role**

Modify `apps/workspaces/src/app/providers/IndustryProvider.tsx` so it is no longer the primary resolver for active workspace pages.

Do not delete it yet. Keep it as:
- default profile fallback
- non-workspace route support
- compatibility layer while the rest of the app is migrating

Do not let `IndustryProvider` override a resolved runtime workspace profile.

Also make the compatibility hooks (`useIndustryConfig`, `useTerminology`) resolve runtime profile data first on workspace routes so existing industry-aware pages continue working during the migration.

- [ ] **Step 8: Run the frontend provider tests and make them pass**

Run:

```bash
pnpm --filter decacan-workspaces test -- src/test/workspace-profile-provider.test.tsx
```

Expected:
- provider resolves workspace profile on workspace routes
- provider preserves default-profile fallback on workspace routes
- fallback still works off-workspace

- [ ] **Step 9: Commit**

```bash
git add apps/workspaces/src/app/providers/index.ts \
        apps/workspaces/src/app/providers/IndustryProvider.tsx \
        apps/workspaces/src/entities/workspace-profile/types.ts \
        apps/workspaces/src/main.tsx \
        apps/workspaces/src/shared/api/workspace-profile.ts \
        apps/workspaces/src/shared/profile/WorkspaceProfileContext.tsx \
        apps/workspaces/src/test/renderApp.tsx \
        apps/workspaces/src/test/workspace-profile-provider.test.tsx
git commit -m "feat(workspaces): load workspace profiles at runtime"
```

---

## Task 4: Make Navigation And Home Rendering Profile-Aware

**Files:**
- Modify: `apps/workspaces/src/shared/layout/WorkspaceShell.tsx`
- Modify: `apps/workspaces/src/shared/layout/WorkspaceNav.tsx`
- Modify: `apps/workspaces/src/entities/workspace/routeModel.ts`
- Modify: `apps/workspaces/src/core/router/IndustryAwareRouter.tsx`
- Modify: `apps/workspaces/src/core/router/dynamicLoader.ts`
- Modify: `apps/workspaces/src/entities/workspace-home/types.ts`
- Modify: `apps/workspaces/src/entities/workbench/normalizeWorkspaceHome.ts`
- Modify: `apps/workspaces/src/features/workspace-home/base/WorkspaceHomePage.tsx`
- Modify: `apps/workspaces/src/features/workspace-home/base/WorkspaceAssistantDock.tsx`
- Modify: `apps/workspaces/src/shared/layout/TopBar.tsx`
- Modify: `apps/workspaces/src/test/workspace-home-page.test.tsx`
- Modify: `apps/workspaces/src/test/workspace-shell.test.tsx`

- [ ] **Step 1: Write failing navigation and home tests**

Extend:
- `apps/workspaces/src/test/workspace-home-page.test.tsx`
- `apps/workspaces/src/test/workspace-shell.test.tsx`

Add assertions for:
- profile-driven workbench title
- profile-driven terminology labels
- runtime extension routes appearing in nav
- extension route navigation preserving workspace id
- core navigation remaining available under the default runtime profile
- specialized routes remaining absent when the resolved profile does not define them

Example assertions:

```ts
expect(await screen.findByText("Studio Workbench")).toBeInTheDocument();
expect(screen.getByRole("button", { name: "Calendar" })).toBeInTheDocument();
```

- [ ] **Step 2: Run the targeted tests to confirm the shell and home are not yet profile-aware**

Run:

```bash
pnpm --filter decacan-workspaces test -- src/test/workspace-home-page.test.tsx src/test/workspace-shell.test.tsx
```

Expected:
- current tests fail because nav labels and workbench title remain fixed

- [ ] **Step 3: Extend the route model to support extension items**

Modify `apps/workspaces/src/entities/workspace/routeModel.ts` to distinguish:
- fixed core sections
- profile extension sections

Keep the core model stable:

```ts
export type CoreWorkspaceSection =
  | "home"
  | "tasks"
  | "deliverables"
  | "approvals"
  | "activity"
  | "members";
```

Then add a runtime extension item type rather than forcing new routes into the compile-time union.

- [ ] **Step 4: Make the shell and nav read the active profile**

Modify:
- `WorkspaceShell.tsx`
- `WorkspaceNav.tsx`

The shell should:
- resolve current core section as before
- load extension routes from the runtime profile
- preserve current section when switching workspaces
- always keep the core navigation set available even when the resolved profile is the default fallback

The nav should render:
- fixed core items first
- runtime extension items after them

- [ ] **Step 5: Make the router and dynamic loader prefer runtime extension routes**

Modify:
- `apps/workspaces/src/core/router/IndustryAwareRouter.tsx`
- `apps/workspaces/src/core/router/dynamicLoader.ts`

The runtime route path must no longer depend on a module-level `getIndustryId()` call.

Refactor the loader so a route wrapper can resolve a runtime variant id at render time, for example:

```ts
loadFeatureComponent(featureName, componentName, variantId?: string)
```

Then make the router read extension route definitions from the runtime profile provider first, falling back to env/config only when no runtime workspace profile is available.

Do not remove the existing base fallback. Keep build-time industry loading as the compatibility path, not the primary resolver.

- [ ] **Step 6: Make workspace-home normalization and shell framing profile-aware**

Modify:
- `apps/workspaces/src/entities/workspace-home/types.ts`
- `apps/workspaces/src/entities/workbench/normalizeWorkspaceHome.ts`
- `apps/workspaces/src/features/workspace-home/base/WorkspaceHomePage.tsx`
- `apps/workspaces/src/features/workspace-home/base/WorkspaceAssistantDock.tsx`
- `apps/workspaces/src/shared/layout/TopBar.tsx`

Use backend-provided profile metadata to drive:
- workbench title
- terminology labels
- assistant summary defaults
- assistant title / CTA framing on the home dock
- workspace shell labels that are visible on the home/shell surface
- any profile-aware CTA label

Keep fallback behavior safe if a profile field is absent.

The default runtime profile must render a complete, usable home without requiring any extension routes.

- [ ] **Step 7: Run the targeted shell/home tests and make them pass**

Run:

```bash
pnpm --filter decacan-workspaces test -- src/test/workspace-home-page.test.tsx src/test/workspace-shell.test.tsx
```

Expected:
- home and shell tests pass with runtime profile labels/routes
- default-profile fallback still renders usable core navigation and home content

- [ ] **Step 8: Commit**

```bash
git add apps/workspaces/src/core/router/IndustryAwareRouter.tsx \
        apps/workspaces/src/core/router/dynamicLoader.ts \
        apps/workspaces/src/entities/workbench/normalizeWorkspaceHome.ts \
        apps/workspaces/src/entities/workspace-home/types.ts \
        apps/workspaces/src/entities/workspace/routeModel.ts \
        apps/workspaces/src/features/workspace-home/base/WorkspaceAssistantDock.tsx \
        apps/workspaces/src/features/workspace-home/base/WorkspaceHomePage.tsx \
        apps/workspaces/src/shared/layout/TopBar.tsx \
        apps/workspaces/src/shared/layout/WorkspaceNav.tsx \
        apps/workspaces/src/shared/layout/WorkspaceShell.tsx \
        apps/workspaces/src/test/workspace-home-page.test.tsx \
        apps/workspaces/src/test/workspace-shell.test.tsx
git commit -m "feat(workspaces): render nav and home from runtime workspace profiles"
```

---

## Task 5: Add Operator Workflow Support Artifacts And Final Verification

**Files:**
- Create: `docs/superpowers/templates/customer-workspace-profile-task-template.md`
- Modify: `docs/superpowers/specs/2026-04-10-customer-workspace-profile-delivery-design.md`
- Modify: `README.md`

- [ ] **Step 1: Write the operator template file**

Create `docs/superpowers/templates/customer-workspace-profile-task-template.md` using the SOP task structure.

Minimum content:

```md
# Create Customer Workspace Profile

## Intake
- Customer:
- Workspace ID:
- Delivery Owner:
- Base Profile:

## Profile Definition
- Domain Language:
- Home Modules:
- Navigation:
- Specialized Views:
- Assistant Profile:
- Required Runtime Flows:
```

- [ ] **Step 2: Link the SOP to the implementation artifacts**

Update `docs/superpowers/specs/2026-04-10-customer-workspace-profile-delivery-design.md` so it points to:
- runtime workspace profile support plan
- operator task template location

- [ ] **Step 3: Update the repo README**

Modify `README.md` to describe the new model:
- Workspaces are resolved per workspace profile at runtime
- build-time industry config is fallback/development support, not the long-term primary delivery model

- [ ] **Step 4: Run end-to-end targeted verification**

Run:

```bash
cargo test -p decacan-runtime workspace_entity -- --nocapture
cargo test -p decacan-runtime workspace_service -- --nocapture
cargo test -p decacan-app --test workspace_profile_api_test -- --nocapture
cargo test -p decacan-app --test account_hub_api_test -- --nocapture
cargo test -p decacan-app --test assistant_api_integration_test -- --nocapture
cargo test -p decacan-app --test http_smoke -- --nocapture
pnpm --filter decacan-workspaces test -- src/test/workspace-profile-provider.test.tsx src/test/workspace-home-page.test.tsx src/test/workspace-shell.test.tsx
cargo fmt --check
cargo clippy --workspace -- -D warnings
pnpm --filter decacan-workspaces exec tsc --noEmit
pnpm --filter decacan-workspaces lint
```

Expected:
- runtime tests pass
- app profile route and home DTO tests pass
- frontend provider, shell, and home tests pass
- repo-level formatting and clippy checks pass
- frontend typecheck and lint pass
- explicit default-profile fallback cases pass
- core navigation remains usable when the resolved profile is the default profile
- specialized routes appear only when the resolved profile defines them

- [ ] **Step 5: Commit**

```bash
git add README.md \
        docs/superpowers/specs/2026-04-10-customer-workspace-profile-delivery-design.md \
        docs/superpowers/templates/customer-workspace-profile-task-template.md \
        docs/superpowers/plans/2026-04-10-customer-workspace-profile-runtime-support.md
git commit -m "docs(workspaces): add customer workspace profile delivery artifacts"
```

---

## Notes For The Implementer

- Keep the first runtime profile contract intentionally narrow. Do not attempt a generalized page-builder system in this plan.
- Preserve backward compatibility while migrating away from build-time `VITE_INDUSTRY`.
- Prefer adding one explicit runtime profile route over overloading unrelated endpoints.
- Keep core task, deliverable, approval, and assistant execution behavior shared; only the customer-facing profile layer should change.
- Treat `default-workspace-profile` as a required runtime baseline, not as optional seed data.
- If a required customer need cannot be represented cleanly after Task 4, stop and log it as a reusable platform extension instead of patching it into one profile.
