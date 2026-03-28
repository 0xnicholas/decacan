import { postJson } from "./client";

export interface TaskPreviewRequest {
  workspace_id: string;
  playbook_key: string;
  input: string;
}

export interface TaskPreview {
  preview_id: string;
  plan_steps: string[];
  expected_artifact_label: string;
  expected_artifact_path: string;
  will_auto_start: boolean;
}

export interface CreateTaskRequest {
  workspace_id: string;
  playbook_key: string;
  input: string;
}

export interface CreateTaskResponse {
  task: {
    id: string;
    workspace_id: string;
    playbook_key: string;
    input: string;
    status: string;
    artifact_id: string | null;
  };
  events_url: string;
  stream_url: string;
}

export function createTaskPreview(request: TaskPreviewRequest) {
  return postJson<TaskPreviewRequest, TaskPreview>("/api/task-previews", request);
}

export function createTask(request: CreateTaskRequest) {
  return postJson<CreateTaskRequest, CreateTaskResponse>("/api/tasks", request);
}
