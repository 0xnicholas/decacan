import { Card, CardContent, CardHeader } from "@decacan/ui";

export interface ActiveDelegation {
  id: string;
  taskId: string;
  taskTitle?: string;
  phase: string;
  blockedReason?: string;
  delegatorName?: string;
  delegateName?: string;
  createdAt: string;
  updatedAt: string;
}

interface ActiveDelegationCardProps {
  delegation: ActiveDelegation;
  onResume?: (delegationId: string) => void;
  onViewDetails?: (taskId: string) => void;
}

export function ActiveDelegationCard({
  delegation,
  onResume,
  onViewDetails,
}: ActiveDelegationCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  const isBlocked = delegation.blockedReason?.includes("approval") ?? false;
  const isWaitingForHuman =
    delegation.blockedReason?.toLowerCase().includes("human") ?? false;

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Active Delegation
            </p>
            <h3 className="text-base font-semibold">
              {delegation.taskTitle ?? `Task ${delegation.taskId.slice(0, 8)}`}
            </h3>
          </div>
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${
              isBlocked
                ? isWaitingForHuman
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-orange-100 text-orange-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {delegation.phase}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {delegation.blockedReason && (
          <div className="rounded-lg bg-yellow-50 px-3 py-2 text-sm">
            <p className="font-medium text-yellow-800">
              {isWaitingForHuman ? "⏳ Waiting for human decision" : "⏸ Blocked"}
            </p>
            <p className="text-yellow-700">{delegation.blockedReason}</p>
          </div>
        )}

        <div className="flex gap-2 text-sm text-muted-foreground">
          <span>
            <span className="font-medium">From:</span>{" "}
            {delegation.delegatorName ?? "Unknown"}
          </span>
          <span>&rarr;</span>
          <span>
            <span className="font-medium">To:</span>{" "}
            {delegation.delegateName ?? "Unknown"}
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          Started: {formatDate(delegation.createdAt)}
          {delegation.updatedAt !== delegation.createdAt && (
            <>
              {" "}
              &bull; Updated: {formatDate(delegation.updatedAt)}
            </>
          )}
        </p>

        <div className="flex gap-2">
          {isBlocked && onResume && (
            <button
              type="button"
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              onClick={() => onResume(delegation.id)}
            >
              Resume
            </button>
          )}
          {onViewDetails && (
            <button
              type="button"
              className="rounded border border-border px-4 py-2 text-sm font-medium hover:bg-gray-50"
              onClick={() => onViewDetails(delegation.taskId)}
            >
              View Details
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
