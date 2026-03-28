# Decacan Playbook Authoring Backend Spec

Date: 2026-03-28
Stage: Backend design
Status: Approved for planning

## 目标

定义 `decacan` 的 `Playbook Authoring Backend`，使系统能够支持：

- 官方 `Playbook Store`
- 用户 `fork/copy` 成本地 Playbook
- 长期编辑 `Draft`
- 同步 `Publish`
- 任务绑定明确的 `PlaybookVersion`

本 spec 聚焦后端能力，不展开前端编辑器交互细节。

## 背景

当前 MVP 中的 Playbook 仍然以预制注册项为主，任务创建依赖内置 `playbook_key`。下一阶段的目标是把 Playbook 升级为正式内容对象，使用户能够：

- 从官方 Store 获取 Playbook
- 复制成自己的 Playbook
- 长期维护草稿
- 发布不可变版本
- 用已发布版本启动任务

这意味着后端需要从“内置注册项”演进到完整的生命周期系统。

## 设计原则

### 1. 用户编辑 Draft，任务执行 Version

必须严格区分：

- `PlaybookDraft`
- `PlaybookVersion`

任务不能直接执行 Draft，只能绑定某个已发布版本。

### 2. 官方 Playbook 不能直接修改

用户必须先从 `Playbook Store` 中 `fork/copy`，再编辑自己的本地 Playbook。

### 3. 同步发布优先

第一版 `Publish` 采用同步发布，而不是后台任务。

原因：

- 发布链以结构化校验和编译为主
- 更适合即时返回错误
- 避免过早引入任务队列与复杂状态机

### 4. 编辑后端是文档型，不是局部 patch 引擎

第一版后端只支持：

- 读取整份 Draft spec
- 保存整份 Draft spec
- 返回 Draft health
- 同步发布

不支持：

- step 级 patch API
- 拖拽式工作流专用后端接口
- 协同编辑

### 5. Store 只是来源，不是执行对象

任务不能直接运行 `StoreEntry`。

用户必须先：

- fork/copy
- 形成本地 `PlaybookHandle`
- 发布 `PlaybookVersion`

然后任务才可执行。

## 核心对象

本 spec 依赖前置对象模型：

- `StoreEntry`
- `PlaybookHandle`
- `PlaybookDraft`
- `PlaybookVersion`
- `DraftHealthReport`

它们之间的关系是：

```text
StoreEntry
  -> fork/copy
      -> PlaybookHandle
           -> Draft
           -> Version 1
           -> Version 2
```

## Playbook Editor Backend

第一版后端应被定义为一个文档型编辑后端。

最小职责只有 4 个：

- 读取当前 `Draft spec`
- 保存整份 `Draft spec`
- 返回 `Draft health`
- 触发 `Publish`

也就是说，第一版不引入：

- workflow 局部更新语义
- 结构化 step patch
- 复杂编辑会话状态机

后端只围绕“Draft 文档”工作。

## Draft 保存模型

Draft 保存流程应是：

```text
load draft
-> replace full spec document
-> recompute Draft health
-> persist updated draft + health
-> return draft + health
```

这里需要坚持一条规则：

- `Draft` 允许不完整
- 保存成功不代表 Draft 可发布

因此 `save` 和 `publish` 是两条不同门槛：

- `save`：允许未完成
- `publish`：必须完全通过验证

## Draft Health

`DraftHealthReport` 是整个 Authoring Backend 的核心反馈对象之一。

它不是单一 capability 检查结果，而是整份 Draft 的统一健康报告。

建议覆盖五个维度：

- `schema`
- `capabilities`
- `workflow`
- `contracts`
- `execution`

最小结构：

- `publishable`
- `summary`
- `issues[]`

每个 issue 至少包含：

- `severity`
- `domain`
- `kind`
- `location`
- `message`
- `related_ref`

这使前端在不理解后端内部细节的情况下，仍然可以准确呈现“当前为什么不能发布”。

