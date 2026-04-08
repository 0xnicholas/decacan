# Decacan Playbook Agent Team Execution Design

Date: 2026-04-08
Stage: Architecture design
Status: Approved for planning

## 目标

重新定义 `decacan` 中的 `Playbook`，使其从“可执行 workflow 文档”升级为：

`Agent Team` 的声明式任务执行规范。

本设计要明确：

- `Playbook` 在系统中的真实语义层级
- `Playbook`、`TeamSpec`、`Mode`、`Graph`、`Runtime` 的边界
- `Abstract Playbook` 与 `Bound Playbook` 的生命周期
- `Step` 作为核心编译单元的结构
- `Compiler` 的职责边界
- `Run` 在统一模型下如何覆盖一次性交付和长生命周期协作
- `Validation`、`Review`、`Failure Handling` 如何进入正式执行语义
- 当前 `decacan` 代码和概念需要如何重映射

## 背景

当前项目中的 `playbook` 已经具备：

- `store -> fork/copy -> draft -> published version`
- runtime 中的 capability-aware workflow 执行
- console 中的 YAML authoring 与 visual preview

但这个模型仍然偏向：

- “可编辑 workflow 文档”
- “发布后直接执行的配置对象”

它还没有清楚表达 `Playbook` 相对于 `TeamSpec`、`Graph`、`Runtime` 的层级关系。

新的方向是：

- `Playbook` 负责表达任务语义与执行规范
- `Graph` 负责表达编译后的执行结构
- `Runtime` 负责执行冻结后的结构，不再承担高层语义解释

## 核心定义

### Playbook

`Playbook` 是面向 `Agent Team` 的声明式任务执行规范。

它定义：

- 为什么做：`goal`、`intent`、`success criteria`
- 做哪些工作单元：`steps`
- 每个工作单元依赖什么能力：`capability_ref`
- 多 agent 如何协作：`mode`
- 怎样才算完成和合格：`validation`
- 失败后如何处理：`control`

一句话收口：

> `Playbook` 是可编译的 Agent 工作说明书。

### TeamSpec

`TeamSpec` 定义执行资源，而不是任务规范。

它提供：

- roles
- agent implementations
- toolchain availability
- execution policy defaults

同一个 `TeamSpec` 可以运行不同 `Playbook`；
同一个 `Playbook` 也可以绑定不同 `TeamSpec`。

### Graph

`Graph` 不是主作者对象，而是 `Playbook` 经过编译后得到的执行结构。

`Playbook` 表达：

- `what`
- `why`
- `quality`
- `coordination`

`Graph` 表达：

- `when`
- `next`
- `branch`
- `loop`
- `terminate`

### Runtime

`Runtime` 的输入是冻结后的执行物，而不是抽象 `Playbook Draft`。

`Runtime` 负责：

- 执行 compiled graph
- 驱动 run state machine
- 记录 run events
- 打开和恢复 checkpoints

`Runtime` 不负责：

- 临时解释高层 playbook 语义
- 在运行前重新决定主流程结构
- 对抽象 step 重新做编译级推断

## Playbook 解决的层级问题

`Playbook` 解决其他层做不了的三类问题。

### 1. 语义层

定义为什么做：

- `goal`
- `intent`
- `success criteria`

`Graph` 只能表达控制流，不能表达任务存在的语义目的。

### 2. 能力层

定义用什么做：

- `capability_ref`
- tools
- routines

`TeamSpec` 只定义角色和执行资源，不定义步骤所需的任务能力契约。

### 3. 规范层

定义怎样才算对：

- `validation`
- `review`
- `retry`
- `fallback`
- `escalate`

`Graph` 只能执行，不负责判断结果是否满足质量要求。

## 核心原则

### 1. Playbook 是语义规范层，Graph 是执行层

作者直接维护的是 `Playbook`，不是 `Graph`。

### 2. Step 是工作单元，不是函数调用

