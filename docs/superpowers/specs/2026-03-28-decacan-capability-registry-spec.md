# Decacan Capability Registry Spec

Date: 2026-03-28
Stage: Backend design
Status: Approved for planning

## 目标

定义 `Capability Registry` 在 `decacan` 后端中的职责、对象模型、解析规则、冻结规则与数据流。

本模块服务于以下新能力：

- 用户可编辑 `Playbook Draft`
- `PlaybookVersion` 发布前的可执行验证
- Playbook 对 builtin 与 extension 能力的安全引用
- 任务执行时对已发布版本依赖的稳定绑定

本 spec 不定义执行器本身，只定义“能力如何被引用、解析、校验、冻结”。

## 背景

在 `Playbook Store + Draft + Published Version` 模型下，用户可以编辑：

- inputs
- outputs
- policy
- workflow

但 workflow 不允许执行任意脚本逻辑，只能组合系统提供的步骤、routines、tools 和 validators。

因此系统需要一层明确的后端模块回答：

- 现在有哪些能力可被 Playbook 引用
- 这些引用如何解析
- 它们在当前环境下是否兼容
- 发布后如何冻结这些依赖，避免执行语义漂移

这就是 `Capability Registry` 的职责。

## 核心原则

### 1. Capability 不是 Skill/Extension 本身

更合理的关系是：

```text
Extension
  -> 安装到本地
      -> 注册 capabilities
          -> Playbook Draft 引用 capability refs
              -> 发布时冻结成 resolved bindings
```

因此：

- `Extension` 是分发单元
- `Capability` 是运行时/发布时可引用单元
- `Playbook` 组织这些能力形成执行规范

### 2. Capability Registry 不执行能力

Registry 只负责：

- 发现
- 解析
- 校验
- 冻结
- 健康状态计算

真正执行能力仍归：

- `RoutineRegistry`
- `Tool Gateway`
- `ValidatorRegistry`
- `semantic`
- 未来的 team-aware runtime structures

### 3. Draft 引用声明，Version 冻结依赖

Playbook 生命周期中必须区分：

- `capability_refs`
  - 可编辑
  - 作者视角
  - 存在于 Draft

- `resolved_bindings`
  - 不可变
  - 发布视角
  - 存在于 Published Version

### 4. 发布后依赖不能漂移

已发布版本不应在执行时重新“按当前环境动态解析最新 capability”。

发布时必须冻结：

- 解析到的 capability
- 其版本信息
- 契约摘要
- 与 workflow step 的绑定关系

### 5. Draft 允许不完整，但必须可诊断

用户需要长时间编辑 Playbook，所以：

- Draft 应允许保存未完成内容
- Draft 当前是否可发布必须可见
- 问题必须定位到 ref / step 级别

## Capability 的定义

一个 capability 不是单纯字符串 id，而是带 contract 和兼容性元数据的可引用能力单元。

第一版 `Capability.kind` 只支持：

- `routine`
- `tool`
- `validator`

`playbook_template` 不属于 capability，它属于 `StoreEntry` 或模板内容来源层。

## Capability 对象结构

每个 capability 至少应包含以下信息。

### 1. Identity

- `capability_id`
- `kind`
- `title`
- `summary`

### 2. Provenance

- `source`
  - `builtin`
  - `extension`
- `provider_id`

例如：

- `builtin`
- `ext.acme`

### 3. Reference

- `ref`

例如：

- `builtin.scan_markdown_files`
- `builtin.artifact.write`
- `ext.acme.topic_cluster`

这是 Playbook spec 中真正保存的引用值。

### 4. Contract

- `input_schema`
- `output_schema`

这用于：

- workflow 编译
- 发布校验
- step 间兼容性验证

### 5. Compatibility

- `allowed_step_types`
- `allowed_modes`
- `requires_workspace`
- `requires_team_context`

### 6. Policy Surface

