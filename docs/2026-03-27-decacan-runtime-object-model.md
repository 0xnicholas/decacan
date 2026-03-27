# Decacan Runtime Object Model

Date: 2026-03-27
Stage: Architecture refinement
Status: Working design

## Goal

Capture the deeper runtime architecture for `decacan` after establishing:

- `decacan-app -> decacan-runtime -> psi`
- `Playbook` as the primary product object
- `发现模式 / 标准模式` as user-facing work modes

This document focuses on:

- core object models
- runtime boundaries
- control-plane vs execution-plane responsibilities
- the path from `Playbook` to `Artifact`

## Architectural Framing

`decacan` should be understood as a task-oriented workstation product, not as a chat agent and not as a coding agent.

The product should convert:

`working directory + playbook + user input`

into:

`task + execution + artifact`

with as little human intervention as possible.

## Three Object Families

The system should be reasoned about through three object families.

### 1. User Objects

These are the objects the product should directly expose in the UI.

- `Workspace`
- `Playbook`
- `Task`
- `Approval`
- `Artifact`

These objects answer:

- where the user is working
- what way of working they selected
- what the current task is doing
- whether the user must intervene
- what was finally produced

The UI should not directly expose:

- workflow internals
- runtime sessions
- routines
- raw tool calls
- psi invocation details

### 2. Runtime Objects

These are the objects owned by `decacan-runtime`.

- `Workflow`
- `WorkflowStep`
- `Run`
- `RunState`
- `PolicyProfile`
- `ExecutionPlan`
- `TaskEvent`

These objects answer:

- how a playbook executes internally
- how the current task has been compiled
- where the run currently is
- which policy rules apply
- how internal execution becomes product-visible state

### 3. Execution Objects

These are the objects closest to concrete execution.

- `Routine`
- `PsiInvocation`
- `ToolRequest`
- `ToolResult`
- `ToolExecutionRecord`
- `OutputWrite`
- `BackupRecord`
- `ExecutionResult`
- `ApprovalInterrupt`

These objects answer:

- what actually executed
- what was allowed, denied, or paused
- what files were written
- what was backed up
- what the execution layer returned

## Control Plane And Data Plane

Inside `decacan-runtime`, it is useful to think in two planes.

### Control Plane

Owns product-facing execution governance:

- playbook interpretation
- task lifecycle
- task-visible planning
- workflow compilation
- policy compilation
- approval handling
- event projection
- artifact registration

The control plane decides:

- what the task is
- what path it should take
- when it is considered paused, failed, or complete
- what the user should see

### Data Plane

Owns actual execution:

- step execution
- routine execution
- psi invocation
- tool requests
- output writing
- backup handling

The data plane decides:

- how a step runs
- how external actions execute
- what raw execution results look like

### Boundary

The control plane should never directly perform filesystem writes or model calls.

The data plane should never define product semantics such as:

- how a task is titled
- how the UI explains a task
- what product event types exist
- which result is considered the primary artifact

## Core Runtime Chain

The internal chain should be:

```text
Playbook
  -> Workflow Definition
      -> Task
          -> Run
              -> WorkflowSteps
                  -> Routine / PsiInvocation
                      -> Tool Gateway
                          -> Tool implementations
                              -> Artifact
```

## Task

`Task` is the central product object.

It is the bridge between user intent and runtime execution.

### Purpose

A task represents one unit of delegated work inside one workspace, created from one playbook, with one resulting product surface.

### Structure

Suggested fields:

- `id`
- `workspace_id`
- `playbook_id`
- `title`
- `created_at`
- `input_payload`
- `selected_subpath`
- `user_notes`
- `requested_output_language`
- `mode`
- `workflow_id`
- `policy_profile_id`
- `current_run_id`
- `current_step_id`
- `status`
- `status_summary`
- `started_at`
- `finished_at`
- `last_event_at`
- `result_summary`
- `artifact_ids`
- `approval_ids`
- `backup_record_ids`
- `failure_reason`

