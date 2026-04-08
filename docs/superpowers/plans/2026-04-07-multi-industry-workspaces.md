# Multi-Industry Workspaces Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a configurable multi-industry architecture for the Workspaces app that supports "medium differences" between industries through a hybrid approach of configuration-driven customization with selective feature overrides.

**Architecture:** Implement a three-layer system: (1) Configuration layer with industry registry, (2) Base feature implementations with optional industry-specific overrides, (3) Dynamic module loader that falls back to base implementations when industry-specific versions don't exist. Uses environment variable `DECACAN_INDUSTRY` to select industry at build/dev time.

**Tech Stack:** React 19.2.2, TypeScript 5.9.2, Vite 7.1.3, React Router 7.10.1, Tailwind CSS 4.1.17

---

## Overview

This plan implements a multi-industry workspace system supporting:
- Configuration-driven customization for terminology, colors, and layout
- Optional feature-level overrides for industry-specific page structures
- Unlimited industry expansion through simple configuration addition
- Concurrent development of multiple industry versions

### File Structure

```
apps/workspaces/src/
├── config/
│   ├── industries/
│   │   ├── registry.ts           # Industry registration and type definitions
│   │   ├── default.ts            # Default/base industry configuration
│   │   ├── legal.ts              # Legal industry configuration (example)
│   │   └── medical.ts            # Medical industry configuration (example)
│   ├── loader.ts                 # Dynamic configuration loader
│   └── types.ts                  # Configuration type definitions
├── features/
│   └── workspace-home/           # Example feature with override
│       ├── base/                 # Generic/base implementation
│       │   ├── WorkspaceHomePage.tsx
│       │   └── components/
│       ├── legal/                # Legal override (optional)
│       │   └── WorkspaceHomePage.tsx
│       └── hooks/                # Shared hooks
├── core/
│   └── router/
│       └── DynamicRouter.tsx     # Router with dynamic page loading
└── app/
    ├── router.tsx                # Modified to use dynamic router
    └── providers/
        └── IndustryProvider.tsx  # React context for industry config
```

---

## Task 1: Configuration Type Definitions

**Files:**
- Create: `apps/workspaces/src/config/types.ts`
- Create: `apps/workspaces/src/config/industries/registry.ts`

**Purpose:** Establish the type system and industry registry that will drive all customization.

- [ ] **Step 1: Write configuration types**

Create `apps/workspaces/src/config/types.ts`:

```typescript
/**
 * Terminology customization - map generic terms to industry-specific terms
 */
export interface IndustryTerminology {
  task: string;
  tasks: string;
  deliverable: string;
  deliverables: string;
  approval: string;
  approvals: string;
  workspace: string;
  member: string;
  members: string;
  activity: string;
  assistant: string;
  playbook: string;
  workflow: string;
}

/**
 * Theme configuration for an industry
 */
export interface IndustryTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
}

/**
 * Workbench slot configuration
 * Defines which components appear in which slots
 */
export interface WorkbenchSlotConfig {
  primary: string;      // Main content area
  sidebar?: string;     // Optional sidebar
  header?: string;      // Optional custom header
  footer?: string;      // Optional custom footer
}

/**
 * Route configuration - can add industry-specific routes or hide default ones
 */
export interface IndustryRouteConfig {
  hiddenRoutes?: string[];    // Routes to hide (e.g., ['deliverables'])
  additionalRoutes?: Array<{
    path: string;
    component: string;
    label: string;
  }>;
}

/**
 * Complete industry configuration
 */
export interface IndustryConfig {
  id: string;
  name: string;
  description: string;
  terminology: IndustryTerminology;
  theme: IndustryTheme;
  workbench: {
    slots: WorkbenchSlotConfig;
    availableWidgets: string[];
  };
  routes?: IndustryRouteConfig;
  features?: {
    [featureName: string]: {
      enabled: boolean;
      config?: Record<string, unknown>;
    };
  };
}

/**
 * Industry registry entry - lazy loading support
 */
export interface IndustryRegistryEntry {
  id: string;
  name: string;
  description: string;
  load: () => Promise<{ config: IndustryConfig }>;
}
```

- [ ] **Step 2: Write industry registry**

Create `apps/workspaces/src/config/industries/registry.ts`:

```typescript
import type { IndustryRegistryEntry } from '../types';

/**
 * Registry of all available industries
 * New industries are registered here
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
  legal: {
    id: 'legal',
    name: 'Legal Services',
    description: 'Workspace optimized for legal teams and case management',
    load: async () => {
      const module = await import('./legal');
      return { config: module.legalConfig };
    },
  },
  medical: {
    id: 'medical',
    name: 'Healthcare',
    description: 'Workspace optimized for healthcare and clinical teams',
    load: async () => {
      const module = await import('./medical');
      return { config: module.medicalConfig };
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
```

- [ ] **Step 3: Verify types compile**

Run: `cd apps/workspaces && npx tsc --noEmit src/config/types.ts src/config/industries/registry.ts`

Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add apps/workspaces/src/config/
git commit -m "feat(workspaces): add industry configuration types and registry

