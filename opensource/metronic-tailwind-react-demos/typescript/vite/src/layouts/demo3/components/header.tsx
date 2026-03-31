import { Container } from '@/components/common/container';
import { HeaderLogo } from './header-logo';
import { HeaderTopbar } from './header-topbar';

export function Header() {
  return (
    <header className="flex items-center fixed z-10 top-0 left-0 right-0 shrink-0 h-(--header-height) bg-muted">
      <Container className="flex justify-between items-stretch px-5 lg:ps-0 lg:gap-4">
        <HeaderLogo />
        <HeaderTopbar />
      </Container>
    </header>
  );
}
