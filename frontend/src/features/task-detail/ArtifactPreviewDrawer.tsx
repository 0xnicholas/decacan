import type { Artifact, ArtifactContent } from "../../entities/artifact/types";

interface ArtifactPreviewDrawerProps {
  artifact: Artifact;
  copyNotice: string | null;
  errorMessage: string | null;
  isLoading: boolean;
  onCopyPath: () => void;
  preview: ArtifactContent | null;
  onClose: () => void;
  onRefresh: () => void;
}

export function ArtifactPreviewDrawer({
  artifact,
  copyNotice,
  errorMessage,
  isLoading,
  onCopyPath,
  preview,
  onClose,
  onRefresh,
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
        <div className="artifact-drawer-actions">
          <button type="button" className="secondary-button" onClick={onCopyPath}>
            Copy path
          </button>
          <button type="button" className="secondary-button" onClick={onRefresh}>
            Refresh preview
          </button>
        </div>
        {copyNotice ? <p className="artifact-drawer-notice">{copyNotice}</p> : null}
        <div className="artifact-drawer-body">
          {isLoading ? <p>Loading preview...</p> : null}
          {!isLoading && errorMessage ? <p>Could not load preview.</p> : null}
          {!isLoading && !errorMessage && preview && preview.content.trim().length > 0 ? (
            <pre className="artifact-preview">{preview.content}</pre>
          ) : null}
          {!isLoading && !errorMessage && preview && preview.content.trim().length === 0 ? (
            <p>No preview content available.</p>
          ) : null}
        </div>
      </section>
    </aside>
  );
}
