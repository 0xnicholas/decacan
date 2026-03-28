import type { TaskAgentMessage, TaskInstructionAction } from "../../entities/task/types";

interface AgentRailProps {
  instructionActions: TaskInstructionAction[];
  isSubmittingKey: string | null;
  messages: TaskAgentMessage[];
  onRunInstruction: (instructionKey: string) => void;
}

export function AgentRail({
  instructionActions,
  isSubmittingKey,
  messages,
  onRunInstruction,
}: AgentRailProps) {
  return (
    <section className="task-panel" aria-label="Agent collaboration">
      <p className="section-kicker">Task Agent</p>
      <p className="panel-copy">
        Use structured prompts to request status, risk, or next-step guidance for this task.
      </p>
      <div className="artifact-drawer-actions">
        {instructionActions.map((action) => (
          <button
            key={action.key}
            type="button"
            className="secondary-button"
            disabled={isSubmittingKey === action.key}
            onClick={() => {
              onRunInstruction(action.key);
            }}
          >
            {isSubmittingKey === action.key ? "Requesting..." : action.label}
          </button>
        ))}
      </div>
      <ul className="timeline-list">
        {messages.map((message) => (
          <li key={message.id}>
            <strong>{message.summary}</strong>
            <span className="panel-copy">{message.detail}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
