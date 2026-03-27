# Decacan Product Architecture

Date: 2026-03-27
Stage: Product architecture
Status: Working design

## Goal

Define the overall product architecture for `decacan`, a task-oriented agent product inspired by the product shape of Cowork-like systems, while preserving long-term control over project code and core runtime behavior.

The core product promise is:

`Give me one working directory, and I will produce results for you.`

## Product Shape

`decacan` is not a general chat assistant.

`decacan` is a task-oriented workstation product with these core properties:

- centered on one working directory at a time
- started through playbooks rather than an empty chat box
- artifact-first output model
- visible short planning before execution
- default auto-run after planning
- approval only for risky actions
- structured execution logs

The first-run user flow is:

1. choose a working directory
2. choose a playbook
3. fill structured task inputs
4. review a short generated plan
5. allow the task to start automatically
6. inspect status, approvals, logs, and artifacts

## Product-Level Decisions

The following decisions have been established:

- the product is local-first
- the initial surface is a localhost web panel
- only one working directory is active at a time
- new files default to `output/`
- modifying existing files requires approval
- command execution is read-only and whitelist-based
- tasks should end in concrete files or explicit results whenever possible

## Layered View

The architecture should be understood in three product-facing layers:

```text
decacan-app
  -> decacan-runtime
       -> psi
```

This is the primary long-term boundary.

## 1. Decacan App

`decacan-app` is the user-facing workstation product.

It owns the user experience and the product surface.

### Main responsibilities

- working directory selection
- playbook selection
- structured task composition
- task detail presentation
- approval interaction
- artifact browsing
- task history and status views

### User-facing objects

- workspace
- playbook
- task
- plan
- approval
- artifact
- execution log

### Core UX principle

The user interacts with tasks, not directly with an agent session.

The app should feel like a workstation for delegating work, not like a prompt playground.

## 2. Decacan Runtime

`decacan-runtime` is the product-owned agent application framework that serves `decacan-app`.

In the initial implementation, it should exist as an internal module inside the project rather than as a separate package.

### Why it exists

The app needs a middle layer that owns product logic and execution orchestration without exposing raw runtime details to the frontend.

### Main responsibilities

- product domain rules
- task lifecycle
- playbook interpretation
- task-visible planning
- approval flow
- artifact registration
- policy compilation
- execution coordination
- runtime event mapping

### Internal conceptual split

`decacan-runtime` includes two closely related concerns:

1. `Product Domain`
2. `Execution Coordination`

#### Product Domain

Owns the actual product logic:

- Workspace Manager
- Template Registry
- Task Orchestrator
- Approval Manager
- Artifact Manager
- Policy Engine
- Event Store

#### Execution Coordination

Bridges product objects to runtime execution:

- Run Builder
- Psi Host Adapter
- Tool Gateway
- Execution Mapper
- Run Supervisor

### Important design rule

`decacan-runtime` exists to serve the app first.

It should not be over-generalized into a reusable framework before the app has validated its boundaries.

The implementation strategy is:

- architecture: treat runtime as a distinct layer
- engineering: implement it internally first
- extraction: only separate it after real boundaries stabilize

## 3. Psi

`psi` is the embedded intelligent execution kernel used by `decacan-runtime`.

Psi is inspired by the useful minimal boundary of `pi.dev`, but is project-owned and implemented under full local control.

Psi is not the product shell and not the product framework.

### Main responsibilities

- execute one psi-scoped invocation inside a runtime-managed run
- hold invocation-local execution state
- generate local semantic decomposition when needed
- request tools through host-owned interfaces
- emit stable invocation events
- continue after host tool outcomes or host decisions
- return structured invocation results

### Non-responsibilities

- task-level planning
- workflow orchestration
- outer run orchestration
- task persistence
- workspace authorization
- approval policy definition
- artifact management
- UI concerns
- database logic
- final permission enforcement

### Internal module split

- `session`
- `planner`
- `executor`
- `tools`
- `model`
- `events`

### Core principle

Psi is a kernel, not a framework.

It must stay replaceable and narrowly scoped.

## Relationship Between The Three Layers

### Decacan App -> Decacan Runtime

The app talks only to product-facing APIs and event streams.

It should not know about raw Psi sessions or internal runtime loop details.

### Decacan Runtime -> Psi

The runtime converts product tasks into workflows and runs.

It invokes Psi only for:

- `psi` workflow steps
- psi-assisted routines

The runtime consumes Psi invocation events and translates them into product events.

The runtime also owns policy enforcement and approval handling at the product level.

The user-visible plan belongs to runtime/workflow compilation, not to Psi.

### Psi -> Host Tools

Psi can only act through host-provided tools.

It must never directly own unrestricted filesystem or shell access.

## Why This Split Matters

This split solves multiple long-term problems:

- preserves control over project code
- prevents the execution kernel from defining the product
- prevents the frontend from binding to low-level agent details
- allows future runtime replacement without rebuilding the app
- allows future extraction of `decacan-runtime` only after the boundaries are proven

## Product Start Flow

The intended user flow is:

```text
Workspace Home
  -> Template Picker
  -> Task Composer
  -> Task Detail
```

### Workspace Home

The user selects the current working directory.

### Template Picker

The user starts work through a small set of productized playbooks.

Initial playbook direction:

- organize directory
- summarize materials
- understand project
- generate deliverable

### Task Composer

Each playbook provides:

- a concise description
- 2 to 3 structured fields
- implied output expectations

### Task Detail

The default focus is:

- short plan
- current status

Secondary sections:

- approval cards
- execution log
- artifact list

## Execution Flow

The high-level execution chain is:

```text
User action
-> App API
-> Runtime product domain
-> Runtime execution coordination
-> Psi invocation when needed
-> Host tools
-> Psi invocation events
-> Runtime-mapped product events
-> App event stream
-> UI update
```

This means the app always consumes product events, not raw kernel events.

## Approval Model

The product should interrupt only for meaningful risk boundaries.

Examples:

- modifying an existing file
- writing outside `output/`
- deleting, moving, or renaming files

Non-whitelisted command requests should be denied rather than approved.

This keeps approval meaningful and keeps the policy boundary understandable.

## Artifact Model

The product should prefer completion states that produce visible outputs.

Examples:

- summary documents
- reports
- structured notes
- generated drafts
- explicit file lists

The final task experience should emphasize:

- what was produced
- what was changed
- what still needs user action

## Engineering Strategy

The architecture should be explicit from the start, but implementation should remain pragmatic.

Recommended approach:

1. implement `decacan-app` and internal `decacan-runtime` in one repository
2. keep `psi` as a clear internal kernel module
3. validate real boundaries through MVP delivery
4. extract `decacan-runtime` only if the app proves the interface

This avoids premature framework design while preserving architectural discipline.

## Design Principles

- tasks before chat
- artifacts before answer text
- product rules before runtime behavior
- runtime coordination before kernel complexity
- kernel narrowness over framework sprawl
- explicit boundaries over convenient coupling

## Next Step

Use this document as the parent architecture reference for MVP planning.

The implementation plan should define:

- repository/module structure
- app-facing APIs
- runtime-facing interfaces
- Psi package boundaries
- persistence and event flow
- verification strategy
