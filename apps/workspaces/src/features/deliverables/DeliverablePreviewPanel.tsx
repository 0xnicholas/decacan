import { useEffect, useState } from "react";

import type { ArtifactContent } from "../../entities/artifact/types";
import { fetchArtifactContent } from "../../shared/api/artifacts";

interface DeliverablePreviewPanelProps {
  artifactId: string;
}

export function DeliverablePreviewPanel({ artifactId }: DeliverablePreviewPanelProps) {
  const [preview, setPreview] = useState<ArtifactContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadPreview() {
      try {
        const nextPreview = await fetchArtifactContent(artifactId);
        if (active) {
          setPreview(nextPreview);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Preview failed");
        }
      }
    }

    void loadPreview();

    return () => {
      active = false;
    };
  }, [artifactId]);

  return (
    <section className="task-panel" aria-label="Deliverable preview">
      <p className="section-kicker">Preview</p>
      {error ? <p className="panel-copy">{error}</p> : null}
      {preview ? <pre className="artifact-preview">{preview.content}</pre> : <p className="panel-copy">Loading preview...</p>}
    </section>
  );
}
