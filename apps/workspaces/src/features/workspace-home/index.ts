import { createLazyComponent, loadFeatureComponent } from '../../core/router/dynamicLoader';

// Re-export for static imports (if needed)
export { WorkspaceHomePage } from './base/WorkspaceHomePage';

// Dynamic loader for industry-specific versions
export const loadWorkspaceHomePage = () => 
  loadFeatureComponent('workspace-home', 'WorkspaceHomePage');

// Lazy-loaded version for React Router
export const LazyWorkspaceHomePage = createLazyComponent('workspace-home', 'WorkspaceHomePage');