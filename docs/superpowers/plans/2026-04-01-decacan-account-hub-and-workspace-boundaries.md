# Decacan Account Hub And Workspace Boundaries Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the current dual-frontend product into `workspace-first execution + account-level hub`, with account-scoped APIs in `decacan-app`, an account hub home in `apps/admin`, and a tightened workspace-scoped launch flow in `apps/workspaces`.

**Architecture:** Add one new account aggregation seam in `decacan-app` instead of spreading cross-workspace logic across `/api/inbox`, `/api/me/tasks`, and frontend-only joins. Rebuild `apps/admin` around that account seam while keeping Playbook Studio there as the design/publish surface. Tighten `apps/workspaces` so it assumes a concrete workspace context and links outward to the account hub instead of owning account-scoped pages.

**Tech Stack:** Rust (Axum, Serde, Tokio), TypeScript (React 19, React Router, Zustand), Vitest, Testing Library

---

## File Structure Map

### Backend account aggregation

- Create: `crates/decacan-app/src/dto/account.rs`
  Account hub DTOs that are explicitly user-scoped, not workspace-scoped.
- Create: `crates/decacan-app/src/api/account.rs`
  Axum routes for `/api/account/home`.
- Modify: `crates/decacan-app/src/dto/mod.rs`
  Re-export account DTOs.
- Modify: `crates/decacan-app/src/api/mod.rs`
  Merge the new account router.
- Modify: `crates/decacan-app/src/app/state.rs`
  Add account-home projection helpers that aggregate from existing in-memory tasks, approvals, workspaces, and playbook lists.
- Create: `crates/decacan-app/tests/account_hub_api_test.rs`
  Focused HTTP integration coverage for the new account endpoint.

### Backend playbook studio authoring APIs

- Create: `crates/decacan-app/tests/playbook_studio_api_test.rs`
  Integration coverage for authoring-oriented list/detail/create/publish flows.
- Modify: `crates/decacan-app/src/api/playbooks.rs`
  Add a dedicated studio route family instead of overloading the product-facing playbook list.
- Modify: `crates/decacan-app/src/app/state.rs`
  Expose list/detail helpers over lifecycle playbook handles and drafts.
- Modify: `crates/decacan-app/src/dto/playbook.rs`
  Add studio-oriented DTOs for handle/draft/version summaries.

### Admin account hub surface

- Modify: `apps/admin/package.json`
  Add a `test` script and test dependencies.
- Modify: `apps/admin/vite.config.ts`
  Enable Vitest + jsdom configuration.
- Create: `apps/admin/src/test/setup.ts`
  Testing Library and fetch stubs.
- Create: `apps/admin/src/test/account-hub-page.test.tsx`
  High-value coverage for the account hub homepage.
- Create: `apps/admin/src/shared/api/client.ts`
  Minimal JSON fetch client for admin-side product APIs.
- Create: `apps/admin/src/features/account-hub/types/accountHub.types.ts`
  Account hub page contracts.
- Create: `apps/admin/src/features/account-hub/api/accountHubApi.ts`
  Frontend fetchers for `/api/account/home`.
- Create: `apps/admin/src/features/account-hub/components/AccountSummaryCards.tsx`
  Summary cards for waiting approvals, running work, and recent outputs.
- Create: `apps/admin/src/features/account-hub/components/WorkspaceListPanel.tsx`
  List of recent/available workspaces with entry links.
- Create: `apps/admin/src/features/account-hub/components/WorkQueuePanel.tsx`
  Cross-workspace work items and approvals.
- Create: `apps/admin/src/features/account-hub/components/PlaybookShortcutPanel.tsx`
  Shortcut list for frequently used playbooks and design/publish entry points.
- Modify: `apps/admin/src/features/dashboard/dashboard-page.tsx`
  Replace the placeholder dashboard with the account hub homepage.
- Modify: `apps/admin/src/config/menu.config.tsx`
  Rename “Dashboard” semantics to “Account Hub” while keeping Playbook Studio intact.

### Admin playbook studio integration

- Modify: `apps/admin/src/features/playbook-studio/api/playbookApi.ts`
  Replace mock data with adapters over the real backend playbook lifecycle APIs.
- Modify: `apps/admin/src/features/playbook-studio/stores/playbookStore.ts`
  Fetch/store real handles, drafts, and publish outcomes.
- Modify: `apps/admin/src/features/playbook-studio/types/playbook.types.ts`
  Align admin-side types with backend DTOs.
- Create: `apps/admin/src/test/playbook-studio-api.test.ts`
  Store/API contract coverage for list/create/publish flows.

### Workspace-first tightening

- Modify: `apps/workspaces/src/app/router.tsx`
  Make `/` redirect into the default workspace and add a workspace-scoped launch route.
- Create: `apps/workspaces/src/features/launch/WorkspaceEntryRedirect.tsx`
  Resolve the default workspace and navigate into `/workspaces/:workspaceId`.
- Create: `apps/workspaces/src/test/renderApp.tsx`
  Shared BrowserRouter-aware render helper so route tests exercise `<App />` with the same routing shell as production.
