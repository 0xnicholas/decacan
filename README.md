# Decacan

Decacan is a work orchestration product for teams that need to turn repeatable playbooks into reliable execution.
It helps teams launch work from reusable playbooks, coordinate approvals and deliverables, and track progress from workspace execution to account-level oversight.

**Architecture update (2026-04):** The backend has been migrated from Rust to TypeScript/Node.js.
The orchestration core now lives in `packages/orchestrator` (Hono + Drizzle ORM) and communicates with remote execution engines over HTTP/SSE.
The frontend applications remain in `apps/workspaces` and `apps/console`.

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

### Workspaces Runtime Model

`apps/workspaces` should be treated as a shared execution platform with customer-specific behavior resolved per workspace.

The intended long-term model is:
- each workspace resolves to one runtime `Workspace Profile`
- that profile shapes terminology, home/workbench framing, navigation extensions, specialized views, and assistant posture
- task execution, deliverables, approvals, and task-detail interaction remain platform-owned and shared

This means customer-specific Workspaces should be delivered by binding or adapting a profile, not by forking the Workspaces application.

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
```

```bash
# orchestrator backend API
pnpm dev:orchestrator

# workspaces app (builds @decacan/ui first)
pnpm dev:workspaces

# console app
pnpm dev:console
```

Default local URLs:
- orchestrator API: `http://127.0.0.1:3000`
- `apps/workspaces`: `http://127.0.0.1:5173`
- `apps/console`: `http://localhost:3001`

### Environment Essentials

- `PORT` (orchestrator port, default `3000`)
- `DATABASE_URL` (Postgres connection string, optional — falls back to in-memory store)
- `EXECUTION_ENGINE_URL` (remote engine URL, optional — falls back to mock engine)
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

### Workspace Profile Direction

Workspaces is moving from build-time industry selection toward runtime workspace-profile resolution.

The intended runtime path is:

`workspace -> workspace_profile_id -> backend/API resolution -> frontend runtime rendering`

Implications:
- different workspaces in the same deployment should be able to use different profiles
- build-time industry config is a transitional compatibility layer and local fallback, not the long-term delivery model
- `default-workspace-profile` should remain the required baseline fallback for any workspace that cannot resolve a customer-specific profile

Current repo state:
- the Workspaces product design and delivery docs already use the `Workspace Profile` model
- parts of the frontend still use build-time industry configuration during the migration period

### Backend Layers

| Layer | Package | Responsibility |
|---|---|---|
| API | `packages/orchestrator/src/api` | Hono routers, DTOs, HTTP contracts, app wiring |
| Domain Runtime | `packages/orchestrator/src/runtime` | Playbook lifecycle, task/run workflow, policies, approval/artifact semantics, execution orchestration |
| Infra Adapters | `packages/orchestrator/src/infra` | Remote execution engine client (fetch + SSE), storage adapters |
| Execution Contract | `packages/orchestrator/src/contract` | White-box protocol between Decacan and remote execution engines |
| Database | `packages/orchestrator/src/db` | Drizzle ORM schema, migrations, and Postgres client |

### Execution Model

- The orchestrator exposes REST APIs for workspaces and console to create tasks, launch executions, and track artifacts/approvals.
- **Actual playbook step execution is externalized to a remote execution engine service.**
- The orchestrator communicates with remote engines via the `ExecutionContract` protocol over HTTP + SSE.
- `HttpExecutionEngineClient` is the production adapter implementing `ExecutionEnginePort`.
- If no `EXECUTION_ENGINE_URL` is configured, a mock engine is used for local development.

## Repository Map

```text
packages/
  orchestrator/             # TypeScript orchestration core (Hono + Drizzle)
    src/contract            # ExecutionEvent / ExecutionRequest / PlaybookSnapshot schemas
    src/runtime             # Task/Run state machines, ExecutionCoordinator
    src/infra               # HTTP engine client, mock engine
    src/api                 # Hono routers
    src/db                  # Drizzle ORM schema and migrations
  ui/                       # Shared UI component library
apps/
  workspaces/               # Workspace-scoped execution frontend
  console/                  # Account-level console frontend
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

- Backend: TypeScript, Node.js, Hono, Drizzle ORM, Zod
- Frontend: React 19, React Router 7, Tailwind CSS v4, Vite
- Package/tooling: pnpm workspace
- Agent/Execution: Externalized to remote execution engine project
- Inter-service protocol: `packages/orchestrator/src/contract` (HTTP + SSE)

## Frontend Handoff Config

`apps/workspaces` -> Console link:

- `VITE_CONSOLE_URL`
- fallback: `VITE_ACCOUNT_HUB_URL`
- default: `http://localhost:3001`

`apps/console` -> Workspaces link:

- `VITE_WORKSPACES_APP_URL`
- default: `http://localhost:5173`

### Workspaces Profile Configuration Notes

During the migration to runtime profiles:
- build-time Workspaces industry config remains available for local development and fallback behavior
- runtime customer delivery should target `Workspace Profile` rather than adding new hardcoded industry forks
- the default fallback profile should stay generic and production-usable, not customer-specific

## Workflow and Contribution

1. Branch from `main` for one scoped concern
2. Keep account/workspace API boundaries explicit in contracts and route naming
3. Run verification before review:
   - `pnpm --filter @decacan/orchestrator test`
   - `pnpm --filter @decacan/orchestrator typecheck`
   - `pnpm --filter decacan-workspaces test`
   - `pnpm --filter decacan-console test`
4. Update docs whenever product boundaries, architecture, or API contracts change

## API Route Quick Reference

Current API router source: `packages/orchestrator/src/api/`.

Note:
- the route list below reflects implemented routes in the repo today
- runtime workspace-profile resolution is the target architecture, but the dedicated profile route may still be in the migration path when you read this README

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

### Orchestrator (TypeScript backend)

```bash
pnpm --filter @decacan/orchestrator test
pnpm --filter @decacan/orchestrator typecheck
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

- Architecture/design specs: `docs/architecture.md`
- Learning guide: `docs/learn.md`
- Feature and subsystem specs: `docs/superpowers/specs/`
- Active implementation plans: `docs/superpowers/plans/`
- Historical plans archive: `docs/superpowers/plans/archive/`

Recommended starting points:

1. `docs/learn.md` - Project overview for new team members
2. `docs/architecture.md` - Comprehensive architecture reference
3. `docs/superpowers/specs/2026-03-29-decacan-backend-spec-index.md`
4. `docs/superpowers/specs/2026-04-01-decacan-account-hub-and-workspace-boundaries-design.md`

## Contributing

1. Create a feature branch from `main`
2. Keep changes scoped to one concern
3. Run relevant tests before opening review
4. Update docs when architecture or behavior changes

## License

Apache License 2.0
