# Decacan Console Navigation And Routing Design

Date: 2026-04-09
Stage: Product IA design
Status: Draft for review

## 目标

定义 `apps/console` 作为经典后台布局时的：

- 左栏信息架构
- 一级与二级导航对象
- 稳定路由前缀与 URL 规则
- 列表页、详情页、编辑页、创建页的落位方式

本设计聚焦 `Console` 的产品结构，不展开具体视觉样式，也不替代已有的账户 / workspace 边界定义。

## 关联设计

本设计建立在以下已有结论之上：

- `Console` 是账户级控制台，不是第二个 workspace 执行壳
- `workspaces` 负责具体执行，`Console` 负责跨 workspace 运营、聚合、authoring 与治理
- `Playbook`、`TeamSpec`、`Capability`、`Policy` 已经被讨论为 agent 配置资产的重要组成部分

相关文档：

- [2026-04-01-decacan-account-hub-and-workspace-boundaries-design.md](/Users/nicholasl/Documents/build-whatever/decacan/docs/superpowers/specs/2026-04-01-decacan-account-hub-and-workspace-boundaries-design.md)
- [2026-04-02-decacan-workspaces-workbench-design.md](/Users/nicholasl/Documents/build-whatever/decacan/docs/superpowers/specs/2026-04-02-decacan-workspaces-workbench-design.md)
- [2026-04-08-decacan-playbook-agent-team-execution-design.md](/Users/nicholasl/Documents/build-whatever/decacan/docs/superpowers/specs/2026-04-08-decacan-playbook-agent-team-execution-design.md)

## 背景

当前 `Console` 在代码中已经具备部分账户级聚合与 `Playbook Studio` 能力，但导航结构仍偏早期：

- 首页是账户级 `My Work`
- `Playbook Studio` 已有列表、创建、编辑、发布能力
- 其他大量 Console 模块仍是占位状态

如果不先固定一套稳定 IA，后续新增模块时会出现两个问题：

- 左栏不断堆叠页面名，缺少对象边界
- 路由与页面归属漂移，导致权限、导航、详情页结构越来越难维护

## 用户与任务

本设计面向两类主要用户：

### 1. 工作区管理者

他们主要关心：

- 管理和切换 `workspaces-workbench`
- 从账户层看跨 workspace 的状态、任务、审批和成员
- 从汇总视角进入具体 workspace 或处理异常

### 2. Agent 管理者

他们主要关心：

- 创建 agent
- 管理 agent 列表
- 管理 agent 的流程、团队、能力与治理规则
- 维护可复用的 agent 配置资产

此外，`Console` 也承载个人账户相关操作，但这不是主导航的第一优先级。

## 核心产品判断

`Console` 应采用：

`左栏稳定对象域 + 右栏具体页面内容`

左栏不应按“页面杂项”组织，也不应按“报表优先”组织，而应按管理对象域组织。这样才能同时服务：

- 高频运营对象
- agent 配置对象
- 汇总分析视图
- 治理与账户设置

## 一级导航决策

`Console` 的左栏一级菜单固定为：

1. `Workspaces`
2. `Agents`
3. `Dashboard`
4. `Manage`

这个顺序是产品决策，不是视觉偏好。

原因如下：

- `Workspaces` 是工作区管理者的主运营对象，应放第一
- `Agents` 是配置中台，承接 agent 创建与资产管理，应放第二
- `Dashboard` 是聚合判断台，不应抢在主操作对象之前
- `Manage` 是低频治理区，应放最后

## 一级导航定义

### Workspaces

`Workspaces` 用于承接跨 workspace 运营与管理入口。

它的职责是：

- 提供 workspace 相关的运营总台
- 提供跨 workspace 列表、队列和入口
- 将用户路由到具体 workspace 或后续管理页面

它不是单个 workspace 内的执行界面，也不是 `workspaces` 产品的镜像壳。

### Agents

`Agents` 用于承接 agent 相关的配置、列表和治理。

它的职责是：

- 创建 agent
- 管理 agent 列表
- 管理组成 agent 的核心资产

这里的关键产品判断是：

`Agent` 是一等对象，`Playbook` 不是 agent 的上位概念。

更准确地说：

- `Agent` 是可管理、可发布、可观察的业务配置单元
- `Playbook` 是 `Agent` 的流程骨架
- `TeamSpec` 是 `Agent` 的团队协作定义
- `Capability` 是 `Agent` 的能力目录
- `Policy` 是 `Agent` 的治理边界