`Step` 不是“调用某个 agent”。

`Step` 表达的是：

- 一个带语义目标的工作单元
- 由一个或多个 agent 完成
- 通过 `Mode + Binding + Capability` 展开成执行子图

### 3. Runtime 只执行冻结后的产物

任务只能从 `Bound Playbook Version` 启动。

不允许直接运行：

- `Abstract Playbook Draft`
- `Abstract Playbook Version`

### 4. 统一运行模型

系统只保留一种运行对象：`PlaybookRun`。

它既能表示一次性交付任务，也能表示长生命周期协作任务。

### 5. Validation 是一级执行语义

“步骤执行完成”不等于“步骤结果合格”。

`validation` 必须在编译阶段显式注入成 gate/check/review 节点。

## 核心对象模型

### Goal

定义 `Playbook` 要达成的目标。

示例：

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

`Step` 是最小语义执行单元。

它不是 runtime 的原子 node，而是 compiler 的输入单元。

推荐结构：

```yaml
steps:
  - id: research
    goal: collect supporting evidence

    input:
      from: topic
      schema: ResearchRequest

    output:
      name: findings
      schema: FindingsBundle

    capability_ref: capability.research.search_and_extract

    mode:
      type: broadcast

    bindings:
      role: researcher

    validation:
      - type: min_sources
        value: 3
      - type: non_empty

    control:
      retry: 2
      on_fail: escalate_to_reviewer
```

### CapabilityRef

`CapabilityRef` 是步骤依赖的能力契约引用，不是具体实现引用。

它背后应能解析到：

- input schema
- output schema
- available tools
- execution limits
- quality requirements

### Mode

`Mode` 定义一个步骤的协作模式，而不是业务能力。

第一层语义至少支持：

- `route`
- `broadcast`
- `coordinate`
- `tasks`

### Validation

`Validation` 定义怎样才算完成和合格。

例如：

```yaml
validation:
  - type: schema_check
  - type: completeness_check
  - type: reviewer_approval
```

### Control

`Control` 定义失败、重试、回退、升级、循环等控制规则。

例如：

```yaml
control:
  retry: 2
  on_fail: escalate_to_reviewer
  loop_to: writing
```

### Bindings

`Bindings` 负责把抽象 step 约束到具体执行资源。

例如：

```yaml
bindings:
  role: researcher
  tools:
    - web_search
    - internal_kb
```

## Step 模型

`Step` 由 7 类字段组成：

- `goal`
- `input/output contract`
- `capability_ref`
- `mode`
- `bindings`
- `validation`
- `control`

一句话表达：

```text
Step
= semantic work unit
= contract
+ capability requirement
+ coordination pattern
+ validation gates
+ failure policy
```

执行意义上：

```text
Step Execution
= select_agents(capability_ref, bindings)
× coordination_mode(mode)
× execution_contract(input/output)
```

## 编译链路

系统主链应为：

```text
Playbook Definition
-> TeamSpec
-> Mode
-> Graph
-> Runtime
```

更精确地说：

```text
Abstract Playbook Version
-> Bind + Compile
-> Bound Playbook Version
-> Run
```

## Compiler 职责

`Compiler` 是新模型中的核心系统边界，主要负责 6 件事。

### 1. Step Expansion

把每个 `Step` 展开成一个或多个 execution node。

例如：

- `broadcast` -> fork/join
- `route` -> classifier + branch
- `coordinate` -> coordinator + workers + reduce

### 2. Binding Resolution

把 `capability_ref + bindings + team spec` 解析到：

- role assignment
- agent implementation
- toolchain
- execution policy

### 3. Contract Wiring

把前一步输出绑定到后一步输入，并进行 schema compatibility 检查。

### 4. Control Lowering

把 `retry / branch / loop / fallback / escalate` 降级成显式 graph edge 和 control node。

### 5. Validation Injection

把 `validation` 转成检查节点或 gate。

### 6. Failure Path Construction

