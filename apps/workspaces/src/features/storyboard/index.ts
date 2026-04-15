import { createLazyComponent, loadFeatureComponent } from '../../core/router/dynamicLoader';

export { StoryboardPage } from './base/StoryboardPage';

export const loadStoryboardPage = () => 
  loadFeatureComponent('storyboard', 'StoryboardPage');

export const LazyStoryboardPage = createLazyComponent('storyboard', 'StoryboardPage');