- Modify: `apps/workspaces/src/features/launch/LaunchPage.tsx`
  Support a workspace-scoped mode that hides the global workspace picker.
- Modify: `apps/workspaces/src/shared/layout/WorkspaceShell.tsx`
  Route “New Task” into the current workspace launch flow.
- Modify: `apps/workspaces/src/shared/layout/TopBar.tsx`
  Replace account-scoped placeholders with an explicit account hub entry.
- Create: `apps/workspaces/src/shared/config/accountHub.ts`
  Centralize the account hub URL / handoff behavior.
- Delete: `apps/workspaces/src/features/inbox/InboxPage.tsx`
  Remove the account-scoped inbox page from the workspace app once coverage migrates.
- Delete: `apps/workspaces/src/features/my-work/MyWorkPage.tsx`
  Remove the account-scoped work summary page from the workspace app once coverage migrates.
- Delete: `apps/workspaces/src/shared/api/inbox.ts`
  Remove account-only API client from the workspace app.
- Modify: `apps/workspaces/src/test/launch-page.test.tsx`
  Cover default-workspace redirect + workspace-scoped launch.
- Modify: `apps/workspaces/src/test/workspace-shell.test.tsx`
  Cover the account hub entry in the top bar.
- Delete: `apps/workspaces/src/test/inbox-page.test.tsx`
  Retire workspace-owned inbox coverage.
- Modify: `apps/workspaces/src/test/tasks-page.test.tsx`
  Remove `/me/tasks` assumptions and keep coverage workspace-scoped.

### Docs / configuration

- Modify: `README.md`
  Add any new frontend environment variable needed for linking to the account hub.

---

## Phase 1: Backend Account Aggregation

### Task 1: Add `/api/account/home` as the single account-scoped aggregation endpoint

**Files:**
- Create: `crates/decacan-app/tests/account_hub_api_test.rs`
- Create: `crates/decacan-app/src/dto/account.rs`
- Create: `crates/decacan-app/src/api/account.rs`
- Modify: `crates/decacan-app/src/dto/mod.rs`
- Modify: `crates/decacan-app/src/api/mod.rs`
- Modify: `crates/decacan-app/src/app/state.rs`

- [ ] **Step 1: Write the failing integration test**

Create `crates/decacan-app/tests/account_hub_api_test.rs`:

```rust
use axum::body::Body;
use axum::http::{Request, StatusCode};
use serde_json::Value;
use tower::ServiceExt;

#[tokio::test]
async fn account_home_returns_cross_workspace_work_summary() {
    let app = decacan_app::app::wiring::router_for_test().await;

    let response = app
        .oneshot(
            Request::builder()
                .method("GET")
                .uri("/api/account/home")
                .body(Body::empty())
                .expect("request should build"),
        )
        .await
        .expect("account home route should respond");

    assert_eq!(response.status(), StatusCode::OK);

    let body = axum::body::to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("body should be readable");
    let json: Value = serde_json::from_slice(&body).expect("body should be json");

    assert!(json.get("default_workspace_id").is_some());
    assert!(json["workspaces"].is_array());
    assert!(json["waiting_on_me"].is_array());
    assert!(json["recent_tasks"].is_array());
    assert!(json["playbook_shortcuts"].is_array());
}
```

- [ ] **Step 2: Run the test to confirm the route is missing**

Run:

```bash
cargo test -p decacan-app --test account_hub_api_test account_home_returns_cross_workspace_work_summary -- --nocapture
```

Expected: FAIL with `404` or unresolved route/module errors.

- [ ] **Step 3: Create the account DTOs and route skeleton**

Create `crates/decacan-app/src/dto/account.rs`:

```rust
use serde::Serialize;

use crate::dto::WorkspaceDto;

#[derive(Debug, Clone, Serialize)]
pub struct AccountHomeDto {
    pub default_workspace_id: String,
    pub workspaces: Vec<WorkspaceDto>,
    pub waiting_on_me: Vec<AccountWorkItemDto>,
    pub recent_tasks: Vec<AccountTaskSummaryDto>,
    pub playbook_shortcuts: Vec<AccountPlaybookShortcutDto>,
}

#[derive(Debug, Clone, Serialize)]
pub struct AccountWorkItemDto {
    pub id: String,
    pub workspace_id: String,
    pub task_id: String,
    pub title: String,
    pub kind: String,
    pub status: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct AccountTaskSummaryDto {
    pub id: String,
    pub workspace_id: String,
    pub playbook_key: String,
    pub status: String,
    pub status_summary: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct AccountPlaybookShortcutDto {
    pub playbook_key: String,
    pub title: String,
    pub summary: String,
    pub mode_label: String,
}
```

Create `crates/decacan-app/src/api/account.rs`:

```rust
use axum::extract::State;
use axum::routing::get;
use axum::{Json, Router};

use crate::app::state::AppState;
use crate::dto::AccountHomeDto;

pub(super) fn router() -> Router<AppState> {
    Router::new().route("/api/account/home", get(get_account_home))
}

async fn get_account_home(State(state): State<AppState>) -> Json<AccountHomeDto> {
    Json(state.build_account_home())
}
```

