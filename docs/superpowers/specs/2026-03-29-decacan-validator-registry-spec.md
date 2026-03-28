# Decacan Validator Registry Spec

Date: 2026-03-29
Stage: Backend design
Status: Approved for planning

## 目标

定义 `Validator Registry` 在 `decacan` 后端中的职责与最小结构。

它的核心作用是将 Draft、Publish、Artifact 三阶段的校验规则统一收口，而不是把所有规则散落在 `Publish Pipeline` 或 runtime 各处。

## 核心原则

### 1. Validator Registry 是统一校验入口

它主要服务三类对象：

- `PlaybookDraft`
- `PlaybookVersion publish candidate`
- `Artifact / Output`

### 2. 它不替代其他 Registry

- `Capability Registry` 负责“引用是谁”
- `TeamSpec Registry` 负责“team 是谁”
- `Validator Registry` 负责“整体是否合法”

### 3. 它只返回统一 issue 结构

Validator Registry 不负责执行 workflow，也不负责 capability/team 解析。它的职责是把“不成立的地方”统一转成结构化 issue。

## Validator 类型

第一版先只支持 4 类：

- `schema_validator`
- `workflow_validator`
- `contract_validator`
- `artifact_validator`

## 最小职责

- 解析 validator ref
- 运行对应校验逻辑
- 返回统一 `issue` 结构

## 服务场景

### 1. Draft Health

为 `DraftHealthReport` 提供统一 issue 集。

### 2. Publish

为同步发布流程提供结构化错误输出。

### 3. Artifact / Output Validation

为运行完成后的 output contract 验证提供统一入口。

## Issue 模型

第一版 issue 建议统一为：

- `severity`
- `domain`
- `kind`
- `location`
- `message`
- `related_ref`

这能让：

- Draft 保存后的 health
- Publish failure
- Artifact validation failure

三者复用同一种问题表示。

## 与 Publish Pipeline 的关系

`Publish Pipeline` 不应硬编码所有校验规则。

更合理的链路是：

```text
load draft
-> resolve capabilities/team
-> run validators
-> compile workflow
-> snapshot bindings
-> create version
```

也就是说：
- Publish Pipeline 负责流程
- Validator Registry 负责规则执行

## MVP 边界

第一版不展开：

- 自定义 validator authoring
- 远端 validator 分发
- validator 生命周期管理
- 多阶段异步验证

## 关键结论

`Validator Registry` 第一版就是统一的校验规则入口，用于把 Draft、Publish、Artifact 三阶段的检查模块化，而不是一个复杂独立系统。
