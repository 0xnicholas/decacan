import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, vi } from "vitest";

import { renderAppAtRoute } from "./renderApp";

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
              owner: "Ari",
            },
          ]),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      throw new Error(`Unhandled request: ${url}`);
    });

    renderAppAtRoute();

    expect(await screen.findByRole("heading", { name: "Deliverables" })).toBeInTheDocument();
    expect(screen.getAllByText("needs_review")[0]).toBeInTheDocument();
    expect(screen.getByText("Ari")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Preview output/release-notes.md" }),
    ).toBeInTheDocument();
  });

  it("renders deliverable detail review actions and right-rail tabs with history", async () => {
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

      if (
        url.endsWith("/api/workspaces/workspace-1/deliverables/deliverable-1")
        && method === "GET"
      ) {
        return new Response(
          JSON.stringify({
            deliverable: {
              id: "deliverable-1",
              workspace_id: "workspace-1",
              task_id: "task-1",
              label: "release-notes",
              canonical_path: "output/release-notes.md",
              status: "needs_review",
              task_status: "succeeded",
              owner: "Ari",
            },
            linked_task: {
              id: "task-1",
              playbook_key: "总结资料",
            },
            review_actions: ["approve", "request_revision"],
            review_history: [
              {
                id: "review-1",
                action: "submitted",
                note: "Ready for reviewer",
              },
            ],
            task_playbook_key: "总结资料",
            task_input: "Summarize notes",
            task_status_summary: "Task completed",
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      if (
        url.endsWith("/api/workspaces/workspace-1/deliverables/deliverable-1/review")
        && method === "POST"
      ) {
        return new Response(null, { status: 202 });
      }

      if (url.endsWith("/api/artifacts/deliverable-1/content") && method === "GET") {
        return new Response(
          JSON.stringify({
            artifact_id: "deliverable-1",
            content_type: "text/markdown",
            content: "# Release notes",
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      throw new Error(`Unhandled request: ${url}`);
    });

    window.history.replaceState({}, "", "/workspaces/workspace-1/deliverables/deliverable-1");

    const user = userEvent.setup();
    renderAppAtRoute();

    expect(await screen.findByRole("tab", { name: "Agent" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Context" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "History" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Request revision" })).toBeInTheDocument();
    expect(screen.getByText(/Task:\s*task-1/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Approve" }));
  });

  it("shows list load error instead of silently rendering empty state", async () => {
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
        return new Response(null, { status: 500 });
      }

      throw new Error(`Unhandled request: ${url}`);
    });

    renderAppAtRoute();

    expect(await screen.findByText("Failed to load deliverables")).toBeInTheDocument();
  });

  it("shows explicit not-found state for missing deliverable detail", async () => {
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

      if (
        url.endsWith("/api/workspaces/workspace-1/deliverables/missing-deliverable")
        && method === "GET"
      ) {
        return new Response(null, { status: 404 });
      }

      throw new Error(`Unhandled request: ${url}`);
    });

    window.history.replaceState({}, "", "/workspaces/workspace-1/deliverables/missing-deliverable");
    renderAppAtRoute();

    expect(await screen.findByText("Deliverable not found")).toBeInTheDocument();
  });

  it("renders status and source-task filters for deliverables", async () => {
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
              owner: "Ari",
            },
          ]),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      throw new Error(`Unhandled request: ${url}`);
    });

    const user = userEvent.setup();
    renderAppAtRoute();

    expect(await screen.findByLabelText("Deliverables status filter")).toBeInTheDocument();
    expect(screen.getByLabelText("Deliverables source task filter")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Deliverables status filter"), "needs_review");
    await user.selectOptions(screen.getByLabelText("Deliverables source task filter"), "task-1");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/workspaces/workspace-1/deliverables?status=needs_review",
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/workspaces/workspace-1/deliverables?status=needs_review&task_id=task-1",
    );
  });
});