Wire the module in `crates/decacan-app/src/dto/mod.rs` and `crates/decacan-app/src/api/mod.rs`.

- [ ] **Step 4: Implement the account projection in `AppState`**

Add a projection helper in `crates/decacan-app/src/app/state.rs`:

```rust
pub fn build_account_home(&self) -> AccountHomeDto {
    let workspaces = self.workspaces();
    let default_workspace_id = workspaces
        .first()
        .map(|workspace| workspace.id.clone())
        .unwrap_or_default();

    let recent_tasks = self
        .list_tasks()
        .into_iter()
        .map(|task| AccountTaskSummaryDto {
            id: task.id,
            workspace_id: task.workspace_id,
            playbook_key: task.playbook_key,
            status: task.status,
            status_summary: task.status_summary,
        })
        .collect();

    let waiting_on_me = self
        .inner
        .approvals
        .lock()
        .unwrap_or_else(|e| e.into_inner())
        .values()
        .cloned()
        .map(|approval| AccountWorkItemDto {
            id: approval.id,
            workspace_id: approval.workspace_id,
            task_id: approval.task_id,
            title: approval.task_playbook_key,
            kind: "approval".to_owned(),
            status: approval.status,
        })
        .collect();

    let playbook_shortcuts = self
        .playbooks()
        .into_iter()
        .map(|playbook| AccountPlaybookShortcutDto {
            playbook_key: playbook.key,
            title: playbook.title,
            summary: playbook.summary,
            mode_label: playbook.mode_label,
        })
        .collect();

    AccountHomeDto {
        default_workspace_id,
        workspaces,
        waiting_on_me,
        recent_tasks,
        playbook_shortcuts,
    }
}
```

Keep the first iteration simple: reuse existing projections instead of inventing new persistence or auth-derived filtering rules in this task.

- [ ] **Step 5: Run focused and existing app API tests**

Run:

```bash
cargo test -p decacan-app --test account_hub_api_test -- --nocapture
cargo test -p decacan-app --test new_apis_integration_test -- --nocapture
```

Expected: PASS for the new endpoint and no regressions in existing API tests.

- [ ] **Step 6: Commit**

```bash
git add crates/decacan-app/src/api/account.rs crates/decacan-app/src/api/mod.rs crates/decacan-app/src/app/state.rs crates/decacan-app/src/dto/account.rs crates/decacan-app/src/dto/mod.rs crates/decacan-app/tests/account_hub_api_test.rs
git commit -m "feat(app): add account hub aggregation endpoint"
```

---

## Phase 2: Admin As Account Hub

### Task 2: Add a minimal admin test harness so account hub work can be done with TDD

**Files:**
- Modify: `apps/admin/package.json`
- Modify: `apps/admin/vite.config.ts`
- Create: `apps/admin/src/test/setup.ts`
- Create: `apps/admin/src/test/account-hub-page.test.tsx`

- [ ] **Step 1: Add the failing test and test dependencies**

Update `apps/admin/package.json`:

```json
{
  "scripts": {
    "test": "vitest run"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.8",
    "@testing-library/react": "^16.0.1",
    "@testing-library/user-event": "^14.5.2",
    "jsdom": "^25.0.1",
    "vitest": "^2.1.9"
  }
}
```

Create `apps/admin/src/test/account-hub-page.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { beforeEach, vi } from "vitest";

import { DashboardPage } from "@/features/dashboard/dashboard-page";

const fetchMock = vi.fn<typeof fetch>();
vi.stubGlobal("fetch", fetchMock);

describe("DashboardPage", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          default_workspace_id: "workspace-1",
          workspaces: [{ id: "workspace-1", title: "Default Workspace", root_path: "/workspace" }],
          waiting_on_me: [{ id: "approval-1", workspace_id: "workspace-1", task_id: "task-1", title: "Approval needed for Summary", kind: "approval", status: "pending" }],
          recent_tasks: [{ id: "task-1", workspace_id: "workspace-1", playbook_key: "总结资料", status: "running", status_summary: "Summarizing notes" }],
          playbook_shortcuts: [{ playbook_key: "总结资料", title: "Summary", summary: "Create summaries", mode_label: "standard" }]
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      ),
    );
  });

  it("renders account-scoped work summary instead of admin welcome copy", async () => {
    render(<DashboardPage />);

    expect(await screen.findByRole("heading", { name: "My Work" })).toBeInTheDocument();
    expect(screen.getByText("Approval needed for Summary")).toBeInTheDocument();
    expect(screen.getByText("Default Workspace")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to confirm admin does not yet support it**

Run:

```bash
pnpm -C apps/admin test -- src/test/account-hub-page.test.tsx
```

Expected: FAIL because Vitest is not configured and `DashboardPage` still renders placeholder welcome text.

- [ ] **Step 3: Configure Vitest**

Update `apps/admin/vite.config.ts`:

```ts
import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/",
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@decacan/ui": fileURLToPath(new URL("../../packages/ui/dist/index.js", import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 3000,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
  },
});
```

Create `apps/admin/src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 4: Run the test harness again**

