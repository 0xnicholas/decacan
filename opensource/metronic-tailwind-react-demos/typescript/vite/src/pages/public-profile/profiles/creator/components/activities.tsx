import { Fragment, useState } from 'react';
import { ActivitiesAnniversary } from '@/partials/activities/anniversary';
import { ActivitiesBloggingConference } from '@/partials/activities/blogging-conference';
import { ActivitiesInterview } from '@/partials/activities/interview';
import { ActivitiesFollowersMilestone } from '@/partials/activities/milestone';
import { ActivitiesNewArticle } from '@/partials/activities/new-article';
import { ActivitiesUpcomingContent } from '@/partials/activities/upcoming-content';
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

const Activities = () => {
  const [isSwitchOn, setIsSwitchOn] = useState(false);

  const handleSwitchToggle = () => {
    setIsSwitchOn(!isSwitchOn);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activities</CardTitle>
        <div className="flex items-center space-x-2.5">
          <Label htmlFor="simple-switch" className="text-sm">
            Auto refresh:
          </Label>
          {isSwitchOn ? 'On' : 'Off'}
          <Switch
            id="simple-switch"
            size="sm"
            className="ms-2"
            checked={isSwitchOn}
            onCheckedChange={handleSwitchToggle}
          />
        </div>
      </CardHeader>
      <CardContent>
        <ActivitiesNewArticle />
        <ActivitiesInterview />
        <ActivitiesUpcomingContent />
        <ActivitiesBloggingConference
          image={
            <Fragment>
              <img
                src={toAbsoluteUrl(`/media/illustrations/3.svg`)}
                className="dark:hidden max-h-[160px]"
                alt="image"
              />
              <img
                src={toAbsoluteUrl(`/media/illustrations/3-dark.svg`)}
                className="light:hidden max-h-[160px]"
                alt="image"
              />
            </Fragment>
          }
        />
        <ActivitiesFollowersMilestone />
        <ActivitiesAnniversary />
      </CardContent>
      <CardFooter className="justify-center">
        <Button mode="link" underlined="dashed" asChild>
          <Link to="/public-profile/activity">All-time Activities</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export { Activities };
