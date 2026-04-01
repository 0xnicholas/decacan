import { render, screen } from "@testing-library/react";
import { beforeEach, vi } from "vitest";

import { App } from "../app/App";

const fetchMock = vi.fn<typeof fetch>();
vi.stubGlobal("fetch", fetchMock);

describe("InboxPage", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    window.history.replaceState({}, "", "/inbox");
  });

  it("renders waiting-on-me inbox sections", async () => {
    fetchMock.mockImplementation(async (input, init) => {
      const url = typeof input === "string" ? input : input.toString();
      const method = init?.method ?? "GET";

      if (url.endsWith("/api/inbox") && method === "GET") {
        return new Response(
          JSON.stringify({
            waiting_on_me: [
              {
                id: "approval-1",
                workspace_id: "workspace-1",
                task_id: "task-1",
                title: "Approve summary deliverable",
                kind: "approval",
              },
            ],
            recently_resolved: [],
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      if (url.endsWith("/api/workspaces") && method === "GET") {
        return new Response(
          JSON.stringify([
            { id: "workspace-1", title: "Workspace 1", root_path: "/tmp/workspace-1" },
          ]),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      if (url.endsWith("/api/playbooks") && method === "GET") {
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }

      throw new Error(`Unhandled request: ${url}`);
    });

    render(<App />);

    expect(await screen.findByRole("heading", { name: "Inbox" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Waiting on me" })).toBeInTheDocument();
    expect(screen.getByText("Approve summary deliverable")).toBeInTheDocument();
  });
});
