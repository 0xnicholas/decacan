import { Fragment } from 'react';
import { PageMenu } from '@/pages/public-profile';
import { UserHero } from '@/partials/common/user-hero';
import { DropdownMenu9 } from '@/partials/dropdown-menu/dropdown-menu-9';
import { Navbar, NavbarActions } from '@/partials/navbar/navbar';
import {
  EllipsisVertical,
  Mail,
  MapPin,
  MessagesSquare,
  SquareMousePointer,
  Users,
  Volleyball,
} from 'lucide-react';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/common/container';
import { ProfileCreatorContent } from '.';

export function ProfileCreatorPage() {
  const image = (
    <div className="flex items-center justify-center rounded-full border-2 border-red-200 bg-background size-[100px] shrink-0">
      <img
        src={toAbsoluteUrl('/media/brand-logos/inferno.svg')}
        className="size-11"
        alt="image"
      />
    </div>
  );

  return (
    <Fragment>
      <UserHero
        name="Inferno"
        image={image}
        info={[
          { label: 'inferno.com', icon: Volleyball },
          { label: 'SF, Bay Area', icon: MapPin },
          { email: 'jenny@kteam.com', icon: Mail },
        ]}
      />
      <Container>
        <Navbar>
          <PageMenu />
          <NavbarActions>
            <Button>
              <SquareMousePointer /> Hire Us
            </Button>
            <Button variant="outline">
              <Users /> Follow
            </Button>
            <Button variant="outline" mode="icon">
              <MessagesSquare />
            </Button>
            <DropdownMenu9
              trigger={
                <Button variant="outline" mode="icon">
                  <EllipsisVertical />
                </Button>
              }
            />
          </NavbarActions>
        </Navbar>
      </Container>
      <Container>
        <ProfileCreatorContent />
      </Container>
    </Fragment>
  );
}
