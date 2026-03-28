# Decacan Extension Registry Spec

Date: 2026-03-29
Stage: Backend design
Status: Approved for planning

## 目标

定义 `Extension Registry` 在 `decacan` 后端中的职责、边界与最小对象模型。

本模块的作用是为外部扩展提供统一注册入口，并将扩展声明的资源投影到系统内部各个 registry 中。

## 核心原则

### 1. 对外入口统一，对内注册面分开

对于扩展安装者或系统安装流程来说，只有一次 `Extension` 注册动作。

但系统内部会拆成多个子职责：

- manifest 校验
- provider 记录
- capability 派生注册
- team spec 派生注册
- 未来模板资源派生注册

### 2. Playbook 不直接依赖 Extension 包

Playbook 不能直接引用 extension 包本体。

更合理的关系是：

```text
Extension
  -> Extension Registry
      -> Capability Registry
      -> TeamSpec Registry
      -> future template source

Playbook
  -> references registry objects only
```

### 3. Extension Registry 不是执行层

它不负责：

- 执行 routine 或 tool
- 调度 team
- 参与 task/run
- 直接修改 Draft
- 做 publish snapshot

它只负责扩展包层面的注册与来源管理。

## Extension Registry 的职责

第一版只负责 5 件事：

- 发现当前已安装的 extensions
- 校验 extension manifest
- 记录 extension/provider 元信息
- 将 manifest 中声明的资源投影到下游 registry
- 对下游提供稳定的来源/版本视图

## 与其他 Registry 的关系

`Extension Registry` 是上游入口。

下游 registry 仍然各自独立维护自己的真相视图：

- `Capability Registry`
- `TeamSpec Registry`
- 未来的模板来源层

关系如下：

```text
register extension
-> validate manifest
-> record provider
-> project capabilities into Capability Registry
-> project team specs into TeamSpec Registry
-> project templates into template source
```

## Extension Manifest

每个 extension 需要一份最小 manifest。

第一版建议至少包含：

### 1. Identity

- `extension_id`
- `provider`
- `version`
- `title`
- `summary`

### 2. Capabilities

声明该扩展提供的：

- `routines`
- `tools`
- `validators`

每项至少包含：

- `ref`
- `kind`
- `version`
- contract metadata

### 3. Team Specs

声明该扩展提供的 TeamSpec：

- `team_spec_id`
- `version`
- `roles`
- `lead_role`
- `compatibility`

### 4. Templates

未来可选：

- `template_id`
- `title`
- `summary`
- `embedded_spec_ref`

### 5. Compatibility

扩展本身的兼容要求，例如：

- 最低 runtime 版本
- 所需 feature flags
- 是否要求 team-aware runtime

### 6. Integrity

第一版即使不做签名，也建议保留：

- `manifest_version`
- `content_hash`

## TeamSpec 与 Capability 的来源

extension 注册后，不需要人工二次注册到 `TeamSpec Registry` 或 `Capability Registry`。

正确关系是：

- 扩展只注册一次
- 系统自动派生下游注册结果

例如：

```text
Team Extension
  -> register once in Extension Registry
      -> auto-project to TeamSpec Registry
```

## MVP 边界

第一版只支持：

- manifest 驱动的统一注册入口
- provider/version 记录
- capability/team spec 自动派生注册

第一版不展开：

- 远端下载
- 扩展市场
- 卸载与迁移
- 签名校验
- 复杂升级策略

## 关键结论

`Extension Registry` 第一版就是一个 manifest 驱动的统一注册入口，用来把外部扩展资源安全接入内部各个 registry，而不是一个新的执行系统。