### Status Values

- `created`
- `planning`
- `running`
- `waiting_approval`
- `completed`
- `failed`
- `cancelled`

### Key Principle

`Task` is not a synonym for a Psi invocation.

It is a product-level work object that may involve planning, pause/resume,
and one or more execution attempts over time.

## Run

`Run` is the execution instance of a task.

If `Task` means "this piece of work", `Run` means "this actual execution attempt".

### Structure

Suggested fields:

- `id`
- `task_id`
- `attempt_index`
- `created_at`
- `workflow_snapshot`
- `policy_snapshot`
- `workspace_snapshot`
- `playbook_snapshot`
- `status`
- `current_step_id`
- `step_cursor`
- `started_at`
- `finished_at`
- `pause_reason`
- `event_ids`
- `intermediate_outputs`
- `output_candidates`
- `write_operations`
- `error_details`

### Status Values

- `initialized`
- `running`
- `paused`
- `completed`
- `failed`
- `cancelled`

### Key Principle

The run owns execution state. The task owns product meaning.

Psi should only see invocation-local execution context, never task-level UI or product semantics.

## PsiInvocation

`PsiInvocation` is a nested intelligent execution unit inside a runtime-managed run.

It is not the outer run itself.

PsiInvocation is created only when:

- a workflow step has type `psi`
- a routine needs psi-assisted execution

It may emit:

- local reasoning notes
- tool requests
- output candidates

It must not own:

- task status
- run status
- workflow step progression
- approval object creation
- artifact registration

### Key Principle

Psi is a nested executor inside `Run`, not the top-level controller of `Run`.

## Workflow

`Workflow` is the hidden execution blueprint behind a playbook.

The workflow should not be a free-form script or arbitrary graph in the MVP.

The MVP should prefer:

- typed step sequences
- limited branching
- explicit transitions

## WorkflowStep

`WorkflowStep` is the smallest business-level execution unit inside a workflow.

It should define structure, not free-form model reasoning.

### Suggested Structure

- `id`
- `name`
- `type`
- `purpose`
- `input_contract`
- `output_contract`
- `execution_profile`
- `transition`

### Supported Step Types

- `deterministic`
- `tool`
- `routine`
- `psi`
- `approval`
- `branch`

### Key Principle

`WorkflowStep` defines work structure.

It should not merely wrap a prompt.

## Routines

The earlier internal term `skill` should be replaced by `routine`.

### Why Rename

External "skills" in the ecosystem increasingly imply installable ability packs or extension units.

Inside `decacan`, the internal unit is different:

- it is not user-facing
- it is not a marketplace object
- it is not a distribution package
- it is a reusable internal execution procedure

`Routine` better expresses "reusable internal procedure" or "例行程序".

### Definition

A `Routine` is an internal reusable execution unit used by workflows.

It may:

- perform deterministic logic
- combine multiple tool actions
- call Psi for local semantic work

It should always have:

- clear input contract
- clear output contract
- one bounded operational purpose

### Relationship

```text
Playbook
  -> Workflow
      -> Routine
          -> Tool / PsiInvocation
```

### Key Principle

Routine is the internal reusable procedure layer.

It is not a product object and should not be surfaced directly in the UI.

Psi-assisted routines are still owned by runtime.

Using Psi inside a routine does not transfer run orchestration to Psi.

## Tool Gateway

`Tool Gateway` should be treated as the controlled action bus of `decacan`.

It is not merely a tool registry.

Its responsibilities are:

- receive all real action requests
- perform policy evaluation before execution
- decide allow / approval / deny
- execute real tools when allowed
- return structured results
- emit execution records

### Required Invariant

No routine, workflow step, or Psi path should directly touch:

- filesystem writes
- command execution
- other external side effects

All such actions must pass through `Tool Gateway`.

### Core Objects

#### `ToolDescriptor`

Describes a tool:

- identity
- purpose
- input schema
- output schema
- risk level
- side-effect type

