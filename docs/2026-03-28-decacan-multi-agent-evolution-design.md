# Decacan Multi-Agent 演进设计

## 背景

当前 `decacan` 的 MVP 主链已经明确为：

```text
Playbook
  -> Workflow
      -> Routine / semantic / Tool
  -> Run
  -> Artifact
```

其中：

- `decacan-runtime` 拥有 `Task / Run / Workflow / Approval / Artifact`
- `semantic` 是 runtime 内部的局部智能执行模块
- `Tool Gateway` 是 runtime 的受控动作边界

接下来如果要支持 `multi-agent / agent team`，目标不是引入一个新的 agent 框架，而是在现有 runtime 主链上增加：

- 并行执行
- 固定角色分工
- 复杂任务分解
- 并行结果收口

## 设计目标

本设计解决的第一优先问题是：

1. 在同一个 `Run` 内支持固定角色小队的并行执行
2. 让复杂任务可以被 runtime 切分给不同角色处理
3. 保持 `Approval / Artifact / TaskEvent` 仍然挂在现有产品主线上

本设计不解决：

- 通用 agent 平台
- 动态自组队
- 多租户 agent 市场
- 独立的 swarm runtime

## 核心原则

### 1. Multi-agent 先是 workflow 执行结构，不是新的内核

不引入第二套 runtime。  
`agent team` 作为 `Workflow` 的新执行结构出现。

### 2. Team 调度权属于 runtime，不属于 semantic

`semantic` 仍然只是局部智能执行器。  
它可以带 `role_context`，但不拥有 team lifecycle。

### 3. Team 不引入子任务系统

第一阶段保持：

- 一个 `Task`
- 一个 `Run`
- 一条 Artifact 主线

并行执行发生在 `Run` 内部，而不是通过“子 run”或“子 task”实现。

### 4. 审批和产物仍然挂在现有产品主线上

- 审批对象仍然是 `Approval`
- 产物仍然是 `Artifact`
- 事件仍然投影为 `TaskEvent`

角色执行只能提供来源上下文，不能接管这些产品对象。

## 新增对象模型

### `Role`

固定角色定义，不是运行时临时 prompt。

建议字段：

- `id`
- `title`
- `responsibility`
- `allowed_routines`
- `semantic_profile`

第一版固定角色示例：

- `scout`
- `synthesizer`
- `verifier`

### `TeamSpec`

某个 `Playbook` 绑定的小队规格。

建议字段：

- `id`
- `roles`
- `lead_role`

第一版只定义：

- 有哪些固定角色
- 谁是默认 merge owner

### `RoleAssignment`

一次具体 `Run` 中，某个角色被分配的一份工作单。

建议字段：

- `assignment_id`
- `run_id`
- `step_id`
- `role_id`
- `status`
- `input_slice_ref`
- `output_refs`
- `error`

### `ParallelRoleGroup`

`WorkflowStep` 的一种 team-aware 配置体。

建议字段：

- `group_id`
- `role_ids`
- `completion_mode`
- `input_partition`
- `merge_step_id`

### `MergeStepConfig`

并行结果收口配置。

建议字段：

- `merge_id`
- `consumes_group_id`
- `strategy`
- `owner_role`

第一版 merge strategy 建议支持：

- `Concatenate`
- `RankAndSelect`
- `Synthesize`

其中 `Synthesize` 对 `decacan` 最重要。

## 对现有模型的扩展

### 扩展 `WorkflowStepType`

在现有 step 类型基础上新增：

- `parallel_role_group`
- `merge`

这样 team 能力仍然是 workflow 的一部分，而不是 workflow 外部的另一套系统。

### 扩展 `Run`

`Run` 仍然是单个执行实例，但新增 team 状态：

- 当前活跃 assignments
- 已完成 group
- merge 等待状态

不新增 `sub-run`。

### `Routine` 的位置

`Routine` 继续是内部例行程序，但可以获得额外上下文：

- 当前 `role`
- 当前 `assignment_scope`
- 当前 `input_slice`

`Routine` 不负责 team 调度。

### `semantic` 的位置

`semantic` 只增加：

- `role_context`
- `assignment_scope`
- `merge_context`

`semantic` 不拥有：

