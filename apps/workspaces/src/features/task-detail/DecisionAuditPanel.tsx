import { Card, CardContent, CardHeader } from "@decacan/ui";
import type { DecisionRecord } from "../../shared/api/decisions";
export type { DecisionRecord } from "../../shared/api/decisions";

interface DecisionAuditPanelProps {
  decisions: DecisionRecord[];
  onApprove?: (decisionId: string) => void;
  onReject?: (decisionId: string) => void;
  pendingOnly?: boolean;
}

export function DecisionAuditPanel({
  decisions,
  onApprove,
  onReject,
  pendingOnly = false,
}: DecisionAuditPanelProps) {
  const filteredDecisions = pendingOnly
    ? decisions.filter((d) => d.decision === "pending")
    : decisions;

  const getRiskBadgeClass = (riskLevel?: string) => {
    switch (riskLevel) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  return (
    <section aria-label="Decision audit trail">
      <Card className="h-full">
        <CardHeader>
          <h2 className="text-base font-semibold leading-none tracking-tight">
            Decision History
          </h2>
          <p className="text-sm text-muted-foreground">
            {filteredDecisions.length} decision{filteredDecisions.length !== 1 ? "s" : ""}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredDecisions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border px-4 py-6">
              <p className="font-medium">No decisions recorded</p>
              <p className="text-sm text-muted-foreground">
                Decision audit trail will appear here once actions are taken.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {filteredDecisions.map((decision) => (
                <li
                  key={decision.id}
                  className="rounded-lg border border-border px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium capitalize">
                          {decision.decisionType.replace(/_/g, " ")}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${getRiskBadgeClass(
                            decision.riskLevel
                          )}`}
                        >
                          {decision.riskLevel ?? "unknown"} risk
                        </span>
                        {decision.decision === "pending" && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                            awaiting decision
                          </span>
                        )}
                      </div>
                      {decision.reason && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {decision.reason}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        By: {decision.decidedBy} &bull;{" "}
                        {formatDate(decision.createdAt)}
                      </p>
                    </div>
                    {decision.decision === "pending" &&
                      onApprove &&
                      onReject && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="rounded bg-green-100 px-3 py-1 text-sm font-medium text-green-800 hover:bg-green-200"
                            onClick={() => onApprove(decision.id)}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="rounded bg-red-100 px-3 py-1 text-sm font-medium text-red-800 hover:bg-red-200"
                            onClick={() => onReject(decision.id)}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
