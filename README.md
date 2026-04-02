# Decacan

Decacan is a multi-agent work orchestration product for teams that need to turn repeatable playbooks into reliable execution.
It helps teams launch work from reusable playbooks, coordinate approvals and deliverables, and track progress from workspace execution to account-level oversight.

## Who Should Read This README

This README is written for:
- Product managers and project owners defining playbook-driven workflows
- Engineers implementing workspace and account-level product surfaces
- Operators responsible for cross-workspace visibility and execution governance

## Who Decacan Serves

Decacan serves teams that need to:
- Convert repeatable operating procedures into executable playbooks
- Run work reliably within explicit workspace boundaries
- Coordinate approvals and outputs while keeping account-level visibility

## Product Overview

Core product surfaces:
- `apps/workspaces`: the daily execution workspace for running tasks, reviewing outputs, handling approvals, and collaborating with members
- `apps/console`: the account hub for cross-workspace visibility, operational routing, and playbook lifecycle operations

Product boundary rule:
- Design and publish reusable playbooks in Console
- Instantiate and execute work inside Workspaces
- Track cross-workspace workload from account-level views without duplicating workspace detail flows

### Non-goals / Out of Scope

- `apps/console` is not a second workspace detail shell; it should not replicate full task-detail execution UX.
- `apps/workspaces` is not the global account dashboard; cross-workspace aggregation belongs to Console.
- Playbook authoring lifecycle (design/edit/publish) does not run inside Workspaces.
- Workspace-specific execution decisions (task instructions, deliverable review flow, member operations) should not be driven from account-level pages.

### Boundary Decision Table

| Scenario | Primary Surface | Why |
|---|---|---|
| Cross-workspace "what needs my attention" | `apps/console` | Account-level aggregation and routing |
| Launch task in a specific workspace | `apps/workspaces` | Requires concrete workspace context and local inputs |
| Task detail execution (timeline, instructions, artifacts) | `apps/workspaces` | Execution supervision belongs to workspace runtime context |
| Deliverable review for a workspace task | `apps/workspaces` | Decision is tied to workspace task ownership |
| Member invite/role changes for a workspace | `apps/workspaces` | Workspace-scoped permission and accountability |
| Playbook design/edit/version/publish | `apps/console` | Centralized reusable asset lifecycle |
| Navigate to another workspace from account perspective | `apps/console` | Cross-workspace switching and account orchestration |
| Global account workload summary | `apps/console` | Not tied to one workspace boundary |

## R&D Collaboration Quickstart

### Team Roles

- Product: define playbook intent, approval rules, success criteria
- Workspaces frontend: workspace-scoped UX for launch, task detail, deliverables, approvals, members, activity
- Console frontend: account-scoped aggregation and playbook operations
- Backend/API: account + workspace route boundaries, DTO contracts, auth/policy enforcement

### Start Here

```bash
pnpm install
cargo check --workspace
```

```bash
# backend API
cargo run -p decacan-app

# workspaces app (builds @decacan/ui first)
pnpm dev:workspaces

# console app
pnpm dev:console
```

Default local URLs:
- backend API: `http://127.0.0.1:3000`
- `apps/workspaces`: `http://127.0.0.1:5173`
- `apps/console`: `http://localhost:3001`

### Environment Essentials

- `DECACAN_APP_PORT` (backend port, default `3000`)
- `DECACAN_PROFILE`
- `DECACAN_POSTGRES_URL`
- `DECACAN_OPENAI_API_KEY`
- `DECACAN_ANTHROPIC_API_KEY`
- `JWT_SECRET` (required for non-test/production auth boot paths)

Copy template:

```bash
cp .env.example .env
```

## Architecture Snapshot (Current Repo)

### Runtime Boundaries

- Workspace surface stays inside a single workspace context.
- Console surface is account-first and can route users across workspaces.
- Backend APIs expose both account and workspace routes, for example:
  - account: `/api/account/home`
  - workspace: `/api/workspaces/:workspace_id/...`

### Backend Layers

| Layer | Crate | Responsibility |
|---|---|---|
| API | `crates/decacan-app` | Axum routers, DTOs, HTTP contracts, app wiring |
| Domain Runtime | `crates/decacan-runtime` | Playbook lifecycle, task/run workflow, policies, team execution, artifacts |
| Infra Adapters | `crates/decacan-infra` | Model providers/router, storage adapters, config/secrets/logging utilities |
| Auth | `crates/decacan-auth` | Auth service, token/session flow, storage adapter |

## Repository Map

```text
crates/
  decacan-app/
  decacan-runtime/
  decacan-infra/
  decacan-auth/
apps/
  workspaces/
  console/
packages/
  ui/
config/
  default.yaml
  dev.yaml
docs/
  superpowers/
    specs/
    plans/
    plans/archive/
```

## Tech Stack

- Backend: Rust, Axum, Tokio, SQLx, Serde, Tracing
- Frontend: React 19, React Router 7, Tailwind CSS v4, Vite
- Package/tooling: Cargo, pnpm workspace
- Model providers (current infra router): OpenAI + Anthropic

## Frontend Handoff Config

`apps/workspaces` -> Console link:

- `VITE_CONSOLE_URL`
- fallback: `VITE_ACCOUNT_HUB_URL`
- default: `http://localhost:3001`

`apps/console` -> Workspaces link:

- `VITE_WORKSPACES_APP_URL`
- default: `http://localhost:5173`

## Workflow and Contribution

1. Branch from `main` for one scoped concern
2. Keep account/workspace API boundaries explicit in contracts and route naming
3. Run verification before review:
   - `cargo test --workspace`
   - `cargo clippy --workspace -- -D warnings`
   - `cargo fmt --check`
   - `pnpm --filter decacan-workspaces test`
   - `pnpm --filter decacan-console test`
