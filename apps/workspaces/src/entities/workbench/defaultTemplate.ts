import {
  requiredWorkbenchSlotOrder,
  type AssistantDockModel,
  type WorkbenchTemplate,
} from "./types";

export const defaultWorkbenchTemplate: WorkbenchTemplate = {
  id: "default-workbench",
  title: "Workspace Workbench",
  slot_order: requiredWorkbenchSlotOrder,
  primary_cta_label: "Resume Work",
  labels: {
    task: "Task",
    deliverable: "Deliverable",
    approval: "Approval",
  },
};

export const defaultAssistantDock: AssistantDockModel = {
  state: "ambient",
  summary: "Resume the most recent work item or review what changed in this workspace.",
  suggested_actions: [],
};
