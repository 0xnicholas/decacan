import type { Artifact, ArtifactContent } from "../../entities/artifact/types";

interface ArtifactPreviewDrawerProps {
  artifact: Artifact;
  preview: ArtifactContent | null;
  onClose: () => void;
}

export function ArtifactPreviewDrawer({
  artifact,
  preview,
  onClose,
}: ArtifactPreviewDrawerProps) {
  return (
    <aside className="artifact-drawer" role="dialog" aria-label="Artifact preview">
      <div className="artifact-drawer-scrim" onClick={onClose} aria-hidden="true" />
      <section className="artifact-drawer-panel">
        <header className="artifact-drawer-header">
          <div>
            <p className="section-kicker">Artifact preview</p>
            <h2>{artifact.label}</h2>
            <p className="panel-copy">{artifact.canonical_path}</p>
          </div>
          <div className="artifact-drawer-meta">
            <span className="status-pill">{artifact.status}</span>
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
              aria-label="Close preview"
            >
              Close
            </button>
          </div>
        </header>
        <div className="artifact-drawer-body">
          {preview ? <pre className="artifact-preview">{preview.content}</pre> : <p>Loading preview...</p>}
        </div>
      </section>
    </aside>
  );
}
