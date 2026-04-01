# Decacan

Decacan is an agent-driven automation platform that manages end-to-end playbook lifecycles while keeping runtime behavior deterministic via built-in playbooks and single-path compilation. The platform supports both single-agent and minimal team execution modes, with full versioning, governance, and artifact management.

## Core Features

### Playbook Lifecycle Management
- **Store & Versioning**: Official playbook store with forking to user handles
- **Draft Editing**: Long-term editable work copies with health validation
- **Publish & Release**: Immutable versions with capability and team snapshots
- **Execution Packages**: Compiled runtime artifacts with bound inputs and policies

### Execution Modes
- **Single Mode**: Traditional single-agent workflow execution
- **Team Mode**: Parallel role group execution with merge aggregation
  - Built-in team specifications (e.g., research-team)
  - Runtime-mediated collaboration (no direct agent communication)
  - Single-level parallel groups with `all_required` completion

### Model Routing
- **Multi-provider Support**: OpenAI and Anthropic with unified interface
- **Automatic Fallback**: Failover chain when providers are unavailable
- **Configurable**: Per-provider API keys, base URLs, timeouts

### Infrastructure
- **Configuration**: Layered config system (default → dev/prod → env → CLI)
- **Secrets Management**: Environment-based secret injection
- **Structured Logging**: JSON format with rotation support
- **PostgreSQL Storage**: Persistent storage with SQLx migrations

## Architecture

Decacan follows a five-layer architecture:

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: Content & Lifecycle                               │
│  Store → Handle → Draft → Version                           │
├─────────────────────────────────────────────────────────────┤
│  Layer 2: Registry & Reference                              │
│  Capability Registry │ TeamSpec Registry │ Validator        │
├─────────────────────────────────────────────────────────────┤
│  Layer 3: Compilation & Execution Preparation               │
│  Runtime Compiler → Execution Package → Policy Resolution   │
├─────────────────────────────────────────────────────────────┤
│  Layer 4: Runtime Execution                                 │
│  Task/Run → Workflow → Tool Gateway → Artifact              │
├─────────────────────────────────────────────────────────────┤
│  Layer 5: Team Extension (MVP)                              │
│  TeamSpec → Role Assignment → Parallel Group → Merge        │
└─────────────────────────────────────────────────────────────┘
```

### Main Data Flow

```
Store
  → fork to Handle
  → edit Draft
  → publish to Version
  → compile to Execution Package
  → create Task/Run
  → execute (single or team workflow)
  → produce Artifact
```

## Project Structure

### Backend (Rust)

| Crate | Purpose |
|-------|---------|
| `crates/decacan-runtime` | Core domain logic, playbook lifecycle, workflow compilation, task/run state machine, policy/tools gates, team execution |
| `crates/decacan-app` | Product-facing Axum API server, DTOs, routers, user workflows |
| `crates/decacan-infra` | Infrastructure adapters: config, secrets, logging, storage, model routing |
| `crates/decacan-auth` | Authentication and authorization utilities |

### Frontend (React 19 + Tailwind v4)

| App | Purpose |
|-----|---------|
| `apps/workspaces` | Main workbench for task execution and workspace management |
| `apps/admin` | System administration dashboard |

### Documentation

- `docs/superpowers/specs/`: Architecture and design specifications
- `docs/superpowers/plans/`: Implementation plans and summaries

## Tech Stack

- **Backend**: Rust, Axum, Tokio, SQLx (PostgreSQL), Serde, Tracing
- **Frontend**: React 19, Tailwind CSS v4, React Router v7, shadcn/ui
- **Models**: OpenAI (GPT-4), Anthropic (Claude 3)
- **Build**: Cargo (Rust), pnpm (Node.js)

## Getting Started

### Prerequisites

- Rust 1.80+ with Cargo
- Node.js 20+ with pnpm
- PostgreSQL 15+

### Environment Setup

1. Copy environment template:
```bash
cp .env.example .env
```

2. Edit `.env` with your configuration:
```bash
# Database
DATABASE_URL=postgres://postgres:password@localhost/decacan

# Model Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# App
APP_PORT=8080
RUST_LOG=info
```

### Backend

```bash
# Run migrations
sqlx migrate run

# Run tests
cargo test --workspace
cargo test -p decacan-app -- --nocapture    # API smoke tests
cargo test -p decacan-runtime team          # Team execution tests

# Start development server
cargo run -p decacan-app

