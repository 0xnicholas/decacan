import { Fragment } from 'react';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/partials/common/toolbar';
import { BaggageClaim } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/common/container';
import { MyOrdersContent } from '.';

export function MyOrdersPage() {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle />
            <ToolbarDescription>View and manage your orders</ToolbarDescription>
          </ToolbarHeading>
          <ToolbarActions>
            <Button variant="outline">
              <BaggageClaim />
              <Link to="#">Continue Shopping</Link>
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <MyOrdersContent />
      </Container>
    </Fragment>
  );
}
