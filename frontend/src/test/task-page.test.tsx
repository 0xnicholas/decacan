import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, vi } from "vitest";

import { App } from "../app/App";

const fetchMock = vi.fn<typeof fetch>();

vi.stubGlobal("fetch", fetchMock);

describe("TaskPage", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    window.history.replaceState({}, "", "/tasks/task-1");
  });

  it("submits an approval decision and opens the primary artifact preview", async () => {
    let approvalStatus = "pending";

    fetchMock.mockImplementation(async (input, init) => {
      const url = typeof input === "string" ? input : input.toString();
      const method = init?.method ?? "GET";

      if (url.endsWith("/api/tasks/task-1") && method === "GET") {
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
                decision: approvalStatus,
                comment: approvalStatus === "approved" ? "Proceed" : null,
                status: approvalStatus
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

      if (url.endsWith("/api/approvals/approval-1/decision") && method === "POST") {
        approvalStatus = "approved";
        return new Response(
          JSON.stringify({
            id: "approval-1",
            task_id: "task-1",
            decision: "approved",
            comment: "Proceed",
            status: "approved"
          }),
          { status: 202, headers: { "content-type": "application/json" } },
        );
      }

      if (url.endsWith("/api/artifacts/artifact-1/content") && method === "GET") {
        return new Response(
          JSON.stringify({
            artifact_id: "artifact-1",
            content_type: "text/markdown",
            content: "## Summary preview"
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      throw new Error(`Unhandled request: ${url}`);
    });

    const user = userEvent.setup();

    render(<App />);

    await user.click(await screen.findByRole("button", { name: "Approve" }));

    expect(await screen.findByText(/approved/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Preview output/summary.md" }));

    expect(await screen.findByText("## Summary preview")).toBeInTheDocument();
  });
});
