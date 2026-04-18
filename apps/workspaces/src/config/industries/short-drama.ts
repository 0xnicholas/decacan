import type { IndustryConfig } from '../types';

/**
 * Short Drama (短剧) industry configuration
 * Optimized for short drama production teams
 * Focuses on: 剧本 (script), 分镜 (storyboard), 美术 (art), 制作进度 (production progress)
 */
export const shortDramaConfig: IndustryConfig = {
  id: 'short-drama',
  name: '短剧行业',
  description: '短剧制作行业工作空间，支持剧本、美术、分镜管理',
  
  terminology: {
    task: '制作任务',
    tasks: '制作任务',
    deliverable: '素材',
    deliverables: '素材',
    approval: '审核',
    approvals: '审核',
    workspace: '项目组',
    member: '成员',
    members: '成员',
    activity: '动态',
    assistant: 'AI助手',
    playbook: '剧本模板',
    workflow: '制作流程',
  },
  
  theme: {
    primary: '#2563eb',      // Tech Blue - professional and clean
    secondary: '#64748b',    // Slate Gray - neutral and modern
    accent: '#f59e0b',       // Amber Orange - highlights and CTAs
    background: '#ffffff',
    surface: '#f8fafc',
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      muted: '#94a3b8',
    },
  },
  
  workbench: {
    slots: {
      primary: 'ProductionTaskList',
      sidebar: 'AssetLibrary',
      header: 'ProjectHeader',
    },
    availableWidgets: [
      'ProductionTaskList',    // Grouped by: 剧本, 分镜, 美术
      'AssetLibrary',          // 素材库
      'ScriptEditor',          // 剧本编辑器
      'StoryboardPanel',       // 分镜板
      'ArtResourceLibrary',    // 美术资源库
      'ProgressDashboard',     // 进度看板
      'TeamActivity',
      'AssistantPanel',
    ],
  },
  
  routes: {
    hiddenRoutes: [],
    additionalRoutes: [
      {
        path: 'script',
        component: 'ScriptPage',
        label: '剧本',
      },
      {
        path: 'storyboard',
        component: 'StoryboardPage',
        label: '分镜',
      },
      {
        path: 'art',
        component: 'ArtResourcesPage',
        label: '美术',
      },
    ],
  },
  
  features: {
    workflowMode: {
      enabled: true,
      config: {
        default: 'production',
      },
    },
    tasks: {
      enabled: true,
      config: {
        groupBy: ['script', 'storyboard', 'art', 'production'],
        showProgress: true,
        showDeadline: true,
        defaultView: 'board',
      },
    },
    deliverables: {
      enabled: true,
      config: {
        assetTypes: ['script', 'storyboard', 'art-asset', 'video-clip', 'audio'],
        previewEnabled: true,
      },
    },
    approvals: {
      enabled: true,
      config: {
        stages: ['script-review', 'art-review', 'final-review'],
      },
    },
    activity: { enabled: true },
    members: { enabled: true },
    assistant: {
      enabled: true,
      config: {
        specialized: true,
        domain: 'drama-production',
        features: ['script-analysis', 'storyboard-suggestions'],
      },
    },
  },
};

export default shortDramaConfig;
