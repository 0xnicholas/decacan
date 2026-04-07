import type { IndustryConfig } from '../types';

/**
 * Short Video (短视频) industry configuration
 * Optimized for short video content creation teams
 * Focuses on: 选题 (topic selection), 脚本 (script), 发布数据 (publishing data)
 */
export const shortVideoConfig: IndustryConfig = {
  id: 'short-video',
  name: '短视频行业',
  description: '短视频内容创作工作空间，支持选题、脚本、发布管理',
  
  terminology: {
    task: '创作任务',
    tasks: '创作任务',
    deliverable: '成片',
    deliverables: '成片',
    approval: '审核',
    approvals: '审核',
    workspace: '账号组',
    member: '创作者',
    members: '创作者',
    activity: '动态',
    assistant: 'AI助手',
    playbook: '内容模板',
    workflow: '创作流程',
  },
  
  theme: {
    primary: '#ec4899',      // Pink - energetic and creative
    secondary: '#8b5cf6',    // Purple - modern and trendy
    accent: '#f97316',       // Orange - attention-grabbing
    background: '#ffffff',
    surface: '#fafafa',
    text: {
      primary: '#18181b',
      secondary: '#52525b',
      muted: '#a1a1aa',
    },
  },
  
  workbench: {
    slots: {
      primary: 'ContentTaskList',
      sidebar: 'AnalyticsPanel',
    },
    availableWidgets: [
      'ContentTaskList',       // Grouped by: 选题, 脚本, 拍摄, 剪辑
      'TopicLibrary',          // 选题库
      'ScriptEditor',          // 脚本编辑器
      'AnalyticsPanel',        // 数据分析
      'PublishingSchedule',    // 发布排期
      'TrendingTopics',        // 热点追踪
      'TeamActivity',
      'AssistantPanel',
    ],
  },
  
  routes: {
    hiddenRoutes: [],
    additionalRoutes: [
      {
        path: 'topics',
        component: 'TopicsPage',
        label: '选题',
      },
      {
        path: 'analytics',
        component: 'AnalyticsPage',
        label: '数据',
      },
      {
        path: 'schedule',
        component: 'SchedulePage',
        label: '排期',
      },
    ],
  },
  
  features: {
    tasks: { 
      enabled: true,
      config: {
        groupBy: ['topic', 'script', 'shoot', 'edit'],
        showAnalytics: true,
        defaultView: 'list',
      },
    },
    deliverables: { 
      enabled: true,
      config: {
        assetTypes: ['script', 'raw-video', 'edited-video', 'thumbnail'],
        analyticsIntegration: true,
      },
    },
    approvals: { enabled: true },
    activity: { enabled: true },
    members: { enabled: true },
    assistant: { 
      enabled: true,
      config: {
        specialized: true,
        domain: 'content-creation',
        features: ['topic-suggestions', 'script-optimization', 'trend-analysis'],
      },
    },
  },
};

export default shortVideoConfig;
