import type { WorkspaceWorkbenchModel } from "../../entities/workbench/types";
import type { AssistantContextState } from "../../entities/workbench/assistantHandoff";
import { EmptyState } from "../../shared/ui";
import { useAssistantDock } from "./useAssistantDock";

interface WorkspaceAssistantDockProps {
  assistant: WorkspaceWorkbenchModel["assistant"];
  onOpenTask: (taskId: string, context: AssistantContextState) => void;
}

export function WorkspaceAssistantDock({
  assistant,
  onOpenTask,
}: WorkspaceAssistantDockProps) {
  const { actions, selectedAction, state, summary, setSelectedActionId } = useAssistantDock(assistant);
  const trimmedSummary = summary.trim();
  const isUnavailable = trimmedSummary.length === 0 && actions.length === 0;

  return (
    <aside className="task-panel h-fit" aria-label="Workspace assistant">
      <p className="section-kicker">{state === "contextual" ? "Focused Guidance" : "Assistant"}</p>
      <h3 className="text-lg font-semibold">Workspace Assistant</h3>
      {isUnavailable ? (
        <EmptyState
          title="Assistant unavailable"
          message="Use the workspace panels directly while assistant guidance is unavailable."
        />
      ) : (
        <>
          <p className="panel-copy">{trimmedSummary}</p>
          {selectedAction ? (
            <p className="panel-copy">
              <strong>Focus:</strong> {selectedAction.label}
            </p>
          ) : null}
        </>
      )}
      {!isUnavailable && actions.length ? (
        <div className="artifact-drawer-actions">
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              className="secondary-button"
              aria-pressed={action.isSelected}
              onClick={() => {
                setSelectedActionId(action.id);
                if (action.canOpenTask && action.handoff) {
                  onOpenTask(action.target_id, action.handoff);
                }
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
      {!isUnavailable && !actions.length ? (
        <p className="panel-copy">Suggested actions will appear here.</p>
      ) : null}
    </aside>
  );
}
