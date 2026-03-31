import type { TaskDetail, TaskListItem } from "../../entities/task/types";
import { getJson, postJson } from "./client";

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
  playbook_handle_id: string;
  playbook_version_id: string;
  input_payload: string;
}

export interface CreateTaskResponse {
  task: {
    id: string;
    workspace_id: string;
    playbook_key: string;
    input: string;
    status: string;
    status_summary?: string;
    artifact_id: string | null;
  };
  events_url: string;
  stream_url: string;
}

export interface ApprovalDecisionRequest {
  decision: string;
  comment: string | null;
}

export interface RetryTaskRequest {
  note: string;
}

export interface TaskInstructionRequest {
  instruction_key: string;
}

export interface TaskInstructionResponse {
  message: {
    id: string;
    task_id: string;
    role: "agent" | "operator";
    summary: string;
    detail: string;
  };
}

export function createTaskPreview(request: TaskPreviewRequest) {
  return postJson<TaskPreviewRequest, TaskPreview>("/api/task-previews", request);
}

export function createTask(request: CreateTaskRequest) {
  return postJson<CreateTaskRequest, CreateTaskResponse>("/api/tasks", request);
}

export function listTasks() {
  return getJson<TaskListItem[]>("/api/tasks");
}

export function listMyTasks() {
  return getJson<TaskListItem[]>("/api/me/tasks");
}

export function listWorkspaceTasks(workspaceId: string) {
  return getJson<TaskListItem[]>(`/api/workspaces/${workspaceId}/tasks`);
}

export function getTaskDetail(taskId: string, workspaceId?: string) {
  const path = workspaceId
    ? `/api/workspaces/${workspaceId}/tasks/${taskId}`
    : `/api/tasks/${taskId}`;
  return getJson<TaskDetail>(path);
}

export function taskEventsStreamPath(taskId: string, workspaceId?: string) {
  return workspaceId
    ? `/api/workspaces/${workspaceId}/tasks/${taskId}/events/stream`
    : `/api/tasks/${taskId}/events/stream`;
}

export function decideApproval(approvalId: string, request: ApprovalDecisionRequest) {
  return postJson<ApprovalDecisionRequest, unknown>(
    `/api/approvals/${approvalId}/decision`,
    request,
  );
}

export function retryTask(taskId: string, request: RetryTaskRequest) {
  return postJson<RetryTaskRequest, unknown>(`/api/tasks/${taskId}/retry`, request);
}

export function sendTaskInstruction(
  taskId: string,
  request: TaskInstructionRequest,
  workspaceId?: string,
) {
  const path = workspaceId
    ? `/api/workspaces/${workspaceId}/tasks/${taskId}/instructions`
    : `/api/tasks/${taskId}/instructions`;
  return postJson<TaskInstructionRequest, TaskInstructionResponse>(
    path,
    request,
  );
}
