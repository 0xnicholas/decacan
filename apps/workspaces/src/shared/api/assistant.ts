import type {
  AssistantSessionResponse,
  CreateAssistantSessionRequest,
} from "../../entities/assistant/types";
import { postJson } from "./client";

export async function createAssistantSession(
  request: CreateAssistantSessionRequest,
): Promise<AssistantSessionResponse> {
  return postJson<CreateAssistantSessionRequest, AssistantSessionResponse>(
    "/api/assistant-sessions",
    request,
  );
}
