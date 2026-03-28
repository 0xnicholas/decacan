import { render, screen } from "@testing-library/react";
import { beforeEach, vi } from "vitest";

import { App } from "../app/App";

const fetchMock = vi.fn<typeof fetch>();

vi.stubGlobal("fetch", fetchMock);

describe("DeliverablesPage", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    window.history.replaceState({}, "", "/workspaces/workspace-1/deliverables");
  });

  it("renders first-class deliverables with review status and preview call-to-action", async () => {
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

      if (url.endsWith("/api/workspaces/workspace-1/deliverables") && method === "GET") {
        return new Response(
          JSON.stringify([
            {
              id: "deliverable-1",
              workspace_id: "workspace-1",
              task_id: "task-1",
              label: "release-notes",
              canonical_path: "output/release-notes.md",
              status: "needs_review",
              task_status: "succeeded",
            },
          ]),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      throw new Error(`Unhandled request: ${url}`);
    });

    render(<App />);

    expect(await screen.findByRole("heading", { name: "Deliverables" })).toBeInTheDocument();
    expect(screen.getByText("needs_review")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Preview output/release-notes.md" }),
    ).toBeInTheDocument();
  });
});