#### `ToolRequest`

Represents one concrete action request.

Suggested fields:

- `request_id`
- `task_id`
- `run_id`
- `step_id`
- `caller`
- `tool_id`
- `params`
- `workspace_context`
- `policy_context`

#### `PolicyDecision`

Represents the action decision:

- `allow`
- `approval_required`
- `deny`

and a structured reason.

#### `ToolResult`

Should normalize execution outcomes:

- `ok`
- `approval_required`
- `denied`
- `error`

#### `ToolExecutionRecord`

Represents the execution fact for logging and audit purposes.

### Key Principle

`Tool Gateway` is the single controlled path for external actions inside decacan.

Psi does not directly execute tools.

Psi emits tool requests. Runtime routes those requests through `Tool Gateway`, applies policy, and feeds the resulting continuation back to Psi when needed.

## Events

The event system should not simply mirror raw execution logs.

It should translate internal execution facts into stable product-visible task state.

### Three Event Layers

#### 1. Execution Events

Fine-grained low-level execution facts from:

- tool gateway
- routines
- psi
- run supervision

These are too granular for direct UI use.

#### 2. Runtime Events

Internal runtime-level events such as:

- `run.started`
- `run.paused`
- `step.started`
- `step.completed`
- `approval.required`
- `output.candidate`
- `run.failed`

These are the internal language of `decacan-runtime`.

#### 3. Product Events / Task Events

UI-facing task events such as:

- `task.created`
- `plan.ready`
- `task.running`
- `task.waiting_approval`
- `task.resumed`
- `artifact.ready`
- `task.completed`
- `task.failed`

### Key Principle

The event system exists to translate execution facts into product-visible state, not to expose runtime internals directly.

Raw Psi events should never be shown to the UI without runtime projection.

## Artifacts

`Artifact` is a first-class product object.

It is not equivalent to "a file that happened to be written".

### Purpose

Artifacts provide:

- the formal result of a task
- a stable object for the UI
- traceability to source materials
- a reusable output for future tasks

### Suggested Structure

- `id`
- `task_id`
- `workspace_id`
- `playbook_id`
- `kind`
- `type`
- `label`
- `canonical_path`
- `physical_path`
- `status`
- `summary`
- `source_refs`
- `created_at`

### Artifact Kinds

- `primary`
- `supporting`
- `backup`

### Key Principle

Files become artifacts only after the runtime recognizes them as formal output under a playbook's output contract.

Psi and routines may produce output candidates, but only runtime can register a formal `Artifact`.

## Approvals

`Approval` should be treated as a formal product object, not a temporary dialog box.

### Purpose

Approval provides:

- visible risk boundaries
- a pause state for tasks and runs
- a record of who approved or rejected what
- a stable resume point

### Suggested Structure

- `id`
- `task_id`
- `run_id`
- `step_id`
- `kind`
- `risk_level`
- `title`
- `summary`
- `reason`
- `action_preview`
- `options`
- `status`
- `created_at`
- `decided_at`
- `decided_by`

### Status Values

- `pending`
- `approved`
- `rejected`
- `resolved`

### Relationship To Tool Gateway

`approval_required` is an execution-layer outcome.

`Approval` is the product-layer object created in response to that outcome.

Psi does not create `Approval`.

At most, a Psi-originated tool request can lead runtime and `Tool Gateway` to produce an `approval_required` outcome.

### Key Principle

Approval is a risk decision object in the product model, not a UI patch layered on top of tools.

## Mode Semantics

The two product-facing modes should affect runtime behavior.

### 标准模式

Should imply:

- more fixed workflows
- more routine/tool usage
- lower path variance
- fewer interruptions
- more stable output contracts

### 发现模式

Should imply:

- more flexible path discovery
- more Psi involvement
- more exploratory intermediate reasoning
- looser output structure

### Important Note

Modes are not only UI labels.

They should influence workflow compilation and runtime execution behavior.

## Example End-To-End Flow

