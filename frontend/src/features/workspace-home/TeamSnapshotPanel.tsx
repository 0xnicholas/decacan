import type { TeamMember } from "../../entities/workspace-home/types";

interface TeamSnapshotPanelProps {
  team: TeamMember[];
}

export function TeamSnapshotPanel({ team }: TeamSnapshotPanelProps) {
  return (
    <section aria-label="Team Snapshot panel">
      <h2>Team Snapshot</h2>
      <ul>
        {team.map((member) => (
          <li key={member.id}>
            <strong>{member.name}</strong> ({member.role}) - {member.focus} [{member.status}]
          </li>
        ))}
      </ul>
    </section>
  );
}
