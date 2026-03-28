import type { ArtifactContent } from "../../entities/artifact/types";

import { getJson } from "./client";

export function fetchArtifactContent(artifactId: string) {
  return getJson<ArtifactContent>(`/api/artifacts/${artifactId}/content`);
}
