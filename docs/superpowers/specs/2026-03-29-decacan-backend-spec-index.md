# Decacan Backend Spec Index

Date: 2026-03-29
Stage: Backend architecture
Status: Working index

## 目的

本文件用于统一 `decacan` 当前已经形成的后端设计 spec，给出：

- 模块地图
- 文档之间的依赖关系
- 推荐阅读顺序
- 当前 MVP 主线包含哪些模块

它不是新的细节设计稿，而是一份总览索引。

## 当前后端主线

`decacan` 当前的后端主线已经从“单线 Playbook 执行”扩展成：

- Playbook 内容生命周期
- Registry 驱动的引用解析
- Runtime 编译与执行准备
- `single + minimal team` 双执行主线

当前推荐的总体理解方式是：

```text
Store
-> fork to Handle
-> edit Draft
-> publish to Version
-> compile to Execution Package
-> create Task / Run
-> execute single or minimal team workflow
-> produce Artifact
```

## 模块分层

### 1. 内容与生命周期层

这层解决“用户拥有什么、编辑什么、发布什么”。

关键对象：

- `StoreEntry`
- `PlaybookHandle`
- `PlaybookDraft`
- `PlaybookVersion`

相关 spec：

- [Playbook Store And Versioning Spec](/Users/nicholasl/Documents/build-whatever/decacan/docs/superpowers/specs/2026-03-28-decacan-playbook-store-and-versioning-spec.md)
- [Playbook Authoring Backend Spec](/Users/nicholasl/Documents/build-whatever/decacan/docs/superpowers/specs/2026-03-28-decacan-playbook-authoring-backend-spec.md)

### 2. 注册与引用层

这层解决“系统里有哪些资源可被 Playbook 引用”。

关键模块：

- `Capability Registry`
- `TeamSpec Registry`
- `Extension Registry`
- `Validator Registry`

相关 spec：

- [Capability Registry Spec](/Users/nicholasl/Documents/build-whatever/decacan/docs/superpowers/specs/2026-03-28-decacan-capability-registry-spec.md)
- [Minimal Team Execution Spec](/Users/nicholasl/Documents/build-whatever/decacan/docs/superpowers/specs/2026-03-29-decacan-minimal-team-execution-spec.md)

说明：

- `Extension Registry` 作为统一入口
- `Capability Registry` 与 `TeamSpec Registry` 仍然保持分开
- `Validator Registry` 作为统一校验规则入口

### 3. 编译与执行准备层

这层解决“如何把一个已发布版本实例化为一次任务执行”。

关键模块：

- `Playbook Runtime Compiler`
- `Execution Package`
- `Input Schema Binder`
- `Output Contract Resolver`
- `Policy Profile Resolver`
- `Execution Profile Resolver`
- `Workspace Policy Model`

相关 spec：

- [Playbook Authoring Backend Spec](/Users/nicholasl/Documents/build-whatever/decacan/docs/superpowers/specs/2026-03-28-decacan-playbook-authoring-backend-spec.md)
- [MVP Backend Module Map Spec](/Users/nicholasl/Documents/build-whatever/decacan/docs/superpowers/specs/2026-03-29-decacan-mvp-backend-module-map-spec.md)

### 4. Runtime 执行层

这层解决“Task / Run 如何真正推进工作流并生成结果”。

关键模块：

- `Task / Run`
- `Workflow / Routine`
- `Tool Gateway`
- `semantic`
- `Artifact`
- `Approval`

相关基础设计：

- [Decacan Runtime Object Model](/Users/nicholasl/Documents/build-whatever/decacan/docs/2026-03-27-decacan-runtime-object-model.md)
- [Decacan Product Architecture](/Users/nicholasl/Documents/build-whatever/decacan/docs/2026-03-27-decacan-product-architecture.md)

### 5. Team 扩展层

这层现在已经正式进入 MVP 主线，但仅限最小闭环。

关键模块：

- `TeamSpec`
- `Team Binding Snapshot`
- `Role`
- `RoleAssignment`
- `parallel_role_group`
- `merge`

相关 spec：

