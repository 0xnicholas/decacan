# OpenClaw Cowork-Style Product Concept

Date: 2026-03-26
Stage: Concept
Status: Draft for MVP planning

## Goal

Build a local desktop-agent product using OpenClaw as the execution runtime while borrowing the product shape of Claude Cowork.

The target is not to integrate Cowork itself. The target is to reproduce the same kind of user experience:

- user selects a working directory
- user gives a goal in a local web panel
- agent plans and executes a bounded task
- user can inspect progress, approve risky actions, and receive concrete output files

## Explicit Decisions

The following decisions were made during the concept phase.

### Product Scope

- Do not integrate WeChat or other IM channels in the MVP.
- Do not integrate Cowork itself.
- Use OpenClaw as the agent/runtime core.
- Borrow Cowork only as a product-shape reference.

### Entry Point

- The MVP entry point is a local web panel served on localhost.
- Do not start with a native desktop app.
- Do not start with CLI-first interaction.

Rationale:

- fastest way to validate the workflow
- enough UI surface for approvals, logs, and artifacts
- simpler than packaging a desktop shell in the first iteration

### Workspace Boundary

- The agent works inside exactly one user-authorized directory at a time.
- All file operations must stay inside that authorized directory.
- The product should behave like a focused working environment, not a whole-machine agent.

Rationale:

- simpler permission model
- easier to explain to users
- much safer than multi-directory or whole-machine access
- closer to the core Cowork interaction model

### Execution Strength

- The MVP is not read-only.
- The MVP supports controlled writes inside the authorized directory.
- The MVP supports running shell commands, but only through a strict whitelist.
- The MVP is not allowed to run arbitrary commands.

Rationale:

- read-only is too weak for the desired "coworker" effect
- arbitrary execution is too risky for a first version
- controlled writes plus whitelisted commands is the minimum useful balance

### Recommended System Shape

Chosen approach: keep OpenClaw as the execution kernel and wrap it in a local product shell.

Not chosen:

- pushing all product logic into OpenClaw plugins and skills
- replacing OpenClaw with a custom runtime

Rationale:

- keeps agent logic and product logic separate
- makes permissions, task state, logging, and recovery easier to manage
- allows future model/runtime changes without rebuilding the entire product shell

## High-Level Architecture

```text
[Web UI]
    |
    v
[Local Task API]
    |
    +--> [Workspace Manager]
    |
    +--> [Task Orchestrator]
    |
    +--> [OpenClaw Runtime Adapter]
              |
              v
        [Tool Gateway]
```

## Component Responsibilities

### Web UI

Responsible for:

- choosing the authorized working directory
- creating tasks
- showing plan, progress, approvals, and artifacts
- displaying structured execution logs

Not responsible for:

- direct file access
- direct OpenClaw calls
- permission enforcement

### Local Task API

Responsible for:

- acting as the single product entrypoint
- receiving task creation and approval requests
- exposing task state to the UI

### Workspace Manager

Responsible for:

- storing the current authorized directory
- validating all requested paths
- defining command whitelist and file-write policy

### Task Orchestrator

Responsible for:

- creating tasks
- tracking status transitions
- persisting structured events
- suspending tasks for approval
- registering output artifacts

This is the product-state core. It must not depend on temporary chat history alone.

### OpenClaw Runtime Adapter

Responsible for:

- translating product tasks into OpenClaw agent sessions
- injecting runtime constraints and tool policy
- mapping tool and reasoning events back into product events

### Tool Gateway

Responsible for:

- safe file listing and reading
- safe file creation and modification
- safe shell execution through a whitelist
- output generation such as reports and summaries

This is the enforcement boundary. Prompt instructions are not sufficient on their own.

## MVP Product Objects

### Workspace

Single authorized directory for the current working context.

Suggested fields:

- `id`
- `name`
- `path`
- `permission_level`
- `allowed_commands`
- `created_at`

### Task

Primary user-facing object for a unit of work.

Suggested fields:

- `id`
- `title`
- `goal`
- `status`
- `workspace_id`
- `model_profile`
- `created_at`
- `started_at`
- `finished_at`
- `result_summary`

Suggested status values:

- `draft`
- `queued`
- `running`
- `waiting_approval`
- `succeeded`
- `failed`
- `cancelled`

### Task Event

Structured execution event used for UI logs and replay.

Suggested event types:

- `task.created`
- `context.bound`
- `plan.generated`
- `tool.called`
- `tool.result`
- `file.proposed`
- `approval.requested`
- `artifact.created`
- `task.completed`
- `task.failed`

### Artifact

Concrete output created by a task.

Examples:

- `summary.md`
- `research-notes.md`
- `report.docx`
- `renamed-files.csv`
- `generated-script.sh`

Suggested fields:

- `id`
- `task_id`
- `workspace_id`
- `path`
- `type`
- `label`
- `created_at`

## Typical Task Flow

```text
User submits a goal in the web panel
-> Task API creates a task
-> Orchestrator binds workspace context and logs initial events
-> OpenClaw Runtime Adapter starts an agent session
-> Runtime calls tools through Tool Gateway
-> Tool results are written back as structured task events
-> Risky actions pause in waiting_approval
-> Task completes with summary and artifacts
```

## MVP Tool Set

The first iteration should stay small.

### Required Tools

- `list_files`
- `read_file`
- `write_file`
- `run_command`

### Enforcement Rules

- every path must resolve inside the authorized directory
- commands must match a whitelist
- unsafe actions must be rejected at the tool layer, not only discouraged in prompts

## Approval Rules

The system should enter `waiting_approval` for actions such as:

- modifying existing files
- moving or renaming multiple files
- deleting files
- running non-trivial shell commands
- writing outside a designated output area, if such an area is used

## Core Product Principles

- permission before intelligence
- task before chat
- artifacts before answer text

## Out of Scope for MVP

- WeChat integration
- multi-workspace tasks
- native desktop shell
- arbitrary command execution
- unrestricted whole-machine file access
- browser automation as a required capability
- marketplace or external skill distribution

## Open Questions for MVP Planning

- which tech stack to use for the local web panel and backend
- how to persist task state locally
- how to define the command whitelist
- whether file writes should default into an `output/` directory
- how much of OpenClaw's built-in abstractions should be surfaced directly versus wrapped

## Next Step

Turn this concept document into an MVP implementation plan with:

- concrete module layout
- API surface
- local persistence strategy
- task execution lifecycle
- verification strategy
