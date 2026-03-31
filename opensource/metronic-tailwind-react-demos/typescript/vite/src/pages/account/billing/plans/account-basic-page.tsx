import { Fragment } from 'react';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { PageNavbar } from '@/pages/account';
import { useSettings } from '@/providers/settings-provider';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/common/container';
import { AccountPlansContent } from '.';

export function AccountPlansPage() {
  const { settings } = useSettings();

  return (
    <Fragment>
      <PageNavbar />
      {settings?.layout === 'demo1' && (
        <Container>
          <Toolbar>
            <ToolbarHeading
              title="Plans"
              description="Central Hub for Personal Customization"
            />
            <ToolbarActions>
              <Button variant="outline">View Billing</Button>
            </ToolbarActions>
          </Toolbar>
        </Container>
      )}
      <Container>
        <AccountPlansContent />
      </Container>
    </Fragment>
  );
}
