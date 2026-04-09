# Decacan Learnings

> Reference project: https://github.com/0xnicholas/decacan

## Purpose

This document captures useful ideas from Decacan as an **external orchestration-semantic system**.

It is not an authoritative Torque architecture document. The point of this file is to study a higher-layer system and extract interface lessons that matter for Torque's runtime/harness design.

## Positioning

Useful working distinction:

- **Torque**: execution semantics layer
- **Decacan-like systems**: orchestration semantics layer

That means a Decacan-like system can own concepts such as:

- workspaces
- playbooks
- team specs
- capability catalogs
- role bindings

Torque should not hard-code those concepts into its kernel. It should expose standard runtime interfaces that systems like this can compile into.

## Workspaces

In a Decacan-like system, `Workspace` is an upper-layer product object.

That is compatible with Torque's current direction:

- upper-layer systems may own workspace-like domain models
- Torque should treat those as external context
- the kernel should carry only neutral references such as `ExternalContextRef`

## Playbook

`Playbook` can be understood as an Agent Team execution specification.

It captures:

- goals
- decomposition
- collaboration mode
- capability references
- validation rules
- retry / fallback / escalation rules
- HITL requirements

A useful shorthand is:

`Playbook = workflow + spec + capability references + runtime checks + HITL`

### Example

```yaml
playbook:
  name: research_report

  steps:
    - id: planning
      goal: decompose task
      capability: planning
      mode: route
      output: plan

    - id: research
      goal: gather information
      capability: research
      mode: broadcast
      input: plan
      output: findings

    - id: analysis
      goal: synthesize insights
      capability: analysis
      mode: tasks
      input: findings
      output: insights

    - id: writing
      goal: generate report
      capability: writing
      mode: pipeline
      input: insights
      output: draft

    - id: review
      goal: validate quality
      capability: review
      mode: coordinate
      input: draft
      output: approved | feedback

  control:
    loop:
      review -> writing: if_not_pass
```

## Why Playbook Exists

Playbook covers things a plain execution graph does not fully capture.

### Semantic Layer

Why the work exists:

- goal
- intent
- success criteria

### Capability Layer

What kind of capability is required:

- capability reference
- tool surface
- routines
- execution limits
- quality requirements

### Normative Layer

How correctness is judged:

- validation
- review
- retry
- fallback
- escalation

## Playbook Core Objects

### Goal

Defines the objective and success criteria.

```yaml
goal:
  name: produce_research_report
  objective: generate a structured market research report
  success_criteria:
    - factual
    - structured
    - reviewed
```

### Step

The minimal semantic work unit.

Important correction:

- wrong: `Step = call one agent`
- correct: `Step = define one work unit that may be completed by one or more agents`

```yaml
steps:
  - id: research
    goal: collect supporting evidence
    input: topic
    output: findings
    capability_ref: capability.research.search_and_extract
    mode: broadcast
    validation:
      - sources >= 3
      - findings_not_empty
```

### Capability Ref

Reference to an ability contract, not a concrete agent call.

```yaml
capability_ref: capability.analysis.summarize_findings
```

Behind this reference there should typically be:

- input schema
- output schema
- tools
- execution limits
- quality expectations

### Mode

How collaboration happens for the step.

```yaml
mode: coordinate
```

Typical mode families:

- `route`
- `broadcast`
- `coordinate`
- `tasks`

### Validation

What makes the step complete or acceptable.

```yaml
validation:
  - type: schema_check
  - type: completeness_check
  - type: reviewer_approval
```

### Control

What happens when execution does not pass straight through.

```yaml
control:
  retry: 2
  on_fail: escalate_to_reviewer
  loop_back_to: writing
```

### Bindings

How an abstract step is mapped to concrete team/agent/tool choices.

```yaml
bindings:
  team: report_team_v1
  role: researcher
  tools:
    - web_search
    - internal_kb
```

## Step Model Summary

```yaml
step:
  id: string
  goal: string

  input:
    from: ref
    schema: type

  output:
    name: string
    schema: type

  capability_ref: string

  mode:
    type: route | broadcast | coordinate | tasks

  bindings:
    role: string | optional
    agents: [] | optional

  validation: []

  control:
    retry: int | optional
    on_fail: action | optional
    loop_to: step_id | optional
```

Condensed:

`Step = Goal + I/O Contract + Capability Ref + Mode + Binding + Validation + Control`

## Playbook and Team

- one team can run multiple playbooks
- one playbook can bind to multiple team configurations

This is useful because it separates:

- semantic template
- capability selection
- runtime binding

## Playbook and Graph

A useful interpretation is:

- `Playbook`: declarative spec for what/why/how-good/how-to-coordinate
- `Graph` or other lowered execution form: concrete control structure for execution

So:

`Playbook -> compiler -> executable orchestration form -> runtime`

That lowered form may be a graph, but Torque should not require that as its kernel abstraction.

## Compiler Responsibilities

An orchestration compiler for a Decacan-like system typically does at least these things:

1. `Step Expansion`
   Expand a step into one or more execution units.
   Examples:
   - `broadcast` -> fork/join
   - `route` -> classifier + branch
   - `coordinate` -> coordinator + workers + reduce

2. `Binding Resolution`
   Resolve `capability_ref` into:
   - role
   - agent implementation
   - toolchain
   - execution policy

3. `Contract Wiring`
   Wire prior outputs into later inputs.

4. `Control Lowering`
   Lower retry / loop / branch into concrete execution control.

5. `Validation Injection`
   Turn validation into checks, gates, or review steps.

6. `Failure Path Construction`
   Build retry / fallback / escalate / abort paths.

## Two Kinds of Playbook

### Abstract Playbook

Defines semantics only, without concrete team/runtime binding.

Useful for:

- reuse
- portability
- template libraries

### Bound Playbook

Already bound to a concrete team, toolchain, and runtime context.

Useful for:

- direct execution
- deployment

## Main Takeaways for Torque

These are the most important lessons to carry into Torque:

- playbook is an upper-layer orchestration concept, not a kernel object
- step is a semantic work unit, not a direct agent call
- team/workspace/capability catalogs belong to upper layers
- Torque should expose standard runtime interfaces rather than require a playbook DSL
- upper-layer systems should compile into runtime objects such as `ExecutionRequest`, `DelegationRequest`, `Artifact`, and `ApprovalRequest`