- [Minimal Team Execution Spec](/Users/nicholasl/Documents/build-whatever/decacan/docs/superpowers/specs/2026-03-29-decacan-minimal-team-execution-spec.md)
- [MVP Backend Module Map Spec](/Users/nicholasl/Documents/build-whatever/decacan/docs/superpowers/specs/2026-03-29-decacan-mvp-backend-module-map-spec.md)

## 文档依赖关系

建议按下面的依赖关系理解这些 spec：

```text
Playbook Store And Versioning
  -> Playbook Authoring Backend
      -> Capability Registry
      -> Validator Registry
      -> TeamSpec Registry / Minimal Team Execution

MVP Backend Module Map
  -> 汇总以上模块，并给出主线优先级
```

换句话说：

- `Store/Versioning` 定义对象生命周期
- `Authoring Backend` 定义编辑、发布、版本绑定执行
- `Capability Registry` 定义能力引用与冻结
- `Minimal Team Execution` 定义 team 进入 MVP 后怎么落地
- `MVP Backend Module Map` 把它们收进同一条执行主线

## 推荐阅读顺序

如果要完整理解当前后端设计，建议按以下顺序阅读：

1. [Decacan Product Architecture](/Users/nicholasl/Documents/build-whatever/decacan/docs/2026-03-27-decacan-product-architecture.md)
2. [Decacan Runtime Object Model](/Users/nicholasl/Documents/build-whatever/decacan/docs/2026-03-27-decacan-runtime-object-model.md)
3. [Playbook Store And Versioning Spec](/Users/nicholasl/Documents/build-whatever/decacan/docs/superpowers/specs/2026-03-28-decacan-playbook-store-and-versioning-spec.md)
4. [Capability Registry Spec](/Users/nicholasl/Documents/build-whatever/decacan/docs/superpowers/specs/2026-03-28-decacan-capability-registry-spec.md)
5. [Playbook Authoring Backend Spec](/Users/nicholasl/Documents/build-whatever/decacan/docs/superpowers/specs/2026-03-28-decacan-playbook-authoring-backend-spec.md)
6. [Minimal Team Execution Spec](/Users/nicholasl/Documents/build-whatever/decacan/docs/superpowers/specs/2026-03-29-decacan-minimal-team-execution-spec.md)
7. [MVP Backend Module Map Spec](/Users/nicholasl/Documents/build-whatever/decacan/docs/superpowers/specs/2026-03-29-decacan-mvp-backend-module-map-spec.md)

## 当前 MVP 主线包含什么

在当前最新收敛结果中，MVP 主线已经包括：

- `Playbook Store`
- `fork/copy -> Handle`
- `Draft / Version`
- `Capability Registry`
- `Authoring Backend`
- `Validator Registry`
- `Runtime Compiler`
- `Execution Package`
- `Workspace Policy Model`
- `single` 执行路径
- `minimal team` 执行路径

但 MVP 中的 `team` 严格限制为：

- `builtin TeamSpec`
- `parallel_role_group -> merge`
- `all_required`
- `runtime-mediated collaboration`

不包括：

- TeamSpec authoring lifecycle
- extension-provided team 的实际执行闭环
- nested groups
- 通用 multi-agent 平台能力

## 尚未展开或仅快速收口的部分

以下模块已经被讨论，但目前只做了快速收口，没有单独完整 spec：

- `Extension Registry`
- `Validator Registry`
- `Workspace Policy Model`

如果后续进入实现计划，可能需要根据优先级再补成单独 spec。

## 当前建议的计划顺序

如果下一步进入 implementation planning，建议优先级为：

1. `Store / Handle / Draft / Version`
2. `Capability Registry`
3. `Authoring Backend`
4. `Runtime Compiler + Execution Package`
5. `Workspace Policy Model`
6. `single` path
7. `TeamSpec Registry + minimal team path`
8. `Validator / Artifact / Approval` 收口

## 一句话总结

当前 `decacan` 的后端设计已经形成一组彼此衔接的 spec：

`它们共同描述了一个以 Playbook 生命周期为上游、以 Registry 为中层、以 Runtime 为执行主线、并在 MVP 内纳入 minimal team execution 的后端系统。`
