import type { IndustryConfig } from '../types';

/**
 * Unified Video Production industry configuration
 * Supports both short-drama (production) and short-video (content) workflows
 *
 * Workflow mode is set via features.workflowMode.default: 'content' | 'production'
 * - 'content': topic → script → shoot → edit (短视频风格)
 * - 'production': script → storyboard → art → production (短剧风格)
 */
export const videoConfig: IndustryConfig = {
  id: 'video',
  name: '视频行业',
  description: '统一的视频内容创作和短剧制作工作空间',

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
    primary: '#ec4899',
    secondary: '#8b5cf6',
    accent: '#f97316',
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
      'ContentTaskList',
      'ProductionTaskList',
      'TopicLibrary',
      'ScriptEditor',
      'AnalyticsPanel',
      'PublishingSchedule',
      'TrendingTopics',
      'AssetLibrary',
      'StoryboardPanel',
      'ArtResourceLibrary',
      'ProgressDashboard',
      'TeamActivity',
      'AssistantPanel',
    ],
  },

  routes: {
    hiddenRoutes: [],
    additionalRoutes: [
      { path: 'topics', component: 'TopicsPage', label: '选题' },
      { path: 'analytics', component: 'AnalyticsPage', label: '数据' },
      { path: 'schedule', component: 'SchedulePage', label: '排期' },
      { path: 'script', component: 'ScriptPage', label: '脚本' },
      { path: 'storyboard', component: 'StoryboardPage', label: '分镜' },
    ],
  },

  features: {
    workflowMode: {
      enabled: true,
      config: {
        default: 'content',
        modes: {
          content: {
            groupBy: ['topic', 'script', 'shoot', 'edit'],
            taskLabel: '创作任务',
            deliverableLabel: '成片',
            workspaceLabel: '账号组',
            memberLabel: '创作者',
          },
          production: {
            groupBy: ['script', 'storyboard', 'art', 'production'],
            taskLabel: '制作任务',
            deliverableLabel: '素材',
            workspaceLabel: '项目组',
            memberLabel: '成员',
          },
        },
      },
    },
    tasks: {
      enabled: true,
      config: {
        groupBy: ['topic', 'script', 'shoot', 'edit'],
        showAnalytics: true,
        showProgress: true,
        defaultView: 'list',
      },
    },
    deliverables: {
      enabled: true,
      config: {
        assetTypes: ['script', 'raw-video', 'edited-video', 'thumbnail', 'storyboard', 'art-asset', 'video-clip', 'audio'],
        analyticsIntegration: true,
        previewEnabled: true,
      },
    },
    approvals: { enabled: true },
    activity: { enabled: true },
    members: { enabled: true },
    assistant: {
      enabled: true,
      config: {
        specialized: true,
        domains: ['content-creation', 'drama-production'],
        defaultDomain: 'content-creation',
        features: ['topic-suggestions', 'script-optimization', 'trend-analysis', 'script-analysis', 'storyboard-suggestions'],
      },
    },
  },
};

export default videoConfig;