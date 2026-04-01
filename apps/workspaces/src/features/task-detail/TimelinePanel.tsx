import type { TaskEventEnvelope } from "../../entities/task/types";

interface TimelinePanelProps {
  timeline: TaskEventEnvelope[];
}

export function TimelinePanel({ timeline }: TimelinePanelProps) {
  return (
    <section className="task-panel">
      <div className="section-header">
        <p className="section-kicker">Timeline</p>
        <h2>Timeline</h2>
      </div>
      <ul className="timeline-list">
        {timeline.map((event) => (
          <li key={event.event_id}>
            <strong>{event.event_type}</strong>
            <span>{event.message}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
