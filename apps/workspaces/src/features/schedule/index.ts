import { createLazyComponent, loadFeatureComponent } from '../../core/router/dynamicLoader';

export { SchedulePage } from './base/SchedulePage';

export const loadSchedulePage = () => 
  loadFeatureComponent('schedule', 'SchedulePage');

export const LazySchedulePage = createLazyComponent('schedule', 'SchedulePage');
