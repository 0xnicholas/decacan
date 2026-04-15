# Decacan 项目学习指南

> 本文档帮助新成员快速理解 Decacan 项目的架构、核心概念和开发约定。

## 1. 项目定位

Decacan 是一个**多智能体工作编排产品**，帮助团队将可重复的 Playbook 转化为可靠的执行。

核心产品承诺：
> 给我一个工作目录和一个 Playbook，我会以最少的打扰为你产出结果。

### 与通用 Chat Agent 的区别

| | 通用 Chat Agent | Decacan |
|---|---|---|
| 入口 | 空白对话框 | 结构化 Playbook |
| 产出 | 回答文本 | 具体产物 (Artifact) |
| 工作方式 | 持续对话 | 任务委托后自动执行 |
| 中断时机 | 频繁询问 | 仅在风险动作时审批 |

## 2. 核心概念

### 2.1 产品对象（用户可见）

| 对象 | 说明 | 类比 |
|---|---|---|
| **Workspace** | 工作空间，执行边界 | 项目目录 |
| **Playbook** | Agent Team 的声明式任务执行规范 | 标准作业程序 (SOP) |
| **TeamSpec** | 执行资源配置（角色、工具、策略） | 团队配置 |
| **Task** | 一次具体的工作委托 | 工单/任务 |
| **Run** | Task 的一次执行实例 | 执行记录 |
| **Approval** | 风险决策点 | 审批单 |
| **Artifact** | 正式产出物 | 交付物 |

### 2.2 Playbook 的新定位

Playbook 已从"可执行 workflow 文档"升级为 **Agent Team 的声明式任务执行规范**。

它定义：
- **为什么做**：goal, intent, success criteria
- **做哪些工作单元**：steps
- **每个工作单元依赖什么能力**：capability_ref
- **多 agent 如何协作**：mode
- **怎样才算完成和合格**：validation
- **失败后如何处理**：control

> Playbook = 可编译的 Agent 工作说明书

### 2.3 Playbook 生命周期

```
Store Entry
    -> fork/copy -> PlaybookHandle
    -> edit Draft
    -> publish -> PlaybookVersion
    -> compile -> Execution Package
    -> create Task/Run
    -> execute (single or minimal team)
    -> produce Artifact
```

### 2.4 Abstract vs Bound Playbook

- **Abstract Playbook**：纯语义定义，无具体团队/运行时绑定
  - 用于：复用、移植、模板库
- **Bound Playbook**：已绑定到具体 TeamSpec 和运行时上下文
  - 用于：直接执行、部署

### 2.5 运行时对象（系统内部）

| 对象 | 说明 |
|---|---|
| **Workflow** | Playbook 背后的隐藏执行蓝图 |
| **WorkflowStep** | 工作流中的执行步骤 |
| **Graph** | Playbook 编译后的执行结构（表达 when/next/branch/loop） |
| **Capability** | 能力引用，可解析为 Routine/Tool/Team Action |
| **Routine** | 内部可复用的例行程序 |
| **TeamSession** | 多智能体协作的会话状态 |

## 3. 架构分层

```
apps/workspaces        工作空间执行界面（面向成员）
apps/console           账户控制台（面向管理者）
        \              /
         \            /
       crates/decacan-app        HTTP 接口层
               |
       crates/decacan-runtime    领域运行时（核心）
               |
       crates/decacan-infra      基础设施适配器
       crates/decacan-auth       认证服务
```

### 3.1 产品边界

**Workspaces**（执行界面）：
- 作为 workspace-scoped execution workbench
- 核心定位：`collaborative project room + action queue`
- 首页原则：`resume current work first`
- 支持 multi-industry 定制（通过配置驱动）

**Console**（账户控制台）：
- 左栏一级导航：`Workspaces` > `Agents` > `Dashboard` > `Manage`
- 面向两类用户：工作区管理者、Agent 管理者
- Playbook Studio（authoring/draft/publish）

### 3.2 各层职责