- Define IndustryConfig, IndustryTerminology, IndustryTheme types
- Create industry registry with default, legal, and medical entries
- Support lazy loading of industry configurations"
```

---

## Task 2: Default Industry Configuration

**Files:**
- Create: `apps/workspaces/src/config/industries/default.ts`

**Purpose:** Create the base configuration that serves as fallback and template for new industries.

- [ ] **Step 1: Write default industry configuration**

Create `apps/workspaces/src/config/industries/default.ts`:

```typescript
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
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `cd apps/workspaces && npx tsc --noEmit src/config/industries/default.ts`

Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/workspaces/src/config/industries/default.ts
git commit -m "feat(workspaces): add default industry configuration

- Base terminology and theme settings
- Default workbench slot configuration
- All features enabled by default"
```

---

## Task 3: Legal Industry Configuration Example

**Files:**
- Create: `apps/workspaces/src/config/industries/legal.ts`

**Purpose:** Create the first industry-specific configuration (Legal) to demonstrate the customization capabilities.

- [ ] **Step 1: Write legal industry configuration**

Create `apps/workspaces/src/config/industries/legal.ts`:

```typescript
import type { IndustryConfig } from '../types';

/**
 * Legal industry configuration
 * Customized terminology and theme for legal teams
 */
export const legalConfig: IndustryConfig = {
  id: 'legal',
  name: 'Legal Services',
  description: 'Workspace optimized for legal teams and case management',
  
  terminology: {
    task: 'Case',
    tasks: 'Cases',
    deliverable: 'Brief',
    deliverables: 'Briefs',
    approval: 'Review',
    approvals: 'Reviews',
    workspace: 'Matter',
    member: 'Attorney',
    members: 'Attorneys',
    activity: 'Timeline',
    assistant: 'Legal Assistant',
    playbook: 'Procedure',
    workflow: 'Process',
  },
  
  theme: {
    primary: '#1e3a5f',      // Deep legal blue
    secondary: '#4a6fa5',    // Lighter blue
    accent: '#8b4513',       // Leather brown
    background: '#FFFFFF',
    surface: '#F5F5F0',      // Warm off-white
    text: {
      primary: '#1a1a1a',
      secondary: '#4a4a4a',
      muted: '#737373',
    },
  },
  
  workbench: {
    slots: {
      primary: 'CaseList',
      sidebar: 'DeadlinePanel',
      header: 'MatterHeader',
    },
    availableWidgets: [
      'CaseList',
      'DeadlinePanel',
      'MatterHeader',
      'RecentBriefs',
      'TeamActivity',
      'LegalAssistant',
    ],
  },
  
  routes: {
    hiddenRoutes: [],
    additionalRoutes: [
      {
        path: 'deadlines',
        component: 'DeadlinesPage',
        label: 'Deadlines',
      },
    ],
  },
  
  features: {
    tasks: { 
      enabled: true,
      config: {
        showPriority: true,
        showDeadline: true,
        defaultView: 'list',
      },
    },
    deliverables: { 
      enabled: true,
      config: {
        documentTypes: ['brief', 'contract', 'memo', 'filing'],
      },
    },
    approvals: { enabled: true },
    activity: { enabled: true },
    members: { enabled: true },
    assistant: { 
      enabled: true,
      config: {
        specialized: true,
        domain: 'legal',
      },
    },
  },
};

export default legalConfig;
```

- [ ] **Step 2: Verify configuration**

Run: `cd apps/workspaces && npx tsc --noEmit src/config/industries/legal.ts`

Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/workspaces/src/config/industries/legal.ts
git commit -m "feat(workspaces): add legal industry configuration

- Legal-specific terminology (Case, Brief, Matter, Attorney)
- Professional blue and leather brown theme
- Custom workbench slots with deadline tracking
- Specialized feature configurations"
```

---

## Task 4: Configuration Loader with Fallback

**Files:**
- Create: `apps/workspaces/src/config/loader.ts`
- Create: `apps/workspaces/src/config/index.ts`

**Purpose:** Implement the dynamic loader that fetches industry configs with fallback to default.

- [ ] **Step 1: Write configuration loader**

Create `apps/workspaces/src/config/loader.ts`:

```typescript
import type { IndustryConfig, IndustryId } from './types';
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
```

- [ ] **Step 2: Create config barrel export**

Create `apps/workspaces/src/config/index.ts`:

```typescript
// Export all configuration types
export type {
  IndustryConfig,
  IndustryTerminology,
  IndustryTheme,
  IndustryRouteConfig,
  WorkbenchSlotConfig,
} from './types';

// Export industry registry utilities
export {
  industryRegistry,
  getAvailableIndustries,
  isValidIndustry,
  type IndustryId,
} from './industries/registry';

// Export loader utilities
export {
  loadIndustryConfig,
  loadDefaultConfig,
  getIndustryId,
  preloadAllIndustries,
} from './loader';
```

- [ ] **Step 3: Test loader functionality**

