import type { IndustryConfig } from '../types';

/**
 * Default industry configuration
 * This serves as the fallback and base for all other industries
 */
export const defaultConfig: IndustryConfig = {
  id: 'default',
  name: 'Default',
  description: 'Standard Decacan workspace',
  
  terminology: {
    task: 'Task',
    tasks: 'Tasks',
    deliverable: 'Deliverable',
    deliverables: 'Deliverables',
    approval: 'Approval',
    approvals: 'Approvals',
    workspace: 'Workspace',
    member: 'Member',
    members: 'Members',
    activity: 'Activity',
    assistant: 'Assistant',
    playbook: 'Playbook',
    workflow: 'Workflow',
  },
  
  theme: {
    primary: '#0066FF',
    secondary: '#6366F1',
    accent: '#8B5CF6',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: {
      primary: '#0F172A',
      secondary: '#475569',
      muted: '#94A3B8',
    },
  },
  
  workbench: {
    slots: {
      primary: 'TaskList',
      sidebar: 'ActivityFeed',
    },
    availableWidgets: [
      'TaskList',
      'ActivityFeed',
      'RecentDeliverables',
      'TeamActivity',
      'AssistantPanel',
    ],
  },
  
  routes: {
    hiddenRoutes: [],
    additionalRoutes: [],
  },
  
  features: {
    tasks: { enabled: true },
    deliverables: { enabled: true },
    approvals: { enabled: true },
    activity: { enabled: true },
    members: { enabled: true },
    assistant: { enabled: true },
  },
};

export default defaultConfig;
