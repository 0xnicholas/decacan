import { useSettings } from '@/providers/settings-provider';
import {
  Demo1LightSidebarPage,
  Demo2Page,
  Demo3Page,
  Demo4Page,
  Demo5Page,
} from '../';

const DefaultPage = () => {
  const { settings } = useSettings();

  if (settings?.layout === 'demo1') {
    return <Demo1LightSidebarPage />;
  } else if (settings?.layout === 'demo2') {
    return <Demo2Page />;
  } else if (settings?.layout === 'demo3') {
    return <Demo3Page />;
  } else if (settings?.layout === 'demo4') {
    return <Demo4Page />;
  } else if (settings?.layout === 'demo5') {
    return <Demo5Page />;
  } else if (settings?.layout === 'demo6') {
    return <Demo4Page />;
  } else if (settings?.layout === 'demo7') {
    return <Demo2Page />;
  } else if (settings?.layout === 'demo8') {
    return <Demo4Page />;
  } else if (settings?.layout === 'demo9') {
    return <Demo2Page />;
  } else if (settings?.layout === 'demo10') {
    return <Demo3Page />;
  }
};

export { DefaultPage };
