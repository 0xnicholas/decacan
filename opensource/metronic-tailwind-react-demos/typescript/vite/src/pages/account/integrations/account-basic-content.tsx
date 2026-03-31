import { Fragment } from 'react';
import { Faq } from '@/partials/common/faq';
import { Help2 } from '@/partials/common/help2';
import { Starter } from '@/partials/common/starter';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Integrations } from './components';

export function AccountIntegrationsContent() {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <Integrations />
      <Starter
        image={
          <Fragment>
            <img
              src={toAbsoluteUrl('/media/illustrations/28.svg')}
              className="dark:hidden max-h-[230px]"
              alt="image"
            />
            <img
              src={toAbsoluteUrl('/media/illustrations/28-dark.svg')}
              className="light:hidden max-h-[230px]"
              alt="image"
            />
          </Fragment>
        }
        title="Add New Integration"
        subTitle={
          <Fragment>
            Explore New Integration: Expand Your Toolkit with Cutting-Edge,
            <br />
            User-Friendly Solutions Tailored for Efficient and Innovative
            Project Management.
          </Fragment>
        }
        engage={{
          path: '/network/user-cards/mini-cards',
          label: 'Start Now',
          btnColor: 'btn-primary',
        }}
      />
      <Faq />
      <Help2 />
    </div>
  );
}
