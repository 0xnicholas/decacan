# Customer Workspace Profile Delivery SOP

Date: 2026-04-10
Stage: Internal service operations
Status: Draft for review

## Purpose

This document defines the standard internal operating procedure for delivering a customer-specific `Workspace Profile` inside `apps/workspaces`.

It is written for the Decacan technical support team, not for customers.

The objective is simple:

- onboard a new customer industry scenario quickly
- keep delivery quality consistent
- avoid turning every customer request into a one-off frontend project
- preserve reuse across similar customers

## Scope

This SOP covers support-led delivery where the team configures and validates a customer workspace directly.

This SOP does include:

- customer intake and profile framing
- profile reuse versus new-base decisions
- workspace profile definition
- bounded customization and extension handling
- runtime verification before handoff
- internal documentation and reuse capture

This SOP does not include:

- customer self-serve configuration
- pricing or packaging decisions
- long-term product roadmap prioritization
- generic plugin marketplace design

## Operating Principle

Every customer industry request must be delivered as:

`one customer-specific workspace profile running on one shared Workspaces platform`

The team is not delivering a separate app.

The team is delivering a configured profile with bounded extensions and verified runtime behavior.

## Delivery Standard

A delivery is successful only if the customer workspace can run real work.

The support team must not treat visual customization alone as completion.

The delivered workspace must support the agreed operational path across:

- workspace home
- task flow
- deliverable flow
- approval flow
- assistant flow
- required specialized pages

## What A Workspace Profile Contains

Each delivered profile should define the following areas.

### 1. Domain Language

- workspace label
- task label
- deliverable label
- approval label
- member label
- assistant label
- other shared product terminology

### 2. Home Workbench Definition

- home title and framing
- required home modules
- module ordering and emphasis
- primary call-to-action
- assistant dock posture

### 3. Navigation Definition

- core sections to expose
- extension routes to add
- labels for all visible routes
- visibility rules where needed

### 4. Domain Object Presentation

- object names
- important fields
- field groupings
- status vocabulary
- list, card, or table presentation preferences

### 5. Specialized Views

- customer-specific collection pages
- dashboards
- calendars or schedules
- asset galleries
- analytics views
- other domain-specific pages required for day-one use

### 6. Assistant Profile

- assistant role framing
- summary tone
- suggested action patterns
- domain shortcuts
- delegation posture

## Delivery Modes

Every request must be classified into one of two modes before configuration begins.

### Mode A: Reuse And Adapt

Use an existing profile as the base when a similar customer already exists.

Typical adjustments:

- terminology
- field sets
- home modules
- route labels
- assistant profile
- selected specialized pages

This is the default mode whenever reuse is reasonable.

### Mode B: New Base Profile

Create a new reusable base profile when no current profile is a good fit.

This is still profile work, not a new product line.

The output of this mode should become a reusable starting point for future similar customers.

## Roles

### Technical Support Owner

Owns the delivery from intake through handoff.

Responsibilities:

- run intake
- classify the request
- prepare the profile spec
- coordinate configuration work
- run verification
- prepare handoff notes

### Product / Platform Reviewer

Reviews cases where the customer need cannot be expressed cleanly through current profile capability.

Responsibilities:

- confirm whether the request is profile work or platform work
- approve or reject proposed extensions
- prevent customer-specific hacks from becoming hidden product debt

### Engineering Implementer

Only involved when profile delivery requires a new platform capability or reusable extension.

Responsibilities:

- build the missing platform support
- avoid customer-only forks
- return capability back to the shared system

## Fixed Internal Task

Every onboarding request must be tracked as the same internal task:

`Create Customer Workspace Profile`

### Required Inputs

- customer name
- target workspace id
- delivery owner
- customer industry summary
- primary business roles
- required business objects
- required specialized pages
- required runtime flows
- closest existing profile, if any

### Required Outputs

- customer profile spec
- profile configuration package
- extension mapping, if needed
- runtime verification record
- customer handoff summary
- internal reuse note

### Definition Of Done

The task is complete only when:

- the workspace is bound to the intended profile
- terminology is correct
- home workbench is usable
- required navigation items are present
- required specialized pages are usable
- required runtime flows pass verification
- assistant behavior is acceptable for the agreed scenario
- internal handoff artifacts are recorded

## Standard Procedure

The support team must follow the same seven-step procedure for both delivery modes.

## Step 1: Intake And Scenario Framing

### Objective

Understand the customer scenario in operator terms before touching implementation.

### Required Questions

- What work does this customer perform every day?
- What objects do they think in?
- What must appear first on workspace home?
- Which pages are non-negotiable on day one?
- Which end-to-end flows must work at launch?

### Required Output

Create a short intake brief covering:

- customer summary
- operational context
- must-have objects
- must-have specialized pages
- must-have runtime flows

### Exit Criteria

The delivery owner can describe the customer workspace in one sentence:

`This workspace exists to help <role> do <core work> using <objects/pages>.`

## Step 2: Classify Reuse Versus New Base

### Objective

Decide whether the customer should inherit from an existing profile or start a new profile family.

### Required Decision

- `base_profile = <existing-profile-id>`
- or `base_profile = new`

### Decision Rule

Choose `Reuse And Adapt` when an existing profile can satisfy most needs with bounded changes.