Run:

```bash
pnpm -C apps/admin test -- src/test/account-hub-page.test.tsx
```

Expected: FAIL on rendered content, not on missing test tooling.

- [ ] **Step 5: Commit**

```bash
git add apps/admin/package.json apps/admin/vite.config.ts apps/admin/src/test/setup.ts apps/admin/src/test/account-hub-page.test.tsx
git commit -m "test(admin): add account hub page test harness"
```

---

### Task 3: Replace the placeholder dashboard with a real account hub homepage

**Files:**
- Create: `apps/admin/src/shared/api/client.ts`
- Create: `apps/admin/src/features/account-hub/types/accountHub.types.ts`
- Create: `apps/admin/src/features/account-hub/api/accountHubApi.ts`
- Create: `apps/admin/src/features/account-hub/components/AccountSummaryCards.tsx`
- Create: `apps/admin/src/features/account-hub/components/WorkspaceListPanel.tsx`
- Create: `apps/admin/src/features/account-hub/components/WorkQueuePanel.tsx`
- Create: `apps/admin/src/features/account-hub/components/PlaybookShortcutPanel.tsx`
- Modify: `apps/admin/src/features/dashboard/dashboard-page.tsx`
- Modify: `apps/admin/src/config/menu.config.tsx`
- Test: `apps/admin/src/test/account-hub-page.test.tsx`

- [ ] **Step 1: Expand the failing test to lock the account-hub shape**

Add assertions to `apps/admin/src/test/account-hub-page.test.tsx`:

```tsx
expect(screen.getByRole("heading", { name: "Recent Workspaces" })).toBeInTheDocument();
expect(screen.getByRole("heading", { name: "Playbook Shortcuts" })).toBeInTheDocument();
expect(screen.queryByText("Welcome to Decacan Admin")).not.toBeInTheDocument();
```

- [ ] **Step 2: Run the test to confirm the current page still fails**

Run:

```bash
pnpm -C apps/admin test -- src/test/account-hub-page.test.tsx
```

Expected: FAIL on missing headings and legacy placeholder copy.

- [ ] **Step 3: Add the account hub API client and typed page contract**

Create `apps/admin/src/shared/api/client.ts`:

```ts
async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function getJson<T>(path: string): Promise<T> {
  return requestJson<T>(path);
}

export function postJson<TRequest, TResponse>(path: string, body: TRequest): Promise<TResponse> {
  return requestJson<TResponse>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function putJson<TRequest, TResponse>(path: string, body: TRequest): Promise<TResponse> {
  return requestJson<TResponse>(path, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteJson(path: string): Promise<void> {
  await requestJson<void>(path, { method: "DELETE" });
}
```

Create `apps/admin/src/features/account-hub/types/accountHub.types.ts`:

```ts
export interface AccountWorkItem {
  id: string;
  workspace_id: string;
  task_id: string;
  title: string;
  kind: string;
  status: string;
}

export interface AccountTaskSummary {
  id: string;
  workspace_id: string;
  playbook_key: string;
  status: string;
  status_summary: string;
}

export interface AccountPlaybookShortcut {
  playbook_key: string;
  title: string;
  summary: string;
  mode_label: string;
}

export interface AccountHomeData {
  default_workspace_id: string;
  workspaces: { id: string; title: string; root_path: string }[];
  waiting_on_me: AccountWorkItem[];
  recent_tasks: AccountTaskSummary[];
  playbook_shortcuts: AccountPlaybookShortcut[];
}
```

Create `apps/admin/src/features/account-hub/api/accountHubApi.ts`:

```ts
import { getJson } from "@/shared/api/client";
import type { AccountHomeData } from "../types/accountHub.types";

export function fetchAccountHome() {
  return getJson<AccountHomeData>("/api/account/home");
}
```

- [ ] **Step 4: Replace the dashboard placeholder with an account hub homepage**

Implement `apps/admin/src/features/dashboard/dashboard-page.tsx` around the account API:

```tsx
import { useEffect, useState } from "react";

import { fetchAccountHome } from "@/features/account-hub/api/accountHubApi";
import type { AccountHomeData } from "@/features/account-hub/types/accountHub.types";

export function DashboardPage() {
  const [data, setData] = useState<AccountHomeData | null>(null);

  useEffect(() => {
    void fetchAccountHome().then(setData);
  }, []);

  if (!data) {
    return <div className="p-6">Loading account hub...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Work</h1>
        <p className="text-muted-foreground">
          Cross-workspace work summary and playbook operations.
        </p>
      </div>
      <AccountSummaryCards data={data} />
      <WorkQueuePanel items={data.waiting_on_me} tasks={data.recent_tasks} />
      <PlaybookShortcutPanel items={data.playbook_shortcuts} />
      <WorkspaceListPanel workspaces={data.workspaces} />
    </div>
  );
}
```

Update `apps/admin/src/config/menu.config.tsx` to rename the root item to `Account Hub`, not `Dashboard`.

- [ ] **Step 5: Run admin tests and build**

