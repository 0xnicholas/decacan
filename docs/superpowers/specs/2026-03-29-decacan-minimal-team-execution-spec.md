# Decacan Minimal Team Execution Spec

Date: 2026-03-29
Stage: Backend design
Status: Approved for planning

## 目标

定义 `decacan` 中进入 MVP 主线的最小 team 执行结构。

本 spec 的目标不是设计完整 multi-agent 平台，而是明确：

- `TeamSpec Registry`
- `Team Binding Snapshot`
- `minimal team path`
- team 路径下的 `Approval`
- team 路径下的 `Artifact` 收口规则

## 背景

`decacan` 的 MVP 已决定同时支持两条正式执行路径：

- `single`
- `team`

其中 `team` 必须保持极窄：

- 不做通用 multi-agent 平台
- 不做 agent 自由协商
- 不做复杂 supervisor 体系

而是在现有 `Playbook -> Runtime -> Run -> Workflow -> Artifact` 主链上，增加一个受控的 team-aware 执行段。

## 核心原则

### 1. Runtime 仍然是唯一执行协调者

team 协作必须是：

`runtime-mediated collaboration`

这意味着：

- 角色之间不直接自由协商
- 输入切片、派工、暂停、恢复、merge、artifact 收口都由 runtime 负责

### 2. TeamSpec 是共享 registry 资源，不是内容对象

第一版 `TeamSpec` 不引入：

- Draft
- Publish
- 编辑器

它只作为：

- 可版本化 registry 资源
- 可被 `PlaybookVersion.execution_profile` 引用
- 可在发布时被 snapshot

### 3. Team 是 Workflow 中的受控结构扩展

不是另起一套 runtime，而是在现有 workflow 中新增：

- `parallel_role_group`
- `merge`

### 4. 角色只产出中间结果

正式 `Artifact` 只能在 merge 之后，由主线统一登记。

## TeamSpec Registry

`TeamSpec Registry` 是固定角色小队的共享定义中心。

它的职责是：

- 列出可用 team specs
- 根据 `team_spec_id` 解析 team
- 校验 PlaybookVersion 是否可以绑定该 team
- 在发布时生成 `Team Binding Snapshot`

它不负责：

- team 调度
- role assignment 执行
- merge
- approval
- artifact 管理

## TeamSpec 对象最小结构

第一版 `TeamSpec` 保持最小定义，只描述：

- `team_spec_id`
- `title`
- `summary`
- `roles`
- `lead_role`
- `compatibility`
- `team_spec_version`
- `provider`

其中每个 `Role` 至少包含：

- `role_id`
- `title`
- `responsibility`
- `allowed_routines`
- `semantic_profile`

### 收口者（lead_role）

`lead_role` 的职责是：

- 默认结果整合责任角色
- 作为 `merge` step 的默认 owner
- 负责把多个角色结果整理回主线

它不是“管理者”，而是默认的结果收口者。

## Team Binding Snapshot

发布时不使用 `freeze`，统一使用 `snapshot`。

`Team Binding Snapshot` 是从 TeamSpec 解析并固化到 `PlaybookVersion` 中的最小 team 快照。

### 最小字段

- `team_spec_id`
- `team_spec_version`
- `provider`
- `role_ids`
- `lead_role_id`
- `role_responsibility_summary`
- `compatibility_summary`

### 边界

- 执行必需信息进入 snapshot
- 展示/管理信息留在 `TeamSpec Registry`

## TeamSpec 的来源

第一版架构允许两类来源：

- `builtin`
- `extension`

关系如下：

```text
Extension
  -> Extension Registry
      -> TeamSpec Registry
          -> PlaybookVersion.execution_profile references team_spec_id
              -> publish snapshots team binding
```

但在 MVP 实际执行主线中，先只支持：

- `builtin TeamSpec`

`extension-provided TeamSpec` 保留为架构方向，不进入当前实际执行闭环。

## Minimal Team Path

MVP 中 team 的执行结构只支持这一种最小闭环：

```text
parallel_role_group
-> all_required
-> merge
-> continue single workflow
```

含义：

- workflow 中允许出现一个受控并行段
- 并行组中的所有 required assignments 都必须成功
- 然后进入一个明确的 merge step
- merge 结束后回到普通单线主线