### Dashboard

`Dashboard` 用于承接账户级汇总、分析与注意力排序。

它的职责是：

- 展示整体运行信号
- 展示与当前用户有关的待办或关注点
- 帮助用户判断应该进入哪个 workspace、agent 或治理模块

`Dashboard` 是判断台，不是主操作台。

### Manage

`Manage` 用于承接账户、权限、审计、集成与系统设置。

它的职责是：

- 治理用户和角色
- 管理审计与合规入口
- 管理外部集成与系统参数

它不承接主业务对象运营，也不承接 agent authoring。

## 左栏二级菜单

### 1. Workspaces

当前建议保留以下二级菜单：

- `Workbench`
- `All Workspaces`
- `Approvals`
- `Runs`
- `Members`

但 `Workspaces` 模块内部页面层级目前仍存在较多不确定性，因此本设计只冻结：

- 一级前缀
- 默认落点
- 当前建议二级入口名

不在本轮设计中冻结：

- 单个 workspace 详情结构
- workspace 详情下的 tabs
- 与 `apps/workspaces` 的最终跳转边界细节

### 2. Agents

`Agents` 的二级菜单冻结为：

- `Quickstart`
- `All Agents`
- `Playbooks`
- `Teams`
- `Capabilities`
- `Policies`

说明：

- `Quickstart` 负责新建入口、模板入口、最近草稿与引导
- `All Agents` 负责 agent 管理列表
- `Playbooks`、`Teams`、`Capabilities`、`Policies` 负责配置资产页

这里采用 `Teams` 而不是 `TeamSpecs` 作为导航文案，原因是：

- 面向后台管理者更直观
- 路由和菜单更简洁
- 可以在实现层继续保留 `teamSpecId` 等内部术语

### 3. Dashboard

`Dashboard` 的二级菜单冻结为：

- `Analytics`
- `My Work`
- `Attention`

其中：

- `Analytics` 负责趋势与汇总
- `My Work` 负责与当前用户直接相关的队列和入口
- `Attention` 负责异常、阻塞、告警与优先处理项

### 4. Manage

`Manage` 的二级菜单冻结为：

- `Account`
- `Users`
- `Audit Logs`
- `Integrations`
- `Settings`

后续如需扩展 `Roles`、`Permissions`、`Billing`，应优先作为 `Manage` 下的新增稳定入口，而不是散落到其他一级菜单下。

## 路由模型

本设计采用：

`一级菜单 = 一级路由前缀`

这样可以保证：

- 菜单归属清晰
- 权限边界清晰
- URL 可预测
- 详情页与列表页的命名稳定

### 一级前缀

- `/workspaces/*`
- `/agents/*`
- `/dashboard/*`
- `/manage/*`

### 默认重定向

- `/workspaces` -> `/workspaces/workbench`
- `/agents` -> `/agents/quickstart`
- `/dashboard` -> `/dashboard/analytics`
- `/manage` -> `/manage/account`

## 推荐 URL 结构

### Workspaces

- `/workspaces/workbench`
- `/workspaces/all`
- `/workspaces/approvals`
- `/workspaces/runs`
- `/workspaces/members`

待后续明确后再补：

- `/workspaces/:workspaceId`
- `/workspaces/:workspaceId/edit`
- `/workspaces/:workspaceId/...`

### Agents

#### 顶层入口

- `/agents/quickstart`
- `/agents/all`
- `/agents/new`
- `/agents/:agentId`
- `/agents/:agentId/edit`

#### Playbooks

- `/agents/playbooks`
- `/agents/playbooks/new`
- `/agents/playbooks/:playbookId`
- `/agents/playbooks/:playbookId/edit`

#### Teams

- `/agents/teams`
- `/agents/teams/new`
- `/agents/teams/:teamId`
- `/agents/teams/:teamId/edit`

#### Capabilities

- `/agents/capabilities`
- `/agents/capabilities/new`
- `/agents/capabilities/:capabilityId`
- `/agents/capabilities/:capabilityId/edit`

#### Policies

- `/agents/policies`
- `/agents/policies/new`
- `/agents/policies/:policyId`
- `/agents/policies/:policyId/edit`

### Dashboard

- `/dashboard/analytics`
- `/dashboard/my-work`
- `/dashboard/attention`

### Manage