- `side_effect_level`
- `default_policy_class`
- `approval_sensitive`

### 7. Version Info

- `capability_version`
- `provider_version`

## Capability Registry 的五个子模块

### 1. `catalog`

职责：

- 列出当前环境中的可引用能力
- 按 kind/source/provider 查询
- 为 Draft 编辑器提供浏览视图

### 2. `resolver`

职责：

- 将 `capability ref` 解析为明确 capability
- 处理 builtin 和 extension 两层来源
- 处理命名空间

### 3. `validator`

职责：

- 验证 capability 是否适合当前 step / mode / workflow 场景
- 验证 contract、兼容性、上下文要求和策略面

### 4. `freezer`

职责：

- 在 publish 时冻结解析结果
- 写入 capability version / provider version / contract snapshot
- 形成不可变的版本依赖快照

### 5. `health`

职责：

- 计算 Draft 当前引用的健康状态
- 标记 unresolved / incompatible / deprecated / invalid binding
- 给编辑器和发布按钮提供状态依据

## Capability Registry 与现有 Runtime 的关系

`Capability Registry` 不应复制一套新的执行注册体系。

它应站在现有 runtime 能力之上，做一层“可引用、可校验、可冻结”的投影。

关系应是：

```text
RoutineRegistry        -> execution truth for routines
ToolDescriptor/Gateway -> execution truth for tools
ValidatorRegistry      -> validation truth for validators

Capability Registry
  -> projects selected entries from those registries
  -> exposes stable refs to the Playbook system
```

因此：

- `RoutineRegistry` 负责怎么执行 routine
- `Tool Gateway` 负责 tool 的 allow/deny/approval 与执行
- `ValidatorRegistry` 负责发布与运行前校验能力
- `Capability Registry` 负责让 Playbook 能安全地引用它们

## Draft Spec 中的 `capability_refs`

Draft 中的 `capability_refs` 是作者视角的依赖声明。

建议分两层表示：

### 顶层声明

```yaml
capability_refs:
  routines:
    - builtin.scan_markdown_files
    - builtin.backup_existing_output
  tools:
    - builtin.workspace.read
    - builtin.artifact.write
  validators:
    - builtin.output_contract.summary
```

### Step 内引用

```yaml
workflow:
  steps:
    - id: scan_markdown_files
      type: routine
      uses: builtin.scan_markdown_files

    - id: write_summary
      type: tool
      uses: builtin.artifact.write
```

这样可以同时满足：

- 顶层快速查看依赖面
- step 级别明确知道每一步在用谁

## Published Version 中的 `resolved_bindings`

发布成功后，版本中不应只保留原始 ref，而应保留冻结后的解析结果。

建议每个 binding 至少包含：

- `ref`
- `kind`
- `provider`
- `capability_version`
- `provider_version`
- `contract_hash`
- `bound_steps`

示意：

```yaml
resolved_bindings:
  - ref: builtin.scan_markdown_files
    kind: routine
    provider: builtin
    capability_version: 1
    provider_version: 1
    contract_hash: abc123
    bound_steps:
      - scan_markdown_files

  - ref: builtin.artifact.write
    kind: tool
    provider: builtin
    capability_version: 1
    provider_version: 1
    contract_hash: def456
    bound_steps:
      - write_summary
```

## 解析与发布冻结

Capability Registry 在发布链中承担三步关键职责：

### 1. Resolve

输入：

- `builtin.scan_markdown_files`
- `ext.acme.topic_cluster`

输出：

- 明确 capability
- 或 unresolved error

### 2. Validate

检查：

- step type 是否匹配
- mode 是否兼容
- input/output contract 是否兼容
- 是否需要 workspace/team context
- policy surface 是否允许当前使用方式

### 3. Freeze

将解析结果冻结进 `PlaybookVersion`：

- 版本信息
- provider 信息
- 契约摘要
- step 绑定关系