| 层级 | 职责 | 不做什么 |
|---|---|---|
| **apps/** | 用户界面、视图组合 | 不直接处理业务规则 |
| **decacan-app** | HTTP 路由、DTO、中间件 | 不写业务逻辑 |
| **decacan-runtime** | 领域规则、工作流编排、任务生命周期 | 不直接操作文件/网络 |
| **decacan-infra** | 具体适配器实现 | 不定义产品语义 |
| **decacan-auth** | 身份认证、授权辅助 | 不参与任务执行 |

### 3.3 关键注册表

- **Capability Registry**：能力注册与解析
- **TeamSpec Registry**：团队规格注册
- **Extension Registry**：扩展统一入口
- **Validator Registry**：校验规则注册

## 4. 执行流程

```
用户选择 Playbook + 填写输入
        |
        v
创建 Task → 编译 Workflow → 创建 Run
        |
        v
执行 WorkflowStep → 解析 Capability
        |
        v
调用 Routine / Team Action / Tool
        |
        v
通过 Tool Gateway 执行真实动作（带权限检查）
        |
        v
产出 Artifact → Task 完成
```

### 审批流程

当执行触及风险动作时：

```
Tool Gateway 返回 approval_required
        |
        v
Runtime 创建 Approval 对象
        |
        v
Task/Run 暂停 → 等待用户决策
        |
        v
用户批准 → 恢复执行 / 拒绝 → 任务失败
```

## 5. Multi-Industry 架构

Workspaces 支持通过三层架构实现多行业定制：

1. **配置层**：industry registry + 配置驱动（terminology, colors, layout）
2. **基础层**：base feature implementations
3. **覆盖层**：可选的行业特定覆盖（如 legal/medical）

配置原则：
- Console 管理 workbench templates
- Workspaces 渲染 template-selected home surface

## 6. 代码组织

### 后端 (Rust)

```
crates/
├── decacan-app/
│   └── src/api/          # HTTP 路由和 DTO
│   └── src/dto/          # 数据传输对象
│   └── src/middleware/   # 中间件
│
├── decacan-runtime/
│   └── src/playbook/     # Playbook 生命周期
│   └── src/task/         # Task 管理
│   └── src/run/          # Run 执行
│   └── src/workflow/     # 工作流定义
│   └── src/approval/     # 审批逻辑
│   └── src/artifact/     # 产物管理
│   └── src/ports/        # 领域端口（接口）
│   └── src/team_session/ # 团队会话
│
├── decacan-infra/
│   └── src/models/       # 模型路由
│   └── src/persistence/  # 持久化适配器
│   └── src/filesystem/   # 文件系统适配器
│   └── src/team/         # 团队编排适配器
│
└── decacan-auth/
    └── src/              # 认证和授权
```

### 前端 (React + TypeScript)

```
apps/
├── workspaces/           # 工作空间执行界面
│   └── src/
│       ├── config/       # Multi-industry 配置
│       ├── features/     # 功能模块（含行业覆盖）
│       └── routes/       # 路由页面
│
└── console/              # 账户控制台
    └── src/
        └── routes/       # 路由页面
```

## 7. 开发约定

### API 边界规则

- **Account Scope**: `/api/account/*`, `/api/playbooks`, `/api/teams`
- **Workspace Scope**: `/api/workspaces/:id/*`
- **Auth**: `/auth/*`（无前缀）

### 提交信息格式

```
<type>(<scope>): <description>

Types:
- feat: 新功能
- fix: Bug 修复
- docs: 文档
- refactor: 重构
- test: 测试
- chore: 维护

Scopes: runtime, app, infra, auth, workspaces, console, models, etc.
```

### 代码规范

**Rust:**
- 使用 `thiserror` 定义错误类型
- 异步 trait 使用 `async-trait`
- 公共 API 必须有文档注释

**TypeScript/React:**
- 遵循 shadcn/ui 组件模式
- 使用 Tailwind CSS v4
- React hooks 必须包含 cleanup

## 8. 常用命令

```bash
# 后端测试
cargo test --workspace
cargo clippy --workspace -- -D warnings
cargo fmt --check

# 前端测试
pnpm --filter decacan-workspaces test
pnpm --filter decacan-console test

# 本地开发
# 1. 启动后端 API
cargo run -p decacan-app

# 2. 启动 Workspaces 应用
pnpm dev:workspaces

# 3. 启动 Console 应用
pnpm dev:console
```

## 9. 推荐阅读顺序

新成员建议按以下顺序阅读文档：

### 入门必读
1. `README.md` - 项目总览
2. `docs/learn.md` - 本学习指南
3. `docs/architecture.md` - 全面架构参考

### 产品边界设计
4. `docs/superpowers/specs/2026-04-01-decacan-account-hub-and-workspace-boundaries-design.md` - 账户/工作空间边界
5. `docs/superpowers/specs/2026-04-02-decacan-workspaces-workbench-design.md` - Workspaces Workbench 设计
6. `docs/superpowers/specs/2026-04-09-decacan-console-navigation-and-routing-design.md` - Console 导航设计

### Playbook 与执行
7. `docs/superpowers/specs/2026-04-08-decacan-playbook-agent-team-execution-design.md` - Playbook 新定位
8. `docs/superpowers/specs/2026-03-29-decacan-backend-spec-index.md` - 后端规范索引

### 实现计划
9. `docs/superpowers/plans/2026-04-07-multi-industry-workspaces.md` - 多行业实现计划

## 10. 关键设计决策

### 为什么 Playbook 从 "Workflow 文档" 升级为 "Agent Team 规范"？

- **分层更清晰**：Playbook 表达 what/why/quality，Graph 表达 when/next/branch
- **编译器模式**：Playbook 编译为 Graph，Runtime 执行冻结后的结构
- **Team 解耦**：Playbook 定义任务规范，TeamSpec 定义执行资源，可独立变化

### 为什么 Task 是中轴对象？

- 用户发起的是 Task
- Runtime 执行的是 Task
- 审批、日志、产物都归属于 Task
- Run 只是 Task 的一次执行尝试

### 为什么 Artifact 是正式对象而非普通文件？

- 文件只是物理存储
- Artifact 是产品级交付物，包含元数据、来源追踪、状态
- 只有 Runtime 按输出合同登记后的文件才成为 Artifact

### Console 的导航为什么是 Workspaces > Agents > Dashboard > Manage？

- `Workspaces` 是工作区管理者的主运营对象
- `Agents` 是配置中台，承接 agent 创建与资产管理
- `Dashboard` 是聚合判断台，不应抢在主操作对象之前
- `Manage` 是低频治理区

## 11. 常见问题

**Q: Playbook、TeamSpec、Graph 的区别？**

A:
- **Playbook**：声明式任务规范（what/why/quality）
- **TeamSpec**：执行资源配置（roles/agents/tools）
- **Graph**：编译后的执行结构（when/next/branch/loop）

**Q: Abstract Playbook 和 Bound Playbook 的区别？**

A:
- **Abstract**：纯语义，无绑定，用于复用和模板
- **Bound**：已绑定 TeamSpec，可直接执行

**Q: Workspaces "resume current work first" 是什么意思？**

A: Workspace Home 不是 KPI 仪表盘，而是帮助用户：
- 快速恢复之前的工作上下文
- 了解自上次访问以来的变化
- 明确下一步该做什么

**Q: Multi-Industry 如何实现？**

A:
- 配置驱动：terminology、colors、layout
- 可选覆盖：特定行业可覆盖页面组件
- Console 管理模板，Workspaces 渲染模板

**Q: 审批和 Tool Gateway 的关系？**

A:
- Tool Gateway 决定 `allow/approval_required/deny`
- 如果需要审批，Runtime 创建 Approval 对象
- Psi/Agent 只发出 tool request，不创建 Approval

**Q: Workspace 和 Account 的边界？**

A:
- Workspace 是执行边界（成员、任务、产物）
- Account 是治理边界（跨工作空间可见、Playbook 管理）
- Console 是 Account 视角，Workspaces 是 Workspace 视角

---

*最后更新: 2026-04-10*