- `/manage/account`
- `/manage/users`
- `/manage/users/:userId`
- `/manage/audit-logs`
- `/manage/integrations`
- `/manage/settings`

## 页面类型规则

为了避免左栏膨胀，页面必须分成不同类型。

### 允许进入左栏的页面

左栏只允许放以下类型：

- 对象总表页
- 稳定功能页
- 汇总入口页
- 治理配置页

### 不进入左栏的页面

以下页面不应进入左栏：

- 创建页
- 编辑页
- 详情页
- 单个对象的运行态页面
- 临时筛选结果页

这意味着：

- `Create Agent` 不进左栏
- `Agent Detail` 不进左栏
- `Edit Playbook` 不进左栏
- `Workspace Detail` 不进左栏

它们应通过右侧内容区、按钮、面包屑和上下文导航进入。

## 创建与管理动作落位

### Create Agent

`Create Agent` 不作为左栏稳定子菜单。

它应出现在两个位置：

- `Agents / Quickstart` 的主 CTA
- `Agents / All Agents` 列表页右上角主按钮

推荐 URL：

- `/agents/new`

### Agent 管理列表

`All Agents` 是 agent 的主管理总表。

它应承接：

- 搜索
- 筛选
- 排序
- owner / status / version / updated at 展示
- 进入 agent 详情
- 新建 agent CTA

推荐 URL：

- `/agents/all`

## 详情页结构规则

详情复杂度优先落在右侧内容区，而不是继续在左栏增加三级导航。

例如 `Agent Detail` 建议使用 tabs：

- `Overview`
- `Playbook`
- `Team`
- `Capabilities`
- `Policies`
- `Versions`
- `Activity`

可用路由包括：

- `/agents/:agentId`
- `/agents/:agentId/playbook`
- `/agents/:agentId/team`
- `/agents/:agentId/capabilities`
- `/agents/:agentId/policies`
- `/agents/:agentId/versions`
- `/agents/:agentId/activity`

本设计不要求这些 tabs 在第一阶段全部实现，但要求后续扩展优先走详情页 tabs，而不是新开左栏入口。

## 文案与命名规则

### 菜单命名

左栏文案应短、稳定、易扫描。

本设计冻结以下推荐文案：

- `Workbench`
- `All Workspaces`
- `Quickstart`
- `All Agents`
- `Playbooks`
- `Teams`
- `Capabilities`
- `Policies`
- `Analytics`
- `My Work`
- `Attention`
- `Account`
- `Users`
- `Audit Logs`
- `Integrations`
- `Settings`

### 命名约束

- 左栏不使用动词短句，如 `Create New Agent`
- 创建动作使用按钮，不使用长期挂载菜单
- URL 使用英文、短名、kebab-case
- 列表与稳定页优先使用复数或固定名词

## 权限与导航边界

本设计不定义完整权限矩阵，但要求后续权限实现遵循导航边界：

- 一级菜单应可按对象域整体隐藏或降级
- 二级菜单应可按对象能力显示或隐藏
- 无权限时，菜单隐藏优先于进入后报错

例如：

- 没有 `Agents` 权限时，整个 `Agents` 菜单可隐藏
- 没有 `Policies` 权限时，隐藏 `Agents / Policies`

## 非目标

本设计不在本轮解决以下问题：

- `Workspaces` 模块详情层级的最终结构
- 具体视觉样式、图标与动效
- 页面内的数据表、筛选器、图表组件设计
- 完整权限模型
- 是否需要独立系统超级管理员控制台

## 设计结论

`Console` 的经典后台布局应采用以下正式 IA：

1. `Workspaces`
2. `Agents`
3. `Dashboard`
4. `Manage`

其中：

- `Workspaces` 是跨 workspace 运营入口
- `Agents` 是 agent 资产与治理中心
- `Dashboard` 是汇总与优先级判断台
- `Manage` 是低频治理与系统配置区

同时采用以下正式路由规则：

- 一级菜单等于一级 URL 前缀
- 左栏只挂稳定入口
- 创建 / 编辑 / 详情页不进入左栏
- 详情复杂度优先通过右侧 tabs 扩展

## 后续规划建议

建议下一步按两个方向继续推进：

1. 先为 `Console` 写实现计划，将当前 React Router、菜单配置、权限显示逻辑对齐到本设计
2. 另起一份 `Workspaces` 详情层级设计，专门解决 `Workspaces` 内部 IA 与 `apps/workspaces` 跳转边界
