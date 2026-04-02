import type { WorkspaceHomeData } from "../workspace-home/types";
import { defaultAssistantDock, defaultWorkbenchTemplate } from "./defaultTemplate";
import type { AssistantDockModel, WorkbenchTemplate, WorkspaceWorkbenchModel } from "./types";

function normalizeTemplate(rawTemplate: WorkspaceHomeData["template"]): WorkbenchTemplate {
  if (!rawTemplate) {
    return defaultWorkbenchTemplate;
  }

  return {
    id: rawTemplate.id,
    title: rawTemplate.title,
    slot_order: rawTemplate.slot_order as WorkbenchTemplate["slot_order"],
    primary_cta_label: rawTemplate.primary_cta_label ?? defaultWorkbenchTemplate.primary_cta_label,
    labels: {
      ...defaultWorkbenchTemplate.labels,
      ...rawTemplate.labels,
    },
  };
}

function normalizeAssistant(rawAssistant: WorkspaceHomeData["assistant"]): AssistantDockModel {
  if (!rawAssistant) {
    return defaultAssistantDock;
  }

  return {
    state: "ambient",
    summary: rawAssistant.summary,
    suggested_actions: rawAssistant.suggested_actions,
  };
}

export function normalizeWorkspaceHome(
  workspaceId: string,
  raw: WorkspaceHomeData,
): WorkspaceWorkbenchModel {
  const template = normalizeTemplate(raw.template);
  const primaryDeliverable = raw.deliverables[0];

  return {
    workspace_id: workspaceId,
    template,
    resume: {
      primary_label: template.primary_cta_label,
      title: primaryDeliverable?.label ?? "Resume current work",
      detail:
        primaryDeliverable?.canonical_path ??
        "Open the most relevant task, artifact, or queue item for this workspace.",
      target_task_id: undefined,
    },
    current_work: {
      task_health: raw.task_health,
      deliverables: raw.deliverables,
    },
    queue: {
      items: raw.attention,
    },
    activity: raw.activity,
    discussion: raw.discussion ?? [],
    team_snapshot: raw.team_snapshot,
    assistant: normalizeAssistant(raw.assistant),
  };
}
