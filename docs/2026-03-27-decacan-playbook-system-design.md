# Decacan Playbook System Design

Date: 2026-03-27
Stage: Product design
Status: Working design

## Goal

Define the product-level object model for `decacan` around `Playbook`, with emphasis on:

- producing results directly
- reducing human-in-the-loop work
- supporting both stable automatic output and exploratory discovery

This document refines the product behavior above the previously defined `decacan-app -> decacan-runtime -> psi` architecture.

## Product Principle

`decacan` should not behave like a generic chat agent.

The product should help users get results from a working directory with as little manual intervention as possible.

The product promise becomes:

`Give me one working directory and a playbook, and I will produce results for you.`

## Primary Product Object: Playbook

The main user-facing object should be `Playbook`.

The product should not separately expose:

- template
- workflow
- skill
- runtime session

Those remain internal concepts.

### Why Playbook

`Playbook` is stronger than `template` as a product term because it implies:

- a repeatable way of working
- expected output
- built-in execution behavior
- less user guesswork

## What The User Sees

The user sees:

- a list of playbooks
- a mode label on each playbook
- a short description
- expected outputs
- a few structured inputs

The user does not need to understand internal workflow structure.

## Internal Layering Behind Playbook

Internally, the relationship should be:

```text
Playbook
  -> workflow definition
      -> decacan-runtime
          -> skill / tool / psi
```

### Meanings

- `Playbook`: user-facing task entry and contract
- `workflow definition`: hidden execution blueprint
- `decacan-runtime`: product-owned execution coordinator
- `skill`: internal reusable capability unit
- `tool`: host action boundary
- `psi`: embedded intelligent executor used only when needed

## Playbook Internal Structure

Each playbook should contain six parts.

### 1. Identity

- `id`
- `name`
- `summary`
- `category`
- `tags`

### 2. Input Schema

Defines what the user must provide.

Examples:

- focus topic
- output language
- optional subpath

### 3. Output Contract

Defines what successful completion produces.

Examples:

- expected artifact type
- default output file path
- completion conditions
- expected summary format

### 4. Execution Profile

Defines how the playbook should behave operationally.

Examples:

- default mode label
- automation level
- whether execution auto-starts
- expected approval behavior

### 5. Workflow Definition

Defines the hidden step structure behind the playbook.

This includes:

- ordered steps
- step types
- input and output contracts per step
- transition rules
- observability labels

### 6. Policy Profile

Defines safety and execution boundaries.

Examples:

- allowed tools
- write policy
- approval triggers
- direct rejection rules

## Playbook Modes

Externally, playbooks should be presented in two work modes:

- `发现模式`
- `标准模式`

These are product-facing mode labels.

Internally they map to:

- `开放型 Playbook`
- `流程型 Playbook`

### 发现模式

Use when the system needs to discover the path while working.

Characteristics:

- higher path flexibility
- more runtime judgment
- more internal use of Psi
- better for exploration, clustering, discovery, and synthesis
- less deterministic than standard mode

### 标准模式

Use when the product already knows a reliable path to the result.

Characteristics:

- fixed or mostly fixed workflow
- less path variance
- higher automation confidence
- more stable outputs
- fewer interruptions

## Important Rule About Modes

Each playbook should have one default mode.

The MVP should not support switching a single playbook between modes dynamically.

This keeps behavior predictable and reduces UX complexity.

## Why Modes Matter

The product needs both breadth and reliability:

- `发现模式` gives the system room to understand unfamiliar material
- `标准模式` gives the system the ability to deliver repeatable outcomes with minimal oversight

This supports the core value proposition:

`effective output with minimal human intervention`

## Workflow Structure Inside A Playbook

A playbook workflow should be defined as a typed step sequence with limited branching.

The MVP should avoid complex graph workflows.

Each step should include:

- `id`
- `name`
- `type`
- `inputs`
- `outputs`
- `execution config`
- `policy hooks`
- `transition rules`
- `observability labels`

### Supported Step Types

- `deterministic`
- `tool`
- `skill`
- `psi`
- `approval`
- `branch`

### Key Principle

The workflow defines the path structure.

`decacan-runtime` decides how to execute each step.

The workflow should not directly bind itself to UI behavior or raw runtime internals.

## Skills In This Model

Skills should remain internal-only in the MVP.

They are not user-facing installable extensions.

A skill is an internal reusable capability unit, such as:

- scanning a directory
- extracting markdown sections
- grouping notes by topic
- drafting a structured summary

Relationship:

- playbook = product entry
- workflow = execution blueprint
- skill = reusable internal capability

## Role Of Psi In This Model

Psi is not the center of the product.

Psi is used only where intelligent execution is needed inside runtime coordination.

Examples:

- infer semantic topics from markdown
- synthesize findings across multiple files
- draft structured prose

Psi should not define:

- playbook objects
- product modes
- approval policy
- output contracts

## Playbook Library Direction For MVP

The MVP should include both modes, but prioritize `标准模式`.

Recommended balance:

- standard mode is the main product story
- discovery mode is present but smaller in scope

Reason:

- the product's core differentiator is stable result production
- discovery mode adds breadth without becoming the product center

## MVP Playbook 1: 总结资料

### Mode

- `标准模式`

### Goal

Produce a structured summary from markdown materials in the working directory.

### Input Boundary

- only markdown files
- default scan scope is the entire working directory
- user may optionally specify a subpath

### Output

Default artifact:

- `output/summary.md`

If `output/summary.md` already exists:

- automatically back up the old file
- then overwrite the canonical output file

### Default Output Structure

- `总览`
- `主题分组`
- `关键结论`
- `信息缺口 / 待确认事项`
- `建议下一步`

### Organization Principle

The summary should be organized by discovered content themes, not by directory layout.

### Source Traceability

Each topic section should explicitly list the relevant markdown file paths.

### Automation Behavior

- full automatic execution
- no approval required for the normal run path

This playbook should behave like a reliable result generator.

## MVP Playbook 2: 发现资料主题

### Mode

- `发现模式`

### Goal

Explore markdown materials in the working directory and identify themes, clusters, open questions, and possible lines of synthesis.

### Role In The Product

This playbook is not primarily for delivering a fixed standard summary.

Its role is to help users discover:

- what themes exist
- how materials relate
- what topics are underdeveloped
- what follow-up work might make sense

### Positioning

This playbook gives `decacan` exploratory breadth without shifting the whole product into a general-purpose agent.

## Product Surface Implications

The homepage should show one unified playbook list.

Each card should include:

- playbook name
- short description
- mode label: `发现模式` or `标准模式`
- expected output signal

The product should not split navigation into separate sections for modes in the MVP.

## Experience Principle

Playbooks should feel like result-producing operating procedures, not like prompt templates.

The user should feel that they are choosing:

- a way of working
- a kind of outcome
- a level of path certainty

not merely selecting a text prompt preset.

## Design Principles

- playbook is the product object
- workflow stays hidden
- standard mode is the primary MVP story
- discovery mode expands usefulness without dominating UX
- skills remain internal
- Psi remains an internal executor, not a product concept
- result quality and low user effort are more important than framework purity

## Next Step

Use this document together with:

- `2026-03-27-decacan-product-architecture.md`
- `2026-03-27-psi-runtime-design.md`

to produce an MVP implementation plan covering:

- playbook definitions
- runtime integration points
- output and backup policy
- event flow
- UI treatment for playbook cards and task detail
