# Decacan App Full Product Frontend Design

Date: 2026-03-28
Stage: Full product frontend design
Status: Approved for planning

## Goal

Define the full-product frontend design for `decacan-app` as a team-oriented workspace system for managing agent-assisted knowledge work.

This design extends the MVP workstation into a complete collaborative product for:

- coordinating work inside a workspace
- launching and supervising tasks
- reviewing and approving decisions
- managing deliverables as formal outputs
- collaborating with an embedded execution agent without turning the product into a chat app

## Product Definition

`decacan-app` is a workspace-based team product.

The full product should be understood as:

`a workspace where a team launches, supervises, approves, and delivers agent-assisted knowledge work`

The frontend must not present the product as:

- a generic AI chat tool
- a pure dashboard/KPI product
- a developer debug console
- a file browser with task metadata attached

## Primary User

The primary full-product user is the `workspace owner / project lead`.

This person is responsible for:

- creating tasks
- monitoring task health
- handling approvals
- reviewing results
- pushing work toward delivery

The secondary user is the `executor`, who needs a focused view of assigned tasks and execution progress.

A tertiary `observer / manager` role may exist later for operational oversight, but it is not the primary design center of this version.

## Top-Level Product Objects

The frontend should organize around these first-class objects:

1. `Workspace`
2. `Task`
3. `Deliverable`
4. `Approval`
5. `Member`
6. `Activity`
7. `Agent`

The object hierarchy should be understood as:

`workspace contains tasks, deliverables, approvals, members, and activity`

The product must not remain task-centric at the top level. `Task Detail` is a critical deep page, but not the root product entry.

## Agent Definition

The agent must have a single stable product definition:

`The agent is the workspace execution assistant that helps explain, advance, and revise work inside task and deliverable context.`

This definition must remain consistent across all pages.

### Agent Design Rules

1. The agent never exists without context.
   It must always be attached to a workspace summary, task, deliverable, or approval.

2. The agent changes depth, not identity.
   It may summarize on shallow pages and collaborate on deep pages, but it is always the same product actor.

3. The agent does not replace page IA.
   Every page must remain understandable and actionable without opening the agent.

4. The agent does not become a free-form chat product.
   It helps explain status, request clarification, accept instructions, and guide next steps.

## Information Architecture

The full-product frontend should be organized around a persistent workspace shell with role-aware defaults.

### Primary Modules

- `Workspace Home`
- `Tasks`
- `Deliverables`
- `Approvals`
- `Activity`
- `Members`
- `Inbox`
- `My Work`
- `New Task Flow`

### Default Entry By Role

- `workspace owner / project lead` -> `Workspace Home`
- `executor` -> `My Work`
- `observer / manager` -> `Activity` or a future operations view

## Global Layout

The full-product layout should move beyond the MVP two-column workstation shell.

Recommended structure:

- `Top Bar`
- `Left Workspace Navigation`
- `Main Content Area`
- `Optional Right Context Rail`

### Top Bar

Global persistent actions:

- workspace switcher
- global search / command entry
- `New Task`
- inbox / approvals
- user menu

### Left Navigation

Persistent workspace module navigation:

- Home
- Tasks
- Deliverables
- Approvals
- Activity
- Members

Executors may also see `My Work` more prominently.

### Main Content Area

Every page should use a consistent hierarchy:

- page header
- priority zone
- core work zone
- support zone

### Right Context Rail

The right rail appears only on deep context pages.

It is reserved for:

- agent collaboration
- object context
- history / audit details

It should not be a permanent global sidebar.

## Visual Language

The product should feel like a collaborative operating surface for active work, not a cold admin dashboard and not a chat-native AI interface.

Design direction:

- high signal, low noise
- warm but professional
- clear object hierarchy
- restrained use of color for status and risk
- minimal decorative chrome

The design should emphasize:

- what object the user is looking at
- what state it is in
- what action is most important right now

## Page Matrix

### Workspace Home

Primary user:
- project lead

Purpose:
- decide what needs attention
- understand current workspace progress
- review near-delivery outcomes

