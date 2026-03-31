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
import { OrderSummaryContent } from '.';
import { Steps } from '../steps';

export function OrderSummaryPage() {
  return (
    <Fragment>
      <Steps currentStep={0} />
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle />
            <ToolbarDescription>
              Review your items before checkout
            </ToolbarDescription>
          </ToolbarHeading>
          <ToolbarActions>
            <Button variant="outline">
              <BaggageClaim />
              <Link to="#">View Cart</Link>
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <OrderSummaryContent />
      </Container>
    </Fragment>
  );
}
