# Decacan MVP Backend Module Map Spec

Date: 2026-03-29
Stage: Backend architecture
Status: Approved for planning

## 目标

统一 `decacan` 当前已经讨论过的后端模块边界，并明确一项新的 MVP 决策：

`Agent Team / team-aware execution` 进入 MVP 主线。

这意味着 MVP 不再只是单线 `single` 执行产品，而是从第一版起同时支持：

- `single`
- `team`

但 `team` 只做最小闭环，不做完整多 agent 平台。

## 核心决策

### 1. Playbook 是内容中心

Playbook 仍然是用户主对象，并已经扩展为：

- `StoreEntry`
- `PlaybookHandle`
- `PlaybookDraft`
- `PlaybookVersion`

### 2. Runtime 仍然是唯一执行协调者

即使引入 team，协作仍然是：

`runtime-mediated collaboration`

也就是说：

- Agent/semantic 不自由协商
- team 调度、输入切片、merge、审批、artifact 收口都由 runtime 统一协调

### 3. Team 进入 MVP，但严格收窄

MVP 中的 team 功能只支持：

- `builtin TeamSpec`
- `parallel_role_group -> merge`
- 单层并行组
- `all_required`
- 审批仍归 `Task / Run`
- 先优先服务 `发现模式 Playbook`

不支持：

- 嵌套并行组
- agent 自由对话协商
- 多层 supervisor 体系
- 通用 multi-agent 平台能力

## 模块地图

整体后端模块可分成五层。

### 一层：内容与生命周期

负责“用户拥有什么、编辑什么、发布什么”。

- `Playbook Store`
  - 官方来源层
  - 提供 `StoreEntry`

- `Playbook Handle`
  - 用户本地 Playbook 的稳定身份

- `Playbook Draft`
  - 可长期编辑的工作副本

- `Playbook Version`
  - 已发布、不可变、可执行的版本

- `Playbook Authoring Backend`
  - 读取 Draft
  - 保存整份 Draft spec
  - 返回 `DraftHealthReport`
  - 同步 Publish

### 二层：注册与引用

负责“系统里有哪些可被 Playbook 引用的资源”。

- `Capability Registry`
  - 管理 `routine / tool / validator`
  - 支持 `resolve / validate / snapshot`

- `TeamSpec Registry`
  - 管理共享、可版本化的 TeamSpec 资源
  - 支持 `resolve / validate / snapshot`

- `Extension Registry`
  - 外部扩展统一入口
  - 向下游 registry 自动派生注册结果

- `Validator Registry`
  - 统一校验规则入口
  - 服务 Draft / Publish / Artifact

### 三层：编译与执行准备

负责“把已发布版本变成一次可执行实例”。

- `Playbook Runtime Compiler`
  - 输入：
    - `PlaybookVersion`
    - `input_payload`
    - `workspace context`
  - 输出：
    - `Execution Package`

- `Execution Package`
  - `playbook_version_ref`
  - `bound_inputs`
  - `workflow_instance`
  - `resolved_contracts`
  - `capability_binding_snapshots`
  - `team_binding_snapshot`（如有）

- `Input Schema Binder`
  - 验证并绑定输入

- `Output Contract Resolver`
  - 解析本次任务的输出合同实例

- `Policy Profile Resolver`
  - 解析本次任务的策略实例

- `Execution Profile Resolver`
  - 解析：
    - `single`
    - `team(team_spec_id)`

- `Team Binding Snapshot`
  - 发布时快照化的 team 定义最小集

### 四层：运行时主链

负责真正执行任务。

- `Task / Run`
- `Workflow / Routine`
- `Tool Gateway`
- `semantic`
- `Artifact`
- `Approval`

这里的硬边界保持不变：

- runtime 是唯一任务执行主线
- semantic 只做局部智能执行
- Tool Gateway 仍然是受控动作入口

### 五层：MVP 内的 Team 执行结构

这层正式进入 MVP 主线，但实现范围严格受限。

- `TeamSpec`
  - 共享、可版本化 registry 资源
  - 第一版不做 Draft/Published

- `Role`
  - 固定角色定义

- `RoleAssignment`
  - 某个 run 内一次角色工作分配

- `parallel_role_group`
  - 并行角色执行结构

- `merge`
  - 并行结果回到主线的收口步骤

## 主线数据流

完整 MVP 主线应理解为：

