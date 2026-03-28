import type { TaskEventEnvelope } from "../../entities/task/types";

interface HistoryRailProps {
  timeline: TaskEventEnvelope[];
}

export function HistoryRail({ timeline }: HistoryRailProps) {
  return (
    <section className="task-panel" aria-label="Task history">
      <p className="section-kicker">History</p>
      {timeline.length ? (
        <ul className="timeline-list">
          {timeline
            .slice()
            .reverse()
            .map((event) => (
              <li key={event.event_id}>
                <strong>{event.event_type}</strong>
                <span className="panel-copy">{event.message}</span>
              </li>
            ))}
        </ul>
      ) : (
        <p className="panel-copy">No timeline events yet.</p>
      )}
    </section>
  );
}