为每个 step 构造失败路径：

- retry
- fallback
- escalate
- abort

## Abstract 与 Bound 生命周期

`Playbook` 不是两种独立对象，而是同一对象生命周期中的两个阶段。

### 1. Abstract Playbook

表达可复用的执行规范。

适合：

- 模板库
- 复用
- 移植
- 产品语义审计

### 2. Bound Playbook

在某个 `Abstract Playbook Version` 的基础上，绑定具体执行资源并冻结编译结果。

适合：

- 直接执行
- 部署
- 可复现运行

### 生命周期

建议关系如下：

```text
PlaybookHandle
  -> Abstract Draft
  -> Abstract Version 1
  -> Abstract Version 2
       -> Bound Version A (team-x, runtime-r1)
       -> Bound Version B (team-y, runtime-r1)
```

### 冻结规则

`Bound Playbook Version` 必须冻结：

- team selection
- capability resolution
- toolchain / execution policy
- compiled execution graph

运行时只允许启动 `Bound Playbook Version`。

### Bound Version 溯源字段

为了保证可复现和可审计，`Bound Playbook Version` 至少应记录：

- source `abstract_playbook_version_id`
- `team_spec_id`
- `team_spec_version` 或 team snapshot ref
- `compiler_version`
- `runtime_profile`
- `compiled_graph_digest`

这些字段属于冻结发布物的一部分，而不是运行时临时元数据。

## 发布与执行规则

发布必须拆成两段。

### 1. Publish Abstract

把 `Abstract Playbook Draft` 发布为 `Abstract Playbook Version`。

这一步主要校验：

- step 结构完整性
- contract 完整性
- capability ref 的契约可解析性
- validation/control 的语义合法性

### 2. Bind + Compile + Freeze

输入：

- `Abstract Playbook Version`
- `TeamSpec`
- `RuntimeProfile`

输出：

- `Bound Playbook Version`

### 执行规则

只允许：

- `Bound Playbook Version -> PlaybookRun`

不允许：

- `Draft -> Run`
- `Abstract Version -> Run`

## 统一运行模型

系统只保留一个运行对象：`PlaybookRun`。

它必须能同时覆盖：

- 一次性交付
- 长生命周期协作

差别不在对象类型，而在 `run` 是否会进入等待类状态。

### 运行对象

建议至少包含：

- `PlaybookRun`
- `StepExecution`
- `Checkpoint`
- `RunEvent`

### PlaybookRun

整体运行实例，绑定一个 `Bound Playbook Version`。

为保证审计链闭环，`PlaybookRun` 至少应记录：

- `bound_playbook_version_id`
- source `abstract_playbook_version_id`
- `compiler_version`
- `runtime_profile`
- `team_spec_snapshot_ref`

### StepExecution

某个 step 的一次执行实例。

因为存在 `retry / loop / fallback`，同一 step 可能有多个 attempt。

### Checkpoint

运行中的等待点或门禁点，例如：

- waiting for input
- waiting for reviewer
- waiting for approval
- waiting for external resume signal

### RunEvent

审计事件流，用于记录：

- step started
- validation failed
- retry scheduled
- escalated
- checkpoint opened
- checkpoint resolved
- run completed

### 状态机

建议统一为：

```text
created
-> ready
-> running
-> waiting_input
-> waiting_review
-> waiting_approval
-> waiting_external
-> resuming
-> completed
-> failed
-> aborted
```

规则：

- `waiting_*` 是一等公民状态
- `retry` 不创建新 run，只创建新的 `StepExecution attempt`
- `loop` 通过 graph control path 回到指定 step
- `escalate` 打开 checkpoint 或切换到特定审阅角色
- `abort` 是显式终止，不等于失败

## Validation、Review 与 Failure Handling

这三类概念必须严格分层。

### Validation

回答“结果是否合格”。

例如：

- schema check
- completeness check
- min sources
- policy compliance

### Review