Primary modules:
- workspace header
- needs attention
- execution overview
- deliverables
- team snapshot

Agent presence:
- lightweight summary / explanation only

Right rail:
- none by default

### Tasks

Primary user:
- project lead, executor

Purpose:
- manage the task pool
- filter tasks
- enter task detail

Primary modules:
- filters
- list view
- board view
- my tasks view

Agent presence:
- lightweight summary snippets only

Right rail:
- none

### Task Detail

Primary user:
- project lead, executor

Purpose:
- advance a specific task
- inspect execution progress
- handle approvals
- review outputs
- collaborate with the agent

Primary modules:
- task header
- execution activity
- plan progress
- approvals
- deliverables
- timeline

Agent presence:
- full collaboration

Right rail:
- yes
- tabs: `Agent`, `Context`, `History`

### Deliverables

Primary user:
- project lead

Purpose:
- manage formal outputs
- review readiness for delivery

Primary modules:
- filters
- deliverable list
- status ribbons
- preview entry

Agent presence:
- lightweight explanation only

Right rail:
- none

### Deliverable Detail

Primary user:
- project lead, executor

Purpose:
- review a result
- understand source context
- request revision

Primary modules:
- deliverable header
- preview
- review actions
- linked tasks
- revision history

Agent presence:
- simplified collaboration

Right rail:
- yes
- tabs: `Agent`, `Context`, `History`

### Approvals

Primary user:
- project lead

Purpose:
- handle decision backlog

Primary modules:
- approval inbox
- filters
- detail pane
- decision form

Agent presence:
- explanation only

Right rail:
- optional lightweight context only

### Activity

Primary user:
- project lead, observer

Purpose:
- understand workspace-level progress and risk

Primary modules:
- workspace activity feed
- filters
- high-risk clusters
- links to related objects

Agent presence:
- lightweight summarization only

Right rail:
- none

### Members

Primary user:
- project lead

Purpose:
- understand roles, workload, and contribution

Primary modules:
- member list
- role badges
- workload summary
- recent activity

Agent presence:
- none

Right rail:
- none

### Inbox

Primary user:
- project lead, executor

Purpose:
- process all items waiting on the current user

Primary modules:
- approvals waiting on me
- deliverables waiting on me
- tasks needing input
- alerts and mentions

Agent presence:
- lightweight summary only

Right rail:
- none

### My Work

Primary user:
- executor

Purpose:
- focus on personally assigned work

Primary modules:
- needs my input
- running tasks
- blocked tasks
- recent outputs

Agent presence:
- lightweight here, full inside task detail

Right rail:
- none by default

### New Task Flow

Primary user:
- project lead, executor

Purpose:
- launch a formal task

Primary steps:
- choose playbook
- define goal
- review plan
- launch

Agent presence:
- no full chat
- optional brief explanations only

Right rail:
- none

## Workspace Home Layout

`Workspace Home` should act as the project lead control center.

Recommended sections:

1. `Header`
   - workspace title
   - one-line status summary
   - `New Task`
   - `View Deliverables`
   - `Open Inbox`

2. `Needs Attention`
   - approvals waiting
   - blocked or failed tasks
   - deliverables needing review
   - deadline or risk alerts

3. `Execution Overview`
   - task health
   - important in-progress tasks
   - workspace activity

4. `Deliverables`
   - recently updated outputs
   - ready for review
   - request revision actions

5. `Team Snapshot`
   - recent contributors
   - blocked owners
   - active members

This page should answer:

- what needs my attention
- what is moving
- what is close to delivery

## Tasks Page Layout

The tasks page should be a management surface, not a task-only detail clone.

Recommended capabilities:

- list view
- board view
- my tasks view
- status, owner, playbook, and text filters

Task rows or cards should show:

- task title or goal summary
- playbook
- owner
- current state
- current activity summary
- last update
- linked deliverable

## Task Detail Layout

`Task Detail` is the deepest execution surface in the product.

Main column order:

1. task header
2. execution activity
3. plan progress
4. approvals
5. deliverables
6. timeline

