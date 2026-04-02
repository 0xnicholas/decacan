import type { WorkspaceHomeData } from "../workspace-home/types";
import { defaultAssistantDock, defaultWorkbenchTemplate } from "./defaultTemplate";
import {
  requiredWorkbenchSlotOrder,
  type AssistantDockModel,
  type RequiredWorkbenchSlotOrder,
  type WorkbenchTemplate,
  type WorkspaceWorkbenchModel,
} from "./types";

function isRequiredWorkbenchSlotOrder(
  slotOrder: readonly string[],
): slotOrder is RequiredWorkbenchSlotOrder {
  return (
    slotOrder.length === requiredWorkbenchSlotOrder.length &&
    slotOrder.every((slot, index) => slot === requiredWorkbenchSlotOrder[index])
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isSuggestedAction(
  action: unknown,
): action is AssistantDockModel["suggested_actions"][number] {
  return (
    isRecord(action) &&
    typeof action.id === "string" &&
    typeof action.label === "string" &&
    (action.target_kind === "task" ||
      action.target_kind === "deliverable" ||
      action.target_kind === "discussion") &&
    typeof action.target_id === "string"
  );
}

function normalizeTemplateLabels(
  rawLabels: Partial<Record<"task" | "deliverable" | "approval", string>> | undefined,
) {
  if (!rawLabels || typeof rawLabels !== "object") {
    return { ...defaultWorkbenchTemplate.labels };
  }

  return {
    task: typeof rawLabels.task === "string" ? rawLabels.task : defaultWorkbenchTemplate.labels.task,
    deliverable:
      typeof rawLabels.deliverable === "string"
        ? rawLabels.deliverable
        : defaultWorkbenchTemplate.labels.deliverable,
    approval:
      typeof rawLabels.approval === "string"
        ? rawLabels.approval
        : defaultWorkbenchTemplate.labels.approval,
  };
}

function normalizeTemplate(rawTemplate: WorkspaceHomeData["template"]): WorkbenchTemplate {
  if (!isRecord(rawTemplate)) {
    return {
      ...defaultWorkbenchTemplate,
      slot_order: [...requiredWorkbenchSlotOrder] as WorkbenchTemplate["slot_order"],
      labels: { ...defaultWorkbenchTemplate.labels },
    };
  }

  const slotOrder =
    Array.isArray(rawTemplate.slot_order) && isRequiredWorkbenchSlotOrder(rawTemplate.slot_order)
    ? rawTemplate.slot_order
    : requiredWorkbenchSlotOrder;

  return {
    id: typeof rawTemplate.id === "string" ? rawTemplate.id : defaultWorkbenchTemplate.id,
    title: typeof rawTemplate.title === "string" ? rawTemplate.title : defaultWorkbenchTemplate.title,
    slot_order: [...slotOrder] as WorkbenchTemplate["slot_order"],
    primary_cta_label:
      typeof rawTemplate.primary_cta_label === "string"
        ? rawTemplate.primary_cta_label
        : defaultWorkbenchTemplate.primary_cta_label,
    labels: normalizeTemplateLabels(rawTemplate.labels),
  };
}

function normalizeAssistant(rawAssistant: WorkspaceHomeData["assistant"]): AssistantDockModel {
  if (!isRecord(rawAssistant)) {
    return {
      ...defaultAssistantDock,
      suggested_actions: [...defaultAssistantDock.suggested_actions],
    };
  }

  return {
    state: "ambient",
    summary:
      typeof rawAssistant.summary === "string" ? rawAssistant.summary : defaultAssistantDock.summary,
    suggested_actions: Array.isArray(rawAssistant.suggested_actions)
      ? rawAssistant.suggested_actions.filter(isSuggestedAction).map((action) => ({ ...action }))
      : [...defaultAssistantDock.suggested_actions],
  };
}

export function normalizeWorkspaceHome(
  workspaceId: string,
  raw: WorkspaceHomeData,
): WorkspaceWorkbenchModel {
  const template = normalizeTemplate(raw.template);
  const primaryDeliverable = raw.deliverables[0];
  const hasCurrentWork =
    raw.deliverables.length > 0 ||
    raw.task_health.running > 0 ||
    raw.task_health.waiting_approval > 0 ||
    raw.task_health.blocked > 0;

  return {
    workspace_id: workspaceId,
    template,
    resume: {
      has_current_work: hasCurrentWork,
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
