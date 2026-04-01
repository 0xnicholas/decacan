import { Button } from "@decacan/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@decacan/ui";

interface EmptyStateProps {
  title: string;
  message: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <Card className="ui-state empty-state">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      {action && (
        <CardContent>
          <Button onClick={action.onClick} type="button">
            {action.label}
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