# With specific config profile
APP_PROFILE=dev cargo run -p decacan-app
```

### Frontend

```bash
# Install dependencies
pnpm install

# Run workspaces app
pnpm dev:workspaces

# Run admin app  
pnpm dev:admin

# Build all apps
pnpm build
```

## Configuration

The platform uses a layered configuration system:

```
config/default.yaml    → Base configuration
config/dev.yaml        → Development overrides (optional)
config/prod.yaml       → Production overrides (optional)
.env                   → Environment variables
CLI flags              → Command-line overrides
```

### Key Configuration Sections

```yaml
# Model routing
models:
  default_provider: openai
  fallback_chain: [openai, anthropic]
  providers:
    openai:
      api_key: "${OPENAI_API_KEY}"
      base_url: https://api.openai.com/v1
      default_model: gpt-4
      timeout_seconds: 60

# Logging
logging:
  level: info
  stdout: true
  file:
    enabled: true
    path: logs/decacan.log
    rotation: daily

# Database
postgres:
  url: "${DATABASE_URL}"
  max_connections: 10
  auto_migrate: false
```

## Development Guidelines

### Testing Strategy

- **Unit Tests**: `cargo test -p <crate>` for isolated component tests
- **Integration Tests**: `cargo test --workspace` for cross-crate integration
- **Smoke Tests**: `crates/decacan-app/tests/http_smoke.rs` for API validation
- **Team Tests**: `cargo test -p decacan-runtime team` for team execution

### Code Organization

- **Runtime**: Domain logic must remain pure (no async I/O in core)
- **App**: HTTP layer handles serialization, auth, and request routing
- **Infra**: All external dependencies (DB, HTTP clients, filesystem)

### Database Changes

1. Create new migration: `sqlx migrate add <name>`
2. Write up/down SQL in `migrations/`
3. Run migrations: `sqlx migrate run`
4. Update queries and regenerate query metadata: `cargo sqlx prepare`

## Model Router Usage

```rust
use decacan_infra::models::{ModelRouter, ModelRouterConfig};
use decacan_runtime::ports::model::ModelPort;

// Configure with providers
let config = ModelRouterConfig::default()
    .with_openai(std::env::var("OPENAI_API_KEY")?)
    .with_anthropic(std::env::var("ANTHROPIC_API_KEY")?);

// Create router with automatic fallback
let router = ModelRouter::new(config)?;

// Use unified interface
let response = router.complete("Explain Rust lifetimes").await?;

// Use specific model
let response = router
    .complete_with_model("claude-3-opus-20240229", "Your prompt")
    .await?;
```

## Team Execution Example

```rust
use decacan_runtime::team::builtin::BuiltinTeamSpecRegistry;
use decacan_runtime::team::registry::TeamSpecRegistry;
use decacan_runtime::run::entity::ParallelRoleGroupState;

// Get built-in team spec
let registry = BuiltinTeamSpecRegistry::new();
let team = registry.resolve(&TeamSpecId::new("research-team"))?;

// Create parallel role group
let mut group = ParallelRoleGroupState::new(team.id().clone());

// Assign work to each role
for role in team.roles() {
    let assignment = RoleAssignment::new(
        RoleAssignmentId::new(format!("assign-{}", role.id().as_str())),
        role.id().clone(),
        team.id().clone(),
    );
    group.add_assignment(assignment);
}

// Execute and merge
// See: docs/superpowers/specs/2026-03-29-decacan-minimal-team-execution-spec.md
```

## Documentation

### Key Specifications

1. [Backend Architecture Overview](docs/superpowers/specs/2026-03-29-decacan-backend-spec-index.md)
2. [MVP Module Map](docs/superpowers/specs/2026-03-29-decacan-mvp-backend-module-map-spec.md)
3. [Playbook Store & Versioning](docs/superpowers/specs/2026-03-28-decacan-playbook-store-and-versioning-spec.md)
4. [Minimal Team Execution](docs/superpowers/specs/2026-03-29-decacan-minimal-team-execution-spec.md)
5. [Model Router Design](docs/superpowers/plans/2026-04-01-models-router.md)

### Implementation Plans

- Current plans: `docs/superpowers/plans/`
- Recent additions: config system, logging, storage, models

## Contributing

1. Branch from `main` for new features
2. Run the smoke suite before submitting: `cargo test -p decacan-app`
3. Follow existing code patterns in each crate
4. Update documentation for architectural changes

## License

[Your License Here]
