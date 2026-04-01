import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, vi } from "vitest";

import { renderAppAtRoute } from "./renderApp";

const fetchMock = vi.fn<typeof fetch>();

vi.stubGlobal("fetch", fetchMock);

describe("TasksPage", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    window.history.replaceState({}, "", "/workspaces/workspace-1/tasks");
  });

  it("switches between list and board views for tasks", async () => {
    fetchMock.mockImplementation(async (input, init) => {
      const url = typeof input === "string" ? input : input.toString();
      const method = init?.method ?? "GET";

      if (url.endsWith("/api/workspaces") && method === "GET") {
        return new Response(
          JSON.stringify([
            {
              id: "workspace-1",
              title: "Workspace 1",
              root_path: "/tmp/workspace-1",
            },
          ]),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      if (url.endsWith("/api/workspaces/workspace-1/tasks") && method === "GET") {
        return new Response(
          JSON.stringify([
            {
              id: "task-3",
              workspace_id: "workspace-1",
              playbook_key: "总结资料",
              input: "Prepare release summary",
              status: "waiting_approval",
              status_summary: "Waiting for approval before final output",
              artifact_id: "artifact-3",
            },
          ]),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      throw new Error(`Unhandled request: ${url}`);
    });

    const user = userEvent.setup();
    renderAppAtRoute("/workspaces/workspace-1/tasks");

    expect(await screen.findByRole("tab", { name: "List" })).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Board" }));
    expect(screen.getByText("Waiting Approval")).toBeInTheDocument();
  });
});
