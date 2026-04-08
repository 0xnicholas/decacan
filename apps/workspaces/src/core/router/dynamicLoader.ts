import React, { type ComponentType } from 'react';
import { getIndustryId } from '../../config';

type LoadableComponent = ComponentType<Record<string, unknown>>;

/**
 * Load a feature component with industry override support
 * Tries industry-specific version first, falls back to base
 * 
 * @param featureName - Name of the feature (e.g., 'workspace-home')
 * @param componentName - Name of the component (e.g., 'WorkspaceHomePage')
 * @returns Promise resolving to the component
 */
export async function loadFeatureComponent(
  featureName: string,
  componentName: string
): Promise<LoadableComponent> {
  const industry = getIndustryId();
  
  // Try industry-specific version first
  try {
    const industryModule = await import(
      /* @vite-ignore */
      `../../features/${featureName}/${industry}/${componentName}`
    );
    
    if (industryModule[componentName]) {
      console.log(`[DynamicLoader] Loaded ${componentName} from ${featureName}/${industry}`);
      return industryModule[componentName];
    }
  } catch {
    // Industry-specific version not found, fall back to base
  }
  
  // Load base version
  try {
    const baseModule = await import(
      /* @vite-ignore */
      `../../features/${featureName}/base/${componentName}`
    );
    
    if (baseModule[componentName]) {
      console.log(`[DynamicLoader] Loaded ${componentName} from ${featureName}/base`);
      return baseModule[componentName];
    }
  } catch (error) {
    throw new Error(
      `Failed to load ${componentName} from ${featureName}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
  
  throw new Error(`Component ${componentName} not found in ${featureName}`);
}

/**
 * Preload a feature module (useful for critical paths)
 */
export function preloadFeature(featureName: string, componentName: string): void {
  void loadFeatureComponent(featureName, componentName);
}

/**
 * Create a lazy-loaded component with industry support
 */
export function createLazyComponent(
  featureName: string,
  componentName: string
): React.LazyExoticComponent<LoadableComponent> {
  return React.lazy(() => 
    loadFeatureComponent(featureName, componentName).then(component => ({ 
      default: component 
    }))
  );
}