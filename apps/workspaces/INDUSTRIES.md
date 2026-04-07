# 多行业 Workspaces 系统

> 支持短剧行业和短视频行业的内容创作工作空间

## 快速开始

### 开发模式

```bash
# 默认工作空间
pnpm dev

# 短剧行业（剧本、分镜、美术管理）
pnpm dev:drama

# 短视频行业（选题、脚本、数据分析）
pnpm dev:video

# 同时启动所有行业版本
pnpm dev:all
```

### 构建生产版本

```bash
# 构建短剧行业版本
pnpm build:drama

# 构建短视频行业版本
pnpm build:video

# 输出目录：dist/（包含行业特定资源）
```

## 架构设计

### 三层架构

```
1. 配置层 (src/config/)
   ├── industries/          # 行业定义
   │   ├── default.ts       # 默认配置
   │   ├── short-drama.ts   # 短剧行业
   │   └── short-video.ts   # 短视频行业
   ├── loader.ts           # 动态加载器
   └── types.ts            # 类型定义

2. 基础实现 (src/features/*/base/)
   └── 通用实现，所有行业共享

3. 行业覆盖 (src/features/*/{industry}/)
   └── 可选的行业特定实现
```

### 工作原理

访问页面时：

1. 路由器检查 `DECACAN_INDUSTRY` 环境变量
2. 尝试加载行业特定组件（如 `workspace-home/short-drama/`）
3. 如不存在，回退到基础组件（`workspace-home/base/`）
4. 所有组件通过 React Context 获取行业配置

## 支持的业行业

### 短剧行业 (short-drama)

**特点：**
- 专业术语：制作任务、素材、项目组
- 核心功能：剧本编辑器、分镜板、美术资源库
- 视觉主题：科技蓝 + 石板灰
- 特色路由：/script（剧本）、/storyboard（分镜）、/art（美术）

**页面结构：**
```
workspace-home/
├── 制作任务列表（按剧本/分镜/美术分组）
├── 剧本编辑器
├── 分镜板
├── 美术资源库
├── 制作进度看板
└── 素材库
```

### 短视频行业 (short-video)

**特点：**
- 专业术语：创作任务、成片、账号组
- 核心功能：选题库、数据分析、发布排期
- 视觉主题：创意粉 + 现代紫
- 特色路由：/topics（选题）、/analytics（数据）、/schedule（排期）

**页面结构：**
```
workspace-home/
├── 创作任务列表（按选题/脚本/拍摄/剪辑分组）
├── 选题库
├── 脚本编辑器
├── 数据分析面板
├── 发布排期
└── 热点追踪
```

## 添加新行业

### 第一步：创建配置文件

创建 `src/config/industries/your-industry.ts`：

```typescript
import type { IndustryConfig } from '../types';

export const yourIndustryConfig: IndustryConfig = {
  id: 'your-industry',
  name: '行业名称',
  description: '行业描述',
  
  terminology: {
    task: '任务名称',
    tasks: '任务名称复数',
    deliverable: '交付物名称',
    workspace: '工作空间名称',
    // ... 其他术语
  },
  
  theme: {
    primary: '#主色调',
    secondary: '#次色调',
    accent: '#强调色',
    background: '#背景色',
    surface: '#表面色',
    text: {
      primary: '#主要文字',
      secondary: '#次要文字',
      muted: '#淡化文字',
    },
  },
  
  workbench: {
    slots: {
      primary: '主组件名',
      sidebar: '侧边栏组件名',
    },
    availableWidgets: ['组件1', '组件2'],
  },
  
  features: {
    tasks: { enabled: true },
    // ... 其他功能
  },
};
```

### 第二步：注册行业

编辑 `src/config/industries/registry.ts`：

```typescript
export const industryRegistry = {
  // ... 现有行业
  
  'your-industry': {
    id: 'your-industry',
    name: '行业名称',
    description: '描述',
    load: async () => {
      const module = await import('./your-industry');
      return { config: module.yourIndustryConfig };
    },
  },
};
```

### 第三步：创建页面覆盖（可选）

如需自定义页面结构：

```bash
mkdir -p src/features/workspace-home/your-industry
cp src/features/workspace-home/base/WorkspaceHomePage.tsx \
   src/features/workspace-home/your-industry/
```

修改组件，系统会自动使用你的版本。

### 第四步：添加开发脚本

编辑 `package.json`：

```json
{
  "scripts": {
    "dev:your-industry": "cross-env DECACAN_INDUSTRY=your-industry vite --port 5176"
  }
}
```

## 自定义指南

### 修改专业术语

```typescript
terminology: {
  task: '制作任务',      // "Task" → "制作任务"
  deliverable: '素材',   // "Deliverable" → "素材"
  workspace: '项目组',   // "Workspace" → "项目组"
}
```

### 修改主题色彩

```typescript
theme: {
  primary: '#2563eb',    // 主品牌色
  secondary: '#64748b',  // 次要色
  accent: '#f59e0b',     // 强调色（CTA按钮等）
}
```

### 启用/禁用功能

```typescript
features: {
  tasks: { enabled: true },
  deliverables: { enabled: false }, // 禁用交付物功能
  assistant: { 
    enabled: true,
    config: { specialized: true }
  },
}
```

### 隐藏特定路由

```typescript
routes: {
  hiddenRoutes: ['deliverables', 'approvals'], // 隐藏交付物和审批路由
}
```

## 最佳实践

1. **从配置开始**：优先使用配置修改术语和颜色，再考虑创建代码覆盖
2. **复制基础版本**：创建覆盖时，先复制 `base/` 目录内容再修改
3. **保持接口一致**：确保覆盖组件的 props 与基础版本一致
4. **测试回退**：删除覆盖文件，确保基础版本仍可正常工作
5. **注释差异**：在覆盖文件中注释说明为什么需要行业特定修改

## 故障排除

### 修改未生效

- 检查浏览器控制台错误
- 确认 `DECACAN_INDUSTRY` 环境变量已设置
- 清除浏览器缓存
- 检查导入路径是否正确

### 构建错误

- 确保 TypeScript 类型正确
- 验证所有导入存在
- 检查 `base/` 目录是否包含所有必需文件

### 回退不工作

- 确保 `base/` 目录存在且包含组件
- 检查组件名称是否完全匹配
- 验证文件扩展名（.tsx）

## 示例参考

查看现有实现：

- `src/config/industries/short-drama.ts` - 短剧行业配置
- `src/features/workspace-home/short-drama/` - 短剧首页覆盖
- `src/config/industries/short-video.ts` - 短视频行业配置

## API 参考

### Hooks

```typescript
// 获取完整配置
const config = useIndustryConfig();

// 仅获取术语
const terms = useTerminology();

// 获取行业上下文
const { config, isLoading, error } = useIndustry();
```

### 动态加载

```typescript
// 加载行业特定组件
const Component = await loadFeatureComponent('workspace-home', 'WorkspaceHomePage');

// 创建懒加载组件
const LazyComponent = createLazyComponent('feature-name', 'ComponentName');
```

---

**最后更新：** 2026-04-07

**维护者：** Decacan Team