Run:

```bash
pnpm -C apps/admin test -- src/test/account-hub-page.test.tsx
pnpm -C apps/admin build
```

Expected: PASS for the new account hub page test and production build succeeds.

- [ ] **Step 6: Commit**

```bash
git add apps/admin/src/shared/api/client.ts apps/admin/src/features/account-hub apps/admin/src/features/dashboard/dashboard-page.tsx apps/admin/src/config/menu.config.tsx apps/admin/src/test/account-hub-page.test.tsx
git commit -m "feat(admin): replace dashboard with account hub home"
```

---

### Task 4: Add dedicated playbook-studio authoring endpoints to `decacan-app`

**Files:**
- Create: `crates/decacan-app/tests/playbook_studio_api_test.rs`
- Modify: `crates/decacan-app/src/api/playbooks.rs`
- Modify: `crates/decacan-app/src/app/state.rs`
- Modify: `crates/decacan-app/src/dto/playbook.rs`
- Modify: `crates/decacan-app/src/dto/mod.rs`

- [ ] **Step 1: Write the failing studio API test**

Create `crates/decacan-app/tests/playbook_studio_api_test.rs`:

```rust
use axum::body::Body;
use axum::http::{Request, StatusCode};
use serde_json::Value;
use tower::ServiceExt;

#[tokio::test]
async fn studio_playbook_routes_list_and_create_lifecycle_handles() {
    let app = decacan_app::app::wiring::router_for_test().await;

    let create_response = app
        .clone()
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/studio/playbooks")
                .header("content-type", "application/json")
                .body(Body::from(
                    r#"{"title":"Summary Builder","description":"Authoring route","mode":"standard"}"#,
                ))
                .expect("request should build"),
        )
        .await
        .expect("create route should respond");

    assert_eq!(create_response.status(), StatusCode::CREATED);

    let list_response = app
        .oneshot(
            Request::builder()
                .method("GET")
                .uri("/api/studio/playbooks")
                .body(Body::empty())
                .expect("request should build"),
        )
        .await
        .expect("list route should respond");

    assert_eq!(list_response.status(), StatusCode::OK);
    let body = axum::body::to_bytes(list_response.into_body(), usize::MAX)
        .await
        .expect("body should be readable");
    let json: Value = serde_json::from_slice(&body).expect("body should be json");
    assert!(json.as_array().is_some());
}
```

- [ ] **Step 2: Run the test to confirm the route family is missing**

Run:

```bash
cargo test -p decacan-app --test playbook_studio_api_test studio_playbook_routes_list_and_create_lifecycle_handles -- --nocapture
```

Expected: FAIL because `/api/studio/playbooks` is not implemented.

- [ ] **Step 3: Add studio-specific DTOs and route family**

Extend `crates/decacan-app/src/dto/playbook.rs`:

```rust
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PlaybookStudioListItemDto {
    pub handle: PlaybookHandleDto,
    pub draft: PlaybookDraftDto,
    pub latest_version: Option<PlaybookVersionDto>,
    pub publishable: bool,
}
```

Add a dedicated route family in `crates/decacan-app/src/api/playbooks.rs`:

```rust
.route("/api/studio/playbooks", get(list_studio_playbooks).post(create_playbook))
.route(
    "/api/studio/playbooks/:handle_id",
    get(get_playbook).put(update_playbook).delete(delete_playbook),
)
.route("/api/studio/playbooks/:handle_id/draft", put(save_playbook_draft))
.route("/api/studio/playbooks/:handle_id/publish", axum::routing::post(publish_playbook))
```

Use existing lifecycle helpers in `AppState` rather than reimplementing authoring storage.

- [ ] **Step 4: Implement `AppState` list/detail helpers for lifecycle playbooks**

Add helper methods in `crates/decacan-app/src/app/state.rs`:

```rust
pub fn list_studio_playbooks(&self) -> Vec<PlaybookStudioListItemDto> {
    self.inner
        .lifecycle_playbooks
        .lock()
        .unwrap_or_else(|e| e.into_inner())
        .values()
        .cloned()
        .map(|stored| PlaybookStudioListItemDto {
            handle: playbook_handle_to_dto(stored.handle.clone()),
            draft: playbook_draft_to_dto(stored.draft.clone()),
            latest_version: stored.versions.last().cloned().map(playbook_version_to_dto),
            publishable: stored.draft.validation_state == DraftValidationState::Valid,
        })
        .collect()
}
```

- [ ] **Step 5: Run focused backend tests**

Run:

```bash
cargo test -p decacan-app --test playbook_studio_api_test -- --nocapture
cargo test -p decacan-app --test new_apis_integration_test -- --nocapture
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add crates/decacan-app/src/api/playbooks.rs crates/decacan-app/src/app/state.rs crates/decacan-app/src/dto/playbook.rs crates/decacan-app/src/dto/mod.rs crates/decacan-app/tests/playbook_studio_api_test.rs
git commit -m "feat(app): add studio playbook authoring endpoints"
```

---

### Task 5: Replace Playbook Studio mocks with the real playbook lifecycle API

