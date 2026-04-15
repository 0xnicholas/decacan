import { createLazyComponent, loadFeatureComponent } from '../../core/router/dynamicLoader';

export { TopicsPage } from './base/TopicsPage';

export const loadTopicsPage = () => 
  loadFeatureComponent('topics', 'TopicsPage');

export const LazyTopicsPage = createLazyComponent('topics', 'TopicsPage');
