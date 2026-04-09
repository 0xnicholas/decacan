# Decacan Console Product Design

Date: 2026-04-10
Stage: Product design
Status: Draft for review

## 目标

定义 `apps/console` 在近中期应该成为什么样的产品。

本设计覆盖：

- `Console` 的产品定位
- 目标用户与关键任务
- 四个产品域的职责边界
- 近中期功能范围
- 关键用户流程
- 导航与路由结构
- MVP 范围与阶段边界

本设计不展开具体视觉样式，也不替代已有的 workspace 执行体验设计。

## 关联设计

本设计建立在以下结论之上：

- `Console` 是账户级控制台，不是第二个 workspace 执行壳
- `apps/workspaces` 是默认工作表面，负责具体执行与协作
- `Console` 负责跨 workspace 运营、agent authoring、聚合、治理
- `Playbook`、`TeamSpec`、`Capability`、`Policy` 是 agent 配置资产的重要组成部分

相关文档：

- [2026-04-01-decacan-account-hub-and-workspace-boundaries-design.md](/Users/nicholasl/Documents/build-whatever/decacan/docs/superpowers/specs/2026-04-01-decacan-account-hub-and-workspace-boundaries-design.md)
- [2026-04-02-decacan-workspaces-workbench-design.md](/Users/nicholasl/Documents/build-whatever/decacan/docs/superpowers/specs/2026-04-02-decacan-workspaces-workbench-design.md)
- [2026-04-08-decacan-playbook-agent-team-execution-design.md](/Users/nicholasl/Documents/build-whatever/decacan/docs/superpowers/specs/2026-04-08-decacan-playbook-agent-team-execution-design.md)

## 背景

当前 `Console` 已经出现了正确方向的雏形：

- 账户级 `My Work` 首页
- 基础跨 workspace 聚合能力
- `Playbook Studio` 的创建、编辑、发布能力

但它仍然更像：

- 部分成型的账户首页
- 单点存在的 playbook studio
- 若干未来模块的占位容器

这意味着当前的主要问题不是“缺页面”，而是“缺完整产品定义”。

如果不先固定产品模型，后续会继续出现三类漂移：

- 导航只反映页面堆叠，不反映产品对象
- 功能在 `Console` 与 `apps/workspaces` 之间互相渗透
- `Agents`、`Dashboard`、`Manage` 会各自生长，但缺少统一分工

## 产品定义

`Console` 的近中期定义应是：

`面向工作区管理者和 agent 管理者的账户级控制台`

它负责四类事情：

- 管理跨 workspace 的运营对象与入口
- 管理 agents 及其配置资产
- 提供轻量决策与注意力汇总
- 承接组织治理与系统设置

它不是：

- 纯报表后台
- 纯系统管理员控制台
- 第二个 workspace 执行壳
- 只服务技术管理员的配置面板

## 目标用户

### 1. 工作区管理者

他们的主要任务是：

- 管理和切换 `workspaces-workbench`
- 从账户层看跨 workspace 的状态、运行、审批和成员
- 找到需要优先关注的 workspace
- 决定是账户层处理还是进入具体 workspace

### 2. Agent 管理者

他们的主要任务是：

- 创建 agent
- 管理 agent 列表
- 管理 agent 的流程、团队、能力与治理规则
- 维护可复用的 agent 配置资产

### 3. 组织治理用户

他们的主要任务是：

- 管理账户、用户、角色和权限
- 查看审计记录
- 管理外部集成和系统设置

### 4. 个人账户用户

他们不是本产品的主中心，但仍需使用 `Console`：

- 查看与自己相关的待办
- 找回最近访问对象
- 处理个人或账户层入口事项

## 核心产品原则

### 1. 对象域优先

`Console` 的主导航按对象域组织，而不是按杂项页面或报表分类组织。

### 2. 账户层运营优先

`Console` 首先要服务跨 workspace 管理与 agent 管理，报表与设置都是支撑能力。

### 3. Agent 是一等对象

`Agent` 必须在产品中有正式对象地位，不能只作为 `Playbook`、`TeamSpec` 等资产的隐式组合结果。

### 4. Dashboard 只做轻量决策

`Dashboard` 应帮助用户判断“去哪里”，而不是承载所有管理动作。

### 5. 治理域独立存在

账户、用户、审计、集成和系统设置必须集中在 `Manage`，不能散落在业务域里。

### 6. Console 与 Workspaces 保持清晰边界

`Console` 负责跨 workspace 管理与入口。

`apps/workspaces` 负责单个 workspace 内的执行现场。