Choose `New Base Profile` only when reuse would create more confusion or complexity than starting clean.

### Required Output

Record:

- selected base profile
- why it was selected
- key differences from the customer requirement

## Step 3: Write The Customer Profile Spec

### Objective

Translate customer requirements into a profile definition that can be implemented and verified.

### Required Sections

- domain language
- home workbench
- navigation
- domain object presentation
- specialized views
- assistant profile
- required runtime flows

### Standard

The spec must be precise enough that another operator or engineer can configure the workspace without relying on meeting memory.

### Exit Criteria

The delivery owner can point to one authoritative document describing what will be delivered.

## Step 4: Map Profile Needs To Current Capability

### Objective

Prevent uncontrolled custom development by classifying every requested capability.

### Classification Buckets

- `reuse directly`
- `reuse with profile customization`
- `requires platform extension`

### Required Output

Produce a capability map listing:

- what already exists
- what can be configured
- what needs engineering support

### Rule

Do not hide missing platform capability inside profile-specific hacks.

If the platform cannot express the customer need cleanly, escalate it.

## Step 5: Assemble The Profile

### Objective

Build the actual deliverable package for the target workspace.

### Typical Work

- clone or initialize the profile baseline
- update terminology
- configure home modules
- configure navigation
- bind specialized views
- configure assistant profile
- associate the profile with the target workspace

### Required Output

A runnable customer profile package attached to the intended workspace.

### Rule

The output should remain understandable as a profile, not a customer-specific product fork.

## Step 6: Run Runtime Verification

### Objective

Prove the delivered workspace can support real customer work.

### Mandatory Verification Path

- open workspace home
- resume or launch work
- open at least one required specialized page
- inspect or produce a deliverable
- complete or route an approval path
- use assistant guidance or delegation

### Required Record

Document:

- what was tested
- what passed
- what failed
- what remains blocked, if anything

### Rule

A profile cannot be handed off if only page rendering is verified.

Operational flow verification is mandatory.

## Step 7: Handoff And Reuse Capture

### Objective

Close the delivery and improve the next one.

### Required Outputs

- customer handoff summary
- internal reuse note
- platform-gap note, if applicable

### Internal Reuse Note Must Capture

- base profile used
- customer-specific adjustments
- reusable improvements worth keeping
- non-reusable customer constraints
- recommended starting point for the next similar customer

## Verification Checklist

Every delivery must include this checklist.

- [ ] Workspace opens with intended terminology
- [ ] Home workbench matches agreed module composition
- [ ] Required navigation items are present
- [ ] Required specialized pages open correctly
- [ ] Required object fields render correctly
- [ ] At least one task flow can be launched or resumed
- [ ] Deliverable flow works for this profile
- [ ] Approval flow works for this profile
- [ ] Assistant behavior matches expected domain posture
- [ ] No required day-one business flow is blocked

## Escalation Rules

Escalate to product or platform work when any of the following is true:

- the customer needs a specialized page that current containers cannot express
- the customer needs a new business object that affects multiple core flows
- the assistant needs new action types or handoff semantics
- the runtime verification failure is caused by platform limits, not profile configuration

When escalating, record:

- blocker
- impact on delivery
- why profile configuration is insufficient
- proposed reusable capability to add

## Anti-Patterns

The support team must avoid the following behaviors.

### 1. Treating Every Customer As A New App

This destroys reuse and slows future delivery.

### 2. Declaring Success After Visual Customization Only

A branded or renamed workspace is not a complete delivery.

### 3. Burying Platform Gaps Inside Customer Logic

This creates invisible support debt and weakens the shared product.

### 4. Skipping Reuse Classification

If the team does not decide `reuse` versus `new base`, scope will drift.

### 5. Skipping Runtime Verification

This creates demo-ready workspaces instead of production-ready ones.

## Standard Task Template

Use the following template for every request.

```markdown
# Create Customer Workspace Profile

## Intake
- Customer:
- Workspace ID:
- Delivery Owner:
- Base Profile:
- Customer Industry Summary:
- Primary Roles:

## Profile Definition
- Domain Language:
- Home Modules:
- Navigation:
- Domain Objects And Fields:
- Specialized Views:
- Assistant Profile:
- Required Runtime Flows:

## Capability Mapping
- Reuse Directly:
- Reuse With Customization:
- Requires Platform Extension:

## Verification
- Home Verified:
- Navigation Verified:
- Specialized Views Verified:
- Task Flow Verified:
- Deliverable Flow Verified:
- Approval Flow Verified:
- Assistant Verified:

## Handoff
- Customer Handoff Summary:
- Internal Reuse Note:
- Follow-Up Platform Gaps:
```

## Recommended Storage Artifacts

For each delivery, keep these artifacts together:

- intake brief
- customer profile spec
- configuration package
- verification record
- handoff summary
- reuse note

## Summary

The support team should use `Create Customer Workspace Profile` as the single standard task for onboarding new industry scenarios.

That task must always follow the same operating motion:

1. intake and frame the scenario
2. classify reuse versus new base
3. write the customer profile spec
4. map needs to current capability
5. assemble the profile
6. verify real runtime flows
7. hand off and capture reuse

This is the operating discipline required to scale customer-specific workspace delivery without letting `apps/workspaces` collapse into uncontrolled custom builds.
