import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { NavigationMenuLink } from '@/components/ui/navigation-menu';

const MegaMenuFooter = () => {
  return (
    <div className="flex flex-wrap items-center lg:justify-between rounded-xl lg:rounded-t-none border border-border lg:border-0 lg:border-t lg:border-t-border px-4 py-4 lg:px-7.5 lg:py-5 gap-2.5 bg-muted/50">
      <div className="flex flex-col gap-1.5">
        <div className="text-base font-semibold text-mono leading-none">
          Ready to Get Started?
        </div>
        <div className="text-sm font-medium text-secondary-foreground">
          Explore the documentation to learn more about our platform.
        </div>
      </div>
      <NavigationMenuLink>
        <Button variant="mono" asChild>
          <Link to="#">Read Documentation</Link>
        </Button>
      </NavigationMenuLink>
    </div>
  );
};

export { MegaMenuFooter };
