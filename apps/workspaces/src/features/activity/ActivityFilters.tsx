import type { ActivityEventType, ActivityFilters as FiltersType } from "../../entities/activity/types";
import { getEventTypeLabel } from "../../shared/api/activity";

interface ActivityFiltersProps {
  filters: FiltersType;
  onChange: (filters: FiltersType) => void;
}

const eventTypes: ActivityEventType[] = [
  "task_created",
  "task_completed",
  "approval_requested",
  "approval_resolved",
  "deliverable_created",
  "member_joined",
];

export function ActivityFilters({ filters, onChange }: ActivityFiltersProps) {
  const selectedType = filters.types?.[0] ?? "all";

  const handleTypeChange = (type: ActivityEventType | "all") => {
    if (type === "all") {
      onChange({});
    } else {
      onChange({ types: [type] });
    }
  };

  return (
    <div className="activity-filters">
      <label htmlFor="event-type-filter" className="activity-filter-label">
        Filter by event type
      </label>
      <select
        id="event-type-filter"
        aria-label="Filter by event type"
        className="activity-filter-select"
        value={selectedType}
        onChange={(e) => handleTypeChange(e.target.value as ActivityEventType | "all")}
      >
        <option value="all">All events</option>
        {eventTypes.map((type) => (
          <option key={type} value={type}>
            {getEventTypeLabel(type)}
          </option>
        ))}
      </select>
    </div>
  );
}