## Draft 编辑时的 Health 视图

Draft 允许长期编辑，因此必须有独立的健康状态反馈。

### 保存与发布的关系

- `save`
  - 允许不完整
  - 允许不可发布

- `publish`
  - 必须通过完整验证

### Health 状态类型

第一版至少支持：

- `ok`
- `unresolved`
- `incompatible`
- `deprecated`
- `invalid_binding`

### Health 输出结构

建议包含：

- `publishable`
- `summary`
- `issues[]`

每个 `issue` 至少包含：

- `severity`
- `kind`
- `location`
- `message`
- `related_ref`

示意：

```yaml
health:
  publishable: false
  summary:
    unresolved: 1
    incompatible: 1
  issues:
    - severity: error
      kind: unresolved
      location: workflow.steps[2].uses
      related_ref: ext.acme.topic_cluster
      message: capability ref cannot be resolved

    - severity: error
      kind: incompatible
      location: workflow.steps[5]
      related_ref: builtin.scan_markdown_files
      message: routine capability cannot be used in tool step
```

## 与 Draft / Publish / Task 的整体数据流

Capability Registry 贯穿三条主线：

- Draft 编辑线
- Publish 冻结线
- Task 执行线

### 1. Draft 编辑线

```text
用户编辑 Draft spec
-> 保存 Draft
-> resolver 尝试解析 refs
-> validator 检查兼容性
-> 生成 Draft health
-> 返回 draft + health
```

产物：

- 更新后的 Draft
- 健康报告

### 2. Publish 冻结线

```text
读取 Draft spec
-> schema validate
-> resolve capability refs
-> validate workflow compatibility
-> compile workflow
-> validate output contract
-> validate execution profile
-> freeze resolved bindings
-> create PlaybookVersion
```

产物：

- 新的不可变 `PlaybookVersion`
- 其中包含 `resolved_bindings`

### 3. Task 执行线

```text
用户创建 Task
-> 指定 playbook_handle_id + playbook_version_id + input_payload
-> runtime 读取 PlaybookVersion
-> 读取 version 中冻结的 resolved_bindings
-> 绑定到 runtime-native executors
-> compile workflow instance
-> create Run
-> execute
```

关键规则：

- 执行时不重新依赖 Draft 的 `capability_refs`
- 优先使用已发布版本中的 `resolved_bindings`

## Registry 的来源层次

第一版只支持两层来源：

- `builtin registry`
- `extension registry`

解析规则：

- capability ref 必须带命名空间
- 不支持裸名回退

例如：

- `builtin.xxx`
- `ext.vendor.xxx`

这样可以避免命名冲突和解析歧义。

## 与 Extension 的关系

以后安装一个 extension 时，更合理的链路是：

```text
Extension
  -> 向 runtime-side registries 注册 routines/tools/validators
  -> Capability adapters 暴露其中可引用项
  -> Capability Registry 收录这些暴露项
  -> Playbook Draft 可以引用这些 capability refs
```

因此 extension 不会：

- 直接绕过 runtime
- 直接污染 Playbook 生命周期模型

## 非目标

本 spec 当前不处理：

- capability 的远端下载
- capability 市场
- 动态代码加载
- 任意用户脚本 capability
- 运行时热替换 capability
- capability migration 工具

## MVP 切分

### Phase 1

- builtin capability catalog
- resolver
- validator
- draft health
- publish freeze

### Phase 2

- extension-provided capabilities
- provider/version freezing
- more detailed compatibility rules

### Phase 3

- execution profile with team-bound capabilities
- richer validator kinds
- cross-version capability migration support

## 关键结论

`Capability Registry` 不是新的执行中心，而是：

`Playbook Draft / Publish / Version / Runtime` 之间的能力解析、校验与冻结边界。`

它的真正价值在于保证：

- Draft 阶段可诊断
- Publish 阶段可冻结
- Task 执行阶段可稳定回放