Create a simple test file `apps/workspaces/src/config/loader.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { loadIndustryConfig, loadDefaultConfig, getIndustryId } from './loader';

describe('Config Loader', () => {
  it('should load default config', async () => {
    const config = await loadDefaultConfig();
    expect(config.id).toBe('default');
    expect(config.terminology.task).toBe('Task');
  });

  it('should load legal config', async () => {
    const config = await loadIndustryConfig('legal');
    expect(config.id).toBe('legal');
    expect(config.terminology.task).toBe('Case');
  });

  it('should fallback to default for unknown industry', async () => {
    const config = await loadIndustryConfig('nonexistent');
    expect(config.id).toBe('default');
  });

  it('should return default industry ID when env not set', () => {
    const id = getIndustryId();
    expect(id).toBe('default');
  });
});
```

Run: `cd apps/workspaces && pnpm test src/config/loader.test.ts`

Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add apps/workspaces/src/config/loader.ts apps/workspaces/src/config/index.ts apps/workspaces/src/config/loader.test.ts
git commit -m "feat(workspaces): add configuration loader with fallback

- Dynamic industry config loading with fallback to default
- Environment variable support (VITE_INDUSTRY)
- Barrel export for clean imports
- Unit tests for loader functions"
```

---

## Task 5: React Context Provider for Industry Config

**Files:**
- Create: `apps/workspaces/src/app/providers/IndustryProvider.tsx`
- Modify: `apps/workspaces/src/app/providers/index.ts` (or create if doesn't exist)

**Purpose:** Provide industry configuration via React Context for easy access in components.

- [ ] **Step 1: Write IndustryProvider component**

Create `apps/workspaces/src/app/providers/IndustryProvider.tsx`:

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { IndustryConfig } from '../../config';
import { loadIndustryConfig, getIndustryId } from '../../config';

interface IndustryContextValue {
  config: IndustryConfig;
  isLoading: boolean;
  error: Error | null;
  reloadConfig: () => Promise<void>;
}

const IndustryContext = createContext<IndustryContextValue | undefined>(undefined);

interface IndustryProviderProps {
  children: React.ReactNode;
  industryId?: string; // Optional override
}

export function IndustryProvider({ children, industryId }: IndustryProviderProps) {
  const [config, setConfig] = useState<IndustryConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadConfig = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const targetIndustry = industryId || getIndustryId();
      const loadedConfig = await loadIndustryConfig(targetIndustry);
      setConfig(loadedConfig);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load config'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadConfig();
  }, [industryId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md p-6">
          <h1 className="text-xl font-semibold mb-2">Failed to Load Workspace</h1>
          <p className="text-muted-foreground mb-4">
            {error?.message || 'Unknown error occurred'}
          </p>
          <button
            onClick={loadConfig}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <IndustryContext.Provider
      value={{
        config,
        isLoading,
        error,
        reloadConfig: loadConfig,
      }}
    >
      {children}
    </IndustryContext.Provider>
  );
}

/**
 * Hook to access industry configuration
 * Must be used within IndustryProvider
 */
export function useIndustry(): IndustryContextValue {
  const context = useContext(IndustryContext);
  
  if (context === undefined) {
    throw new Error('useIndustry must be used within an IndustryProvider');
  }
  
  return context;
}

/**
 * Hook to access just the config (convenience)
 */
export function useIndustryConfig(): IndustryConfig {
  const { config } = useIndustry();
  return config;
}

/**
 * Hook to access terminology (convenience)
 */
export function useTerminology(): IndustryConfig['terminology'] {
  const { config } = useIndustry();
  return config.terminology;
}
```

- [ ] **Step 2: Create/update providers index**

Create or update `apps/workspaces/src/app/providers/index.ts`:

```typescript
export {
  IndustryProvider,
  useIndustry,
  useIndustryConfig,
  useTerminology,
} from './IndustryProvider';
```

- [ ] **Step 3: Update main.tsx to wrap with IndustryProvider**

Read and then modify `apps/workspaces/src/main.tsx`:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import { IndustryProvider } from './app/providers';
import './css/styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <IndustryProvider>
      <App />
    </IndustryProvider>
  </React.StrictMode>
);
```

- [ ] **Step 4: Verify TypeScript compilation**

Run: `cd apps/workspaces && npx tsc --noEmit src/app/providers/IndustryProvider.tsx`

Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add apps/workspaces/src/app/providers/
git commit -m "feat(workspaces): add IndustryProvider React context

- React Context for industry configuration
- useIndustry, useIndustryConfig, useTerminology hooks
- Loading and error states
- Must be wrapped around entire app"
```

---

## Task 6: Dynamic Feature Module Loader

**Files:**
- Create: `apps/workspaces/src/core/router/dynamicLoader.ts`
- Create: `apps/workspaces/src/features/workspace-home/index.ts`

**Purpose:** Implement the dynamic module loading system that tries industry-specific version first, falls back to base.

- [ ] **Step 1: Write dynamic feature loader**

