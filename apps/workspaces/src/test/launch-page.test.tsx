import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, vi } from "vitest";

import { renderAppAtRoute } from "./renderApp";

const fetchMock = vi.fn<typeof fetch>();

vi.stubGlobal("fetch", fetchMock);

describe("App", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    window.history.replaceState({}, "", "/");
  });

  it("redirects root into the account home default workspace", async () => {
    fetchMock.mockImplementation(async (input, init) => {
      const url = typeof input === "string" ? input : input.toString();
      const method = init?.method ?? "GET";

      if (url.endsWith("/api/account/home") && method === "GET") {
        return new Response(
          JSON.stringify({
            default_workspace_id: "workspace-2",
            workspaces: [
              {
                id: "workspace-1",
                title: "Default Workspace",
                root_path: "/workspace",
              },
              {
                id: "workspace-2",
                title: "Second Workspace",
                root_path: "/workspace-2",
              },
            ],
            waiting_on_me: [],
            recent_tasks: [],
            playbook_shortcuts: [],
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      throw new Error(`Unhandled request: ${method} ${url}`);
    });

    renderAppAtRoute("/");

    await waitFor(() => {
      expect(window.location.pathname).toBe("/workspaces/workspace-2");
    });
  });

  it("launches from /workspaces/:workspaceId/new-task without showing a workspace picker", async () => {
    fetchMock.mockImplementation(async (input, init) => {
      const url = typeof input === "string" ? input : input.toString();
      const method = init?.method ?? "GET";

      if (url.endsWith("/api/workspaces") && method === "GET") {
        return new Response(
          JSON.stringify([
            {
              id: "workspace-1",
              title: "Default Workspace",
              root_path: "/workspace",
            },
          ]),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      if (url.endsWith("/api/published-playbooks") && method === "GET") {
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }

      throw new Error(`Unhandled request: ${method} ${url}`);
    });

    renderAppAtRoute("/workspaces/workspace-1/new-task");

    expect(await screen.findByText("Choose a playbook")).toBeInTheDocument();
    expect(screen.queryByLabelText("Select workspace")).not.toBeInTheDocument();
  });

  it("creates a task from published playbook preview and redirects to the task route", async () => {
    let createTaskPreviewRequest: Record<string, unknown> | null = null;
    let createTaskRequest: Record<string, unknown> | null = null;

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

      if (url.endsWith("/api/published-playbooks") && method === "GET") {
        return new Response(
          JSON.stringify([
            {
              playbook_handle_id: "pb-1",
              playbook_version_id: "version-1",
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
        createTaskPreviewRequest = JSON.parse(String(init?.body ?? "{}")) as Record<
          string,
          unknown
        >;
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

      if (url.endsWith("/api/playbooks/fork") && method === "POST") {
        throw new Error(`Launch should not fork playbooks: ${method} ${url}`);
      }

      if (url.endsWith("/api/playbooks/pb-1/draft") && method === "PUT") {
        throw new Error(`Launch should not save drafts: ${method} ${url}`);
      }

      if (url.endsWith("/api/playbooks/pb-1/publish") && method === "POST") {
        throw new Error(`Launch should not publish playbooks: ${method} ${url}`);
      }

      if (url.endsWith("/api/tasks") && method === "POST") {
        createTaskRequest = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
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

      if (url.endsWith("/api/tasks") && method === "GET") {
        return new Response(
          JSON.stringify([
            {
              id: "task-1",
              workspace_id: "workspace-1",
              playbook_key: "总结资料",
              input: "Summarize notes",
              status: "running",
              artifact_id: "artifact-task-1-pending"
            }
          ]),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

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
              artifact_id: "artifact-task-1-pending"
            },
            plan: {
              steps: [
                "Scan markdown files in the selected workspace",
                "Draft a concise summary with key takeaways",
                "Write the final summary artifact to output/summary.md"
              ],
              current_step_index: 0,
              status: "running"
            },
            approvals: [],
            artifacts: [
              {
                id: "artifact-task-1-pending",
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

      throw new Error(`Unhandled request: ${method} ${url}`);
    });

    const user = userEvent.setup();

    renderAppAtRoute("/workspaces/workspace-1/new-task");

    await screen.findByText("Choose a playbook");

    await user.click(screen.getByRole("button", { name: "Summary" }));
    await user.type(screen.getByLabelText("Goal"), "Summarize notes");
    await user.click(screen.getByRole("button", { name: "Preview plan" }));

    await screen.findByText("Plan preview");

    await user.click(screen.getByRole("button", { name: "Start task" }));

    expect(createTaskPreviewRequest).toMatchObject({
      workspace_id: "workspace-1",
      playbook_handle_id: "pb-1",
      playbook_version_id: "version-1",
      input: "Summarize notes",
    });
    expect(createTaskRequest).toMatchObject({
      workspace_id: "workspace-1",
      playbook_handle_id: "pb-1",
      playbook_version_id: "version-1",
      input_payload: "Summarize notes",
    });

    await waitFor(() => {
      expect(window.location.pathname).toBe("/tasks/task-1");
    });
  });
});
