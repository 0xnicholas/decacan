import { useEffect, useMemo, useState } from "react";

import type { AssistantContextState } from "../../../entities/workbench/assistantHandoff";
import type { WorkspaceWorkbenchModel } from "../../../entities/workbench/types";

type AssistantModel = WorkspaceWorkbenchModel["assistant"];
type SuggestedAction = AssistantModel["suggested_actions"][number];

export interface AssistantDockAction extends SuggestedAction {
  canOpenTask: boolean;
  handoff: AssistantContextState | null;
  isSelected: boolean;
}

export function useAssistantDock(assistant: AssistantModel) {
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedActionId(null);
  }, [assistant.summary, assistant.suggested_actions]);

  const selectedAction = useMemo(
    () => assistant.suggested_actions.find((action) => action.id === selectedActionId) ?? null,
    [assistant.suggested_actions, selectedActionId],
  );

  const actions = useMemo<AssistantDockAction[]>(
    () =>
      assistant.suggested_actions.map((action) => {
        const canOpenTask = action.target_kind === "task" && action.target_id.length > 0;
        return {
          ...action,
          canOpenTask,
          handoff: canOpenTask
            ? {
                source: "workspace-assistant-dock",
                summary: assistant.summary,
                actionLabel: action.label,
                targetKind: action.target_kind,
                targetId: action.target_id,
              }
            : null,
          isSelected: action.id === selectedActionId,
        };
      }),
    [assistant.summary, assistant.suggested_actions, selectedActionId],
  );

  return {
    actions,
    selectedAction,
    state: selectedAction ? "contextual" : assistant.state,
    summary: assistant.summary,
    setSelectedActionId,
  };
}
