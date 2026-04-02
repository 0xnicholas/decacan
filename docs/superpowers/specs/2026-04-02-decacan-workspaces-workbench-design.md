# Decacan Workspaces Workbench Design

Date: 2026-04-02
Stage: Workspace home interaction design
Status: Draft for review

## Goal

Define how `apps/workspaces` should behave as a workspace-scoped execution workbench, with a configurable `Workspace Home` that adapts by industry or workspace type without becoming a freeform dashboard builder.

This design focuses on:

- the role of `Workspace Home` inside `apps/workspaces`
- the interaction hierarchy of the home workbench
- the role of a persistent workspace assistant
- the configuration boundary between `apps/console` and `apps/workspaces`

This design does not redefine the broader account/workspace product split that was already established in [2026-04-01-decacan-account-hub-and-workspace-boundaries-design.md](/Users/nicholasl/Documents/build-whatever/decacan/docs/superpowers/specs/2026-04-01-decacan-account-hub-and-workspace-boundaries-design.md).

## Why This Design Exists

The current `workspaces` app already has the right object center:

- workspace home
- tasks
- deliverables
- approvals
- activity
- members
- task detail

However, the current home surface is still closer to a generic control center than to a true daily workbench. The product direction discussed in this design is stronger:

- `workspaces` should feel like a collaborative project room with queue awareness
- the first job of home is to reconnect the user to ongoing work
- different industries should be able to shape the home experience
- configuration should happen in `Console`, not inside `workspaces`

Without a clear design, the home page would likely drift into one of two bad outcomes:

- a generic dashboard with weak workflow value
- an over-flexible page builder that fragments the product model

## Product Decision

`apps/workspaces` should act as a workspace-scoped execution workbench.

Its overall product character is:

`collaborative project room + action queue`

Its home-page posture is:

`resume current work first`

This means `Workspace Home` is not primarily:

- a KPI dashboard
- a global inbox
- a second task-detail screen

It is the place a member lands to understand:

- what they were working on
- what changed since last time
- what they should do next

## Phase-1 Scope

Phase 1 configuration is intentionally narrow.

### Included

- configurable `Workspace Home` only
- template selection by workspace type or industry scenario
- template-defined module composition, terminology, business-summary metrics, and primary CTA
- persistent workspace assistant dock on home

### Excluded

- configurable task list pages
- configurable deliverable, approval, activity, or member pages
- configurable task detail structure
- arbitrary page-builder layout tools
- user-by-user home personalization

The ownership rule is:

- `Console` manages workbench templates
- `workspaces` renders a template-selected home surface

## Design Principles

### 1. Resume First

The home page should help a member pick up ongoing work faster than opening the task list and manually reconstructing context.

### 2. Workspace Context First

Everything on home should reinforce that the user is already inside one concrete workspace, not browsing an account-wide control plane.

### 3. Consistent Product Frame

Industry adaptation should happen inside the home canvas, not by rewriting the whole product shell. Navigation, object model, and route structure stay stable.

### 4. Opinionated Configuration

Templates may configure modules and meanings, but not invent arbitrary layouts or replace the product's core interaction model.

### 5. Assistant As Collaborator

The assistant should operate as a persistent collaborator in the same workspace context, not as a detached chatbot.

## Home Interaction Model

The recommended home backbone is:

`Resume-First Studio`

This model was chosen because it best fits the desired behavior:

- restore context quickly
- keep current work visible
- keep queue items present but not dominant
- leave room for collaboration and discussion

### Fixed Product Frame

The following elements stay stable across templates:

- top bar
- workspace switcher
- left navigation
- core workspace object model
- route structure for home, tasks, deliverables, approvals, activity, and members

Templates do not change the frame. They change the home canvas inside it.

### Home Information Hierarchy

The home canvas should follow a fixed priority order:

1. `Resume Strip`
2. `Current Work Cluster`
3. `My Queue`
4. `Team Activity`
5. `Discussion`

This order is a product rule, not a template preference.

Templates may vary the content and language of these regions, but they should not turn the home page into a queue-first or KPI-first dashboard.

### Required Meaning Of Each Region

#### Resume Strip

The top region should answer:

- what is the best current work item to continue
- what changed most recently
- what is the next recommended action

This region may also expose the template's primary CTA.

Examples:

- `Resume Review Cycle`
- `Continue Case Coordination`
- `Open Latest Client Revision`

#### Current Work Cluster

This region shows the main work objects the user is actively participating in.

Depending on the template, this may emphasize:

- tasks
- projects
- cases
- active outputs
- pinned resources

#### My Queue

This region holds action-bearing items that matter now but should not dominate the entire page under normal conditions.

Examples:

- approvals awaiting review
- replies requested
- blocked items
- unresolved mentions

#### Team Activity

This region highlights meaningful changes by collaborators:

- handoffs
- state changes
- newly uploaded outputs
- recent execution movement

#### Discussion

This region surfaces conversation that is tied to current work:

- unresolved questions
- recent decisions
- active threads
- requests for feedback

## Workspace Assistant Dock

`Workspace Home` should include a persistent right-side `Workspace Assistant Dock`.

This is not a generic chat widget. It is a workspace-native collaborator that shares the same execution context as the user.

### Core Responsibilities

The dock should help the user:

- understand what changed
- understand what matters now
- navigate into the right work object
- execute common actions without losing context

### Behavioral States

The dock operates in three states:

1. `Ambient`
2. `Contextual`
3. `Escalated`

#### Ambient

The default state summarizes the workspace and proposes a few concrete next actions.

Examples:

- `You have 2 blocked items and 1 draft awaiting review`
- `The latest artifact changed after design feedback`
- `Resume the launch checklist`

#### Contextual

When the user selects a task, artifact, discussion, or queue item from home, the dock pivots into that object's local context.

This state should preserve the feeling that the user is still on home, but now working against one active object.

#### Escalated

When the workflow becomes deep, long-running, or highly task-specific, the user should be routed into task detail.

That route should preserve continuity of:

- selected object
- recent assistant context
- action intent

### Authority Model

The assistant may execute most actions on behalf of the user.

High-risk actions require explicit user confirmation.

Examples of high-risk actions:

- approvals
- destructive changes
- publish or release transitions
- member removal
- irreversible workflow transitions

### Product Rule

The assistant augments the workbench. It does not replace direct UI affordances.

The following should remain directly available in the interface:

- opening work objects
- reviewing lists
- navigating between sections
- initiating common actions

This avoids turning the homepage into a chat-first experience.

## Template Configuration Model

Templates should be configured in `Console`.

The configuration model should be:

`fixed slots + module registry`

It should not be:

`freeform page builder`

### Why This Boundary Matters

The product needs meaningful industry adaptation without losing consistency, testability, or the ability for users to transfer mental models between workspaces.

### What A Template Controls

A template may define:

- the home modules assigned to each supported slot
- terminology for user-facing labels
- the business-summary metrics shown by home modules
- the primary CTA used by the resume strip
- optional lower-tier modules that can be hidden

### What A Template Does Not Control

A template may not define:

- arbitrary HTML or custom page layouts
- navigation structure
- route ownership
- the core workspace object model
- a different top-level interaction hierarchy

### Slot Model

Phase 1 should use a bounded slot model rather than unconstrained region editing.

Recommended slot groups:

- `resume`
- `current_work_primary`
- `queue_secondary`
- `collaboration_left`
- `collaboration_right`
- `assistant_dock`

The rendering system should decide layout. Templates fill slots with compatible modules.

Required in phase 1:

- `resume`
- `current_work_primary`
- `queue_secondary`
- `assistant_dock`

Optional in phase 1:

- `collaboration_left`
- `collaboration_right`

The assistant dock is a required home capability, not a template-optional plugin.

### Module Compatibility

Each slot should accept only specific module categories.

Examples:

- `resume` accepts resume-oriented modules only
- `queue_secondary` accepts action queue modules only
- collaboration slots accept activity or discussion modules

This keeps configuration composable and prevents broken layouts.

## Terminology And Metrics

Templates may change domain language and business-summary metrics shown on home.

Examples:

- `Task` -> `Project`
- `Deliverable` -> `Asset`
- `Approval` -> `Review`

The metric flexibility in phase 1 is intentionally narrow.

### Allowed

- choose which summary metrics appear in a module
- rename metric labels
- adjust visual emphasis and thresholds
- map the metric set to the template's domain language

### Not Allowed

- arbitrary formulas authored by admins
- BI-style report construction
- metric definitions that bypass the core object model

This means metric configuration is really:

`selecting and presenting business state summaries`

not:

`building a reporting system`

## Daily User Flow

The intended daily interaction loop is:

1. User lands on `Workspace Home`
2. Resume strip identifies the best work item to continue
3. Assistant dock explains recent changes and proposes actions
4. User opens a task, artifact, discussion, or queue item
5. User acts either inline on home or in task detail
6. User returns to home with continuity of state

This design should make home feel like a workbench entry point, not just a place to glance before switching to another page.

## State And Fallback Rules

### No Current Work

If there is no meaningful work to resume, the resume region should become a useful start surface instead of an empty KPI panel.

Examples:

- launch new work
- accept assigned work
- review new inbound items

### Missing Or Invalid Template

If the workspace template is missing, invalid, or unavailable, `workspaces` should fall back to a default home template with standard labels and modules.

The home page should remain usable even when template configuration fails.

### Assistant Unavailable

If the assistant is unavailable, the dock should degrade to a non-conversational status panel with direct action shortcuts where possible.

The failure mode should be:

`reduced assistance`

not:

`missing home functionality`

### Data Loading And Errors

Home should prefer panel-level loading, empty, and error states rather than collapsing the entire workbench whenever one region fails.

This aligns with the existing direction of shared `LoadingState`, `EmptyState`, and `ErrorState` UI building blocks in `apps/workspaces`.

## Relationship To Existing Task Detail

The existing task detail model already contains:

- agent collaboration
- context
- history

That is a good sign. Home should not duplicate a full task workspace.

Instead:

- home hosts a lighter persistent assistant
- task detail remains the deep execution surface
- assistant context should carry forward when the user escalates from home into task detail

## Planning Implications

This spec implies several implementation tracks, but they should stay separate during planning:

1. template and config contract design
2. home layout and module rendering
3. workspace assistant dock behavior
4. fallback and state handling

These are related, but they should still be planned as one coherent home-workbench initiative rather than mixed with unrelated tasks-page or task-detail redesign work.

## Verification Focus

Implementation planning should include verification for:

- correct template selection and fallback behavior
- rendering of slot-compatible modules
- assistant behavior across ambient, contextual, and escalated states
- preservation of continuity when moving from home into task detail
- panel-level loading, empty, and error states
- confirmation boundaries for high-risk assistant actions

## Non-Goals

This spec does not attempt to define:

- the full `Console` template-editor UX
- backend storage schema for templates
- account-level work aggregation
- a full redesign of task detail
- role-based personalized home variants

Those may be planned later if needed, but they are not required to implement the workbench direction defined here.