## 产品域

`Console` 的正式一级产品域固定为：

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

## 产品域职责边界

### Workspaces

`Workspaces` 是 `Console` 里的跨 workspace 运营域。

它负责：

- 提供 workspace 相关的运营总台
- 提供跨 workspace 列表、队列和入口
- 让用户定位需要关注的 workspace、审批、运行或成员问题
- 将用户路由到具体 workspace 或后续管理页面

它不负责：

- 复刻单个 workspace 的完整执行体验
- 在 `Console` 中承载任务详情、交付物详情、活动流等现场型页面
- 替代 `apps/workspaces` 的协作与推进流程

一句话收口：

`Workspaces` 是跨 workspace 运营台，不是 workspace 执行壳。

### Agents

`Agents` 是 `Console` 的配置中台，负责把 agent 作为正式产品对象管理。

它负责：

- 创建 agent
- 管理 agent 列表
- 管理组成 agent 的核心资产
- 为发布、变更、治理和复用提供正式入口

对象关系应明确写成：

- `Agent` 是一等对象
- `Playbook` 是 `Agent` 的流程骨架
- `TeamSpec` 是 `Agent` 的团队协作定义
- `Capability` 是 `Agent` 的能力目录
- `Policy` 是 `Agent` 的治理边界

它不负责：

- 展示某次 run 的完整执行现场
- 承担运行日志中心或调试控制台角色
- 让配置资产页取代 agent 本身

一句话收口：

`Agents` 是 agent 资产与治理中心。

### Dashboard

`Dashboard` 是轻量决策台。

它负责：

- 展示整体运行信号
- 展示与当前用户有关的待办或关注点
- 排序异常、阻塞和优先处理项
- 帮助用户判断应该进入哪个 workspace、agent 或治理模块

它不负责：

- 承接复杂批量管理动作
- 变成对象域页面的替代品
- 变成什么都能做的超级首页

一句话收口：

`Dashboard` 的价值是帮助用户判断下一步去哪里。

### Manage

`Manage` 是治理域。

它负责：

- 治理账户与组织信息
- 治理用户、角色与权限
- 管理审计入口
- 管理外部集成与系统设置

它不负责：

- 承接 workspace 日常运营
- 承接 agent authoring 主流程
- 变成第二个业务配置中台

一句话收口：

`Manage` 是组织治理与系统配置区。

## 近中期功能范围

### Workspaces 的近中期功能

`Workspaces` 在近中期应覆盖跨 workspace 运营入口，而不是深入单个 workspace 内部。

应包含：

- `Workbench`
- `All Workspaces`
- `Approvals`
- `Runs`
- `Members`

应明确支持：

- 从账户层筛选和定位有问题的 workspace
- 从账户层查看审批、运行与成员问题
- 从 `Console` 跳转进入具体 workspace

本设计暂不冻结：

- `Console` 内部的 workspace 详情结构
- 是否在 `Console` 中提供完整 workspace 详情页
- `Console` 与 `apps/workspaces` 的最终页面切分细节

### Agents 的近中期功能

`Agents` 是近中期最应做实的域。

应包含：

- `Quickstart`
- `All Agents`
- `Create Agent`
- `Agent Detail`
- `Playbooks`
- `Teams`
- `Capabilities`
- `Policies`

应明确支持：

- 创建 agent
- 管理 agent 列表
- 进入 agent 详情
- 管理 agent 的核心配置资产
- 支撑后续发布、治理和复用

近中期不要求：

- 完整调试控制台
- 全量运行日志中心
- 重型实时观测台

### Dashboard 的近中期功能

`Dashboard` 只做轻量决策，不做重运营。

应包含：

- `Analytics`
- `My Work`
- `Attention`

应明确支持：

- 回答“我现在该去哪里”
- 回答“哪里有问题”
- 将用户导向 `Workspaces`、`Agents` 或 `Manage`

不应扩展为：

- 承载大量批量操作的运营页
- 取代对象域页面的超级首页

### Manage 的近中期功能

`Manage` 在近中期应作为完整治理区存在。

应包含：

- `Account`
- `Users`
- `Audit Logs`
- `Integrations`
- `Settings`

应明确支持：

- 组织治理
- 角色和权限治理
- 审计和追踪
- 外部集成管理
- 系统级设置

## 关键用户流程

### 流程 A：工作区管理者发现问题并进入处理

