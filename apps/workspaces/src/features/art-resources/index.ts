import { createLazyComponent, loadFeatureComponent } from '../../core/router/dynamicLoader';

export { ArtResourcesPage } from './base/ArtResourcesPage';

export const loadArtResourcesPage = () => 
  loadFeatureComponent('art-resources', 'ArtResourcesPage');

export const LazyArtResourcesPage = createLazyComponent('art-resources', 'ArtResourcesPage');