**Files:**
- Create: `apps/admin/src/test/playbook-studio-api.test.ts`
- Modify: `apps/admin/src/features/playbook-studio/api/playbookApi.ts`
- Modify: `apps/admin/src/features/playbook-studio/stores/playbookStore.ts`
- Modify: `apps/admin/src/features/playbook-studio/types/playbook.types.ts`
- Modify: `apps/admin/src/features/playbook-studio/pages/PlaybookListPage.tsx`
- Modify: `apps/admin/src/features/playbook-studio/pages/PlaybookEditPage.tsx`
- Modify: `apps/admin/src/features/playbook-studio/pages/PlaybookCreatePage.tsx`

- [ ] **Step 1: Write the failing admin-side API/store test**

Create `apps/admin/src/test/playbook-studio-api.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

import { playbookApi } from "@/features/playbook-studio/api/playbookApi";

const fetchMock = vi.fn<typeof fetch>();
vi.stubGlobal("fetch", fetchMock);

describe("playbookApi", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("loads real playbooks from the backend instead of mock data", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            handle: { playbook_handle_id: "handle-1", title: "Summary" },
            draft: { draft_id: "draft-1", playbook_handle_id: "handle-1", spec_document: "metadata: {}", validation_state: "valid" },
            latest_version: null,
            publishable: true
          }
        ]),
        { status: 200, headers: { "content-type": "application/json" } }
      )
    );

    const result = await playbookApi.listPlaybooks();
    expect(fetchMock).toHaveBeenCalledWith("/api/studio/playbooks", expect.anything());
    expect(result[0].name).toBe("Summary");
  });
});
```

- [ ] **Step 2: Run the test to confirm the API layer is still mocked**

Run:

```bash
pnpm -C apps/admin test -- src/test/playbook-studio-api.test.ts
```

Expected: FAIL because `playbookApi` returns hard-coded mock data and does not call fetch.

- [ ] **Step 3: Adapt Playbook Studio to the studio-specific backend DTOs**

Update `apps/admin/src/features/playbook-studio/api/playbookApi.ts` to use `shared/api/client.ts` and map backend DTOs:

```ts
import { getJson, postJson, putJson, deleteJson } from "@/shared/api/client";

interface BackendStudioPlaybookDto {
  handle: { playbook_handle_id: string; title: string };
  draft: { draft_id: string; playbook_handle_id: string; spec_document: string; validation_state: string };
  latest_version: { playbook_version_id: string; playbook_handle_id: string; version_number: number } | null;
  publishable: boolean;
}

interface CreatePlaybookRequest {
  title: string;
  description: string;
  mode: string;
}

interface BackendCreatePlaybookResponse {
  handle: BackendStudioPlaybookDto["handle"];
  draft: BackendStudioPlaybookDto["draft"];
}

function toPlaybook(dto: BackendStudioPlaybookDto): Playbook {
  return {
    id: dto.handle.playbook_handle_id,
    name: dto.handle.title,
    description: dto.draft.spec_document,
    version: dto.latest_version ? `v${dto.latest_version.version_number}` : "draft",
    status: dto.latest_version ? "published" : "draft",
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    author: {
      id: "current-user",
      name: "Current User",
      email: "current@example.com",
    },
  };
}

export const playbookApi = {
  async listPlaybooks() {
    return getJson<BackendStudioPlaybookDto[]>("/api/studio/playbooks").then((items) => items.map(toPlaybook));
  },
  async createPlaybook(data: Partial<Playbook>) {
    return postJson<CreatePlaybookRequest, BackendCreatePlaybookResponse>("/api/studio/playbooks", {
      title: data.name ?? "New Playbook",
      description: data.description ?? "",
      mode: "standard",
    }).then((created) => toPlaybook({
      handle: created.handle,
      draft: created.draft,
      latest_version: null,
      publishable: false,
    }));
  },
  // detail / save draft / publish follow /api/studio/playbooks/:handle_id...
};
```

Update the store to stop fabricating in-memory entries and instead delegate to `playbookApi`.

- [ ] **Step 4: Run the test and verify the list/create path**

Run:

```bash
pnpm -C apps/admin test -- src/test/playbook-studio-api.test.ts
pnpm -C apps/admin build
```

Expected: PASS for the admin-side API adapter test and build stays green.

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src/features/playbook-studio/api/playbookApi.ts apps/admin/src/features/playbook-studio/stores/playbookStore.ts apps/admin/src/features/playbook-studio/types/playbook.types.ts apps/admin/src/features/playbook-studio/pages/PlaybookListPage.tsx apps/admin/src/features/playbook-studio/pages/PlaybookEditPage.tsx apps/admin/src/features/playbook-studio/pages/PlaybookCreatePage.tsx apps/admin/src/test/playbook-studio-api.test.ts
git commit -m "feat(admin): connect playbook studio to playbook lifecycle api"
```

---

## Phase 3: Tighten `workspaces` As The Execution Surface

### Task 6: Redirect `/` into the default workspace and make task launch workspace-scoped

**Files:**
- Create: `apps/workspaces/src/test/renderApp.tsx`
- Create: `apps/workspaces/src/features/launch/WorkspaceEntryRedirect.tsx`
- Modify: `apps/workspaces/src/app/router.tsx`
- Modify: `apps/workspaces/src/features/launch/LaunchPage.tsx`
- Modify: `apps/workspaces/src/shared/layout/WorkspaceShell.tsx`
- Modify: `apps/workspaces/src/test/launch-page.test.tsx`
- Modify: `apps/workspaces/src/test/workspace-home-page.test.tsx`

- [ ] **Step 1: Add the router-aware test helper and write failing workspace routing tests**

Create `apps/workspaces/src/test/renderApp.tsx`:

```tsx
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