1. 进入 `Dashboard / Attention` 或 `Workspaces / Workbench`
2. 看到异常 workspace、阻塞 run、待处理审批或成员问题
3. 进入 `All Workspaces`、`Approvals`、`Runs` 或 `Members`
4. 判断是账户层可处理，还是需要进入具体 workspace
5. 如需现场处理，跳转到 `apps/workspaces`

这个流程说明：

- `Console` 负责发现、筛选、分发
- `apps/workspaces` 负责具体执行与协作

### 流程 B：工作区管理者从账户层管理 workspace 资源

1. 进入 `Workspaces / All Workspaces`
2. 搜索或筛选目标 workspace
3. 查看状态、owner、活跃度或异常标记
4. 进入相关成员、运行或审批视图
5. 必要时进入具体 workspace

### 流程 C：Agent 管理者创建新 agent

1. 进入 `Agents / Quickstart`
2. 点击 `Create Agent`
3. 选择模板或从空白开始
4. 完成基础定义
5. 进入 agent 详情继续配置 `Playbook / Team / Capabilities / Policies`

这个流程说明：

- `Quickstart` 是入口页，不是文档页
- `Agent` 应是第一落点，不应要求用户先理解配置资产页结构

### 流程 D：Agent 管理者管理现有 agent

1. 进入 `Agents / All Agents`
2. 搜索、筛选、查看状态与版本
3. 打开某个 agent 详情
4. 查看或修改它的 `Playbook / Team / Capabilities / Policies`
5. 决定是否发布、继续编辑或回看活动

### 流程 E：维护可复用配置资产

1. 进入 `Playbooks / Teams / Capabilities / Policies`
2. 管理可复用资产库
3. 在 agent 中复用或绑定这些资产
4. 在后续发布、治理和审计中保持一致性

### 流程 F：个人用户查看与自己相关的事项

1. 进入 `Dashboard / My Work`
2. 查看待办、最近草稿、最近访问项
3. 跳转到相关 workspace、agent 或治理页

### 流程 G：治理用户完成组织与系统管理

1. 进入 `Manage`
2. 在 `Users`、`Audit Logs`、`Integrations`、`Settings` 中处理治理任务
3. 必要时回到 `Workspaces` 或 `Agents` 验证变更影响

## 导航结构

`Console` 的左栏应采用经典后台结构：

`左栏稳定对象域 + 右栏具体页面内容`

左栏不应按页面杂项组织，也不应按报表优先组织，而应按管理对象域组织。

### 一级导航

1. `Workspaces`
2. `Agents`
3. `Dashboard`
4. `Manage`

### 二级导航

#### Workspaces

- `Workbench`
- `All Workspaces`
- `Approvals`
- `Runs`
- `Members`

#### Agents

- `Quickstart`
- `All Agents`
- `Playbooks`
- `Teams`
- `Capabilities`
- `Policies`

这里采用 `Teams` 而不是 `TeamSpecs` 作为导航文案。

实现层可以继续保留 `teamSpecId` 等内部术语，但对后台管理者而言，`Teams` 更直接。

#### Dashboard

- `Analytics`
- `My Work`
- `Attention`

#### Manage

- `Account`
- `Users`
- `Audit Logs`
- `Integrations`
- `Settings`

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

### 推荐 URL 结构

#### Workspaces

- `/workspaces/workbench`
- `/workspaces/all`
- `/workspaces/approvals`
- `/workspaces/runs`
- `/workspaces/members`

后续待定：

- `/workspaces/:workspaceId`
- `/workspaces/:workspaceId/edit`
- `/workspaces/:workspaceId/...`

#### Agents

- `/agents/quickstart`
- `/agents/all`
- `/agents/new`
- `/agents/:agentId`
- `/agents/:agentId/edit`

- `/agents/playbooks`
- `/agents/playbooks/new`
- `/agents/playbooks/:playbookId`
- `/agents/playbooks/:playbookId/edit`

- `/agents/teams`
- `/agents/teams/new`
- `/agents/teams/:teamId`
- `/agents/teams/:teamId/edit`

- `/agents/capabilities`
- `/agents/capabilities/new`
- `/agents/capabilities/:capabilityId`
- `/agents/capabilities/:capabilityId/edit`

- `/agents/policies`
- `/agents/policies/new`
- `/agents/policies/:policyId`
- `/agents/policies/:policyId/edit`

#### Dashboard

- `/dashboard/analytics`
- `/dashboard/my-work`
- `/dashboard/attention`

#### Manage

- `/manage/account`
- `/manage/users`
- `/manage/users/:userId`
- `/manage/audit-logs`
- `/manage/integrations`
- `/manage/settings`

## 页面类型规则

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

### Create Agent 的落位

