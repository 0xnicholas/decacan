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

interface AssistantContextNoticeProps {
  context: AssistantContextState;
}

export function AssistantContextNotice({ context }: AssistantContextNoticeProps) {
  return (
    <section className="task-panel" aria-label="Assistant handoff">
      <p className="section-kicker">Assistant Handoff</p>
      <h2 className="text-base font-semibold">Opened from Workspace Assistant</h2>
      <p className="panel-copy">{context.summary}</p>
      <p className="panel-copy">
        <strong>Suggested action:</strong> {context.actionLabel}
      </p>
    </section>
  );
}
