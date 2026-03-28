import type { TaskConnectionState, TaskEventEnvelope } from "../../entities/task/types";

interface LiveActivityStripProps {
  latestEvent: TaskEventEnvelope | null;
  connectionState: TaskConnectionState;
}

export function LiveActivityStrip({
  latestEvent,
  connectionState,
}: LiveActivityStripProps) {
  const statusLabel = connectionState.charAt(0).toUpperCase() + connectionState.slice(1);

  return (
    <section className="task-panel live-activity-strip" aria-label="Live activity">
      <p className="live-activity-copy">
        Last event: {latestEvent?.message ?? "Waiting for task activity"}
      </p>
      <span className={`live-connection-pill is-${connectionState}`}>{statusLabel}</span>
    </section>
  );
}
