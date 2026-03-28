import type { ArtifactContent } from "../../entities/artifact/types";
import type { Artifact } from "../../entities/artifact/types";

interface ArtifactPanelProps {
  artifacts: Artifact[];
  preview: ArtifactContent | null;
  onPreview: (artifactId: string) => void;
}

export function ArtifactPanel({ artifacts, preview, onPreview }: ArtifactPanelProps) {
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
            <button
              type="button"
              className="secondary-button"
              onClick={() => onPreview(artifact.id)}
              aria-label={`Preview ${artifact.canonical_path}`}
            >
              Preview
            </button>
          </li>
        ))}
      </ul>
      {preview ? <pre className="artifact-preview">{preview.content}</pre> : null}
    </section>
  );
}
