export interface Artifact {
  id: string;
  task_id: string;
  label: string;
  canonical_path: string;
  status: string;
}

export interface ArtifactContent {
  artifact_id: string;
  content_type: string;
  content: string;
}
