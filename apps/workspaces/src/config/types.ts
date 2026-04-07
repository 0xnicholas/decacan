/**
 * Terminology customization - map generic terms to industry-specific terms
 * Supports Chinese content industry terminology
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
 * Clean and modern design for content industries
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
 * Supports industry-specific layouts
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