import { App } from "../app/App";

export function renderAppAtRoute(route = "/") {
  window.history.replaceState({}, "", route);

  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  );
}
```

Update `apps/workspaces/src/test/launch-page.test.tsx` to assert the new route shape:

```tsx
it("redirects root into the default workspace home", async () => {
  fetchMock.mockResolvedValue(
    new Response(
      JSON.stringify([{ id: "workspace-1", title: "Default Workspace", root_path: "/workspace" }]),
      { status: 200, headers: { "content-type": "application/json" } }
    )
  );

  renderAppAtRoute("/");

  await waitFor(() => {
    expect(window.location.pathname).toBe("/workspaces/workspace-1");
  });
});
```

Add a second test:

```tsx
it("launches a task from /workspaces/:workspaceId/new-task without showing a workspace picker", async () => {
  renderAppAtRoute("/workspaces/workspace-1/new-task");

  expect(await screen.findByText("Choose a playbook")).toBeInTheDocument();
  expect(screen.queryByLabelText("Select workspace")).not.toBeInTheDocument();
});
```

Also update any route-driven assertions in `apps/workspaces/src/test/workspace-home-page.test.tsx` to use `renderAppAtRoute("/workspaces/workspace-1")` instead of rendering `<App />` without a router wrapper.

- [ ] **Step 2: Run the focused tests**

Run:

```bash
pnpm -C apps/workspaces test -- src/test/launch-page.test.tsx src/test/workspace-home-page.test.tsx
```

Expected: FAIL because `/` still renders `LaunchPage` and launch still depends on a global workspace picker.

- [ ] **Step 3: Implement the redirect + workspace-scoped launch mode**

Create `apps/workspaces/src/features/launch/WorkspaceEntryRedirect.tsx`:

```tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { fetchWorkspaces } from "../../shared/api/catalog";

export function WorkspaceEntryRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    void fetchWorkspaces().then((workspaces) => {
      const first = workspaces[0];
      if (first) navigate(`/workspaces/${first.id}`, { replace: true });
    });
  }, [navigate]);

  return <p>Loading workspace…</p>;
}
```

Update `apps/workspaces/src/app/router.tsx`:

```tsx
<Route path="/" element={<WorkspaceEntryRedirect />} />
<Route path="/workspaces/:workspaceId/new-task" element={<WorkspaceLaunchWrapper />} />
```

Update `LaunchPage` to accept an optional current workspace:

```tsx
interface LaunchPageProps {
  workspaceId?: string;
}

export function LaunchPage({ workspaceId }: LaunchPageProps) {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(workspaceId ?? null);
  const hideWorkspacePicker = Boolean(workspaceId);

  useEffect(() => {
    if (workspaceId) {
      setSelectedWorkspaceId(workspaceId);
      return;
    }
    // existing fetchWorkspaces flow
  }, [workspaceId]);
}
```

Update `WorkspaceShell` so `onNewTask()` navigates to `/workspaces/${workspaceId}/new-task`.

- [ ] **Step 4: Re-run the workspace tests**

Run:

```bash
pnpm -C apps/workspaces test -- src/test/launch-page.test.tsx src/test/workspace-home-page.test.tsx
```

Expected: PASS on default-workspace redirect and workspace-scoped launch behavior.

- [ ] **Step 5: Commit**

```bash
git add apps/workspaces/src/app/router.tsx apps/workspaces/src/features/launch/WorkspaceEntryRedirect.tsx apps/workspaces/src/features/launch/LaunchPage.tsx apps/workspaces/src/shared/layout/WorkspaceShell.tsx apps/workspaces/src/test/renderApp.tsx apps/workspaces/src/test/launch-page.test.tsx apps/workspaces/src/test/workspace-home-page.test.tsx
git commit -m "feat(workspaces): make root and launch workspace-scoped"
```

---

### Task 7: Remove account-scoped affordances from the workspace app and link to the account hub instead

**Files:**
- Create: `apps/workspaces/src/shared/config/accountHub.ts`
- Modify: `apps/workspaces/src/shared/layout/TopBar.tsx`
- Modify: `apps/workspaces/src/app/router.tsx`
- Modify: `apps/workspaces/src/test/workspace-shell.test.tsx`
- Modify: `apps/workspaces/src/test/tasks-page.test.tsx`
- Delete: `apps/workspaces/src/features/inbox/InboxPage.tsx`
- Delete: `apps/workspaces/src/features/my-work/MyWorkPage.tsx`
- Delete: `apps/workspaces/src/shared/api/inbox.ts`
- Delete: `apps/workspaces/src/test/inbox-page.test.tsx`

- [ ] **Step 1: Write a failing top-bar test for the account hub entry**

Add to `apps/workspaces/src/test/workspace-shell.test.tsx`:

```tsx
it("shows an account hub entry in the top bar", async () => {
  renderAppAtRoute("/workspaces/workspace-1");

  expect(await screen.findByRole("link", { name: "Account Hub" })).toBeInTheDocument();
});
```

Update `apps/workspaces/src/test/tasks-page.test.tsx` to remove `/me/tasks` expectations, switch route-based renders to `renderAppAtRoute("/workspaces/workspace-1/tasks")`, and keep only workspace-scoped task list behavior.

- [ ] **Step 2: Run the focused test set**

Run:

```bash
pnpm -C apps/workspaces test -- src/test/workspace-shell.test.tsx src/test/tasks-page.test.tsx
```

Expected: FAIL because the top bar still shows placeholder `Inbox` and `User` controls and the router still exposes account-scoped routes.

- [ ] **Step 3: Implement the account hub handoff and retire workspace-owned account pages**

Create `apps/workspaces/src/shared/config/accountHub.ts`:

```ts
export const accountHubUrl =
  import.meta.env.VITE_ACCOUNT_HUB_URL ?? "http://localhost:3001";
