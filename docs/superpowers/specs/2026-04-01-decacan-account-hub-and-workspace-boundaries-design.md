# Decacan Account Hub And Workspace Boundaries Design

Date: 2026-04-01
Stage: Product surface architecture
Status: Approved for planning

## Goal

Define the top-level product boundary between the two frontend surfaces:

- `apps/workspaces` as the default workspace-scoped execution product
- `apps/admin` as the account-scoped aggregation and playbook operations product

This design does not replace the existing backend layering. It clarifies how users should enter and move through the product, and how product-facing APIs should align with those surfaces.

## Why This Design Exists

The current repository already has two frontend surfaces, but their product meanings are not fully settled:

- `workspaces` already behaves like a workspace execution shell
- `admin` currently behaves like a partial studio / platform console
- several flows still mix account-level selection with workspace-level execution

Without a clear boundary, the next quarter would likely expand both surfaces in parallel and create more overlap in navigation, API shape, and ownership.

## Product Decision

The product should be understood as:

`workspace-first execution + account-level hub`

### Entry Rule

After login, the user should land in their current default workspace.

From there, they may enter the account-level hub through the avatar menu or similar secondary navigation.

This means the product is not centered on a global dashboard home. It is centered on active work inside a workspace, with a secondary account layer for cross-workspace aggregation and design/publishing tasks.

## Surface Definitions

### 1. Workspace Surface

`apps/workspaces` is the default product surface.

Its purpose is to help a user operate inside one concrete workspace context:

- start work in the selected workspace
- inspect and advance tasks
- review approvals and deliverables in that workspace
- understand workspace activity and team status
- collaborate around the outputs of that workspace

This surface is context-first. It should assume the user is already working within a specific workspace boundary.

### 2. Account Hub Surface

`apps/admin` should be reinterpreted as an account-level hub, not a classic system administrator console.

Its purpose is to help one user understand and manage work that spans multiple workspaces and teams:

- aggregate "my work" across workspaces
- show cross-workspace approvals and recent tasks
- list recent or frequent workspaces
- host playbook design, versioning, and publishing workflows
- provide account-level navigation into workspace execution

This surface is account-first. It should answer:

`What am I involved in across the system, and what operational or authoring work do I need to handle next?`

## Object Ownership

The most important decision is not page count. It is object ownership.

### Workspace-Scoped Objects

These objects should primarily live in `workspaces`:

- `Workspace Home`
- `Task`
- `Task Detail`
- `Deliverable`
- `Activity`
- `Member`
- workspace-local approvals and decision handling

These views may be linked from the account hub, but their execution context belongs to a concrete workspace.

### Account-Scoped Objects

These objects should primarily live in the account hub:

- `My Approvals` across workspaces
- `My Tasks` / recent tasks across workspaces
- recent or pinned workspaces
- cross-workspace work summary
- playbook studio
- release / publish surfaces for reusable playbooks

These views summarize and route. They should not become a second workspace detail shell.

## Playbook Lifecycle Boundary

The playbook lifecycle should be split across the two surfaces.

### Account Hub Responsibilities

The account hub owns:

- playbook design
- editing and validation
- version management
- publishing and release decisions

### Workspace Responsibilities

The workspace surface owns:

- selecting from already published playbooks
- supplying workspace-local context and inputs
- previewing the task that would be created
- instantiating a task / run in the current workspace
- supervising execution and consuming outputs

This preserves a clean product rule:

`design and publish centrally; instantiate and execute locally`

## Implications For Current Repository Structure

### What Already Fits

`apps/workspaces` is already close to the intended role:

- workspace home
- tasks
- deliverables
- approvals
- activity
- members
- task detail

These are all good signs that the execution surface has the correct center of gravity.

### What Does Not Yet Fit

`apps/admin` is not yet an account hub.

Today it is closer to:

- a platform shell
- a playbook studio stub
- a future admin console with many placeholder routes

This is the main mismatch. The repo already has a second surface, but it does not yet present the right top-level value for normal users.

### What Needs Rehoming

Some existing flows mix account-scoped and workspace-scoped responsibilities. In particular:

- launch flows that begin with broad workspace selection
- inbox / approval concepts that aggregate across workspaces
- dashboard wording that still frames the second surface as an admin console

These are not necessarily wrong features. They are features that need clearer ownership.

## API And Aggregation Guidance

Product APIs should begin to separate into two families.

### Account APIs

These APIs aggregate by user:

- my approvals across workspaces
- recent tasks across workspaces
- recent workspaces
- account-level summaries
- playbook authoring and publish flows

### Workspace APIs

These APIs aggregate by workspace:

- workspace home
- tasks in workspace
- task detail in workspace
- deliverables in workspace
- members in workspace
- workspace activity

The frontend should not have to guess which lists are cross-workspace and which are workspace-local. That distinction should be explicit in both route design and DTO boundaries.

## Navigation Model

### Default Navigation

1. User authenticates
2. User lands in current default workspace
3. User works inside the workspace shell
4. User opens account hub from avatar or global menu when they need cross-workspace visibility or playbook operations

### Account Hub Navigation

The account hub should behave like a secondary home, not the mandatory first page after login.

It should help the user:

- jump into another workspace
- resolve work that is not confined to one workspace
- manage reusable playbooks

## Quarterly Priority

The next quarter should prioritize product-surface convergence, not breadth expansion.

### Phase 1: Clarify Surface Ownership

- define account-scoped vs workspace-scoped objects
- update wording and documentation
- stop adding overlapping pages to both surfaces

### Phase 2: Turn `admin` Into A Real Account Hub

- replace the generic dashboard framing
- add user-centered work aggregation
- keep playbook studio there as the design / publish surface

### Phase 3: Tighten `workspaces` As The Execution Surface

- keep workspace home as the local control center
- move launch toward workspace-local instantiation of published playbooks
- keep task, deliverable, approval, and activity flows workspace-first

## Non-Goals

This design does not:

- define a system-wide super-admin console
- rename `apps/admin` immediately
- redesign backend runtime layering
- replace existing task-detail or workspace-detail interaction models

If a true system administration console is needed later, it should be treated as a third privileged surface or a privileged area within the account hub, not as the meaning of the entire second frontend.

## Documentation Status

This design supersedes earlier assumptions that described the second frontend primarily as an administrator dashboard.

Earlier workspace/task-focused frontend documents remain useful where they describe the execution surface, but they should no longer be read as defining the whole product alone.

## Summary

The correct product split for the current direction is:

- `workspaces` = workspace-scoped execution surface and default entry after login
- `admin` = account-scoped hub for cross-workspace work aggregation plus playbook design and publishing

The main architectural task for the next quarter is not adding more modules. It is making this boundary explicit across routes, APIs, documentation, and product language.
