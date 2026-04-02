export interface AssistantContextState {
  source: "workspace-assistant-dock";
  summary: string;
  actionLabel: string;
  targetKind: "task" | "deliverable" | "discussion";
  targetId: string;
}

function isTargetKind(value: unknown): value is AssistantContextState["targetKind"] {
  return value === "task" || value === "deliverable" || value === "discussion";
}

export function readAssistantContextState(state: unknown): AssistantContextState | null {
  if (!state || typeof state !== "object" || !("assistantContext" in state)) {
    return null;
  }

  const candidate = (state as { assistantContext?: unknown }).assistantContext;
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const context = candidate as Partial<AssistantContextState>;
  if (
    context.source !== "workspace-assistant-dock"
    || typeof context.summary !== "string"
    || typeof context.actionLabel !== "string"
    || !isTargetKind(context.targetKind)
    || typeof context.targetId !== "string"
  ) {
    return null;
  }

  return context as AssistantContextState;
}
