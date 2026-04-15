import { createLazyComponent, loadFeatureComponent } from '../../core/router/dynamicLoader';

export { ScriptPage } from './base/ScriptPage';

export const loadScriptPage = () => 
  loadFeatureComponent('script', 'ScriptPage');

export const LazyScriptPage = createLazyComponent('script', 'ScriptPage');