- team lifecycle
- assignment scheduling
- cross-agent coordination

## 执行结构

目标关系为：

```text
Playbook
  -> Workflow
      -> normal step
      -> parallel_role_group
          -> RoleAssignments
              -> Routine / semantic / Tool
      -> merge
      -> Artifact
```

## 执行算法

### 普通 step

保持不变：

- 执行 `Routine / semantic / Tool`
- 更新 `Run`
- 发事件
- 前进到下一步

### `parallel_role_group`

运行时行为：

1. 根据 `TeamSpec` 和当前 step 生成多个 `RoleAssignment`
2. 按输入切片策略生成 `input_slice`
3. 调度 assignments 执行
4. 收集结果
5. 满足完成条件后进入 `merge`

### `merge`

运行时行为：

1. 收集一个 group 的 assignment outputs
2. 按 `MergeStrategy` 合并
3. 生成 merged output
4. 写回 run intermediate state
5. 继续主 workflow

## 并行和调度

### 调度权

始终由 `Run Supervisor` 或 runtime 主循环掌控。

### 第一版完成判定

只支持：

- `AllRequired`

即所有 required assignments 成功后，group 才算完成。

### 第一版失败策略

只支持：

- `fail_group`

任一 required assignment 失败，则整个 group 失败。

## 审批与恢复

若某个 `RoleAssignment` 命中风险动作，流程仍然是：

```text
RoleAssignment
  -> Tool Gateway returns approval_required
  -> Runtime creates Approval
  -> Run pauses
  -> group pauses
  -> user approves / rejects
  -> affected assignment resumes or group fails
```

关键原则：

- 审批挂在 `Task / Run`
- assignment 只作为审批来源上下文
- 不引入 agent 级独立审批状态机

## 事件系统

仍保持三层：

```text
Execution Events
  -> Runtime Events
      -> Task Events
```

Team-aware runtime event 可新增：

- `role.assignment.started`
- `role.assignment.completed`
- `role.assignment.failed`
- `parallel_group.completed`
- `merge.started`
- `merge.completed`

但产品层仍然只暴露稳定、简洁的 `TaskEvent`。

## 分阶段落地建议

### Phase 1：对象模型与顺序模拟

先新增：

- `Role`
- `TeamSpec`
- `RoleAssignment`
- `ParallelRoleGroup`
- `MergeStepConfig`

执行上仍可顺序模拟，不做真实并行。

目标：

- 验证 team 数据结构
- 验证 merge contract
- 验证 Artifact 是否能正确收口

### Phase 2：同一个 `Run` 内真实并行

在 Phase 1 稳定后，再让 assignments 真正并行执行。

第一版并行建议：

- 一层 parallel group
- group 内并行
- group 外串行
- merge 紧跟 group

### Phase 3：让 `发现模式 Playbook` 优先使用 team

第一批推荐使用 team 的是 discovery-mode playbook，例如：

- `发现资料主题`

理由：

- 更适合拆分探索
- 对并行 scout 更敏感
- 不会先破坏标准模式的稳定产出承诺

### Phase 4：评估标准模式的 team 化收益

例如未来的：

- 大目录资料总结
- 多来源并行收集后汇总

但这是后续优化，不进入第一波。

## 最小可行切片

最小 team-aware 验证路径建议为：

```text
Playbook
  -> compile Workflow
  -> Run starts
  -> normal step
  -> parallel_role_group
       -> create RoleAssignments
       -> execute assignments
       -> collect outputs
  -> merge
       -> synthesize merged result
  -> write artifact
  -> Task complete
```

第一版甚至可以：

- 不接前端
- 不接真实审批
- 不做复杂恢复
- 只用测试级 workflow 验证一个 team-aware artifact 闭环

## 非目标

以下内容不进入第一阶段设计：

- 动态临时组队
- 角色自我生成
- 通用 multi-agent marketplace
- 多层嵌套 parallel group
- 跨 run team recovery
- 独立的 team-specific UI 系统

## 结论

`decacan` 的 multi-agent 未来不应从 `semantic` 长成“第二个 agent runtime”，而应作为 `decacan-runtime` 的 workflow 执行结构扩展出现。

一句话总结：

**multi-agent = role-based parallel workflow execution inside the existing runtime mainline**