Create `apps/workspaces/src/core/router/dynamicLoader.ts`:

```typescript
import type { ComponentType } from 'react';
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
```

- [ ] **Step 2: Create workspace-home feature index**

First, move existing `WorkspaceHomePage.tsx` to `apps/workspaces/src/features/workspace-home/base/WorkspaceHomePage.tsx`

Then create `apps/workspaces/src/features/workspace-home/index.ts`:

```typescript
import { createLazyComponent, loadFeatureComponent } from '../../core/router/dynamicLoader';

// Re-export for static imports (if needed)
export { WorkspaceHomePage } from './base/WorkspaceHomePage';

// Dynamic loader for industry-specific versions
export const loadWorkspaceHomePage = () => 
  loadFeatureComponent('workspace-home', 'WorkspaceHomePage');

// Lazy-loaded version for React Router
export const LazyWorkspaceHomePage = createLazyComponent('workspace-home', 'WorkspaceHomePage');
```

- [ ] **Step 3: Move existing files to base/ directory**

Move all existing workspace-home files:
```bash
cd apps/workspaces/src/features/workspace-home
mkdir -p base
mv *.tsx base/
mv components base/ 2>/dev/null || true
mv hooks base/ 2>/dev/null || true
```

Update imports in moved files to reflect new relative paths.

- [ ] **Step 4: Update imports in moved files**

Update relative imports in `base/WorkspaceHomePage.tsx` and other files:
- Change `../../shared/` to `../../../shared/`
- Change `../../entities/` to `../../../entities/`
- Change `../hooks/` to `./hooks/`

- [ ] **Step 5: Commit**

```bash
git add apps/workspaces/src/core/router/dynamicLoader.ts
git add apps/workspaces/src/features/workspace-home/
git commit -m "feat(workspaces): add dynamic feature module loader

- loadFeatureComponent with industry override support
- Falls back to base/ when industry-specific not found
- createLazyComponent for React.lazy integration
- Moved workspace-home to base/ directory"
```

---

## Task 7: Update Router to Support Dynamic Loading

**Files:**
- Create: `apps/workspaces/src/core/router/IndustryAwareRouter.tsx`
- Modify: `apps/workspaces/src/app/router.tsx`

**Purpose:** Integrate dynamic loading into the router so pages can load industry-specific versions.

- [ ] **Step 1: Create IndustryAwareRouter component**

Create `apps/workspaces/src/core/router/IndustryAwareRouter.tsx`:

