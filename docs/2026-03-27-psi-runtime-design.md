# Psi Runtime Design

Date: 2026-03-27
Stage: Design
Status: Approved for planning

## Goal

Build a local task-oriented workstation product with full control over project code and architecture.

Instead of depending on OpenClaw as the execution engine, the project will introduce `Psi`, an in-project, controllable fork/rewrite inspired by `pi.dev`.

Psi is not the product itself. Psi is the embedded intelligent execution kernel used by the product backend.

## Product Direction

The product shape remains:

- local web panel on `localhost`
- single authorized working directory
- artifact-first task execution
- controlled writes
- approval for risky actions
- structured execution logs

The difference is that the execution kernel is now `Psi`, not OpenClaw.

## Why Replace OpenClaw

OpenClaw was rejected as the execution engine because it is too heavy for the target architecture.

Reasons:

- too many built-in agent/runtime assumptions
- too much overlap with product-layer responsibilities
- too much integration complexity for a local MVP
- too little long-term control over core project code

The project needs a thin, controllable execution kernel rather than a large agent framework.

## Psi Positioning

Psi is a controllable fork/rewrite inspired by `pi.dev`.

Psi is intended to preserve the useful boundary of a minimal execution harness while making the implementation, interfaces, and long-term evolution fully project-controlled.

Chosen positioning:

- `Psi` is a project-owned execution kernel
- `Psi` is embedded as a library in the local product backend
- `Psi` is not a standalone product
- `Psi` is not a separate local service in the MVP
- `Psi` is not responsible for product state management

## Core Boundary

Psi has a strict kernel boundary.

Psi is responsible for:

- accepting a `PsiInvocation` request for one workflow step or one psi-assisted routine
- maintaining invocation-local execution state
- optionally generating a local step plan when semantic decomposition is needed
- deciding local next actions inside that invocation
- requesting tool usage through host-owned tool interfaces
- emitting structured invocation events
- accepting continuation input after host tool results or host decisions
- returning structured output candidates and invocation results

Psi is not responsible for:

- task-level planning
- task lifecycle
- workflow orchestration
- the outer `Run` control loop
- task persistence
- workspace authorization
- approval policy
- approval object creation
- artifact registration
- UI concerns
- database storage
- final permission enforcement

Those concerns remain in the product backend.

## Recommended Architecture

```text
[Web Frontend]
    |
    v
[Product Backend]
    |
    +--> Workspace Manager
    +--> Task Orchestrator
    +--> Workflow Engine / Run Supervisor
    +--> Approval Manager
    +--> Artifact Store
    |
    v
[Psi]
    |
    v
[Host-provided Tool Gateway]
```

## Frontend to Psi Interaction Model

The frontend must not talk to Psi directly.

The interaction boundary is:

- frontend talks to product backend over HTTP and streaming events
- product backend calls Psi as an in-process library only when a workflow step needs intelligent execution
- Psi requests tool usage only through the host-provided tool boundary

Typical flow:

1. frontend selects workspace
2. frontend creates task
3. backend compiles the task into a workflow and starts a runtime-managed `Run`
4. when a `psi` step or psi-assisted routine is reached, runtime creates a `PsiInvocation`
5. Psi emits invocation events to runtime
6. runtime executes requested tools through `Tool Gateway`
7. if tool policy requires approval, runtime pauses the outer `Run` and creates a product-level `Approval`
8. after the host receives tool outcomes or user decisions, runtime continues the `PsiInvocation` as needed
9. runtime records final task results and artifacts

This keeps the frontend bound to a task API rather than an agent session.

## Embedded Model

Psi should be implemented as an embedded library, not as a standalone service.

Chosen model:

- product backend imports and calls Psi directly
- Psi exposes a library API
- Psi does not define the product API surface

Rationale:

- maximum code ownership
- lower MVP complexity
- easier debugging
- clearer product/runtime separation

## Key Integration Rule

Psi must never own the outer task/run lifecycle.

`decacan-runtime` owns:

- the `Task`
- the `Run`
- workflow step progression
- user-visible planning
- approval creation
- artifact registration

