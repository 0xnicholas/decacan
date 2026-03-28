# Decacan Workspace Policy Model Spec

Date: 2026-03-29
Stage: Backend design
Status: Approved for planning

## 目标

定义 `Workspace Policy Model` 在 `decacan` 后端中的角色。

本模块用于把“任务在工作目录里能做什么、做到哪一层”的规则，从零散逻辑中抽离出来，形成任务级一等策略对象。

## 背景

当 Playbook 可自定义之后，目录边界不再只是固定常量，而会同时受到以下因素影响：

- `Workspace` 的物理边界
- `PlaybookVersion.policy_profile`
- 当前任务的 `bound_inputs`

如果不把这些规则收口成单独模块，边界就会重新散落到：

- workflow step
- tool gateway
- task creation
- playbook policy

## 核心原则

### 1. Workspace Policy 是任务级策略实例

它不是静态配置，而是一次任务编译后得到的 resolved policy instance。

### 2. Tool Gateway 负责执行它

Workspace Policy 不直接做 allow/deny。  
它提供任务级边界，最终由 runtime 和 `Tool Gateway` 落地。

### 3. 路径规则不能散落在 step 中

step 不应各自携带大量目录边界逻辑。  
Workspace Policy 应成为统一的目录边界来源。

## 输入来源

一个 task 的 `Workspace Policy` 由三部分共同决定：

- `Workspace`
- `PlaybookVersion.policy_profile`
- `bound_inputs`

关系如下：

```text
Workspace
+ PlaybookVersion.policy_profile
+ bound_inputs
-> Workspace Policy Resolver
-> resolved workspace policy instance
-> Tool Gateway enforces it
```

## 最小字段

第一版只需要 4 组字段：

- `scope`
- `read_boundary`
- `write_boundary`
- `path_rules`

### 1. `scope`

定义这次任务能看到工作目录的哪一部分，例如：

- `full_workspace`
- `subpath_only`

### 2. `read_boundary`

定义允许读取哪些路径、哪些类型资源。

### 3. `write_boundary`

定义允许写到哪里，例如：

- `output_only`
- `output_plus_approved`

### 4. `path_rules`

定义额外路径规则，例如：

- 是否允许覆盖
- 是否要求先备份
- 是否禁止逃逸出 workspace

## 运行关系

Workspace Policy 的职责是：

- 在任务创建/编译后形成任务级目录边界实例
- 交给 runtime 与 Tool Gateway 使用

它不负责：

- 自己执行路径检查
- 自己判断 approval
- 自己解释 Playbook step 语义

## MVP 边界

第一版只做：

- 任务级 resolved workspace policy
- runtime / Tool Gateway 统一使用
- 目录边界不再散落在各 step 里

第一版不展开：

- 复杂多工作区共享策略
- 用户级权限体系
- 历史策略迁移
- runtime 外独立 policy engine 服务

## 关键结论

`Workspace Policy Model` 第一版就是任务级的目录边界实例，用于把工作目录读写规则统一收口并交给 Tool Gateway 落地。