```typescript
import React, { Suspense } from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import { createLazyComponent } from './dynamicLoader';
import { WorkspaceShell } from '../../shared/layout/WorkspaceShell';
import { useIndustryConfig } from '../../app/providers';

// Lazy-loaded components with industry support
const LazyWorkspaceHomePage = createLazyComponent('workspace-home', 'WorkspaceHomePage');
const LazyTasksPage = createLazyComponent('tasks', 'TasksPage');
const LazyTaskPage = createLazyComponent('task-detail', 'TaskPage');
const LazyDeliverablesPage = createLazyComponent('deliverables', 'DeliverablesPage');
const LazyDeliverableDetailPage = createLazyComponent('deliverables', 'DeliverableDetailPage');
const LazyApprovalsPage = createLazyComponent('approvals', 'ApprovalsPage');
const LazyActivityPage = createLazyComponent('activity', 'ActivityPage');
const LazyMembersPage = createLazyComponent('members', 'MembersPage');
const LazyLaunchPage = createLazyComponent('launch', 'LaunchPage');

// Wrapper components with loading states
function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    }>
      {children}
    </Suspense>
  );
}

function WorkspaceHomeWrapper() {
  const { workspaceId } = useParams();
  const config = useIndustryConfig();
  
  return workspaceId ? (
    <SuspenseWrapper>
      <LazyWorkspaceHomePage workspaceId={workspaceId} config={config} />
    </SuspenseWrapper>
  ) : null;
}

function TasksPageWrapper() {
  const { workspaceId } = useParams();
  return workspaceId ? (
    <SuspenseWrapper>
      <LazyTasksPage workspaceId={workspaceId} />
    </SuspenseWrapper>
  ) : null;
}

function TaskPageWorkspaceWrapper() {
  const { workspaceId, taskId } = useParams();
  return workspaceId && taskId ? (
    <SuspenseWrapper>
      <LazyTaskPage taskId={taskId} workspaceId={workspaceId} />
    </SuspenseWrapper>
  ) : null;
}

function DeliverablesPageWrapper() {
  const { workspaceId } = useParams();
  return workspaceId ? (
    <SuspenseWrapper>
      <LazyDeliverablesPage workspaceId={workspaceId} />
    </SuspenseWrapper>
  ) : null;
}

function DeliverableDetailWrapper() {
  const { workspaceId, deliverableId } = useParams();
  return workspaceId && deliverableId ? (
    <SuspenseWrapper>
      <LazyDeliverableDetailPage workspaceId={workspaceId} deliverableId={deliverableId} />
    </SuspenseWrapper>
  ) : null;
}

function ApprovalsPageWrapper() {
  const { workspaceId } = useParams();
  return workspaceId ? (
    <SuspenseWrapper>
      <LazyApprovalsPage workspaceId={workspaceId} />
    </SuspenseWrapper>
  ) : null;
}

function ActivityPageWrapper() {
  const { workspaceId } = useParams();
  return workspaceId ? (
    <SuspenseWrapper>
      <LazyActivityPage workspaceId={workspaceId} />
    </SuspenseWrapper>
  ) : null;
}

function MembersPageWrapper() {
  const { workspaceId } = useParams();
  return workspaceId ? (
    <SuspenseWrapper>
      <LazyMembersPage workspaceId={workspaceId} />
    </SuspenseWrapper>
  ) : null;
}

function WorkspaceLaunchWrapper() {
  const { workspaceId } = useParams();
  return workspaceId ? (
    <SuspenseWrapper>
      <LazyLaunchPage workspaceId={workspaceId} />
    </SuspenseWrapper>
  ) : null;
}

function TaskPageWrapper() {
  const { taskId } = useParams();
  return taskId ? (
    <SuspenseWrapper>
      <LazyTaskPage taskId={taskId} />
    </SuspenseWrapper>
  ) : null;
}

function WorkspaceSegmentOverflowPlaceholder() {
  return (
    <section className="flex flex-col gap-3">
      <p className="text-sm uppercase tracking-widest text-foreground/50">Workspace</p>
      <h1 className="text-2xl font-semibold">Route not available</h1>
      <p className="text-foreground/70 max-w-lg">Content for this route will be implemented in later tasks.</p>
    </section>
  );
}

function WorkspaceEntryRedirect() {
  // Redirect to default workspace or show workspace selector
  return <div>Redirecting...</div>;
}

export function IndustryAwareRouter() {
  const config = useIndustryConfig();
  
  // Get visible routes based on industry config
  const isRouteVisible = (route: string): boolean => {
    if (!config.routes?.hiddenRoutes) return true;
    return !config.routes.hiddenRoutes.includes(route);
  };

  return (
    <Routes>
      <Route path="/tasks/:taskId" element={<TaskPageWrapper />} />
      <Route path="/workspaces/:workspaceId/new-task" element={<WorkspaceLaunchWrapper />} />

      {/* Workspace pages with shell */}
      <Route path="/workspaces/:workspaceId" element={<WorkspaceShell />}>
        <Route index element={<WorkspaceHomeWrapper />} />
        {isRouteVisible('tasks') && <Route path="tasks" element={<TasksPageWrapper />} />}
        {isRouteVisible('tasks') && <Route path="tasks/:taskId" element={<TaskPageWorkspaceWrapper />} />}
        {isRouteVisible('deliverables') && <Route path="deliverables" element={<DeliverablesPageWrapper />} />}
        {isRouteVisible('deliverables') && <Route path="deliverables/:deliverableId" element={<DeliverableDetailWrapper />} />}
        {isRouteVisible('approvals') && <Route path="approvals" element={<ApprovalsPageWrapper />} />}
        {isRouteVisible('activity') && <Route path="activity" element={<ActivityPageWrapper />} />}
        {isRouteVisible('members') && <Route path="members" element={<MembersPageWrapper />} />}
        <Route path="*" element={<WorkspaceSegmentOverflowPlaceholder />} />
      </Route>

      <Route path="/" element={<WorkspaceEntryRedirect />} />
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
  );
}
```

- [ ] **Step 2: Update main router to use IndustryAwareRouter**

Modify `apps/workspaces/src/app/router.tsx`:

```typescript
import { IndustryAwareRouter } from '../core/router/IndustryAwareRouter';

// Export the industry-aware router as the main router
export function AppRouter() {
  return <IndustryAwareRouter />;
}

// Also export for backward compatibility
export { IndustryAwareRouter };
```

Or if you want to keep both options:

```typescript
import { IndustryAwareRouter } from '../core/router/IndustryAwareRouter';

// Original router (for backward compatibility)
export { AppRouter as LegacyRouter } from './router-legacy';

// New industry-aware router
export function AppRouter() {
  return <IndustryAwareRouter />;
}
```

- [ ] **Step 3: Verify compilation**

Run: `cd apps/workspaces && npx tsc --noEmit src/core/router/IndustryAwareRouter.tsx`

Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add apps/workspaces/src/core/router/
git add apps/workspaces/src/app/router.tsx
git commit -m "feat(workspaces): add IndustryAwareRouter with dynamic loading

