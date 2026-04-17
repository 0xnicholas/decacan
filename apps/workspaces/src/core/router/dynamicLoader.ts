import React, { type ComponentType } from 'react';
import { getIndustryId } from '../../config';

type LoadableComponent = ComponentType<Record<string, unknown>>;

let currentProfileId: string | null = null;

const componentCache: Record<string, LoadableComponent> = {};

export function setCurrentProfile(profileId: string | null): void {
  currentProfileId = profileId;
}

export function getCurrentProfile(): string | null {
  return currentProfileId;
}

export async function loadFeatureComponent(
  featureName: string,
  componentName: string,
  profileOverride?: string | null
): Promise<LoadableComponent> {
  const profile = profileOverride ?? currentProfileId ?? getIndustryId();
  const cacheKey = `${profile}:${featureName}:${componentName}`;

  if (componentCache[cacheKey]) {
    return componentCache[cacheKey];
  }

  try {
    const profileModule = await import(
      /* @vite-ignore */
      `../../features/${featureName}/${profile}/${componentName}`
    );

    if (profileModule[componentName]) {
      console.log(`[DynamicLoader] Loaded ${componentName} from ${featureName}/${profile}`);
      componentCache[cacheKey] = profileModule[componentName];
      return profileModule[componentName];
    }
  } catch {
    // Profile-specific not found, fall through
  }

  try {
    const baseModule = await import(
      /* @vite-ignore */
      `../../features/${featureName}/base/${componentName}`
    );

    if (baseModule[componentName]) {
      console.log(`[DynamicLoader] Loaded ${componentName} from ${featureName}/base`);
      componentCache[cacheKey] = baseModule[componentName];
      return baseModule[componentName];
    }
  } catch (error) {
    throw new Error(
      `Failed to load ${componentName} from ${featureName}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  throw new Error(`Component ${componentName} not found in ${featureName}`);
}

export function preloadFeature(featureName: string, componentName: string): void {
  void loadFeatureComponent(featureName, componentName);
}

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