4. Update docs whenever product boundaries, architecture, or API contracts change

## API Route Quick Reference

Current API router source: `crates/decacan-app/src/api/`.

### Top 20 Most Used

- `GET /api/account/home`
- `GET /api/workspaces`
- `GET /api/workspaces/:workspace_id/home`
- `GET /api/workspaces/:workspace_id/tasks`
- `GET /api/workspaces/:workspace_id/tasks/:task_id`
- `GET /api/workspaces/:workspace_id/tasks/:task_id/events/stream`
- `POST /api/workspaces/:workspace_id/tasks/:task_id/instructions`
- `GET /api/workspaces/:workspace_id/deliverables`
- `GET /api/workspaces/:workspace_id/deliverables/:deliverable_id`
- `POST /api/workspaces/:workspace_id/deliverables/:deliverable_id/review`
- `GET /api/workspaces/:workspace_id/approvals`
- `POST /api/workspaces/:workspace_id/approvals/:approval_id/decision`
- `GET /api/workspaces/:workspace_id/members`
- `POST /api/workspaces/:workspace_id/members`
- `PUT /api/workspaces/:workspace_id/members/:member_id`
- `DELETE /api/workspaces/:workspace_id/members/:member_id`
- `GET /api/playbooks`
- `POST /api/tasks`
- `GET /api/tasks/:task_id`
- `POST /auth/login`

### Full Route List

<details>
<summary>Expand full API list</summary>

Account scope:
- `GET /api/account/home`
- `GET /api/inbox`
- `GET /api/me/tasks`
- `GET /api/me/permissions`
- `GET /api/permissions/check`
- `GET /api/roles/:role/permissions`

Workspace scope:
- `GET /api/workspaces`
- `GET /api/workspaces/:workspace_id/home`
- `GET /api/workspaces/:workspace_id/tasks`
- `GET /api/workspaces/:workspace_id/tasks/:task_id`
- `GET /api/workspaces/:workspace_id/tasks/:task_id/events/stream`
- `POST /api/workspaces/:workspace_id/tasks/:task_id/instructions`
- `GET /api/workspaces/:workspace_id/deliverables`
- `GET /api/workspaces/:workspace_id/deliverables/:deliverable_id`
- `POST /api/workspaces/:workspace_id/deliverables/:deliverable_id/review`
- `GET /api/workspaces/:workspace_id/approvals`
- `POST /api/workspaces/:workspace_id/approvals/:approval_id/decision`
- `GET /api/workspaces/:workspace_id/members`
- `POST /api/workspaces/:workspace_id/members`
- `PUT /api/workspaces/:workspace_id/members/:member_id`
- `DELETE /api/workspaces/:workspace_id/members/:member_id`

Playbook and team:
- `GET/POST /api/playbooks`
- `GET/PUT/DELETE /api/playbooks/:handle_id`
- `PUT /api/playbooks/:handle_id/draft`
- `POST /api/playbooks/:handle_id/publish`
- `POST /api/playbooks/fork`
- `GET /api/playbook-store`
- `GET /api/published-playbooks`
- `GET/POST /api/studio/playbooks`
- `GET/PUT/DELETE /api/studio/playbooks/:handle_id`
- `PUT /api/studio/playbooks/:handle_id/draft`
- `POST /api/studio/playbooks/:handle_id/publish`
- `GET/POST /api/teams`
- `GET/PUT/DELETE /api/teams/:team_id`

Task/approval/artifact/trace:
- `GET/POST /api/tasks`
- `GET /api/tasks/:task_id`
- `POST /api/tasks/:task_id/retry`
- `POST /api/tasks/:task_id/instructions`
- `GET /api/tasks/:task_id/events`
- `GET /api/tasks/:task_id/events/stream`
- `POST /api/tasks/:task_id/approvals`
- `GET /api/approvals/:approval_id`
- `POST /api/approvals/:approval_id/decision`
- `GET /api/artifacts/:artifact_id`
- `GET /api/artifacts/:artifact_id/content`
- `GET /api/tasks/:task_id/trace`
- `GET /api/tasks/:task_id/attribution`
- `GET /api/playbooks/:handle_id/versions/:version_id/stats`

Auth (non-`/api` prefix):
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

</details>

## Testing and Verification

### Rust

```bash
cargo test --workspace
cargo clippy --workspace -- -D warnings
cargo fmt --check
```

### Frontend

```bash
pnpm --filter decacan-workspaces test
pnpm --filter decacan-console test
```

## Troubleshooting

### Port in use (5173 / 3001)

```bash
lsof -ti tcp:5173 | xargs kill -9
lsof -ti tcp:3001 | xargs kill -9
```

### `@decacan/ui` import resolution failures in workspaces dev

`dev:workspaces` already builds `@decacan/ui` before Vite startup. If issues persist:

```bash
pnpm install
pnpm --filter @decacan/ui build
pnpm dev:workspaces
```

## Documentation Map

- Architecture/design specs: `docs/superpowers/specs/`
- Active implementation plans: `docs/superpowers/plans/`
- Historical plans archive: `docs/superpowers/plans/archive/`

Recommended starting points:

1. `docs/superpowers/specs/2026-03-29-decacan-backend-spec-index.md`
2. `docs/superpowers/specs/2026-04-01-decacan-account-hub-and-workspace-boundaries-design.md`

## Contributing

1. Create a feature branch from `main`
2. Keep changes scoped to one concern
3. Run relevant tests before opening review
4. Update docs when architecture or behavior changes

## License

Apache License 2.0
