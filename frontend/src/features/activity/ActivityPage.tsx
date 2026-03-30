import { useEffect, useState } from "react";

import type { ActivityEvent, ActivityEventType } from "../../entities/activity/types";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "../../shared/ui";
import { fetchWorkspaceActivity, getEventTypeLabel } from "../../shared/api/activity";
import { ActivityFilters } from "./ActivityFilters";

interface ActivityPageProps {
  workspaceId: string;
}

function getEventDescription(event: ActivityEvent): string {
  const typeLabel = getEventTypeLabel(event.type).toLowerCase();
  
  switch (event.type) {
    case "task_created":
      return `${event.actor} created task ${event.target}`;
    case "task_completed":
      return `${event.actor} completed task ${event.target}`;
    case "approval_requested":
      return `${event.actor} requested approval ${event.target}`;
    case "approval_resolved":
      return `${event.actor} resolved approval ${event.target}`;
    case "deliverable_created":
      return `${event.actor} created deliverable ${event.target}`;
    case "member_joined":
      return `${event.actor} joined as ${event.target}`;
    default:
      return `${event.actor} ${typeLabel} ${event.target}`;
  }
}

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) {
    return "just now";
  } else if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays === 1) {
    return "1d ago";
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks}w ago`;
  } else {
    return then.toLocaleDateString();
  }
}

export function ActivityPage({ workspaceId }: ActivityPageProps) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<ActivityEventType | "all">("all");

  const loadActivity = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters = selectedType === "all" ? undefined : { type: selectedType };
      const data = await fetchWorkspaceActivity(workspaceId, filters);
      setEvents(data);
    } catch (err) {
      setError("Failed to load activity");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadActivity();
  }, [workspaceId, selectedType]);

  return (
    <section aria-label="Activity" className="activity-page">
      <PageHeader title="Activity" subtitle="Track what's happening in your workspace" />

      <ActivityFilters
        selectedType={selectedType}
        onTypeChange={setSelectedType}
      />

      {isLoading && (
        <LoadingState message="Loading activity..." />
      )}

      {error && (
        <ErrorState message={error} onRetry={loadActivity} />
      )}

      {!isLoading && !error && events.length === 0 && (
        <EmptyState
          title="No activity found"
          message="Adjust your filters or check back later"
        />
      )}

      {!isLoading && !error && events.length > 0 && (
        <ul className="activity-feed" aria-label="Activity feed">
          {events.map((event) => (
            <li key={event.id} className="activity-event">
              <div className="activity-event-icon" aria-hidden="true">
                {getEventIcon(event.type)}
              </div>
              <div className="activity-event-content">
                <p className="activity-event-description">
                  {getEventDescription(event)}
                </p>
                <time className="activity-event-time" dateTime={event.timestamp}>
                  {formatRelativeTime(event.timestamp)}
                </time>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function getEventIcon(type: ActivityEventType): string {
  const icons: Record<ActivityEventType, string> = {
    task_created: "📝",
    task_completed: "✅",
    approval_requested: "⏳",
    approval_resolved: "✓",
    deliverable_created: "📦",
    member_joined: "👤",
  };
  return icons[type];
}
