import type { IndustryRegistryEntry } from '../types';

/**
 * Registry of all available industries
 * New industries are registered here
 * 
 * Supported industries:
 * - default: Standard Decacan workspace
 * - short-drama: Short drama production industry (P0 priority)
 * - short-video: Short video content industry (P1 priority)
 */
export const industryRegistry: Record<string, IndustryRegistryEntry> = {
  default: {
    id: 'default',
    name: 'Default',
    description: 'Standard Decacan workspace',
    load: async () => {
      const module = await import('./default');
      return { config: module.defaultConfig };
    },
  },
  'short-drama': {
    id: 'short-drama',
    name: '短剧行业',
    description: '短剧制作行业工作空间，支持剧本、美术、分镜管理',
    load: async () => {
      const module = await import('./short-drama');
      return { config: module.shortDramaConfig };
    },
  },
  'short-video': {
    id: 'short-video',
    name: '短视频行业',
    description: '短视频内容创作工作空间，支持选题、脚本、发布管理',
    load: async () => {
      const module = await import('./short-video');
      return { config: module.shortVideoConfig };
    },
  },
};

export type IndustryId = keyof typeof industryRegistry;

/**
 * Get list of all available industries
 */
export function getAvailableIndustries(): Array<{ id: string; name: string; description: string }> {
  return Object.values(industryRegistry).map(({ id, name, description }) => ({
    id,
    name,
    description,
  }));
}

/**
 * Check if an industry ID is valid
 */
export function isValidIndustry(industryId: string): industryId is IndustryId {
  return industryId in industryRegistry;
}
