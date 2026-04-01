# Decacan

Decacan is an agent-driven automation platform that manages end-to-end playbook lifecycles (store → draft → publish → versioned task execution) while keeping runtime behavior deterministic via built-in playbooks and single-path compilation. The repository contains the backend runtime (`crates/decacan-runtime`), the Axum-based app server (`crates/decacan-app`), the infra helpers (`crates/decacan-infra`), and the frontend applications.

## Structure

### Backend
- `crates/decacan-runtime`: core domain logic, playbook lifecycle, workflow compilation, task/run state machine, and policy/tools gates.
- `crates/decacan-app`: product-facing API server, DTOs, Axum routers, user workflow for playbooks/tasks, plus in-memory state used in smoke tests.
- `crates/decacan-infra`: supporting adapters (filesystem, storage, clock) and shared utilities.

### Frontend
- `apps/workspaces`: Main workbench application for task execution and workspace management (React 19, Tailwind v4, React Router v7).
- `apps/admin`: Admin dashboard for system management (React 19, Tailwind v4, shadcn/ui).

### Documentation
- `docs/`: architecture/specs/plans captured during prototyping.

## Getting started

### Backend
```sh
cargo test --workspace            # run full backend+app test suite
cargo test -p decacan-app -- --nocapture    # API smoke tests
cargo test -p decacan-runtime -- --nocapture # runtime-focused suites
cargo run -p decacan-app          # launch app server
```

### Frontend
```sh
# Install dependencies
pnpm install

# Run workspaces app
pnpm dev:workspaces

# Run admin app  
pnpm dev:admin

# Build all apps
pnpm build
```

## How to continue

1. Explore `docs/superpowers/plans/` for the ongoing implementation plan (recent files already target the playbook lifecycle).
2. Branch from `main` when picking up additional phases so the plan history stays clean.
3. Run the existing smoke suite (`crates/decacan-app/tests/http_smoke.rs`) before pushing major API changes.