- Lazy-loaded components with industry override support
- Suspense wrappers for loading states
- Route visibility based on industry config
- Falls back to base implementations"
```

---

## Task 8: Vite Configuration for Environment Variables

**Files:**
- Modify: `apps/workspaces/vite.config.ts`

**Purpose:** Configure Vite to inject the DECACAN_INDUSTRY environment variable at build time.

- [ ] **Step 1: Update vite.config.ts**

Read current config and modify:

```typescript
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');
  const industry = env.DECACAN_INDUSTRY || 'default';
  
  console.log(`[Vite] Building for industry: ${industry}`);
  
  return {
    plugins: [react(), tailwindcss()],
    base: '/',
    
    define: {
      // Inject industry ID as global constant
      __INDUSTRY__: JSON.stringify(industry),
      'import.meta.env.VITE_INDUSTRY': JSON.stringify(industry),
    },
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@decacan/ui': path.resolve(__dirname, '../../packages/ui'),
      },
    },
    
    server: {
      host: '127.0.0.1',
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
    
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Separate industry configs into their own chunks
            'industry-default': ['./src/config/industries/default.ts'],
            'industry-legal': ['./src/config/industries/legal.ts'],
            'industry-medical': ['./src/config/industries/medical.ts'],
          },
        },
      },
    },
  };
});
```

- [ ] **Step 2: Add type declaration for __INDUSTRY__**

Create `apps/workspaces/src/types/vite-env.d.ts`:

```typescript
/// <reference types="vite/client" />

declare const __INDUSTRY__: string;

interface ImportMetaEnv {
  readonly VITE_INDUSTRY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

- [ ] **Step 3: Test configuration**

Run with different industries:
```bash
cd apps/workspaces

# Test default
pnpm dev

# Test legal (in another terminal)
DECACAN_INDUSTRY=legal pnpm dev --port 5174
```

- [ ] **Step 4: Commit**

```bash
git add apps/workspaces/vite.config.ts
git add apps/workspaces/src/types/vite-env.d.ts
git commit -m "feat(workspaces): configure Vite for multi-industry builds

- Load DECACAN_INDUSTRY from environment
- Inject __INDUSTRY__ global constant
- Industry-specific code splitting
- Type declarations for env vars"
```

---

## Task 9: Add npm Scripts for Multi-Industry Development

**Files:**
- Modify: `apps/workspaces/package.json`
- Modify: Root `package.json`

**Purpose:** Add convenient scripts for launching different industry versions.

- [ ] **Step 1: Update workspaces package.json**

Modify `apps/workspaces/package.json` scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "dev:default": "cross-env DECACAN_INDUSTRY=default vite",
    "dev:legal": "cross-env DECACAN_INDUSTRY=legal vite --port 5174",
    "dev:medical": "cross-env DECACAN_INDUSTRY=medical vite --port 5175",
    "dev:all": "concurrently \"pnpm dev\" \"pnpm dev:legal\" \"pnpm dev:medical\"",
    "build": "tsc && vite build",
    "build:default": "cross-env DECACAN_INDUSTRY=default pnpm build",
    "build:legal": "cross-env DECACAN_INDUSTRY=legal pnpm build",
    "build:medical": "cross-env DECACAN_INDUSTRY=medical pnpm build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint src --fix",
    "format": "prettier --write ."
  }
}
```

- [ ] **Step 2: Install cross-env and concurrently**

```bash
cd apps/workspaces
pnpm add -D cross-env concurrently
```

- [ ] **Step 3: Update root package.json**

Modify root `package.json`:

```json
{
  "scripts": {
    "dev:workspaces": "pnpm --filter @decacan/ui build && pnpm --filter decacan-workspaces dev",
    "dev:workspaces:legal": "pnpm --filter @decacan/ui build && pnpm --filter decacan-workspaces dev:legal",
    "dev:workspaces:medical": "pnpm --filter @decacan/ui build && pnpm --filter decacan-workspaces dev:medical",
    "dev:workspaces:all": "pnpm --filter decacan-workspaces dev:all",
    "dev:console": "pnpm --filter decacan-console dev",
    "dev:admin": "pnpm --filter decacan-console dev",
    "build": "pnpm --filter '*' build",
    "build:workspaces:legal": "pnpm --filter decacan-workspaces build:legal",
    "build:workspaces:medical": "pnpm --filter decacan-workspaces build:medical"
  }
}
```

- [ ] **Step 4: Test scripts**

```bash
# From root
pnpm dev:workspaces:legal

# Should start on port 5174 with legal configuration
```

- [ ] **Step 5: Commit**

```bash
git add apps/workspaces/package.json
git add package.json
git commit -m "feat(workspaces): add multi-industry npm scripts

- dev:legal, dev:medical for industry-specific development
- dev:all for concurrent development
- build scripts for production builds
- cross-env for cross-platform env vars"
```

---

## Task 10: Create Example Legal Workspace-Home Override

**Files:**
- Create: `apps/workspaces/src/features/workspace-home/legal/WorkspaceHomePage.tsx`

**Purpose:** Create an example industry-specific override to demonstrate the system working.

- [ ] **Step 1: Write legal-specific WorkspaceHomePage**

Create `apps/workspaces/src/features/workspace-home/legal/WorkspaceHomePage.tsx`:

```typescript
import React from 'react';
import { useIndustryConfig, useTerminology } from '../../../app/providers';
import { PageHeader } from '../../../shared/ui/PageHeader';

