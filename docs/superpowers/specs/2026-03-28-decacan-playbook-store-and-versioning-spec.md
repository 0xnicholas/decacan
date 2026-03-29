# Decacan Playbook Store And Versioning Spec

Date: 2026-03-28
Stage: Backend design
Status: Approved for planning

## 目标

定义 `decacan` 下一阶段的 Playbook 后端模型，使系统从“内置预制 Playbook”演进到：

- 官方 `Playbook Store`
- 用户本地 `fork/copy`
- 长期编辑的 `Draft`
- 不可变的 `Published Version`
- 任务绑定精确版本执行

本 spec 的目标不是实现 UI 编辑器，而是先锁定后端对象、版本规则、执行绑定与发布校验链。

## 设计原则

### 1. Playbook 是正式产品对象

Playbook 不再只是 runtime 中的一个内置注册项，而是：

- 可分发
- 可 fork
- 可编辑
- 可发布
- 可绑定版本执行

### 2. 用户编辑草稿，任务执行版本

系统必须严格区分：

- 可变的 `Draft`
- 不可变的 `Published Version`

任务只能绑定某个已发布版本，不能绑定“最新草稿”或“当前最新状态”。

### 3. 官方内容先内置，再考虑远端

第一版 `Playbook Store` 先作为应用内置内容存在，不引入远端同步、账号体系或分享市场。

### 4. 自定义从 Fork/Copy 开始

用户不能直接修改官方 Playbook。必须先：

- 从官方 Store 选择一个条目
- `fork/copy` 到本地
- 在自己的 Draft 上长期编辑

### 5. 发布必须通过可执行验证

`Publish` 不是简单改状态。发布前必须证明：

- spec 结构合法
- capability 引用可解析
- workflow 可编译
- output contract 完整
- execution profile 可执行

### 6. Playbook 使用能力，不直接等同 Skill

Playbook 不直接“装一个黑盒 skill”。更准确的关系是：

- extension / skill 安装后向系统注册能力
- Playbook workflow 引用这些已注册能力
- runtime 编译和执行这些引用

## 非目标

本 spec 当前不覆盖：

- 远端 Playbook Store 同步
- Playbook 分享/导出
- 任意用户脚本执行
- 任意自定义 step 代码
- 前端可视化 workflow 编辑器细节
- Agent Team 的完整实现

Agent Team 在本 spec 中只以 `execution_profile` 的可选关联形式出现。

## 术语

### StoreEntry

官方 Playbook Store 中的一个分发项。

### PlaybookHandle

某个用户本地 Playbook 的稳定身份，不承载具体内容快照。

### PlaybookDraft

用户当前正在编辑的可变工作副本。

### PlaybookVersion

一个已发布、不可变、可执行的内容快照。

### Capability

系统可解析的能力引用。可由内置系统或已安装 extension 提供，例如：

- routine
- tool
- validator

## 核心对象模型

关系如下：

```text
StoreEntry
  -> fork/copy
      -> PlaybookHandle
           -> Draft
           -> Version 1
           -> Version 2
```

### 1. StoreEntry

表示官方分发源。

建议字段：

- `store_entry_id`
- `title`
- `summary`
- `category`
- `tags`
- `mode`
- `official_version`
- `embedded_spec_ref`

约束：

- 不可直接编辑
- 只能被安装或 fork/copy

### 2. PlaybookHandle

表示“这是我的哪一个 Playbook”。

建议字段：

- `playbook_handle_id`
- `owner_scope`
- `origin`
- `source_store_entry_id`
- `title`
- `created_at`
- `updated_at`

说明：

- `owner_scope` 在第一版固定为本地私有
- `origin` 用于区分：
  - `official_fork`
  - `local_copy`

### 3. PlaybookDraft

表示当前可变草稿。

建议字段：

- `draft_id`
- `playbook_handle_id`
- `spec_document`
- `last_saved_at`
- `last_validated_at`
- `validation_state`

约束：

- 可以长期编辑
- 可以多次保存
- 不可被任务直接执行

### 4. PlaybookVersion

表示已发布的不可变快照。

建议字段：

- `playbook_version_id`
- `playbook_handle_id`
- `version_number`
- `spec_document`
- `published_at`
- `validation_report`

约束：

- 一经发布不可变
- 任务必须绑定某个明确 `playbook_version_id`

## 版本化 Spec 文档

Playbook Draft 和 Version 的核心内容都保存为一份版本化 spec 文档，而不是多张结构化表。

建议 spec 至少包含 6 个部分：

### 1. `metadata`

例如：

- `title`
- `summary`
- `mode`
- `origin`
- `base_store_entry`

### 2. `inputs`

定义用户输入 schema：

- 字段名
- 字段类型
- 默认值
- 必填约束
- 文案说明

### 3. `outputs`

定义输出合同：

- 主产物类型
- 默认输出路径
- 备份/覆盖策略
- 完成判定

### 4. `workflow`

定义执行蓝图：

- step 列表
- step 类型
- 输入输出 contract
- transition
- 允许引用的 routine/tool/validator

### 5. `capability_refs`

定义本 Playbook 依赖哪些系统能力。

例如：

```yaml
capability_refs:
  routines:
    - builtin.scan_markdown_files
    - builtin.backup_existing_output
    - ext.acme.topic_cluster
  tools:
    - builtin.workspace.read
    - builtin.artifact.write
  validators:
    - builtin.output_contract.summary
```