## Publish Pipeline

第一版 `Publish` 采用同步、原子化流程：

```text
load draft
-> schema validate
-> resolve capability refs
-> validate compatibility
-> compile workflow
-> validate output contract
-> validate execution profile
-> freeze resolved bindings
-> create immutable version
```

核心规则：

- 任一步失败则整体失败
- 失败时不生成半成品 version
- 成功时生成新的不可变 `PlaybookVersion`

第一版不做：

- 后台发布任务
- 发布队列
- 重试/取消
- 中间状态持久化

## Publish Result

`Publish` 结果只需分成两类：

- `publish_success`
- `publish_failure`

### 成功时返回

- `playbook_version_id`
- `version_number`
- `published_at`
- `summary`

### 失败时返回

返回与 `DraftHealthReport` 兼容的结构化问题集：

- `publishable = false`
- `summary`
- `issues[]`

这样前端只需要处理一套统一的问题模型。

## Task Creation

新的任务创建模型不能再只依赖 `playbook_key`。

任务创建时至少要绑定：

- `workspace_id`
- `playbook_handle_id`
- `playbook_version_id`
- `input_payload`

执行链应是：

```text
create task request
-> load PlaybookHandle
-> load exact PlaybookVersion
-> validate version belongs to handle
-> validate input_payload against version input schema
-> compile workflow instance
-> create Task + Run
-> start execution
```

关键规则：

- 任务永远绑定一个明确已发布版本
- Draft 不能直接执行
- StoreEntry 不能直接执行

## Playbook Runtime Compiler

`Playbook Runtime Compiler` 的职责应保持很窄：

它负责：

`把一个已发布 PlaybookVersion，加上这次任务输入，编译成一次可执行的 workflow instance。`

输入：

- `PlaybookVersion`
- `input_payload`
- `workspace context`

输出：

- `workflow_instance`
- `resolved output contract instance`
- `resolved policy instance`
- `resolved execution profile instance`

它不负责：

- 解析 Draft
- Store 查询
- Publish
- 真正执行 workflow

## Execution Package

Runtime Compiler 最后应产出一个标准执行包。

建议最小结构包含：

- `playbook_version_ref`
- `bound_inputs`
- `workflow_instance`
- `resolved_contracts`
- `frozen_capability_bindings`

关系如下：

```text
PlaybookVersion
+ input_payload
+ workspace context
-> Runtime Compiler
-> Execution Package
-> Task / Run
```

`Execution Package` 不是持久化对象，而是 runtime 创建任务与运行前的标准中间物。

## Playbook Input Schema

`Input Schema` 的职责是描述、验证和绑定任务输入。

第一版每个 input field 只需要：

- `key`
- `type`
- `required`
- `default`
- `label`
- `description`

第一版建议支持的字段类型：

- `string`
- `text`
- `boolean`
- `enum`
- `path`

处理链为：

```text
version.inputs schema
+ user input_payload
-> validate
-> bind
-> bound_inputs
```

关键原则：

- `input_payload` 是外部输入
- `bound_inputs` 是内部执行输入
- 后续 runtime 只消费 `bound_inputs`

## Playbook Output Contract

`Output Contract` 定义的是 Playbook 的正式交付承诺。

第一版建议最小结构：

- `primary_artifact_type`
- `default_output_path`
- `overwrite_policy`
- `completion_rule`

作用有三点：

1. 发布时校验
2. 任务编译时实例化
3. 执行完成时验收

关系如下：

```text
PlaybookVersion.output_contract
-> Runtime Compiler resolves instance
-> Runtime writes outputs
-> Artifact/Completion validation checks contract
```

## Playbook Policy Profile

`Policy Profile` 定义的是“过程中允许做什么”。

第一版建议最小字段：

- `allowed_capability_classes`
- `write_policy`
- `approval_policy`
- `workspace_scope`
- `command_policy`

