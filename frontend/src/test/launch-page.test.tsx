import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, vi } from "vitest";

import { App } from "../app/App";

const fetchMock = vi.fn<typeof fetch>();

vi.stubGlobal("fetch", fetchMock);

describe("App", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    window.history.replaceState({}, "", "/");
  });

  it("creates a task from preview and redirects to the task route", async () => {
    fetchMock.mockImplementation(async (input, init) => {
      const url = typeof input === "string" ? input : input.toString();
      const method = init?.method ?? "GET";

      if (url.endsWith("/api/workspaces") && method === "GET") {
        return new Response(
          JSON.stringify([
            {
              id: "workspace-1",
              title: "Default Workspace",
              root_path: "/workspace"
            }
          ]),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      if (url.endsWith("/api/playbooks") && method === "GET") {
        return new Response(
          JSON.stringify([
            {
              key: "总结资料",
              title: "Summary",
              summary: "Create a concise summary from markdown notes.",
              mode_label: "标准模式",
              expected_output_label: "Summary document",
              expected_output_path: "output/summary.md"
            }
          ]),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      if (url.endsWith("/api/task-previews") && method === "POST") {
        return new Response(
          JSON.stringify({
            preview_id: "preview-1",
            plan_steps: [
              "Scan markdown files in the selected workspace",
              "Draft a concise summary with key takeaways",
              "Write the final summary artifact to output/summary.md"
            ],
            expected_artifact_label: "Summary document",
            expected_artifact_path: "output/summary.md",
            will_auto_start: true
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      if (url.endsWith("/api/tasks") && method === "POST") {
        return new Response(
          JSON.stringify({
            task: {
              id: "task-1",
              workspace_id: "workspace-1",
              playbook_key: "总结资料",
              input: "Summarize notes",
              status: "accepted",
              artifact_id: "artifact-task-1-pending"
            },
            events_url: "/api/tasks/task-1/events",
            stream_url: "/api/tasks/task-1/events/stream"
          }),
          { status: 202, headers: { "content-type": "application/json" } },
        );
      }

      throw new Error(`Unhandled request: ${method} ${url}`);
    });

    const user = userEvent.setup();

    render(<App />);

    await screen.findByText("Choose a playbook");

    await user.click(screen.getByRole("button", { name: "Summary" }));
    await user.type(screen.getByLabelText("Goal"), "Summarize notes");
    await user.click(screen.getByRole("button", { name: "Preview plan" }));

    await screen.findByText("Plan preview");

    await user.click(screen.getByRole("button", { name: "Start task" }));

    await waitFor(() => {
      expect(window.location.pathname).toBe("/tasks/task-1");
    });
  });
});