interface WorkspaceHomePageProps {
  workspaceId: string;
}

/**
 * Legal industry-specific workspace home page
 * Demonstrates custom layout and terminology
 */
export function WorkspaceHomePage({ workspaceId }: WorkspaceHomePageProps) {
  const config = useIndustryConfig();
  const terms = useTerminology();
  
  return (
    <div className="space-y-6">
      {/* Legal-specific header with matter info */}
      <PageHeader
        title={`Matter: ${workspaceId}`}
        subtitle={`${terms.workspace} Overview`}
      />
      
      {/* Legal-specific layout: Priority on deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content: Case list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">
              Active {terms.tasks}
            </h2>
            <p className="text-muted-foreground">
              List of active {terms.tasks.toLowerCase()} for this {terms.workspace.toLowerCase()}...
            </p>
            {/* TODO: Implement CaseList component */}
          </div>
          
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">
              Recent {terms.deliverables}
            </h2>
            <p className="text-muted-foreground">
              Recent {terms.deliverables.toLowerCase()}...
            </p>
          </div>
        </div>
        
        {/* Sidebar: Deadlines and team */}
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-6 border-l-4 border-l-red-500">
            <h2 className="text-lg font-semibold mb-4 text-red-600">
              Upcoming Deadlines
            </h2>
            <p className="text-muted-foreground">
              Critical deadlines for this {terms.workspace.toLowerCase()}...
            </p>
            {/* TODO: Implement DeadlinePanel component */}
          </div>
          
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">
              {terms.members}
            </h2>
            <p className="text-muted-foreground">
              {terms.members} working on this {terms.workspace.toLowerCase()}...
            </p>
          </div>
          
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">
              {terms.assistant}
            </h2>
            <p className="text-muted-foreground">
              Ask the {terms.assistant.toLowerCase()} for help...
            </p>
          </div>
        </div>
      </div>
      
      {/* Debug info */}
      <div className="mt-8 p-4 rounded bg-muted text-sm">
        <p className="font-semibold">Debug Info:</p>
        <p>Industry: {config.id}</p>
        <p>Theme Primary: {config.theme.primary}</p>
        <p>Workspace ID: {workspaceId}</p>
      </div>
    </div>
  );
}

export default WorkspaceHomePage;
```

- [ ] **Step 2: Verify compilation**

Run: `cd apps/workspaces && npx tsc --noEmit src/features/workspace-home/legal/WorkspaceHomePage.tsx`

Expected: No errors

- [ ] **Step 3: Test the override**

```bash
cd apps/workspaces

# Start legal version
pnpm dev:legal

# Navigate to http://localhost:5174/workspaces/test-workspace
# Should see legal-specific page with "Case", "Matter", "Attorney" terminology
```

- [ ] **Step 4: Commit**

```bash
git add apps/workspaces/src/features/workspace-home/legal/
git commit -m "feat(workspaces): add legal industry workspace-home override

- Custom layout emphasizing deadlines
- Legal terminology (Case, Matter, Attorney)
- Red accent for deadline panel
- Demonstrates industry override system"
```

---

## Task 11: Documentation and README

**Files:**
- Create: `apps/workspaces/INDUSTRIES.md`

**Purpose:** Document how to use and extend the multi-industry system.

- [ ] **Step 1: Create comprehensive documentation**

Create `apps/workspaces/INDUSTRIES.md`:

```markdown
# Multi-Industry Workspaces

This document explains how to customize and extend Workspaces for different industries.

## Quick Start

### Development

```bash
# Default workspace
pnpm dev

# Legal industry
pnpm dev:legal

# Medical industry
pnpm dev:medical

# All industries concurrently
pnpm dev:all
```

### Building

```bash
# Build for specific industry
pnpm build:legal
pnpm build:medical

# Output will be in dist/ with industry-specific assets
```

## Architecture

### Three-Layer System

1. **Configuration Layer** (`src/config/`)
   - Industry definitions and terminology
   - Theme colors and settings
   - Feature flags and routing

2. **Base Implementation** (`src/features/*/base/`)
   - Generic implementations for all industries
   - Used as fallback when industry-specific doesn't exist

3. **Industry Override** (`src/features/*/{industry}/`)
   - Optional industry-specific implementations
   - Takes precedence over base when present

### How It Works

When you navigate to a page:

1. Router checks current industry from `DECACAN_INDUSTRY` env var
2. Tries to load industry-specific component
3. Falls back to base component if not found
4. All components receive industry config via React Context

## Adding a New Industry

### Step 1: Create Configuration

Create `src/config/industries/{your-industry}.ts`:

```typescript
import type { IndustryConfig } from '../types';

export const yourIndustryConfig: IndustryConfig = {
  id: 'your-industry',
  name: 'Your Industry Name',
  description: 'Description of your industry',
  
  terminology: {
    task: 'Work Item',
    tasks: 'Work Items',
    // ... other terms
  },
  
  theme: {
    primary: '#your-color',
    // ... other theme values
  },
  
  workbench: {
    slots: {
      primary: 'YourComponent',
      sidebar: 'YourSidebar',
    },
    availableWidgets: ['YourComponent', 'AnotherWidget'],
  },
  
  features: {
    tasks: { enabled: true },
    // ... other features
  },
};
```

