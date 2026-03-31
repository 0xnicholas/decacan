import { Container } from '@/components/common/container';
import { NavbarLinks } from './navbar-links';
import { NavbarMenu } from './navbar-menu';

export function Navbar() {
  return (
    <div className="flex items-stretch lg:fixed z-5 top-(--header-height) start-(--sidebar-width) end-5 h-(--navbar-height) mx-5 lg:mx-0 bg-muted">
      <div className="rounded-t-xl border border-border bg-background flex items-stretch grow">
        <Container className="flex justify-between items-stretch gap-5">
          <NavbarMenu />
          <NavbarLinks />
        </Container>
      </div>
    </div>
  );
}
