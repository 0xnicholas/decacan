import { createLazyComponent, loadFeatureComponent } from '../../core/router/dynamicLoader';

export { AnalyticsPage } from './base/AnalyticsPage';

export const loadAnalyticsPage = () => 
  loadFeatureComponent('analytics', 'AnalyticsPage');

export const LazyAnalyticsPage = createLazyComponent('analytics', 'AnalyticsPage');