### Step 2: Register Industry

Add to `src/config/industries/registry.ts`:

```typescript
export const industryRegistry = {
  // ... existing industries
  
  'your-industry': {
    id: 'your-industry',
    name: 'Your Industry Name',
    description: 'Description',
    load: async () => {
      const module = await import('./your-industry');
      return { config: module.yourIndustryConfig };
    },
  },
};
```

### Step 3: Create Feature Overrides (Optional)

For pages that need custom structure:

```bash
mkdir -p src/features/workspace-home/your-industry
cp src/features/workspace-home/base/WorkspaceHomePage.tsx \
   src/features/workspace-home/your-industry/
```

Modify as needed. The system will automatically use your version.

### Step 4: Add Development Script

Update `package.json`:

```json
{
  "scripts": {
    "dev:your-industry": "cross-env DECACAN_INDUSTRY=your-industry vite --port 5176"
  }
}
```

## Customization Guide

### Terminology

Change what things are called:

```typescript
terminology: {
  task: 'Case',        // "Tasks" → "Cases"
  deliverable: 'Brief', // "Deliverables" → "Briefs"
  workspace: 'Matter',  // "Workspace" → "Matter"
}
```

### Theme Colors

Customize the color scheme:

```typescript
theme: {
  primary: '#1e3a5f',    // Main brand color
  secondary: '#4a6fa5',  // Secondary accent
  accent: '#8b4513',     // Highlight color
}
```

### Feature Flags

Enable/disable features:

```typescript
features: {
  tasks: { enabled: true },
  deliverables: { enabled: false }, // Hide deliverables
  assistant: { 
    enabled: true,
    config: { specialized: true }  // Enable specialized assistant
  },
}
```

### Route Visibility

Hide specific routes:

```typescript
routes: {
  hiddenRoutes: ['deliverables', 'approvals'],
}
```

## Best Practices

1. **Start with Configuration**: Use config for terminology and colors before creating code overrides
2. **Copy Base First**: When overriding, copy from `base/` and modify
3. **Maintain Compatibility**: Keep props interface consistent with base
4. **Test Fallback**: Remove your override to ensure base version still works
5. **Document Differences**: Comment why industry-specific changes were made

## Troubleshooting

### Changes Not Showing

- Check browser console for errors
- Verify `DECACAN_INDUSTRY` env var is set
- Clear browser cache
- Check that import paths are correct

### Build Errors

- Ensure TypeScript types are correct
- Verify all imports exist
- Check that base/ directory has all required files

### Fallback Not Working

- Ensure base/ directory exists
- Check that component names match exactly
- Verify file extensions (.tsx)

## Examples

See existing implementations:

- `src/config/industries/legal.ts` - Legal industry config
- `src/features/workspace-home/legal/` - Legal override example
```

- [ ] **Step 2: Commit documentation**

```bash
git add apps/workspaces/INDUSTRIES.md
git commit -m "docs(workspaces): add comprehensive multi-industry guide

- Quick start for development and building
- Architecture explanation
- Step-by-step guide for adding new industries
- Customization examples
- Troubleshooting section"
```

---

## Summary

This implementation plan creates a complete multi-industry workspace system with:

1. **Configuration System**: Type-safe industry configs with terminology, themes, and features
2. **Dynamic Loading**: Automatic fallback from industry-specific to base implementations
3. **React Integration**: Context provider for easy config access in components
4. **Development Tools**: npm scripts for easy multi-industry development
5. **Production Ready**: Build-time environment variable injection and code splitting
6. **Documentation**: Complete guide for extending the system

### What Was Built

| Component | Purpose |
|-----------|---------|
| `config/types.ts` | Type definitions for all configuration |
| `config/industries/registry.ts` | Industry registration system |
| `config/loader.ts` | Dynamic config loading with fallback |
| `IndustryProvider.tsx` | React Context for config access |
| `dynamicLoader.ts` | Feature module loading with override support |
| `IndustryAwareRouter.tsx` | Router with dynamic page loading |
| `vite.config.ts` | Build configuration for environment variables |
| npm scripts | Convenient development commands |

### Testing Checklist

- [ ] Default industry loads and works
- [ ] Legal industry shows "Case", "Matter", "Attorney"
- [ ] Medical industry shows "Patient", "Chart" (when implemented)
- [ ] Unknown industry falls back to default
- [ ] All npm scripts work correctly
- [ ] Production builds succeed
- [ ] Console app still works independently

### Next Steps

1. Implement remaining feature overrides as needed
2. Add more industry configurations
3. Create industry-specific widgets
4. Add A/B testing support for industry variations
5. Implement runtime industry switching (for admins)

---

**Plan complete and saved to `docs/superpowers/plans/YYYY-MM-DD-multi-industry-workspaces.md`**

**Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach would you like?**