```

Update `TopBar.tsx`:

```tsx
import { accountHubUrl } from "../config/accountHub";

<a
  href={accountHubUrl}
  className="w-fit px-3.5 py-2 border border-foreground/14 rounded-full bg-surface text-inherit"
>
  Account Hub
</a>
<div className="px-3 py-1.5 border border-foreground/14 rounded-full bg-surface">
  Workspace User
</div>
```

Update `apps/workspaces/src/app/router.tsx` to remove:

```tsx
<Route path="/inbox" element={<InboxPage />} />
<Route path="/me/tasks" element={<MyWorkPage />} />
```

Delete the retired inbox/my-work page files and the now-unused inbox API client.

- [ ] **Step 4: Run the workspace test suite sections that changed**

Run:

```bash
pnpm -C apps/workspaces test -- src/test/workspace-shell.test.tsx src/test/tasks-page.test.tsx src/test/launch-page.test.tsx
```

Expected: PASS for the updated top-bar/navigation expectations.

- [ ] **Step 5: Commit**

```bash
git add apps/workspaces/src/shared/config/accountHub.ts apps/workspaces/src/shared/layout/TopBar.tsx apps/workspaces/src/app/router.tsx apps/workspaces/src/test/workspace-shell.test.tsx apps/workspaces/src/test/tasks-page.test.tsx apps/workspaces/src/test/launch-page.test.tsx
git rm apps/workspaces/src/features/inbox/InboxPage.tsx apps/workspaces/src/features/my-work/MyWorkPage.tsx apps/workspaces/src/shared/api/inbox.ts apps/workspaces/src/test/inbox-page.test.tsx
git commit -m "refactor(workspaces): hand off account-scoped flows to account hub"
```

---

## Phase 4: Verification And Final Doc Alignment

### Task 8: Verify the cross-surface boundary end to end and document any new env handoff

**Files:**
- Modify: `README.md`
- Verify: `crates/decacan-app/tests/account_hub_api_test.rs`
- Verify: `apps/admin/src/test/account-hub-page.test.tsx`
- Verify: `apps/admin/src/test/playbook-studio-api.test.ts`
- Verify: `apps/workspaces/src/test/launch-page.test.tsx`
- Verify: `apps/workspaces/src/test/workspace-shell.test.tsx`

- [ ] **Step 1: Document the account-hub handoff config**

If `VITE_ACCOUNT_HUB_URL` is introduced, add it to the frontend setup section in `README.md`:

```md
# Optional cross-app navigation
VITE_ACCOUNT_HUB_URL=http://localhost:3001
```

- [ ] **Step 2: Run the backend verification**

Run:

```bash
cargo test -p decacan-app --test account_hub_api_test -- --nocapture
cargo test -p decacan-app --test new_apis_integration_test -- --nocapture
```

Expected: PASS.

- [ ] **Step 3: Run the admin verification**

Run:

```bash
pnpm -C apps/admin test
pnpm -C apps/admin build
```

Expected: PASS.

- [ ] **Step 4: Run the workspace verification**

Run:

```bash
pnpm -C apps/workspaces test
pnpm -C apps/workspaces build
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "docs(frontend): document account hub handoff configuration"
```

---

## Notes For Execution

- Do not rename `apps/admin` during this plan. Change semantics first, naming later.
- Keep the first backend aggregation endpoint intentionally thin and projection-based. Do not introduce new persistence abstractions unless the tests force it.
- Do not expand more placeholder admin sections while this plan is in flight. The main goal is boundary convergence, not feature breadth.
- If the workspace and admin apps need separate local origins, centralize the handoff URL in one helper and one README entry only.
