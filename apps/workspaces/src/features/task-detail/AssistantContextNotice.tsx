import type { AssistantContextState } from "../../entities/workbench/assistantHandoff";

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
