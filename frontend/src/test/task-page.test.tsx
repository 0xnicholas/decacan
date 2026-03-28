import { render, screen } from "@testing-library/react";
import { beforeEach, vi } from "vitest";

import { App } from "../app/App";

const fetchMock = vi.fn<typeof fetch>();

vi.stubGlobal("fetch", fetchMock);

describe("TaskPage", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    window.history.replaceState({}, "", "/tasks/task-1");
  });

  it("renders task header, plan, approvals, and artifact panels from the aggregate payload", async () => {
    fetchMock.mockImplementation(async (input) => {
      const url = typeof input === "string" ? input : input.toString();

      if (url.endsWith("/api/tasks/task-1")) {
        return new Response(
          JSON.stringify({
            task: {
              id: "task-1",
              workspace_id: "workspace-1",
              playbook_key: "总结资料",
              input: "Summarize notes",
              status: "running",
              status_summary: "Task is running",
              artifact_id: "artifact-1"
            },
            plan: {
              steps: [
                "Scan markdown files in the selected workspace",
                "Draft a concise summary with key takeaways",
                "Write the final summary artifact to output/summary.md"
              ],
              current_step_index: 1,
              status: "running"
            },
            approvals: [
              {
                id: "approval-1",
                task_id: "task-1",
                decision: "pending",
                comment: null,
                status: "pending"
              }
            ],
            artifacts: [
              {
                id: "artifact-1",
                task_id: "task-1",
                label: "primary-output",
                canonical_path: "output/summary.md",
                status: "pending"
              }
            ],
            timeline: [
              {
                event_id: "event-1",
                task_id: "task-1",
                sequence: 1,
                event_type: "task.accepted",
                snapshot_version: 1,
                message: "Task accepted by API"
              }
            ]
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      throw new Error(`Unhandled request: ${url}`);
    });

    render(<App />);

    expect(await screen.findByText("Running")).toBeInTheDocument();
    expect(screen.getByText("Plan")).toBeInTheDocument();
    expect(screen.getByText("Approvals")).toBeInTheDocument();
    expect(screen.getByText("Artifacts")).toBeInTheDocument();
  });
});
