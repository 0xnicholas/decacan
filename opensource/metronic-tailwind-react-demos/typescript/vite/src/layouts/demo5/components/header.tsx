import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useScrollPosition } from '@/hooks/use-scroll-position';
import { useSettings } from '@/providers/settings-provider';
import { Container } from '@/components/common/container';
import { HeaderLogo } from './header-logo';
import { HeaderTopbar } from './header-topbar';

const Header = () => {
  const { settings } = useSettings();
  const scrollPosition = useScrollPosition();
  const [headerStickyOn, setHeaderStickyOn] = useState(false);

  useEffect(() => {
    const isSticky = scrollPosition > settings.layouts.demo2.headerStickyOffset;
    setHeaderStickyOn(isSticky);
  }, [scrollPosition, settings]);

  useEffect(() => {
    if (headerStickyOn === true) {
      document.body.setAttribute('data-sticky-header', 'on');
    } else {
      document.body.removeAttribute('data-sticky-header');
    }
  }, [headerStickyOn]);

  return (
    <header
      className={cn(
        'flex items-center transition-[height] shrink-0 bg-(--header-bg) dark:bg-(--header-bg-dark) h-(--header-height)',
        headerStickyOn &&
          'transition-[height] fixed z-10 top-0 start-0 end-0 shadow-xs backdrop-blur-md bg-white/70',
      )}
    >
      <Container
        width="fluid"
        className="flex flex-wrap justify-between items-center lg:gap-4"
      >
        <HeaderLogo />
        <HeaderTopbar />
      </Container>
    </header>
  );
};

export { Header };