Right rail:

- `Agent`
- `Context`
- `History`

This page must support both:

- managerial supervision
- executor-level correction and collaboration

## Deliverables Design

Deliverables must become formal reviewable results, not hidden artifacts.

The deliverables list should support:

- status filtering
- owner filtering
- source task filtering
- preview entry
- review state visibility

Deliverable detail should support:

- content preview
- review / confirm actions
- revision request actions
- source-task references
- version or revision history

## Approval Design

Approvals should be a first-class decision surface.

The approvals page should support:

- pending decisions
- resolved decisions
- rejected decisions
- aging / stalled approvals

Each approval entry should explain:

- what decision is requested
- why it needs approval
- what task or deliverable it affects
- who requested it
- how long it has been waiting

## Activity Design

Activity is a workspace-level product event feed, not a raw log viewer.

It should show high-signal events such as:

- task started
- task blocked
- task completed
- approval requested
- approval resolved
- deliverable updated
- deliverable confirmed
- agent requested clarification

Every activity row should link back to the relevant object.

## Agent Rail Strategy

The agent should not appear at equal depth everywhere.

### Full Agent Rail

Only on:

- `Task Detail`

### Simplified Agent Rail

Only on:

- `Deliverable Detail`

### Lightweight Agent Presence

On:

- `Workspace Home`
- `Tasks`
- `Deliverables`
- `Approvals`
- `Activity`
- `Inbox`
- `My Work`

Lightweight means:

- summary
- explanation
- jump into the relevant deep page

It does not mean opening a full conversational panel.

## State Design

The full-product frontend must define mature states for every major page.

### Empty States

Every page needs meaningful empty states with product guidance.

Examples:

- no tasks yet
- no deliverables yet
- no approvals waiting
- no recent activity

### Loading States

Every major page should have page-level skeletons, not bare loading text.

Minimum:

- workspace home skeleton
- tasks list skeleton
- task detail skeleton
- deliverable preview skeleton

### Failure States

The UI should clearly distinguish:

- network failure
- permissions failure
- object missing
- task execution failure
- live connection interruption

Task execution failure must remain actionable and recoverable.

## Device Strategy

The product is desktop-first.

### Desktop

Full experience:

- top bar
- left nav
- wide main content
- optional right context rail

### Tablet

Adaptations:

- collapsible left nav
- right rail becomes drawer

### Mobile

Mobile is a reduced support surface, not the primary design target.

Good mobile candidates:

- inbox
- approvals
- deliverable preview
- lightweight task status

Full task collaboration should remain desktop-first.

## Development Priority Matrix

### P0

- `Workspace Home`
- `Task Detail` full version
- `New Task Flow`

Why:

- establishes the project lead primary workflow
- upgrades MVP into a full product shape

### P1

- `Tasks`
- `Deliverables`
- `Deliverable Detail`
- `Approvals`

Why:

- formalizes task pool, deliverables, and decisions

### P2

- `Inbox`
- `My Work`

Why:

- improves day-to-day efficiency for both project leads and executors

### P3

- `Activity`
- `Members`

Why:

- deepens collaboration visibility and operational completeness

## Relationship To MVP

This full-product design should extend the MVP, not discard it.

What carries forward from MVP:

- task execution center
- execution activity
- artifact preview becoming deliverable preview
- task-scoped agent collaboration

What expands in the full product:

- workspace-level coordination
- deliverables as first-class outputs
- approvals as a dedicated center
- role-aware entry points
- inbox, members, and team-oriented navigation

## Success Criteria

The full-product frontend design is successful if:

- project leads can understand a workspace at a glance
- users can move naturally from task creation to delivery
- deliverables are treated as formal review objects
- agent collaboration feels present but never displaces the core product structure
- the same product identity is maintained across shallow and deep pages

## Non-Goals

This design does not define:

- backend API contracts
- frontend state implementation details
- permission model internals
- billing, organizations, or external customer portals
- mobile-native-first interaction patterns

Those topics should be handled in later planning or subsystem specs.
