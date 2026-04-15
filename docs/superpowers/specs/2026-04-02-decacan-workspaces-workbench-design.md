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
- the relationship between home templates and the broader `Workspace Profile` model

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

This is still the correct phase-1 implementation boundary.

However, the longer-term product model should not stop at `home template`.

The broader runtime unit for customer-specific Workspaces should be:

`Workspace Profile`

In that model:

- a template is one part of a profile
- a profile is bound to one workspace at runtime
- the workspace shell, home, navigation extensions, specialized views, and assistant framing all resolve from that profile

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

## Workspace Profile Model

The product should evolve from a narrow `home template` concept toward a broader runtime `Workspace Profile` concept.

The distinction is:

- `Home Template` defines the home canvas
- `Workspace Profile` defines how a concrete workspace should feel and behave for one customer or domain

This means a profile is not just a frontend theme or a build-time industry switch.

It is a runtime configuration object bound to a workspace.

### Product Role Of A Workspace Profile

A `Workspace Profile` should be the main unit of customer-specific Workspaces delivery.

It should allow a workspace to look and behave as if it were specialized for one business domain, while still running on the shared Workspaces execution platform.

The customer should experience:

- domain-specific language
- domain-appropriate home emphasis
- relevant navigation
- required specialized pages
- assistant behavior that matches the domain

Internally, the product should still preserve:

- one shared task model
- one shared deliverable/approval execution model
- one shared task-detail execution surface
- one shared assistant session and delegation model

### Why Profile Exists Above Template

The home template alone is too narrow for support-led customer delivery.

Once Workspaces must support customer-specific onboarding across multiple industries, the delivery unit must include more than home:

- terminology
- navigation extensions
- specialized pages
- assistant framing
- home/workbench behavior

That bundle is the `Workspace Profile`.

### Runtime Resolution Model

Workspaces should eventually resolve customer-specific behavior using this runtime path:

1. each workspace is bound to one `workspace_profile_id`
2. backend APIs resolve the profile for that workspace
3. frontend loads the profile at runtime when entering the workspace
4. shell, home, navigation, and specialized routes render from the resolved profile

This is preferable to a pure build-time industry selection model because:

- different workspaces in the same deployment may use different profiles
- support can deliver customer-specific workspaces without shipping separate apps
- similar customers can reuse and adapt an existing profile

### Default Profile Requirement

The runtime profile model must always include one default profile.

Recommended id:

`default-workspace-profile`

This default profile is required for three reasons:

#### 1. System Fallback

If a workspace has no explicit profile binding, or if profile resolution fails, Workspaces must still render a usable workspace shell and home.

The failure mode should be:

`fallback to default profile`

not:

`workspace cannot load`

#### 2. Platform Baseline

The default profile defines the generic Workspaces baseline for non-specialized usage.

It should include:

- standard terminology
- standard workbench title
- standard home module set
- standard assistant framing
- core navigation only
- no required specialized extension routes

#### 3. Base For New Profiles

When support or engineering creates a new customer profile, the default profile should be a valid starting point if no closer reusable profile exists.

This makes the default profile the root baseline of the profile system rather than only an error fallback.

### Default Profile Rules

The default profile should follow these rules:

- every workspace must resolve to exactly one profile at runtime
- if no explicit profile is bound, resolve to the default profile
- if explicit profile resolution fails, fall back to the default profile
- the default profile must support all core workspace sections without extension dependencies
- the default profile must not encode a customer-specific or industry-specific worldview

### What The Default Profile Should Not Be

The default profile should not be:

- a content-industry default
- a legal-industry default
- a customer-specific seed disguised as a platform default
- a profile that depends on optional pages in order to remain usable

It should be:

`the minimum complete, production-usable Workspaces baseline`

### What A Workspace Profile Controls

At minimum, a profile should define the following categories.

#### 1. Domain Language

- workspace label
- task label
- deliverable label
- approval label
- member label
- assistant label

#### 2. Home Workbench Definition

- workbench title and framing
- home modules
- slot usage
- primary CTA
- assistant dock posture

