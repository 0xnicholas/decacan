import { describe, expect, it } from "vitest";

import type { WorkspaceHomeData } from "../entities/workspace-home/types";
import { normalizeWorkspaceHome } from "../entities/workbench/normalizeWorkspaceHome";

const legacyPayload: WorkspaceHomeData = {
  attention: [
    {
      id: "attention-1",
      title: "Legal sign-off pending",
      reason: "Final copy is waiting for review.",
      severity: "high",
    },
  ],
  task_health: {
    running: 4,
    waiting_approval: 2,
    blocked: 1,
    completed_today: 9,
  },
  activity: [
    {
      id: "activity-1",
      message: "Campaign moved to final QA.",
      relative_time: "5m ago",
    },
  ],
  deliverables: [
    {
      id: "deliverable-1",
      label: "Release Notes Draft",
      canonical_path: "output/release-notes.md",
      status: "reviewing",
    },
  ],
  team_snapshot: [
    {
      id: "member-1",
      name: "Ari",
      role: "Project Lead",
      focus: "Final milestone coordination",
      status: "online",
    },
  ],
};

describe("normalizeWorkspaceHome", () => {
  it("produces the required phase-1 slots from the legacy home payload", () => {
    const model = normalizeWorkspaceHome("workspace-1", legacyPayload);

    expect(model.template.slot_order).toEqual([
      "resume",
      "current_work_primary",
      "queue_secondary",
      "collaboration_left",
      "collaboration_right",
      "assistant_dock",
    ]);
    expect(model.resume.primary_label).toContain("Resume");
    expect(model.queue.items).toHaveLength(1);
  });

  it("falls back to the default template and assistant summary when config is missing", () => {
    const model = normalizeWorkspaceHome("workspace-1", {
      ...legacyPayload,
      template: undefined,
      assistant: undefined,
    });

    expect(model.template.id).toBe("default-workbench");
    expect(model.assistant.state).toBe("ambient");
    expect(model.assistant.summary).toContain("Resume");
  });
});