```text
Store
-> fork to Handle
-> edit Draft
-> publish to Version
-> compile to Execution Package
-> create Task / Run
-> execute workflow
-> produce Artifact
```

如果是 `single` 执行：

```text
PlaybookVersion
-> workflow_instance
-> Run
-> Routine / semantic / Tool
-> Artifact
```

如果是 `team` 执行：

```text
PlaybookVersion.execution_profile = team(team_spec_id)
-> TeamSpec resolve / validate / snapshot
-> workflow_instance with parallel_role_group / merge
-> Run
-> RoleAssignments
-> merge
-> Artifact
```

## Team 在 MVP 中的落点

MVP 中 team 的实现边界必须写死：

### 支持

- `builtin TeamSpec`
- `parallel_role_group -> merge`
- `all_required`
- `runtime-mediated collaboration`
- `Task / Run` 级审批与恢复

### 不支持

- extension-provided team in execution path
- team draft/publish lifecycle
- nested parallel groups
- multi-level supervisors
- peer-to-peer agent conversation
- arbitrary agent graph orchestration

注：

`Extension-provided TeamSpec` 仍可作为架构方向存在，但不进入本轮 MVP 的实际执行主线。

## TeamSpec 的定位

`TeamSpec` 在 MVP 中的定位是：

- 可版本化 registry 资源
- 共享定义
- 可被 `PlaybookVersion.execution_profile` 引用
- 发布时生成 `Team Binding Snapshot`

第一版不做：

- TeamSpec Draft
- TeamSpec Publish
- TeamSpec 编辑器

## Team Binding Snapshot

发布时不再使用 `freeze` 一词，统一使用 `snapshot`。

`Team Binding Snapshot` 是发布时从 TeamSpec 解析并固化到 `PlaybookVersion` 的最小执行快照。

建议最小包含：

- `team_spec_id`
- `team_spec_version`
- `provider`
- `role_ids`
- `lead_role_id`
- `role_responsibility_summary`
- `compatibility_summary`

原则：

- 执行必需信息进 snapshot
- 展示/管理信息留在 TeamSpec Registry

## Registry 之间的关系

### Capability Registry

负责 Playbook workflow 可引用的能力：

- `routine`
- `tool`
- `validator`

### TeamSpec Registry

负责 Playbook execution profile 可引用的 team。

### Extension Registry

是统一入口，但内部职责分开：

```text
register extension
-> validate manifest
-> record provider
-> project capabilities into Capability Registry
-> project team specs into TeamSpec Registry
-> project templates into future store/template source
```

因此：

- 注册入口统一
- 下游 registry 分开

## Validator 在新主线里的作用

`Validator Registry` 在新主线中主要服务三件事：

- `DraftHealthReport`
- `Publish`
- `Artifact / Output validation`

它不负责 capability resolve，也不负责 team resolve。  
它只负责把“哪里不成立”转成统一 issue 模型。

## 关键边界

这份模块地图需要保护以下边界：

### 1. Playbook 不直接依赖 Extension 包

Playbook 只能引用 registry 中的：

- capability refs
- team spec ids

### 2. Runtime 不直接消费 StoreEntry

Task 不能直接从 `StoreEntry` 启动。必须先有：

- `PlaybookHandle`
- `PlaybookVersion`

### 3. semantic 不是 team 执行总控

即使 team 进入 MVP，semantic 仍然只负责局部智能执行。  
team 的调度与 merge 仍归 runtime。

### 4. Team 进入 MVP，不等于把 MVP 做成 multi-agent 平台

MVP 中的 team 只是最小 team-aware workflow 结构，不是通用 agent team framework。

## 后续实现优先级建议

在新的 MVP 主线下，后端优先级建议是：

1. `Playbook Store + Handle + Draft + Version`
2. `Capability Registry`
3. `Playbook Authoring Backend`
4. `TeamSpec Registry`
5. `Runtime Compiler + Execution Package`
6. `single` 路径稳定
7. `minimal team path`
8. `Artifact / Approval / validation` 收口

## 关键结论

`decacan` 的 MVP 后端现在应被理解为：

`一个以 Playbook 内容生命周期为上游、以 Runtime 为执行主线、并在第一版内纳入 minimal team execution 的分层系统。`

它的目标不是立刻成为完整多 agent 平台，而是：

- 先把 `single` 路径跑稳
- 再把 `team` 作为受控、可验证、可收口的执行结构纳入同一条主线