### 6. `execution_profile`

定义执行配置：

- `single`
- 或 `team(team_spec_ref)`

Agent Team 在这里是可选关联，不是 Playbook 的强制组成部分。

## Playbook 与 Skill/Extension 的关系

Playbook 不直接等于一个 skill。

更合理的关系是：

```text
Skill / Extension
  -> 安装到本地能力仓
      -> 暴露 routines / tools / validators / templates
          -> Playbook Draft 引用这些能力
              -> 发布成 PlaybookVersion
```

因此：

- Playbook 是产品级执行规范
- extension/skill 是能力分发单元
- runtime 才是真正使用 Playbook 的执行主体

## 谁使用 Playbook

直接使用 Playbook 的不是 agent，而是 `decacan-runtime`。

链路应当是：

```text
用户选择 Playbook
-> runtime 读取某个 Published Version
-> 编译成 workflow / policy / output contract
-> runtime 执行 workflow
-> 某些 step 再调用 semantic 或未来的 agent team
```

因此：

- 用户选择 Playbook
- runtime 消费 Playbook
- agent / semantic 只执行局部步骤

## 任务绑定规则

任务创建时，不应再只传 `playbook_key`。

新的绑定至少应包含：

- `playbook_handle_id`
- `playbook_version_id`
- `input_payload`

其中：

- `playbook_handle_id` 用于归属与追踪
- `playbook_version_id` 用于精确执行
- `input_payload` 用于实例化当前版本的输入参数

核心规则：

- 一个 Task 永远绑定一个明确的 `PlaybookVersion`
- 一个 Run 永远执行该版本编译出来的 workflow instance
- 后续 Draft 修改和新版本发布都不影响已有 Task

## 参数进入 Runtime 的链路

参数不应直接作为随意上下文传给执行器，而应经过三层处理：

### 1. Input Binding

将用户输入绑定成结构化参数值，例如：

- `source_scope`
- `focus_topics`
- `output_language`
- `output_path_override`

### 2. Compile-time Resolution

runtime 编译 workflow 时，将参数注入：

- step input contract
- output contract
- policy profile
- execution profile

### 3. Run-time Context

执行时再把这些已解析参数传给：

- routines
- tools
- semantic invocations
- 未来的 role assignments

## 发布验证链

发布流程固定为：

```text
load draft
-> schema validate
-> capability resolve
-> workflow compile
-> output contract validate
-> execution profile validate
-> freeze spec
-> create PlaybookVersion
-> mark as published
```

### 1. Schema Validate

检查：

- spec 结构完整
- 字段合法
- 必填部分齐全

### 2. Capability Resolve

检查 draft 引用的 routines/tools/validators 是否都存在且可用。

### 3. Workflow Compile

检查：

- workflow step 是否可编译
- step 之间输入输出 contract 是否匹配
- step 引用的能力是否满足要求

### 4. Output Contract Validate

检查：

- 是否定义主产物
- 默认路径和覆盖策略是否完整

### 5. Execution Profile Validate

检查：

- `single` 模式是否合法
- 若绑定 team，则 team spec 是否存在且匹配

## 官方 Store 与本地编辑 API 方向

第一版建议的最小 API：

- `GET /api/playbook-store`
  - 返回官方 Store 条目

- `POST /api/playbooks/fork`
  - 从 `store_entry_id` 创建本地 `PlaybookHandle + Draft`

- `GET /api/playbooks/:handle_id`
  - 返回 handle 概览、当前 draft、已发布版本列表

- `PUT /api/playbooks/:handle_id/draft`
  - 保存整个 draft spec 文档

- `POST /api/playbooks/:handle_id/publish`
  - 执行发布验证并生成新版本

- `GET /api/playbooks/:handle_id/versions/:version_id`
  - 返回某个已发布版本快照

第一版建议采用：

- whole-document draft save
- 不做细粒度 workflow step patch API

## 执行配置与 Agent Team

Playbook 可以可选关联 Agent Team，但这应当放在 `execution_profile` 中，而不是成为 Playbook 的强制部分。

建议形式：

```text
PlaybookVersion
  -> workflow
  -> policy
  -> output contract
  -> execution profile
       -> single
       -> team(team_spec_id)
```

补充原则：

- team 是可选执行配置
- 多 Agent 协作采用 `runtime-mediated collaboration`
- 不是 agent 彼此自由协商

## MVP 切分

### Phase 1：版本化 Playbook 基础

- 官方 Store 内置
- fork/copy 成本地 handle
- draft 文档保存
- publish 成 version
- task 绑定 version
- 只支持 builtin capabilities
- execution profile 先只支持 `single`

### Phase 2：标准模式参数化与完整自定义

- Draft 可改 inputs / outputs / policy / workflow
- 发布前可执行验证完整跑通
- 用户任务真正使用自己发布的 PlaybookVersion

### Phase 3：Extension 和 Team

- 安装 skill/extension，注册 capability refs
- Playbook Draft 可引用 extension 提供的能力
- execution profile 可绑定 team spec
- runtime 进一步支持 team-aware workflow

## 关键结论

这一阶段的核心不是“让任务多几个参数”，而是：

`把 Playbook 从内置配置提升成用户可 fork、可编辑、可发布、可版本绑定执行的正式产品对象。`

后续实现顺序应当是：

1. `Store + Handle + Draft + Version`
2. `发布验证链`
3. `任务绑定版本`
4. `capability refs`
5. `team / extension`
