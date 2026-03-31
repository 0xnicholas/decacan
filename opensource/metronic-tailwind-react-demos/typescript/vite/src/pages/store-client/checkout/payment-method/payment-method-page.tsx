import { Fragment } from 'react';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/partials/common/toolbar';
import { WalletCards } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/common/container';
import { PaymentMethodContent } from '.';
import { Steps } from '../steps';

export function PaymentMethodPage() {
  return (
    <Fragment>
      <Steps currentStep={2} />
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle />
            <ToolbarDescription>Select how you want to pay</ToolbarDescription>
          </ToolbarHeading>
          <ToolbarActions>
            <Button variant="outline">
              <WalletCards />
              <Link to="#">Add Cart</Link>
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <PaymentMethodContent />
      </Container>
    </Fragment>
  );
}
