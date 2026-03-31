import { useEffect, useState } from 'react'; // Add useState to the imports
import { cn } from '@/lib/utils';
import { useScrollPosition } from '@/hooks/use-scroll-position';
import { useSettings } from '@/providers/settings-provider';
import { Container } from '@/components/common/container';
import { HeaderLogo } from './header-logo';
import { HeaderTopbar } from './header-topbar';

export function Header() {
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
        'flex items-center transition-[height] shrink-0 h-(--header-height) in-data-[sticky-header=on]:pe-[var(--removed-body-scroll-bar-size,0px)]',
        settings.layouts.demo2.headerSticky &&
          headerStickyOn &&
          'transition-[height] fixed z-10 top-0 start-0 end-0 shadow-xs backdrop-blur-md bg-background/70',
      )}
    >
      <Container className="flex justify-between items-center lg:gap-4">
        <HeaderLogo />
        <HeaderTopbar />
      </Container>
    </header>
  );
}
