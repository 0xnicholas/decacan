import { Skeleton } from "@decacan/ui";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="ui-state loading-state flex flex-col items-center gap-4 p-8" role="status" aria-live="polite">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
      <span className="text-muted-foreground">{message}</span>
    </div>
  );
}