是特殊的 `Validation` 机制。

它要求某个角色、agent 或人类给出判断。

例如：

- reviewer signoff
- editor approval
- human gate

### Failure Handling

回答“不合格或执行失败后怎么办”。

例如：

- retry
- fallback
- escalate
- abort
- loop back

### 失败类型

建议显式区分：

1. `Execution Failure`
- 运行失败、超时、工具错误、中断

2. `Validation Failure`
- 步骤执行完成，但结果不合格

### 编译模板

每个 `Step` 编译后通常应形成：

```text
[execution subgraph]
-> [validation gate 1]
-> [validation gate 2]
-> [review gate]
-> success / failure edges
```

### Validation 分类

第一版建议收敛成 4 类：

- `contract validation`
- `quality validation`
- `policy validation`
- `approval validation`

## MVP 边界

为了进入实现主线，第一阶段只做最小闭环。

### MVP 必做

1. `Abstract Playbook Draft / Version`
2. `Bound Playbook Version`
3. `Compiler V1`
4. `Run Engine` 只执行 `Bound Playbook Version`
5. `Team Binding V1` 使用确定性 resolution

### Compiler V1 范围

`Mode` 只支持：

- `route`
- `broadcast`
- `coordinate`

`Control` 只支持：

- `retry`
- `fallback`
- `escalate`
- `loop_to`

`Validation` 只支持：

- `schema_check`
- `completeness_check`
- `reviewer_approval`

### MVP 不做

- 运行时临时 bind abstract playbook
- 任意动态规划整个主流程
- 高级 capability resolver 策略系统
- 多 runtime 兼容矩阵
- 协同编辑
- 可视化 graph authoring 作为主编辑入口

## 对当前 Decacan 的重映射

### 1. 当前 `PlaybookDraft`

应重定义为：

- `AbstractPlaybookDraft`

### 2. 当前 `PlaybookVersion` / `PublishedPlaybook`

如果它代表“已发布可执行物”，新模型下更接近：

- `BoundPlaybookVersion`

而不是抽象规范版本。

### 3. 当前 runtime 直接解析 playbook spec 执行

应拆成：

- `playbook/compiler`
- `run/executor`

### 4. 当前 `workflow`

应降为：

- compiler 输出
- 或内部中间表示

不再是主 authoring 对象。

### 5. 当前 capability refs

方向保留，但要从“步骤实现引用”提升为“步骤能力契约引用”。

## 建议模块边界

第一阶段建议显式形成以下模块：

- `playbook/spec`
- `playbook/compiler`
- `playbook/bound`
- `run/executor`
- `team/spec`

### playbook/spec

负责抽象 playbook 的 schema、parser、validation。

### playbook/compiler

负责：

- step expansion
- binding resolution
- contract wiring
- control lowering
- validation injection
- failure path construction

### playbook/bound

负责 `Bound Playbook Version` 的持久化模型与冻结数据结构。

### run/executor

只执行 frozen graph，不再解释高层 playbook 语义。

### team/spec

负责 team、role、agent implementation、toolchain 的声明模型。

## 对产品面的直接影响

### Playbook Studio

短期仍可继续用 YAML 编辑器，但 YAML schema 必须升级为语义规范模型。

长期方向应是：

- 面向语义规范的 authoring 体验

而不是单纯 workflow 文本编辑器。

### Publish

后端必须拆成两段：

- publish abstract
- bind and compile

UI 可以包装为单一流程，但系统语义不能混淆。

### Launch

不能再仅凭“选一个 playbook”直接启动。

必须选择某个 `Bound Playbook Version`。

## 最终收口

本设计的核心结论是：

> `Playbook` 是 Agent Team 的声明式执行规范；`Abstract Version` 表达可复用语义；`Compiler` 将其绑定并降级成冻结的 `Bound Playbook Version`；`Runtime` 只执行冻结后的 graph；任务只能从 `Bound Version` 启动。
