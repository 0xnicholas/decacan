# Decacan

Decacan is a multi-agent work orchestration product for teams that need to turn repeatable playbooks into reliable execution.
It helps teams launch work from reusable playbooks, coordinate approvals and deliverables, and track progress from workspace execution to account-level oversight.

Product surfaces:
- `apps/workspaces`: the daily execution workspace for running tasks, reviewing outputs, handling approvals, and collaborating with members
- `apps/console`: the account hub for cross-workspace visibility, operational routing, and playbook lifecycle operations

Decacan is an agent-driven execution platform with a Rust backend and two React product surfaces:

- `apps/workspaces`: workspace-scoped execution (tasks, deliverables, approvals, members, activity)
- `apps/console`: account-scoped hub (cross-workspace aggregation + playbook operations)

## Architecture (Current Repo)

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

## Project Structure

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

## Getting Started

### Prerequisites

- Rust (with Cargo)
- Node.js 20+
- pnpm 10+
- PostgreSQL 15+ (for DB-backed flows)

### Install

```bash
pnpm install
cargo check --workspace
```

### Environment

Copy and edit:

```bash
cp .env.example .env
```

Common variables used by current code and configs:

- `DECACAN_APP_PORT` (backend port, default `3000`)
- `DECACAN_PROFILE`
- `DECACAN_POSTGRES_URL`
- `DECACAN_OPENAI_API_KEY`
- `DECACAN_ANTHROPIC_API_KEY`
- `JWT_SECRET` (required for non-test/production auth boot paths)

## Run

### Backend

```bash
# optional: run SQL migrations if using PostgreSQL storage paths
sqlx migrate run

# start API server (defaults to 127.0.0.1:3000)
cargo run -p decacan-app
```

### Frontend

```bash
# workspaces dev (builds @decacan/ui first, then starts app)
pnpm dev:workspaces

# console dev
pnpm dev:console
```

Default local URLs:

- `apps/workspaces`: `http://127.0.0.1:5173`
- `apps/console`: `http://localhost:3001`
- backend API: `http://127.0.0.1:3000`

## Frontend Handoff Config

`apps/workspaces` -> Console link:

- `VITE_CONSOLE_URL`
- fallback: `VITE_ACCOUNT_HUB_URL`
- default: `http://localhost:3001`

`apps/console` -> Workspaces link:

- `VITE_WORKSPACES_APP_URL`
- default: `http://localhost:5173`

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
