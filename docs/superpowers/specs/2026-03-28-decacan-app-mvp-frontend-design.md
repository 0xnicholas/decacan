# Decacan App MVP Frontend Design

Date: 2026-03-28
Stage: MVP frontend design
Status: Approved for planning

Note: This document defines the MVP workstation frontend. The full team-product extension is defined separately in `2026-03-28-decacan-app-full-product-frontend-design.md`.

## Goal

Define the MVP frontend design for `decacan-app` as a local workstation product that helps general technical team members understand and use the system without prior training.

The design must validate the product mode:

`workspace + playbook -> task -> approval(if needed) -> artifact`

## Product Intent

The frontend is not a generic chat UI and not a developer control panel.

It should present `decacan` as a task-oriented workstation where the user:

1. selects a working directory
2. chooses a playbook
3. reviews a short plan
4. watches task progress
5. handles approvals when needed
6. receives a formal artifact

The UI should feel like the user is delegating bounded work, not chatting with a model.

## Target User

The primary MVP audience is:

- general technical team members
- product managers
- collaborators who may understand software workflows but are not AI tooling experts

This audience needs the product to explain itself through structure and language. The design therefore prioritizes clarity of workflow over raw flexibility.

## Success Criteria

The frontend design is successful if it enables these outcomes:

- first-time users can understand how to start a task without training
- users understand that `Playbook` is the main product entry
- users can follow what a task is doing through product-visible states
- approval requests are visible and understandable
- the final artifact is clearly presented as the formal result of the task
- the product is understood as a workstation, not a chat assistant

## Non-Goals

The MVP frontend design does not include:

- an open-ended agent chat interface
- complex task history or global search
- multi-workspace concurrent operation in one UI session
- custom playbook authoring
- team collaboration or role-based permission systems
- exposing runtime, Psi, or raw tool execution internals directly in the UI

## Core Design Principles

### 1. Playbook Is The Product Entry

The user should start by choosing a playbook rather than typing into an empty prompt box.

### 2. Task Detail Is The Product Center

The most important page in the product is the task detail view, because it is where planning, progress, approvals, and results come together.

### 3. Artifact Is A First-Class Result

Artifacts are not passive file links. The UI should present them as the formal outputs of a completed task.

### 4. Product Events, Not Runtime Internals

The frontend should consume product-facing task events and task projections. It must not bind directly to raw runtime or Psi events.

### 5. Structured Interaction Over Chat

The UI may accept task-scoped user input such as launch notes, approval comments, or retry instructions, but should not center the experience around an open conversation pane.

## Information Architecture

The MVP frontend should be organized around three primary views:

### 1. Launch

Purpose:

- select workspace
- browse playbooks
- fill structured inputs
- review a short plan preview
- create a task

### 2. Task

Purpose:

- show the current task state
- display the short plan and execution progress
- surface approvals
- present artifacts
- show a readable timeline of product events

This is the central product view.

### 3. Artifact

Purpose:

- preview or inspect the formal result of the task
- provide a stable entry point to the output

For MVP, artifact detail may be implemented as a dedicated route or as an overlay/drawer from the task page.

## Workspace Layout

The primary UI shape should be a two-column workstation layout.

### Left Column: Persistent Context

The left column should keep the user oriented inside the current working context.

Recommended content:

- current workspace card
- current playbook card
- active task status summary
- short key-step list
- artifact shortcuts
- recent tasks

This column answers:

`What am I working on right now?`

### Right Column: Main Work Area

The right column should host the active user task.

In `Launch` state it should show:

- playbook description
- playbook choice cards
- structured input form
- supplemental task note field
- short plan preview

In `Task` state it should show:

- task header with state
- plan and progress
- timeline
- approval panel
- artifact panel
- retry or correction controls when applicable

This column answers:

`What is happening now, and what do I need to do next?`

## Why There Is No Chat Pane

The MVP should not include a classic agent chat interface.

Reasons:

- it would mislead users into treating the product as a generic assistant
- it would weaken the product meaning of `Playbook`
- it would compete visually with plan, approval, and artifact views
- it would pull the product toward prompt iteration rather than task execution

The design still allows limited interaction through structured, task-scoped inputs:

- launch notes
- approval comments
- retry or correction notes after pause or failure

## Route Design

The route structure should stay intentionally small:

- `/`
- `/launch`
- `/tasks/:taskId`
- `/artifacts/:artifactId`

Suggested behavior:

- `/` returns the user to the current active context
- `/launch` is the task start surface
- `/tasks/:taskId` is the core workstation detail page
- `/artifacts/:artifactId` is optional as a full page and may be rendered as a detail surface from the task page

The route model should reinforce that the product is centered on starting work, inspecting a task, and receiving a result.

## Frontend State Model

The frontend should organize client state into four focused groups:

### 1. Catalog State

Holds:

- current workspace selection
- available playbooks
- selected playbook

### 2. Draft State

Holds:

- launch form values
- structured inputs
- supplemental note
- preview request state

### 3. Active Task State

Holds the aggregated data needed to render task detail:

- task summary
- workspace summary
- playbook summary
- short plan
- approvals
- artifacts
- recent timeline events
- available user actions

### 4. UI State

Holds:

- panel expansion
- preview drawers
- transient loading states
- local filtering or presentation preferences

