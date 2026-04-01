import { Button } from "@decacan/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@decacan/ui";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <Card className="ui-state error-state" role="alert">
      <CardHeader>
        <CardTitle>Something went wrong</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      {onRetry && (
        <CardContent>
          <Button variant="outline" onClick={onRetry} type="button">
            Retry
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
