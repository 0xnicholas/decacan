# Decacan Architecture

Status: Living architecture document  
Audience: Product, frontend, backend, platform, and operations teams  
Scope: North-star architecture, current implementation mapping, and migration path

## Table of Contents

- [1. Purpose](#1-purpose)
- [2. Product Architecture Overview](#2-product-architecture-overview)
- [3. North-Star Goals](#3-north-star-goals)
- [4. Architectural Principles](#4-architectural-principles)
- [5. System Context](#5-system-context)
- [6. Product Boundaries](#6-product-boundaries)
- [7. Layered Architecture](#7-layered-architecture)
- [7.6 Ownership Matrix](#76-ownership-matrix)
- [8. Core Domain Model](#8-core-domain-model)
- [9. Execution Model](#9-execution-model)
- [10. API and Contract Architecture](#10-api-and-contract-architecture)
- [11. Data and State Architecture](#11-data-and-state-architecture)
- [12. Eventing and Observability](#12-eventing-and-observability)
- [13. Security and Permission Model](#13-security-and-permission-model)
- [14. Frontend Architecture Direction](#14-frontend-architecture-direction)
- [15. Deployment and Runtime Topology](#15-deployment-and-runtime-topology)
- [16. Current State vs Target State](#16-current-state-vs-target-state)
- [17. Evolution Roadmap](#17-evolution-roadmap)
- [18. Key Risks](#18-key-risks)
- [19. Decision Rules](#19-decision-rules)
- [20. Architecture Review Checklist](#20-architecture-review-checklist)
- [21. Repository Mapping](#21-repository-mapping)
- [22. Summary](#22-summary)

## Related Documents

Foundational product and runtime references:

- [`README.md`](../README.md)
- [`2026-03-27-decacan-product-architecture.md`](./2026-03-27-decacan-product-architecture.md)
- [`2026-03-27-decacan-runtime-object-model.md`](./2026-03-27-decacan-runtime-object-model.md)
- [`2026-03-27-decacan-playbook-system-design.md`](./2026-03-27-decacan-playbook-system-design.md)
- [`2026-03-27-decacan-分层架构讨论纪要.md`](./2026-03-27-decacan-%E5%88%86%E5%B1%82%E6%9E%B6%E6%9E%84%E8%AE%A8%E8%AE%BA%E7%BA%AA%E8%A6%81.md)

Focused architecture decisions and implementation planning:

- [`superpowers/architecture/2026-03-30-playbook-workflow-architecture-decisions.md`](./superpowers/architecture/2026-03-30-playbook-workflow-architecture-decisions.md)
- [`2026-03-27-decacan-mvp-implementation-plan.md`](./2026-03-27-decacan-mvp-implementation-plan.md)
- [`superpowers/plans/`](./superpowers/plans/)
- [`superpowers/specs/`](./superpowers/specs/)

## 1. Purpose

Decacan is a playbook-driven multi-agent work orchestration system.
Its purpose is to turn repeatable operating procedures into reliable execution inside explicit workspace boundaries, while preserving account-level visibility and governance.

This document defines:

- the north-star architecture for the product
- the system boundaries between apps, backend services, runtime, and infrastructure
- the core domain model
- the execution and event model
- the gap between the current repository state and the intended target state
- the migration path from the current implementation to the long-term architecture

This document is intentionally written as a target architecture reference, not only as a snapshot of what exists today.

## 2. Product Architecture Overview

Decacan is organized around two product surfaces and one backend platform:

- `apps/workspaces`: the execution surface for daily work inside a single workspace
- `apps/console`: the account-level control surface for cross-workspace visibility and reusable asset lifecycle
- backend platform: the Rust application/runtime/infra stack that serves both surfaces

The core product rule is:

- reusable assets are authored and governed centrally
- execution happens locally in a concrete workspace context
- account-level visibility must not collapse workspace boundaries

At the highest level, the system should evolve toward this architecture:

```text
Frontend Surfaces
  apps/console           apps/workspaces
          \              /
           \            /
            Decacan API Platform
                    |
             Application Layer
             decacan-app
                    |
              Domain Runtime
            decacan-runtime
                    |
          Infrastructure Adapters
      decacan-infra + decacan-auth
                    |
      Storage / Models / Filesystem / Team Gateway
```

## 3. North-Star Goals

The architecture is designed to support these long-term goals:

- treat `Playbook` as the primary reusable operating asset
- treat `Task` as the primary execution object
- keep `Workspace` as the hard execution boundary
- separate account control-plane concerns from workspace execution concerns
- make agent-team execution a replaceable subsystem behind stable runtime ports
- keep model providers, storage, secrets, and filesystem access behind infrastructure boundaries
- support multi-industry frontend variants without forking the core product
- move from in-memory and in-process adapters to durable and distributed implementations without changing the product contract

These goals extend the earlier product-layer framing in
[`2026-03-27-decacan-product-architecture.md`](./2026-03-27-decacan-product-architecture.md)
and the runtime object framing in
[`2026-03-27-decacan-runtime-object-model.md`](./2026-03-27-decacan-runtime-object-model.md).

## 4. Architectural Principles

### 4.1 Clear Boundary Ownership

Each layer should have one clear responsibility:

- frontend apps own user interaction and view composition
- `decacan-app` owns HTTP contracts, route composition, DTOs, and request-scoped orchestration
- `decacan-runtime` owns product semantics, workflow execution, task lifecycle, policies, and domain services
- `decacan-infra` owns adapter implementations for external systems
- `decacan-auth` owns authentication and identity-oriented services

No layer should reach around another layer to bypass contracts.

### 4.2 Workspace-First Execution

Execution always happens in a concrete workspace context.
Account-level surfaces may discover, summarize, and route work, but they must not become a second execution shell.

### 4.3 Playbook-Driven Operation

Users should enter the system through reusable playbooks rather than open-ended prompting.
The system should optimize for repeatable execution, outputs, approvals, artifacts, and auditability.

### 4.4 Domain Before Infrastructure

Domain concepts such as `Playbook`, `Task`, `Run`, `Approval`, `Artifact`, `AssistantSession`, and `TeamSession` must remain defined in runtime contracts rather than leaking infrastructure or UI concerns into the domain layer.

### 4.5 Replaceable Execution Backends

The system should support a transitional implementation where agent-team execution runs in process, but the long-term design assumes a durable out-of-process orchestrator behind stable runtime ports.

### 4.6 Evolutionary Delivery

The repository is expected to move in phases.
Temporary adapters are acceptable if they preserve the intended seam and do not contaminate higher-level domain contracts.

## 5. System Context

Decacan sits between human operators and a set of execution systems.

```text
Users
  |\
  | \__ Workspace members and operators
  |
  +--> apps/workspaces
  +--> apps/console
          |
          v
    Decacan API Platform
          |
          +--> Runtime domain services
          +--> Auth services
          +--> Storage adapters
          +--> Model router
          +--> Filesystem adapters
          +--> Team orchestration adapter
```

External or semi-external dependencies include:

- PostgreSQL and/or transitional in-memory storage
- filesystem access for workspace-local artifacts
- model providers such as OpenAI and Anthropic
- secret/configuration sources
- browser clients for the two frontend apps
- a future remote team-orchestration service

## 6. Product Boundaries

### 6.1 Console Responsibilities

`apps/console` is the account control surface.
Its long-term responsibilities are:

- account home and cross-workspace summaries
- playbook authoring, draft management, versioning, publish lifecycle
- workspace routing and operational oversight
- account-scoped work queues and exception visibility
- reusable asset administration

It should not own detailed task execution UX.

### 6.2 Workspaces Responsibilities

`apps/workspaces` is the execution surface.
Its long-term responsibilities are:

- workspace home and current work surfaces
- task execution and task detail flows
- approvals, deliverables, artifacts, and team activity
- member collaboration inside workspace scope
- assistant and delegated team execution within workspace authority rules

It should not become the account dashboard or playbook authoring studio.

### 6.3 Backend Boundary Rule

The backend must preserve explicit route and contract separation between:

- account scope
- workspace scope
- reusable asset lifecycle
- execution and team-session APIs

This separation is already reflected in the repository route shape and should remain explicit as the system scales.
The most up-to-date boundary summary is also maintained in [`README.md`](../README.md).

## 7. Layered Architecture

### 7.1 Frontend Layer

The frontend layer contains two separately deployable React applications.

### `apps/workspaces`

Current characteristics:

- React 19
- React Router 7
- Vite
- Tailwind CSS v4
- emerging multi-industry architecture

Target role:

- execution-oriented workspace shell
- industry-aware composition with shared core and vertical overrides
- API-driven workspace UI backed by workspace-scoped endpoints

### `apps/console`

Current characteristics:

- React 19
- React Router 7
- Vite
- broader admin-style UI composition
- playbook studio and account hub features

Target role:

- account control plane
- playbook design and publication surface
- account-level workload and workspace routing hub

### Shared frontend direction

The north-star direction is:

- shared design system through `@decacan/ui`
- shared DTO-driven API clients where useful
- separate app shells with explicit product boundaries
- industry-specific customization in Workspaces without copying the entire application

### 7.2 Application Layer: `decacan-app`

`decacan-app` is the HTTP and composition layer.
It should remain thin in domain logic and strong in contract definition.

Responsibilities:

- Axum router composition
- HTTP request handling
- DTO serialization and translation
- middleware integration
- app-state wiring
- streaming/event endpoints
- orchestration across runtime and adapter services

Current repository mapping:

- `crates/decacan-app/src/api/`
- `crates/decacan-app/src/app/`
- `crates/decacan-app/src/dto/`
- `crates/decacan-app/src/middleware/`
- `crates/decacan-app/src/streams/`

Target direction:

- move from broad in-memory application state toward durable service composition
- preserve stateless HTTP edges where possible
- keep API modules aligned to account/workspace/playbook/team/task boundaries

### 7.3 Domain Runtime Layer: `decacan-runtime`

`decacan-runtime` is the product core.
It should own product semantics independently of HTTP, browser, and infrastructure details.

Responsibilities:

- playbook lifecycle and execution semantics
- workflow definition and orchestration
- task and run lifecycle management
- approval and policy models
- artifact and output registration
- assistant authority and delegation contracts
- team-session contracts
- persistence-facing domain models and ports
- event generation and state projection

Current repository mapping includes modules such as:

- `approval`
- `artifact`
- `assistant`
- `authority`
- `capability`
- `contract`
- `events`
- `execution`
- `gateway`
- `invocation`
- `playbook`
- `policy`
- `ports`
- `run`
- `task`
- `team`
- `team_session`
- `trace`
- `workflow`
- `workspace`

The runtime object model described here is aligned with
[`2026-03-27-decacan-runtime-object-model.md`](./2026-03-27-decacan-runtime-object-model.md).

Target direction:

- runtime remains the stable home of domain contracts
- transient implementation shortcuts stay outside domain contracts
- capability resolution, workflow execution, and team orchestration evolve behind runtime interfaces

### 7.4 Infrastructure Layer: `decacan-infra`

`decacan-infra` should hold concrete adapters and operational utilities.

Responsibilities:

- configuration loading
- secret management
- logging/tracing support
- filesystem adapter implementations
- persistence adapters
- model router and model-provider integrations
- team gateway adapters and retries
- clock and runtime utility adapters

Current repository mapping:

- `clock`
- `config`
- `filesystem`
- `logging`
- `models`
- `persistence`
- `secrets`
- `storage`
- `team`

Target direction:

- adapters remain replaceable
- runtime depends on ports, not these implementations
- environment-specific deployments choose concrete adapters at composition time

### 7.5 Authentication Layer: `decacan-auth`

`decacan-auth` owns identity, authentication flows, and authorization-related support.

Responsibilities:

- user and session entities
- auth service flows
- token/session issuance
- auth storage adapters
- authorization helpers
- auth-related rate limiting

Target direction:

- keep identity logic isolated from playbook/task runtime logic
- unify workspace roles with runtime-owned role definitions where appropriate
- support stronger production-grade storage and provider integrations over time

### 7.6 Ownership Matrix

The matrix below is the practical boundary guide for the repository.
If a new capability cannot be assigned cleanly to one row, the architecture boundary is not clear enough yet.

| Unit | Owns | Does Not Own | Key Interfaces |
|---|---|---|---|
| `apps/workspaces` | Workspace-scoped execution UX, task detail flows, approvals, deliverables, artifacts, workspace member collaboration, industry-specific workspace presentation | Account-wide aggregation, playbook authoring lifecycle, backend domain rules, provider/storage implementation details | Workspace-scoped HTTP APIs, task event streams, shared UI package |
| `apps/console` | Account-scoped navigation, account home, cross-workspace visibility, playbook studio, reusable asset lifecycle, workspace routing from account context | Workspace task execution shell, low-level runtime orchestration, direct storage/provider concerns | Account APIs, playbook/studio APIs, shared UI package |
| `crates/decacan-app` | HTTP contracts, Axum routers, DTO translation, middleware, streaming endpoints, app wiring/composition | Core product semantics, durable adapter implementation details, frontend presentation logic | `api/`, `dto/`, `middleware/`, `streams/`, runtime and infra service composition |
| `crates/decacan-runtime` | Core domain model, playbook/workflow semantics, task/run lifecycle, policy and approval logic, assistant/team-session contracts, domain events and ports | HTTP transport details, browser concerns, concrete provider/storage implementations, identity provider specifics | Runtime ports, domain services, entities, execution and event contracts |
| `crates/decacan-infra` | Concrete adapters for config, secrets, logging, filesystem, persistence, model routing, team gateway communication, retries and operational utilities | Product workflow semantics, API DTO shape, frontend concerns, top-level auth product flows | Adapter implementations consumed through runtime/app composition |
| `crates/decacan-auth` | Identity entities, auth/session flows, auth storage, authorization helpers, auth-oriented rate limiting | Playbook/task/workflow semantics, workspace execution UX, generic infrastructure unrelated to identity | Auth service, auth storage, runtime-aligned role exports |

## 8. Core Domain Model

The domain is organized around a small set of primary product objects.

### 8.1 Account

Represents the top-level organizational boundary.
Owns:

- cross-workspace visibility
- reusable asset governance
- account-level routing and oversight

### 8.2 Workspace

Represents the execution boundary.
A workspace defines:

- membership and roles
- local working context
- workspace-scoped tasks and outputs
- operational accountability

### 8.3 Playbook

Represents a reusable operating asset.
A playbook defines:

- identity and metadata
- structured inputs
- execution profile
- workflow definition
- output contract
- policy profile

North-star rule:

- users start work from a playbook, not from a raw agent session

### 8.4 Task

Represents a unit of delegated work created from a playbook inside a workspace.
It is the primary execution-visible product object.

A task owns:

- the intent to execute work
- current status and summary
- selected playbook/version snapshot
- current run association
- approvals and artifacts
- user-visible activity history

### 8.5 Run

Represents one execution attempt of a task.
This separates product-level work identity from individual execution attempts.

### 8.6 Workflow and WorkflowStep

Represent the internal executable blueprint behind a playbook.
Workflows are internal execution structures, not primary UI objects.

### 8.7 Approval

Represents a product-level interruption or decision point required before risky or policy-sensitive continuation.

### 8.8 Artifact and Deliverable

Represent the outputs of execution.
Artifacts are execution outputs; deliverables are user-facing reviewable outputs or business-significant outputs derived from those artifacts.

### 8.9 AssistantSession and TeamSession

These represent delegated execution contexts.

- `AssistantSession`: a user-facing delegation context tied to workspace assistance
- `TeamSession`: the execution state of delegated multi-agent work

North-star rule:

- these are execution-supporting domain objects, not the primary user entry point

## 9. Execution Model

Decacan execution should be understood as a layered chain:

```text
Playbook
  -> Workflow Definition
  -> Task
  -> Run
  -> Workflow Steps
  -> Capability Resolution
  -> Routine / Invocation / Team Action
  -> Tool / Model / Filesystem / External Adapter
  -> Events / Artifacts / Deliverables
```

### 9.1 Request-to-Artifact/Event Flow

The main product flow should look like this:

```text
User in apps/workspaces or apps/console
  |
  | 1. Trigger action
  |    - launch task
  |    - review approval
  |    - publish playbook
  |    - start assistant delegation
  v
HTTP request / event subscription
  |
  v
decacan-app
  |
  | 2. API contract handling
  |    - route match
  |    - auth middleware
  |    - DTO parsing / validation
  |    - request-scoped orchestration
  v
decacan-runtime
  |
  | 3. Domain execution
  |    - load account/workspace/task/playbook context
  |    - evaluate authority and policy
  |    - create or resume Task / Run / TeamSession
  |    - compile workflow / select capability
  v
Execution ports
  |
  | 4. Concrete execution
  |    - model call
  |    - filesystem operation
  |    - persistence write
  |    - team orchestration request
  v
decacan-infra / decacan-auth / external systems
  |
  | 5. Raw results return
  |    - provider result
  |    - file write result
  |    - auth result
  |    - remote orchestration status
  v
decacan-runtime
  |
  | 6. Product projection
  |    - update task/run/session state
  |    - register artifacts and deliverables
  |    - emit domain events
  |    - decide completion / blocked / approval-needed
  v
decacan-app
  |
  | 7. Delivery to clients
  |    - HTTP response DTO
  |    - stream event envelope
  |    - follow-up polling/read models
  v
Product-visible outputs
  |- Durable state: task, run, approval, team session, playbook lifecycle data
  |- Artifact state: files, artifact metadata, deliverables
  `- Event state: task events, trace records, activity streams, audit history
```

This flow is the practical handshake between the product layers:

- `decacan-app` translates transport into product requests and product state into delivery contracts
- `decacan-runtime` decides meaning, policy, workflow, and lifecycle state
- `decacan-infra` and `decacan-auth` perform concrete external work behind stable interfaces

### 9.2 Task Launch and Execution Flow

The most common execution path is task launch from a playbook:

```text
User chooses workspace + playbook + inputs
  |
  v
POST /api/tasks
  |
  v
decacan-app
  |- validate request DTO
  |- authenticate user
  `- hand off command
      |
      v
decacan-runtime
  |- load workspace context
  |- load playbook version / policy profile
  |- create Task
  |- create initial Run
  `- compile workflow
      |
      v
Execution loop
  |- resolve step capability
  |- invoke routine / synthesis / team action
  |- call models / filesystem / adapters through ports
  |- collect raw outputs
  `- evaluate policy after each step
      |
      +--> approval needed?
      |      |
      |      +--> yes: create Approval + emit task event + pause Run
      |      `--> no: continue
      |
      +--> execution failed?
      |      |
      |      +--> yes: mark Run failed + project Task failure state
      |      `--> no: continue
      |
      `--> workflow complete
             |
             v
Product projection
  |- register Artifact metadata
  |- write Deliverable-facing output references
  |- emit task/run/activity events
  |- update Task status summary
  `- persist trace/audit information
      |
      v
decacan-app response + read models
  |- 202/200 response DTO
  |- task detail fetch
  `- event stream subscription
      |
      v
Workspace UI
  |- task state
  |- approvals
  |- artifacts / deliverables
  `- execution timeline
```

This flow should remain the reference path for workspace execution.
If a feature bypasses `Task` or `Run`, it is usually violating the product model.

### 9.3 Assistant Delegation and Team Session Flow

Delegated assistant execution is a specialized path layered on top of the same runtime principles:

```text
User starts assistant action in a workspace
  |
  v
POST /api/assistant-sessions
or
POST /api/assistant-sessions/:assistant_session_id/delegations
  |
  v
decacan-app
  |- authenticate + authorize
  |- validate workspace and request
  `- forward delegation command
      |
      v
decacan-runtime
  |- load AssistantSession
  |- evaluate authority rules
  |- bind delegation intent to workspace context
  |- create or resume TeamSession
  `- issue StartTeamSessionRequest through port
      |
      v
Team orchestrator adapter
  |- current state: in-process adapter
  `- target state: durable remote orchestrator / gateway
      |
      v
Delegated execution progresses
  |- session status updates
  |- evolution proposals
  |- intermediate outputs
  |- approval or continuation needs
  `- final completion / failure
      |
      v
decacan-runtime projection
  |- update TeamSession snapshot
  |- attach outputs or proposals to workspace-visible objects
  |- emit assistant/team events
  `- enforce continuation semantics
      |
      v
decacan-app delivery
  |- team-session snapshot endpoint
  |- assistant session response DTOs
  `- workspace-facing event/state refresh
      |
      v
Workspace UI
  |- assistant dock state
  |- delegation status
  |- team progress visibility
  `- follow-up review / approval actions
```

This flow should stay behind runtime ports so the current in-process adapter can be replaced without changing workspace product contracts.

### 9.4 Control Plane

The control plane is responsible for:

- interpreting playbooks
- compiling execution plans
- deciding task status
- enforcing policy and approval rules
- mapping raw execution results into user-visible events
- preserving auditability

This should primarily live in `decacan-runtime`.

### 9.5 Execution Plane

The execution plane is responsible for:

- carrying out routines or invocations
- calling model providers
- performing filesystem operations
- invoking team orchestration adapters
- returning raw results and traces

This should primarily live behind runtime ports and infrastructure adapters.

### 9.6 Capability-Based Evolution

The architecture direction already points toward capability-driven workflow execution:

- workflows reference capabilities
- capabilities are resolved to concrete implementations
- implementation may be a routine, tool, skill, or external execution path

Near term:

- capability-to-routine mapping can remain simple

Long term:

- the resolver can select among multiple execution implementations with richer policies and reasoning

For the current capability and workflow refactor direction, see
[`superpowers/architecture/2026-03-30-playbook-workflow-architecture-decisions.md`](./superpowers/architecture/2026-03-30-playbook-workflow-architecture-decisions.md).

## 10. API and Contract Architecture

The API layer should continue to expose explicit product contracts rather than a generic agent API.

Primary contract families:

- account APIs
- workspace APIs
- playbook and studio APIs
- task, approval, deliverable, artifact, and trace APIs
- assistant and team-session APIs
- auth APIs

North-star principles:

- HTTP contracts reflect product concepts, not low-level runtime internals
- DTOs are stable translation boundaries
- event streams expose product events rather than raw adapter events

## 11. Data and State Architecture

### 11.1 Current State

The current repository still contains significant in-memory and local-process state in `decacan-app::app::state`.
This is acceptable as a transitional implementation for fast iteration, but it is not the target state.

Examples of transitional state currently held in application memory include:

- tasks
- playbook lifecycle drafts and versions
- team specs
- assistant sessions
- evolution proposals
- artifacts and approvals
- event buses

### 11.2 Target State

The target architecture separates state into durable categories:

- relational durable state for accounts, workspaces, memberships, playbooks, tasks, approvals, and session metadata
- append-only or event-oriented state for task events, traces, and execution history
- object/file storage for artifacts and large outputs
- configuration and secret sources managed separately from product data

### 11.3 Recommended Persistence Model

Recommended long-term split:

- PostgreSQL for relational entities and workflow/session metadata
- durable event storage for task, run, and team-session event streams
- filesystem or object storage abstraction for artifact payloads
- optional cache layer for derived account/workspace summaries

## 12. Eventing and Observability

The product is inherently execution-oriented and must be observable by default.

Required observable concerns:

- task lifecycle transitions
- workflow step transitions
- approval interruptions and resumptions
- assistant and team-session delegation milestones
- artifact production
- external adapter failures
- user-visible summaries and audit trails

The target design should distinguish:

- domain events: meaningful product state changes
- operational telemetry: traces, logs, retries, latency, provider behavior

The current repository already includes task event structures and stream endpoints.
The long-term direction is to make event persistence and replay durable rather than process-local.

## 13. Security and Permission Model

Security is not a cross-cutting afterthought; it is part of the domain.

### 13.1 Boundary Rules

- account-level access does not imply unrestricted workspace execution control
- workspace roles govern execution actions inside the workspace
- playbook publication and reusable asset governance remain centrally controlled
- risky actions require approval paths according to policy

### 13.2 Enforcement Layers

Security should be enforced at multiple layers:

- API middleware for authentication and request identity
- application-level route guards and permission checks
- runtime authority and policy checks
- infrastructure-level credentials and signed external requests

### 13.3 Filesystem and Execution Safety

The long-term execution model should ensure:

- workspace-scoped path control
- explicit write policies
- auditable file mutations
- approval-aware risky operations
- provider credentials isolated from product logic

## 14. Frontend Architecture Direction

### 14.1 Workspaces App

The Workspaces app is moving toward a modular, industry-aware architecture.
Recent changes in the repository already indicate:

- dynamic feature module loading
- industry-aware routing
- specialized workspace-home variants such as `short-drama` and `short-video`

Target architecture for Workspaces:

- a shared core workspace shell
- feature modules aligned to domain concepts
- industry overrides for selected surfaces, not full app forks
- backend-driven execution data with local presentation-specific state only

### 14.2 Console App

The Console app is evolving as the account operating system for Decacan.

Target architecture for Console:

- account home as the main routing hub
- playbook studio as the reusable asset lifecycle center
- workspace routing and status surfaces
- permission-aware shells and navigation

### 14.3 Shared Frontend Rules

- avoid duplicating execution flows across Console and Workspaces
- share design primitives, not product boundaries
- keep route ownership aligned with backend scope ownership
- prefer feature-oriented modules over large global state stores

## 15. Deployment and Runtime Topology

### 15.1 Current Topology

Today the repository is optimized for local development:

- Rust backend launched via `cargo run -p decacan-app`
- two Vite frontend apps for Workspaces and Console
- local environment-driven configuration
- in-process and in-memory adapters in several flows

### 15.2 Target Topology

The long-term topology should support:

- independently deployable frontend applications
- one or more backend API deployments
- durable relational and event storage
- separate model/provider credentials and adapter configuration
- an out-of-process team orchestration service or gateway

Illustrative target topology:

```text
Browser Clients
  -> Console Web App
  -> Workspaces Web App
          |
          v
       API Gateway / App Service
          |
          +--> decacan-app
                  |
                  +--> decacan-runtime
                  |
                  +--> auth/policy services
                  +--> relational database
                  +--> event store
                  +--> artifact storage
                  +--> model router
                  +--> remote team orchestrator
```

## 16. Current State vs Target State

The current repository already establishes the correct macro-boundaries:

- separate frontend surfaces
- explicit backend crates
- runtime as domain core
- infra and auth separated from runtime
- account/workspace route distinction
- early assistant and team-session contracts

However, several areas are still transitional.
The detailed implementation steps behind these transitions should continue to live in
[`superpowers/plans/`](./superpowers/plans/),
while this document remains the long-lived architectural reference.

### 16.1 Current Strengths

- strong product boundary definition in `README.md`
- clear Rust workspace layering
- runtime domain surface already richer than a basic CRUD backend
- multi-industry direction started in `apps/workspaces`
- playbook lifecycle and team-session APIs already exist

### 16.2 Current Gaps

- broad in-memory `AppState` still acts as a temporary composition root and data store
- in-process team orchestrator is a bridge implementation, not a production architecture
- event streaming and state projection are not yet fully durable
- artifact storage and task persistence are not yet fully externalized
- some local development assumptions remain embedded in the app layer

### 16.3 Architectural Interpretation

These are acceptable phase gaps if the team preserves the existing seams:

- runtime ports stay stable
- app contracts stay product-oriented
- infra adapters absorb implementation replacement

## 17. Evolution Roadmap

The architecture should evolve in staged phases.

### Phase 1: Product and Runtime Boundary Stabilization

Goals:

- keep account/workspace/product boundaries explicit
- complete runtime contract consolidation
- reduce accidental business logic in the app layer

Expected outcomes:

- clearer ownership between `decacan-app` and `decacan-runtime`
- more stable DTO and API modules
- documented domain language

### Phase 2: Durable Persistence

Goals:

- move core entities out of in-memory state
- persist task, playbook lifecycle, and team-session data durably
- formalize artifact storage abstraction

Expected outcomes:

- backend restarts no longer lose task/session state
- better auditability and replay
- clearer separation between domain state and delivery state

### Phase 3: Execution Adapter Hardening

Goals:

- replace in-process team orchestration with a durable external adapter
- strengthen provider routing, retries, and signing
- make execution telemetry first-class

Expected outcomes:

- more reliable delegated agent execution
- environment-independent orchestration contract
- safer scaling path

### Phase 4: Capability and Workflow Generalization

Goals:

- formalize capability resolution
- allow multiple execution implementations behind stable capability contracts
- support richer workflow compilation and policy-aware selection

Expected outcomes:

- more flexible playbook execution
- less coupling between workflow definition and concrete implementation

### Phase 5: Verticalized Workspaces Platform

Goals:

- preserve one shared workspace architecture
- support multiple industry experiences through bounded overrides
- keep the backend domain model coherent across verticals

Expected outcomes:

- faster industry expansion without app duplication
- shared execution infrastructure with tailored operator UX

## 18. Key Risks

The main architectural risks are:

- Console and Workspaces drifting into overlapping product scopes
- application-layer convenience logic growing into domain ownership
- temporary in-memory patterns becoming permanent by accident
- team orchestration contract being shaped around one bridge adapter
- frontend verticalization leading to product forks instead of bounded overrides

These risks should be managed by architectural review, API boundary discipline, and runtime-port stability.

## 19. Decision Rules

When introducing or reviewing changes, use these decision rules:

1. Does this belong to account scope or workspace scope?
2. Is this a product/domain rule or an infrastructure concern?
3. Should this be expressed as a runtime contract rather than an app-local shortcut?
4. Is the change preserving replaceable adapter seams?
5. Will this make future durable/distributed execution easier or harder?
6. Is this introducing a second source of truth for an existing domain concept?

If a change fails these tests, it should be redesigned before implementation.

## 20. Architecture Review Checklist

Use this checklist during design review, implementation planning, and PR review for changes that affect architecture, boundaries, data flow, or execution behavior.

### 20.1 Scope and Ownership

- [ ] Is the change clearly assigned to one primary owning unit (`apps/workspaces`, `apps/console`, `decacan-app`, `decacan-runtime`, `decacan-infra`, or `decacan-auth`)?
- [ ] Does the change respect the account-vs-workspace product boundary?
- [ ] Does the change avoid creating overlapping ownership between Console and Workspaces?
- [ ] Does the change avoid moving domain logic into the application or frontend layer without a clear reason?

### 20.2 Domain Model and Runtime Fit

- [ ] Does the change map cleanly to an existing domain concept such as `Playbook`, `Task`, `Run`, `Approval`, `Artifact`, `AssistantSession`, or `TeamSession`?
- [ ] If a new domain concept is introduced, is its relationship to existing runtime concepts explicit?
- [ ] Does the change preserve `Task` and `Run` as the primary execution model instead of bypassing them with ad hoc flows?
- [ ] Are workflow, policy, and authority decisions kept in `decacan-runtime` rather than spread across unrelated layers?

### 20.3 API and Contract Design

- [ ] Does the HTTP/API contract express a product concept instead of leaking low-level implementation details?
- [ ] Are DTO changes explicit, version-safe enough for current consumers, and aligned with route scope ownership?
- [ ] If streaming or async status is involved, is the event contract product-visible and not just adapter-visible?

### 20.4 State, Persistence, and Data Lifecycle

- [ ] Is the source of truth for new state clearly identified?
- [ ] Does the change avoid introducing duplicate or competing state across app memory, runtime state, and persistence?
- [ ] If new durable state is introduced, are persistence shape, lifecycle, and recovery semantics clear?
- [ ] If temporary in-memory state is added, is it clearly marked as transitional and contained behind the right seam?

### 20.5 Events, Observability, and Auditability

- [ ] Does the change emit or project the right domain events for user-visible state transitions?
- [ ] Can operators understand what happened through task events, traces, logs, or audit records?
- [ ] Are failure, retry, blocked, and approval-required paths observable?

### 20.6 Security, Policy, and Permissions

- [ ] Is authentication enforced at the correct entry points?
- [ ] Are workspace roles, authority checks, and policy rules evaluated in the correct layer?
- [ ] If the change touches filesystem, model, or orchestration actions, are risky operations still approval-aware and auditable?
- [ ] Does the change avoid leaking provider credentials, signing logic, or auth concerns into unrelated modules?

### 20.7 Adapter and Infrastructure Boundaries

- [ ] Does the change depend on runtime ports rather than directly coupling domain logic to a concrete adapter?
- [ ] If a new external dependency is introduced, is it isolated in `decacan-infra` or `decacan-auth` as appropriate?
- [ ] Can the concrete adapter be replaced later without changing product contracts?

### 20.8 Frontend Boundary Fit

- [ ] Is the UI behavior implemented in the correct app surface?
- [ ] Does the change avoid duplicating workspace execution UX inside Console?
- [ ] For Workspaces, does the change fit the shared-core-plus-industry-override direction rather than creating a fork?

### 20.9 Migration and Operability

- [ ] Does the change move the system toward the target architecture, or is the intentional deviation documented?
- [ ] If the change introduces a transitional shortcut, is the future replacement seam explicit?
- [ ] Are deployment, configuration, and runtime operational impacts understood?

If multiple checklist items cannot be answered confidently, the change should be escalated for architecture review before implementation or merge.

## 21. Repository Mapping

The current repository maps to the target architecture as follows:

```text
apps/
  console/                  -> Account control surface
  workspaces/               -> Workspace execution surface

crates/
  decacan-app/              -> API/application layer
  decacan-runtime/          -> Domain runtime and execution semantics
  decacan-infra/            -> Infrastructure adapters
  decacan-auth/             -> Authentication and identity services

docs/
  architecture.md           -> This north-star architecture document
  superpowers/specs/        -> Feature and subsystem specs
  superpowers/plans/        -> Implementation plans
  superpowers/architecture/ -> Focused architecture decisions
```

## 22. Summary

Decacan should evolve into a layered, playbook-driven, workspace-first orchestration system with:

- separate account and workspace product surfaces
- runtime-owned domain semantics
- replaceable infrastructure adapters
- durable execution and event state
- bounded delegated agent-team execution
- a flexible path from current local/in-memory development patterns to production-grade distributed operation

The repository already reflects the intended macro-boundaries.
The main architectural task now is not to reinvent those boundaries, but to harden them and migrate transitional implementations behind them.
