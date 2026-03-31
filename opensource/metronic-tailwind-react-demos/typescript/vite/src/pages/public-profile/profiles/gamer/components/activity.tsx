import { Fragment, useId } from 'react';
import { ActivitiesBloggingConference } from '@/partials/activities/blogging-conference';
import { ActivitiesLogin } from '@/partials/activities/login';
import { ActivitiesNewProduct } from '@/partials/activities/new-product';
import { ActivitiesProductSpecific } from '@/partials/activities/product-specific';
import { ActivitiesProductWebinar } from '@/partials/activities/product-webinar';
import { Link } from 'react-router-dom';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const Activity = () => {
  const id = useId();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <div className="flex items-center space-x-2">
          <Label htmlFor={id} className="text-sm">
            Auto update
          </Label>
          <Switch id={id} size="sm" />
        </div>
      </CardHeader>
      <CardContent>
        <ActivitiesNewProduct />
        <ActivitiesProductWebinar />
        <ActivitiesLogin />
        <ActivitiesBloggingConference
          heading="Email campaign sent to Jenny for a special promotion."
          datetime="1 week ago, 11:45 AM"
          title="First Campaign Created"
          image={
            <Fragment>
              <img
                src={toAbsoluteUrl(`/media/illustrations/10.svg`)}
                className="dark:hidden max-h-[160px]"
                alt="image"
              />
              <img
                src={toAbsoluteUrl(`/media/illustrations/10-dark.svg`)}
                className="light:hidden max-h-[160px]"
                alt="image"
              />
            </Fragment>
          }
        />
        <ActivitiesProductSpecific />
      </CardContent>
      <CardFooter className="justify-center">
        <Button mode="link" underlined="dashed" asChild>
          <Link to="/public-profile/activity">All-time Activities</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export { Activity };