运行时关系：

```text
PlaybookVersion.policy_profile
-> Runtime Compiler resolves task-specific policy instance
-> Tool Gateway / Runtime enforce policy
```

这里需要坚持：

- Policy Profile 是策略来源
- 真正的 allow/deny/approval 仍由 runtime 和 Tool Gateway 落地

## Execution Profile

`Execution Profile` 定义的是“怎样组织执行”。

第一版建议支持：

- `single`
- `team(team_spec_ref)` 作为结构入口

其中：

- `single` 是当前默认路径
- `team` 为后续多 Agent 执行保留结构入口

关系如下：

```text
PlaybookVersion
  -> workflow
  -> output contract
  -> policy profile
  -> execution profile
       -> single
       -> team(team_spec_ref)
```

补充原则：

- team 是可选配置
- 多 Agent 协作必须是 `runtime-mediated collaboration`
- 不是 agent 自由协商

## 生命周期 API

第一版建议保持极小的生命周期 API：

- `GET /api/playbook-store`
  - 列出官方 Store 条目

- `POST /api/playbooks/fork`
  - 从 `store_entry_id` 创建本地 `PlaybookHandle + Draft`

- `GET /api/playbooks/:handle_id`
  - 返回：
    - handle 摘要
    - 当前 draft spec
    - current health
    - published versions 列表

- `PUT /api/playbooks/:handle_id/draft`
  - 保存整份 Draft spec
  - 返回最新 Draft 和 `DraftHealthReport`

- `POST /api/playbooks/:handle_id/publish`
  - 同步发布当前 Draft
  - 成功返回新 `PlaybookVersion` 摘要
  - 失败返回结构化问题集

- `GET /api/playbooks/:handle_id/versions/:version_id`
  - 返回某个已发布版本快照

第一版不包括：

- 删除 Playbook
- 回滚版本
- diff 版本
- 分享/导出
- 局部 patch 编辑 API

## Storage 方向

Authoring Backend 的存储模型建议为：

- 数据库优先
- spec 整体作为文档字段存储

最小对象：

- `store_entries`
- `playbook_handles`
- `playbook_drafts`
- `playbook_versions`

字段原则：

- 结构化列：
  - `id`
  - `handle_id`
  - `version_number`
  - `timestamps`
  - `status`

- 文档字段：
  - `spec_json`
  - `resolved_bindings_json`
  - `validation_report_json`

第一版 `DraftHealthReport` 可先内嵌在 draft 记录中，不单独拆表。

## 整体数据流

### 1. 编辑线

```text
edit draft
-> save full spec
-> compute Draft health
-> return updated draft + health
```

### 2. 发布线

```text
publish draft
-> run full validation chain
-> freeze bindings
-> create immutable version
-> return publish result
```

### 3. 执行线

```text
create task from handle + version
-> bind inputs
-> compile workflow instance
-> create Execution Package
-> create Task / Run
-> execute
```

## 非目标

本 spec 当前不处理：

- 前端可视化 workflow 编辑器
- 协同编辑
- 远端 Store 同步
- Playbook 分享/导出
- Publish 后台任务
- 版本 diff/merge
- 任意用户脚本执行

## MVP 切分

### Phase 1

- Store -> fork/copy
- Draft read/write
- Draft health
- synchronous publish
- task binding to published version

### Phase 2

- 完整 workflow 自定义
- richer output/policy/execution validation
- improved authoring diagnostics

### Phase 3

- extension-aware authoring
- team-aware execution profile
- richer version operations

## 关键结论

`Playbook Authoring Backend` 的第一版，本质上是：

`一个围绕 Draft 文档、同步发布、版本绑定执行而设计的内容生命周期后端。`

它不追求先做复杂编辑器，而是先把以下边界做稳：

- Store 是来源
- Handle 是拥有权
- Draft 是编辑工作区
- Version 是不可变执行快照
- Task 只执行 Version