Psi is invoked only for:

- `psi` workflow steps
- `psi-assisted` routines

## Psi External Interface

Psi should expose a small library-oriented interface.

Minimum interface:

- `createInvocation(input)`
- `invocation.events()`
- `invocation.resume(continuation)`
- `invocation.result()`

The product backend owns orchestration. Psi owns only invocation-local execution.

## Invocation Protocol

Psi and the product backend communicate using a structured invocation protocol.

### InvocationInput

Suggested fields:

- `goal`
- `system_policy`
- `workspace_context`
- `tool_descriptors`
- `local_context`
- `model_config`
- `limits`
- `continuation_context`

### InvocationEvent

Suggested event types:

- `invocation.started`
- `local.plan.generated`
- `reasoning.note`
- `tool.requested`
- `output.candidate`
- `invocation.completed`
- `invocation.failed`

### ContinuationInput

The host continues a Psi invocation using structured continuation input.

Typical continuation outcomes are:

- `tool_ok`
- `denied`
- `host_interrupted`

Psi itself does not create product-level approvals. Approval remains a runtime concern.

### InvocationResult

Suggested fields:

- `status`
- `summary`
- `output_candidates`
- `final_state`

## Psi Internal Modules

Psi should be split into focused modules from the start.

### `session`

Responsible for the lifecycle of a single invocation instance.

### `planner`

Responsible for generating a local execution sketch for one invocation when needed.

The planner should stay simple. No task-level planning and no complex task trees in v1.

### `executor`

Responsible for the core execution loop:

- send state to model
- interpret model output
- choose next local action
- request tool usage through the host
- wait for continuation input from the host
- continue until completion or failure

### `tools`

Responsible for the tool protocol only, not the concrete tool implementations.

### `model`

Responsible for model provider adaptation behind a stable internal interface.

### `events`

Responsible for translating internal runtime activity into stable external events.

## Host Backend Responsibilities

The host backend remains the product owner of:

- workspace selection
- path policy
- output directory policy
- task-visible planning
- workflow progression
- the outer run loop
- task lifecycle
- approval requests
- persistence
- artifact records
- frontend-facing API

This must stay true even as Psi evolves.

## Tool Boundary

Psi must never directly access the file system or shell outside host-provided tools.

The host product defines the real tools and the real enforcement boundary.

Psi may request tool usage, but it does not own:

- policy enforcement
- approval creation
- final execution authorization
- artifact recognition

Initial tool set expected by the product:

- `list_files`
- `read_file`
- `write_file`
- `run_command`

Policy already decided for the product MVP:

- new files default to `output/`
- modifying existing files requires approval
- `run_command` is read-only and whitelist-based

## MVP Scope for Psi

Psi v1 should support only:

- single invocation execution
- local planning when needed
- tool request generation
- structured streaming events
- continuation after host outcomes or host decisions
- final output-candidate generation
- one model adapter

Psi v1 should not support:

- multi-agent execution
- long-term memory
- marketplace or skills ecosystem
- task database
- built-in permissions
- concurrent task/run scheduling
- complex DAG planning
- cross-invocation persistence

## Evolution Strategy

Psi should grow in this order:

### Phase 1: Usable Kernel

- start an invocation
- generate a local plan when needed
- request tool usage
- accept host continuation
- resume
- return result

### Phase 2: Stable Host Contract

- harden event schema
- harden tool descriptors
- improve limits and context handling
- improve error typing

### Phase 3: Extend Carefully

Only after the host product is stable, consider:

- more model adapters
- richer planning
- replay tooling
- extension points

Every proposed addition to Psi should be tested against one rule:

If the responsibility belongs to task management, persistence, permissions, or user interaction, it belongs in the host backend, not in Psi.

## Design Principles

- kernel, not framework
- host owns product state
- tools are host-owned
- permissions are enforced outside the model
- event contracts should remain stable
- keep Psi replaceable

## Next Step

Turn this design into an MVP implementation plan covering:

- repository/module layout
- backend API shape
- Psi package boundaries
- persistence strategy
- execution lifecycle
- verification strategy