### 不支持

- 嵌套并行组
- 多层 team graph
- 多次交错 merge
- agent 自由通信
- 动态角色生成

## Minimal Team Path 的运行对象

最小新增对象只需要：

- `RoleAssignment`
- `ParallelRoleGroupState`
- `MergeInputBundle`

### RoleAssignment

表示在某个 run 中分配给某个角色的一份工作。

它不是子任务系统，也不是子 run。

### ParallelRoleGroupState

表示当前并行组的状态：

- 哪些 assignments 已创建
- 哪些已完成
- 是否满足 `all_required`
- 是否可以进入 merge

### MergeInputBundle

表示 merge step 消费的一组 assignment 输出。

它是 merge 的输入包，不是正式 Artifact。

## Execution Profile 与 Team

PlaybookVersion 中 team 的绑定方式是：

```text
execution_profile
  -> single
  -> team(team_spec_id)
```

在 Publish 时：

- `team_spec_id` 先通过 `TeamSpec Registry`
  - resolve
  - validate
  - snapshot

发布后：

- `PlaybookVersion` 不依赖 TeamSpec Registry 的当前值
- runtime 使用 `team binding snapshot` 进行执行

## Approval 在 Team 路径下的规则

team 路径不引入新的审批模型。

最小规则为：

1. 某个 `RoleAssignment` 触发风险动作
2. `Tool Gateway` 返回 `approval_required`
3. runtime 创建一个普通 `Approval`
4. 但 payload 中增加：
   - `role_id`
   - `assignment_id`
   - `group_id`
5. 当前 `Run` 进入 `paused`
6. 当前 `parallel_role_group` 同步暂停
7. 用户批准后恢复当前 run
8. 用户拒绝后，group fail，run 按失败路径处理

### 关键边界

- 不做 agent 级审批系统
- 不做 assignment 独立审批队列
- 仍然只有产品级 `Approval`

换句话说：

`team 里的审批只是“带角色上下文的普通审批”。`

## Artifact 在 Team 路径下的规则

team 路径中结果分两层：

### 1. Assignment Outputs

由各个 `RoleAssignment` 产生。

性质：

- 中间结果
- 只供并行组和 merge 使用
- 不登记为正式 `Artifact`

### 2. Artifact

只有在 `merge` 之后回到主线，才允许：

- output write
- artifact registration
- completion validation

### 关键边界

- 角色不直接登记正式 Artifact
- 正式 Artifact 只由主线统一登记
- output contract 只验证 merge 后的最终交付结果

也就是说：

`team 只生成中间结果，主线才生成正式结果。`

## Runtime 关系图

```text
PlaybookVersion.execution_profile = team(team_spec_id)
-> TeamSpec Registry resolve / validate / snapshot
-> workflow_instance with parallel_role_group / merge
-> Run
-> RoleAssignments
-> MergeInputBundle
-> merge
-> return to mainline
-> Artifact
```

## 与现有主链的关系

这套 team 结构不是第二条 runtime，而是现有主线的受控扩展：

```text
Playbook
-> Runtime Compiler
-> Execution Package
-> Run
-> Workflow
-> team segment
-> mainline resumes
-> Artifact
```

因此：

- `semantic` 仍然只是局部智能执行器
- `Tool Gateway` 仍然是唯一动作边界
- `Approval` 仍然挂在 `Task / Run`
- `Artifact` 仍然由主线统一登记

## MVP 支持范围

### 支持

- `builtin TeamSpec`
- `parallel_role_group -> merge`
- `all_required`
- `Task / Run` 级审批
- `runtime-mediated collaboration`

### 不支持

- extension-provided team 在执行闭环里实际运行
- TeamSpec authoring lifecycle
- nested groups
- dynamic agent graph
- peer-to-peer agent negotiation
- team-specific artifact ownership model

## 关键结论

`minimal team execution` 在 MVP 中应被实现为：

`现有 workflow 主线里的一个受控并行段，加一个明确 merge 收口点，而不是一个新的多 agent 平台。`

这样可以在不打碎当前 runtime 边界的前提下，把 team 正式纳入 MVP 主线。 