The key principle is that task detail should render from a stable aggregated task view, not from scattered low-level entities.

## API Design Direction

`decacan-app` should expose product-facing APIs for the frontend. The frontend must not be forced to reconstruct UI meaning from minimal runtime entities.

### Catalog APIs

Recommended endpoints:

- `GET /api/workspaces`
- `GET /api/playbooks?workspace_id=...`

Recommended `PlaybookCardDto` fields:

- `key`
- `title`
- `summary`
- `mode_label`
- `expected_output_label`
- `expected_output_path`
- `input_schema`
- `automation_level`
- `approval_hint`

### Launch APIs

Recommended endpoints:

- `POST /api/task-previews`
- `POST /api/tasks`

Recommended `TaskPreviewDto` fields:

- `preview_id`
- `workspace`
- `playbook`
- `input_summary`
- `plan_steps`
- `expected_artifact`
- `approval_risks`
- `will_auto_start`

The design expects users to see a short plan preview before starting a task.

### Task Workspace APIs

Recommended endpoints:

- `GET /api/tasks/:task_id`
- `GET /api/tasks/:task_id/timeline`
- `GET /api/tasks/:task_id/stream`
- `POST /api/approvals/:approval_id/decision`
- `POST /api/tasks/:task_id/retry`
- `GET /api/artifacts/:artifact_id`
- `GET /api/artifacts/:artifact_id/content`

Recommended `TaskDetailDto` structure:

- `task`
- `workspace`
- `playbook`
- `plan`
- `approvals`
- `artifacts`
- `timeline`
- `actions`
- `input_echo`

This aggregated DTO is the primary contract for the task detail page.

## Event Model

The frontend should subscribe to product-visible task events over SSE.

Recommended event envelope fields:

- `event_id`
- `task_id`
- `sequence`
- `event_type`
- `occurred_at`
- `snapshot_version`
- `payload`

Recommended MVP event types:

- `plan.ready`
- `task.running`
- `task.waiting_approval`
- `approval.resolved`
- `artifact.ready`
- `task.completed`
- `task.failed`

Recommended frontend event handling model:

1. fetch the current task snapshot
2. subscribe to the task SSE stream
3. append timeline entries locally
4. re-fetch the task snapshot after key events using `snapshot_version`

This keeps the UI stable without exposing runtime internals directly.

## Frontend Engineering Direction

The frontend should be implemented as a dedicated TypeScript application, while `decacan-app` continues to own the local API, SSE surface, and production static asset serving.

Recommended stack:

- React
- TypeScript
- Vite
- TanStack Router
- TanStack Query
- native `EventSource`
- `react-hook-form`
- `zod`

Recommended structure:

- `frontend/src/app`
- `frontend/src/features/launch`
- `frontend/src/features/task-detail`
- `frontend/src/features/artifacts`
- `frontend/src/entities`
- `frontend/src/shared`

The split should follow product responsibilities rather than generic technical folders.

## Implementation Phases

The frontend plan should proceed in this order:

### Phase 1: Product DTOs And Aggregated API Contracts

Define the frontend-facing DTOs and task aggregation contract first.

### Phase 2: Frontend Workspace Shell

Create the frontend application shell, routing, two-column layout, API client, and SSE client.

### Phase 3: Launch Flow

Implement:

- workspace selection
- playbook selection
- task input form
- short plan preview
- task creation redirect

### Phase 4: Task Detail Core Flow

Implement:

- task header
- plan and progress panel
- timeline panel
- approval panel
- artifact panel
- SSE-driven updates

### Phase 5: Artifact Preview And Failure Recovery

Implement:

- artifact preview
- failure state presentation
- retry or correction flow
- approval decision feedback

### Phase 6: Demo-Ready Polish

Polish:

- product copy
- terminology
- loading and empty states
- default demo data
- static asset serving integration

## Testing Strategy

The plan should verify product comprehension, not only rendering correctness.

### Contract Tests

Validate:

- product DTO shape
- task aggregate responses
- SSE event envelopes

### Component And Route Tests

Validate:

- launch state transitions
- task page rendering across key task states
- approval flow rendering
- artifact readiness presentation

### End-To-End Tests

At minimum cover:

1. launch a standard-mode task and reach a final artifact
2. pause on approval, approve, and continue
3. fail or pause, provide a correction, and recover

### Demo Acceptance Checklist

Manually verify that a first-time user can:

- choose a workspace
- understand the difference between playbooks
- interpret the short plan
- respond to approvals
- find the final artifact

## Key Risks

- frontend DTOs remain too thin and force UI-side reconstruction
- short plan preview does not match actual task progression
- product events leak runtime detail
- task detail becomes too log-heavy
- frontend and Rust integration creates avoidable build friction
- the product is interpreted as a chat assistant because of UI drift

## Deferred Items

These items are intentionally out of scope for this MVP frontend plan:

- open chat UI
- large-scale task history
- search and filtering systems
- multi-user collaboration
- custom playbook editing
- advanced permissions

## Approval To Proceed

This design is approved for implementation planning once the written document has been reviewed and accepted by the user.

Note: the standard brainstorming workflow calls for a delegated spec-document review. In this session, subagent delegation is not available by policy, so spec review must be performed manually in-session.
