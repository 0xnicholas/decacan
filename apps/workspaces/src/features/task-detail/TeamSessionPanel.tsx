import type { TeamSessionSnapshot } from "../../entities/assistant/types";

interface TeamSessionPanelProps {
  session: TeamSessionSnapshot;
}

export function TeamSessionPanel({ session }: TeamSessionPanelProps) {
  return (
    <section className="task-panel" aria-label="Team session">
      <p className="section-kicker">Agent Team</p>
      <h3 className="text-lg font-semibold">Team Session</h3>
      <p className="panel-copy">
        <strong>Status:</strong> {session.status}
      </p>
      <p className="panel-copy">
        <strong>Phase:</strong> {session.phase}
      </p>
      <p className="panel-copy">
        <strong>Snapshot:</strong> v{session.snapshot_version}
      </p>
    </section>
  );
}