`Create Agent` 应出现在：

- `Agents / Quickstart` 的主 CTA
- `Agents / All Agents` 列表页右上角主按钮

推荐 URL：

- `/agents/new`

### Agent 管理列表的落位

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

推荐路由包括：

- `/agents/:agentId`
- `/agents/:agentId/playbook`
- `/agents/:agentId/team`
- `/agents/:agentId/capabilities`
- `/agents/:agentId/policies`
- `/agents/:agentId/versions`
- `/agents/:agentId/activity`

本设计不要求这些 tabs 在第一阶段全部实现，但要求后续扩展优先走详情页 tabs，而不是新开左栏入口。

## 权限与导航边界

本设计不定义完整权限矩阵，但要求后续权限实现遵循导航边界：

- 一级菜单应可按对象域整体隐藏或降级
- 二级菜单应可按对象能力显示或隐藏
- 无权限时，菜单隐藏优先于进入后报错

例如：

- 没有 `Agents` 权限时，整个 `Agents` 菜单可隐藏
- 没有 `Policies` 权限时，隐藏 `Agents / Policies`

## 近中期 MVP 定义

`Console` 的近中期 MVP 不要求四个域同等完整。

它要求的是：

- 四个域都在产品结构上成立
- 至少两个域形成真正可用闭环
- 其余域提供稳定入口和明确边界

建议的 MVP 成功标准是：

`Console` 已能被工作区管理者和 agent 管理者当作正式入口使用，而不再只是首页加若干占位页。`

## 第一阶段必须做实的部分

### 1. Agents 必须做实

第一阶段必须至少形成以下闭环：

- `Quickstart`
- `All Agents`
- `Create Agent`
- `Agent Detail`
- `Playbooks`
- `Teams`
- `Capabilities`
- `Policies`

这里不要求每个模块都很深，但必须保证：

- agent 可以创建
- agent 可以列表管理
- agent 的核心配置资产有正式入口
- 用户能理解 agent 与这些资产的关系

### 2. Workspaces 必须成立为账户级入口

第一阶段至少应成立：

- `Workbench`
- `All Workspaces`
- 至少一个跨 workspace 队列页，如 `Approvals` 或 `Runs`

目标不是做深，而是让工作区管理者真的能从 `Console` 找到东西并进入正确上下文。

## 第一阶段可以中等深度完成的部分

### Dashboard

第一阶段只要做到以下三点就已足够：

- `Analytics` 有基础汇总
- `My Work` 有个人相关入口
- `Attention` 有异常和阻塞列表

## 第一阶段需要正式存在但不必过深的部分

### Manage

第一阶段建议正式存在：

- `Account`
- `Users`
- `Integrations`
- `Settings`

`Audit Logs` 可以先以较浅版本上线，但必须作为正式治理入口存在。

## 明确延后的内容

为了保护近中期范围，以下内容明确延后：

- `Workspaces` 内部完整详情层级
- 复杂批量运营操作
- 完整 agent 调试控制台
- 复杂运行日志中心
- 高级报表分析体系
- 完整审计检索与合规工具
- 过深的三级菜单或多层导航体系

## 非目标

本设计不在本轮解决以下问题：

- `Console` 的具体视觉样式、图标与动效
- 页面内数据表、筛选器、图表组件设计
- 完整权限模型
- 独立系统超级管理员控制台
- `Workspaces` 详情层级的最终结构

## 设计结论

`Console` 的近中期产品形态应被正式定义为：

`面向工作区管理者和 agent 管理者的账户级控制台`

它由四个正式产品域组成：

1. `Workspaces`
2. `Agents`
3. `Dashboard`
4. `Manage`

其中：

- `Workspaces` 管跨 workspace 运营与入口
- `Agents` 管 agent 对象与配置资产
- `Dashboard` 管轻量汇总与注意力判断
- `Manage` 管组织治理与系统设置

同时采用以下正式规则：

- 一级菜单等于一级 URL 前缀
- 左栏只挂稳定入口
- 创建 / 编辑 / 详情页不进入左栏
- `Agent` 是 `Agents` 域的一等对象
- `Dashboard` 不承接主业务重操作
- `Console` 与 `apps/workspaces` 保持明确边界

## 后续规划建议

建议下一步按两个方向推进：

1. 为 `Console` 写实现计划，将当前 React Router、菜单配置、权限显示逻辑和页面边界对齐到本设计
2. 另起一份 `Workspaces` 详情层级设计，专门解决 `Workspaces` 内部 IA 与 `apps/workspaces` 跳转边界
