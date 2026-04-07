import type { IndustryConfig } from './types';
import { industryRegistry, isValidIndustry } from './industries/registry';

/**
 * Load industry configuration
 * Falls back to default if industry not found or loading fails
 */
export async function loadIndustryConfig(
  industryId: string
): Promise<IndustryConfig> {
  // Validate industry ID
  if (!isValidIndustry(industryId)) {
    console.warn(`Unknown industry: ${industryId}, falling back to default`);
    return loadDefaultConfig();
  }

  try {
    const entry = industryRegistry[industryId];
    const { config } = await entry.load();
    return config;
  } catch (error) {
    console.error(`Failed to load industry ${industryId}:`, error);
    return loadDefaultConfig();
  }
}

/**
 * Load default configuration directly
 */
export async function loadDefaultConfig(): Promise<IndustryConfig> {
  const { defaultConfig } = await import('./industries/default');
  return defaultConfig;
}

/**
 * Get industry ID from environment variable
 * Used at build time and runtime
 */
export function getIndustryId(): string {
  // Vite exposes env vars on import.meta.env
  const envIndustry = import.meta.env.VITE_INDUSTRY;
  return envIndustry || 'default';
}

/**
 * Preload all industry configurations (useful for SSR or admin panels)
 */
export async function preloadAllIndustries(): Promise<Record<string, IndustryConfig>> {
  const configs: Record<string, IndustryConfig> = {};
  
  await Promise.all(
    Object.entries(industryRegistry).map(async ([id, entry]) => {
      try {
        const { config } = await entry.load();
        configs[id] = config;
      } catch (error) {
        console.error(`Failed to preload industry ${id}:`, error);
      }
    })
  );
  
  return configs;
}