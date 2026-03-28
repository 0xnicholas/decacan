import type { Artifact } from "../../entities/artifact/types";

interface ArtifactPanelProps {
  artifacts: Artifact[];
}

export function ArtifactPanel({ artifacts }: ArtifactPanelProps) {
  return (
    <section className="task-panel">
      <div className="section-header">
        <p className="section-kicker">Output</p>
        <h2>Artifacts</h2>
      </div>
      <ul className="detail-list">
        {artifacts.map((artifact) => (
          <li key={artifact.id}>
            <strong>{artifact.label}</strong>
            <span>{artifact.canonical_path}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