For the first standard-mode playbook `总结资料`, the intended path is:

1. user selects workspace
2. user selects playbook
3. user optionally sets subpath, language, focus
4. runtime creates task
5. runtime compiles fixed workflow
6. runtime creates run
7. steps execute:
   - scan markdown files
   - read markdown files
   - discover themes
   - draft structured summary
   - back up previous output if present
   - write `output/summary.md`
   - register artifact
8. runtime emits task events
9. task completes with artifact

## Static Relationship Diagram

```text
Workspace
  ├─ contains -> source files
  └─ hosts -> Tasks

Playbook
  ├─ owns -> Input Schema
  ├─ owns -> Output Contract
  ├─ owns -> Policy Profile
  └─ compiles to -> Workflow

Task
  ├─ belongs to -> Workspace
  ├─ instantiated from -> Playbook
  ├─ bound to -> Workflow snapshot
  ├─ has many -> TaskEvents
  ├─ has many -> Approvals
  ├─ has many -> Artifacts
  └─ has one current -> Run

Run
  ├─ belongs to -> Task
  ├─ executes -> WorkflowSteps
  ├─ emits -> Runtime Events
  ├─ invokes -> Routines
  ├─ invokes -> PsiInvocation
  ├─ invokes -> Tool Gateway
  └─ produces -> execution outputs

Workflow
  ├─ belongs to -> Playbook snapshot
  └─ contains -> WorkflowSteps

WorkflowStep
  ├─ may invoke -> Routine
  ├─ may invoke -> PsiInvocation
  ├─ may invoke -> Tool Gateway
  └─ may create -> Approval requirement

Routine
  ├─ internal reusable procedure
  ├─ may call -> Tool Gateway
  └─ may call -> PsiInvocation

PsiInvocation
  ├─ intelligent executor
  └─ reaches real actions only through -> Tool Gateway

Tool Gateway
  ├─ receives -> ToolRequest
  ├─ evaluates -> PolicyDecision
  ├─ returns -> ToolResult
  └─ records -> ToolExecutionRecord

Approval
  ├─ belongs to -> Task
  ├─ pauses -> Run
  └─ resumes or fails -> Task/Run

Artifact
  ├─ belongs to -> Task
  ├─ written in -> Workspace
  ├─ validated against -> Playbook Output Contract
  └─ surfaced to -> user
```

## Dynamic Sequence Diagram

```text
User
-> selects Workspace
-> selects Playbook
-> provides input

decacan-app
-> sends task creation request

decacan-runtime control plane
-> creates Task
-> freezes playbook/workspace/policy snapshot
-> compiles Workflow
-> creates Run
-> emits plan-ready event

decacan-runtime data plane
-> executes WorkflowSteps
-> calls Routine / PsiInvocation
-> sends ToolRequests through Tool Gateway

Tool Gateway
-> evaluates policy
-> allow / approval_required / deny
-> executes tool if allowed
-> returns ToolResult

Runtime
-> maps execution facts to task events
-> updates Task and Run state
-> registers Artifact when output contract is satisfied

decacan-app
-> streams task events
-> shows current status
-> shows approvals if any
-> shows artifacts
```

## Future Governance Note

The runtime should preserve a single controlled action path so that a future external governance layer can be introduced without rewriting the product model.

This is a future compatibility requirement, not an MVP dependency.

## Design Principles

- task is the product work unit
- run is the execution attempt
- playbook defines the work contract
- workflow defines the hidden execution structure
- routine is the reusable internal procedure
- tool gateway is the controlled action boundary
- artifact is the formal output object
- approval is the formal risk decision object
- UI consumes product objects, not kernel internals

## Next Step

Use this document with:

- `2026-03-27-decacan-product-architecture.md`
- `2026-03-27-decacan-playbook-system-design.md`
- `2026-03-27-psi-runtime-design.md`

to create the implementation plan for:

- repository/module structure
- runtime package boundaries
- playbook definitions
- event flow
- task detail UI
- verification strategy