#### 3. Navigation Definition

- core sections shown
- extension routes
- route labels
- visibility rules where needed

#### 4. Domain Object Presentation

- important business field names
- field groupings
- status vocabulary
- list/card/table emphasis

#### 5. Specialized Views

- domain-specific collection pages
- dashboards
- schedules/calendars
- asset galleries
- analysis pages

#### 6. Assistant Profile

- assistant role framing
- summary style
- suggested action patterns
- domain shortcuts
- delegation posture

### What A Workspace Profile Does Not Control

Even in the broader profile model, the following should remain platform-owned:

- the core task execution engine
- the top-level workspace object model
- approval and deliverable execution primitives
- the task-detail interaction backbone
- arbitrary custom layouts or injected application code

This keeps the system productized even when customer workspaces feel deeply specialized.

### Relationship Between Template And Profile

The intended nesting is:

`Workspace Profile -> Home Template -> Slot Modules`

That means:

- the home template remains a bounded configuration artifact
- the profile becomes the runtime wrapper that gives the workspace its broader domain behavior
- module compatibility rules still apply inside the template

This preserves the workbench discipline already defined in this spec while allowing the product to scale beyond a few hardcoded industries.

### Delivery Implication

Once the runtime profile model exists, the operational delivery unit for a new customer should become:

`Create Customer Workspace Profile`

That delivery workflow is described separately in [2026-04-10-customer-workspace-profile-delivery-design.md](/Users/nicholasl/Documents/build-whatever/decacan/docs/superpowers/specs/2026-04-10-customer-workspace-profile-delivery-design.md).

This spec remains the source of truth for how Workspaces itself should behave.

### Design Freeze Checklist

Workspaces design should not be considered frozen for multi-customer delivery until the following conditions are explicitly accepted.

#### 1. Profile Is The Primary Runtime Unit

The product model must treat `Workspace Profile` as the top-level customer delivery unit.

This means:

- customer-specific Workspaces are defined by profiles, not by build-time industry selection
- `home template` remains a bounded sub-configuration inside a profile
- runtime resolution, fallback behavior, and customer delivery all refer to profile first

#### 2. Profile Boundaries Are Closed

The profile boundary must be explicit and stable.

Accepted profile-controlled areas:

- terminology
- home/workbench composition
- navigation extensions
- domain presentation rules
- specialized views
- assistant framing

Accepted platform-owned areas:

- task execution engine
- deliverable and approval primitives
- task-detail interaction backbone
- arbitrary injected application code

If these boundaries are not accepted, Workspaces will drift into project-specific custom application delivery.

#### 3. Industry Is A Migration Layer, Not The End State

The design must explicitly state the relationship between:

- build-time `industry`
- `home template`
- runtime `Workspace Profile`

The accepted model is:

- build-time industry support is transitional
- home template is one bounded part of a profile
- runtime profile is the long-term customer delivery model
- `default-workspace-profile` is the required fallback baseline

This prevents the codebase and documentation from carrying multiple competing product models indefinitely.

#### 4. Delivery Workflow Is Part Of Product Design

Support-led customer delivery is not a separate operational workaround.

It is part of the Workspaces product model.

The design should therefore explicitly accept:

- `Create Customer Workspace Profile` as the standard delivery unit
- profile reuse and adaptation as the default support path
- escalation to new platform capabilities only when profile composition is insufficient

This links product design to the actual operating model used to deliver customer Workspaces.

#### 5. Freeze Requires Runtime Acceptance Criteria

The design freeze should include explicit runtime acceptance criteria, not only design principles.

At minimum, the following conditions should hold:

- every workspace resolves to exactly one profile at runtime
- missing or invalid profile resolution falls back to `default-workspace-profile`
- all core workspace sections remain usable under the default profile
- specialized routes remain optional enhancement layers rather than core dependencies
- a new customer workspace can be delivered by reusing or adapting a profile without rewriting the Workspaces application

If these conditions are not yet accepted, Workspaces design should still be considered in-progress for multi-customer delivery.

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
