# 收敛为纯编排语义层的优化计划

> 目标：将项目收敛为与 LLM 和 agent 无关的“编排语义层”，只保留 playbook → workflow → task → run → execution → approval → artifact 的核心编排状态机。

---

## 背景

当前代码库中仍然存在大量 agent/assistant/team/本地 synthesis 概念，这些属于**执行器侧职责**，与“编排语义层”的定位相冲突。本计划描述如何系统性地剥离这些概念，使后端成为纯粹的编排内核。

**后续进展**：本计划中的清理工作已完成，并且项目已进一步从 Rust 全面迁移到 TypeScript/Node.js，后端核心现在位于 `packages/orchestrator`。

---

## 阶段一：语义重命名（低风险）

| 动作 | 从 | 到 |
|---|---|---|
| 重命名目录/模块 | `src/contract` 中的 agent 语义 | `src/contract` 中的 execution 语义 |
| 更新引用 | 所有 `agent-contract` 相关命名 | `execution-contract` 相关命名 |

- 消除 "agent" 语义偏差，明确这是编排协议层。

---

## 阶段二：剥离 Agent/Assistant 概念（中风险）

### `packages/orchestrator/src/runtime`

| 模块 | 动作 |
|---|---|
| `src/runtime/assistant/` | 删除 |
| `src/runtime/ports/assistant_delegation.ts` | 删除 |
| 数据库表中 assistant session 相关表 | 从 Drizzle schema 中删除 |

### `packages/orchestrator/src/api`

| 文件 | 动作 |
|---|---|
| `src/api/assistant.ts` | 删除 |
| `src/api/server.ts` 中 assistant 路由注册 | 删除 |

### `packages/orchestrator/src/infra`

| 文件 | 动作 |
|---|---|
| assistant 相关的持久化适配器 | 删除 |

---

## 阶段三：剥离 Team/Team Session 概念（中风险）

### `packages/orchestrator/src/runtime`

| 模块 | 动作 |
|---|---|
| `src/runtime/team_session/` | 删除 |
| `src/runtime/ports/team_orchestrator.ts` | 删除 |
| `src/runtime/ports/team_action_gateway.ts` | 删除 |

### `packages/orchestrator/src/api`

| 文件 | 动作 |
|---|---|
| `src/api/team_sessions.ts` | 删除 |
| `src/api/server.ts` 中 team session 路由注册 | 删除 |

### `packages/orchestrator/src/infra`

| 文件 | 动作 |
|---|---|
| `src/infra/team/` 本地适配器 | 评估后删除（已被 `HttpExecutionEngineClient` 取代） |

---

## 阶段四：剥离本地 Synthesis 执行器（高风险，需前置决策）

`synthesis` 模块是**硬编码的本地文本生成执行器**，属于执行逻辑而非编排语义。

| 模块 | 建议动作 |
|---|---|
| `src/runtime/synthesis/` | 整体删除 |
| `src/runtime/gateway/synthesis_adapter.ts` | 随 synthesis 一起删除 |
| `src/runtime/routine/executor.ts` 中 synthesis 调用 | 重写为向 `ExecutionEnginePort` 提交执行请求 |

**关键决策**：
- **激进方案 A**：全部删除，编排层只负责启动和监控远程执行引擎。
- **渐进方案 B**：将 `synthesis` 外移到独立服务，作为可选本地执行后端。

**推荐**：方案 A。既然定位是“编排语义层”，就不应包含任何 playbook 步骤的本地实现。

---

## 阶段五：剥离 Evolution Proposals（中风险）

`evolution_proposals` 是 agent 自我演进/改进 playbook 的元学习能力，非编排语义。

| 文件 | 动作 |
|---|---|
| `src/api/evolution_proposals.ts` | 删除 |
| `src/runtime/persistence/evolution_proposals.ts` | 删除 |
| 数据库 schema 中 evolution proposal 相关表 | 删除 |

---

## 阶段六：验证与边界确认

完成清理后，`packages/orchestrator/src/runtime/` 应仅保留以下模块：

```
approval/          ← 审批语义
artifact/          ← 产物语义
authority/         ← 权限/授权评估
capability/        ← 能力声明
contract/          ← 输入输出契约
events/            ← 事件流与投影
execution/         ← 执行编排核心（coordinator）
gateway/           ← 策略网关（保留 policy 部分）
invocation/        ← HTTP 工具调用
playbook/          ← Playbook 定义与注册表
policy/            ← 策略引擎
ports/             ← clock/filesystem/storage/execution_engine
run/               ← Run 语义
storage/           ← 内部存储抽象
task/              ← Task 语义
trace/             ← 追踪/审计
workflow/          ← Workflow 编译与执行图
workspace/         ← Workspace 语义
```

---

## 执行顺序

```
阶段一（重命名 contract）
    ↓
阶段二（assistant）
    ↓
阶段三（team）
    ↓
阶段五（evolution proposals）
    ↓
阶段四（synthesis，需前置决策）
    ↓
阶段六（验证 + 最终边界审查）
```

---

## 验证命令

每阶段完成后必须执行：

```bash
pnpm --filter @decacan/orchestrator test
pnpm --filter @decacan/orchestrator typecheck
```

---

## 后续：TypeScript 迁移

上述清理工作完成后，项目已进一步完成以下迁移：

- 删除所有 Rust crates（`crates/` 目录已移除）
- 在 `packages/orchestrator` 中重建了完整的 TypeScript 后端
- 使用 Hono 替代 Axum 作为 Web 框架
- 使用 Drizzle ORM + Postgres 替代 sqlx
- 使用 Zod 定义执行协议 schema
- 端到端测试已跑通（Vitest）

这意味着本计划的目标——“纯编排语义层”——现在以 TypeScript 实现的形式存在于 `packages/orchestrator` 中。

---

*Created: 2026-04-15*  
*Updated: 2026-04-16（补充 TypeScript 迁移说明）*
