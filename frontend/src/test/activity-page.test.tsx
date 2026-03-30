import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, vi } from "vitest";

import { App } from "../app/App";

const fetchMock = vi.fn<typeof fetch>();
vi.stubGlobal("fetch", fetchMock);

describe("ActivityPage", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    window.history.replaceState({}, "", "/workspaces/workspace-1/activity");
  });

  it("renders activity feed with events", async () => {
    fetchMock.mockImplementation(async (input, init) => {
      const url = typeof input === "string" ? input : input.toString();
      const method = init?.method ?? "GET";

      if (url.endsWith("/api/workspaces") && method === "GET") {
        return new Response(
          JSON.stringify([
            { id: "workspace-1", title: "Workspace 1", root_path: "/tmp/workspace-1" },
          ]),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      if (url.endsWith("/api/workspaces/workspace-1/activity") && method === "GET") {
        return new Response(
          JSON.stringify([
            {
              id: "event-1",
              type: "task_created",
              actor: "Ari",
              target: "TASK-001",
              timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            },
            {
              id: "event-2",
              type: "task_completed",
              actor: "Maya",
              target: "TASK-002",
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            },
          ]),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      throw new Error(`Unhandled request: ${url}`);
    });

    render(<App />);

    expect(await screen.findByRole("heading", { name: "Activity" })).toBeInTheDocument();
    expect(screen.getByText("Ari created task TASK-001")).toBeInTheDocument();
    expect(screen.getByText("Maya completed task TASK-002")).toBeInTheDocument();
    expect(screen.getByText("5m ago")).toBeInTheDocument();
    expect(screen.getByText("2h ago")).toBeInTheDocument();
  });

  it("filters activity by type", async () => {
    fetchMock.mockImplementation(async (input, init) => {
      const url = typeof input === "string" ? input : input.toString();
      const method = init?.method ?? "GET";

      if (url.endsWith("/api/workspaces") && method === "GET") {
        return new Response(
          JSON.stringify([
            { id: "workspace-1", title: "Workspace 1", root_path: "/tmp/workspace-1" },
          ]),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      if (url.endsWith("/api/workspaces/workspace-1/activity") && method === "GET") {
        return new Response(
          JSON.stringify([
            {
              id: "event-1",
              type: "task_created",
              actor: "Ari",
              target: "TASK-001",
              timestamp: new Date().toISOString(),
            },
            {
              id: "event-2",
              type: "task_completed",
              actor: "Maya",
              target: "TASK-002",
              timestamp: new Date().toISOString(),
            },
          ]),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      throw new Error(`Unhandled request: ${url}`);
    });

    const user = userEvent.setup();
    render(<App />);

    expect(await screen.findByRole("heading", { name: "Activity" })).toBeInTheDocument();
    expect(screen.getByLabelText("Filter by event type")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Filter by event type"), "task_created");

    expect(fetchMock).toHaveBeenCalledWith("/api/workspaces/workspace-1/activity?type=task_created");
  });

  it("shows empty state when filter returns no results", async () => {
    fetchMock.mockImplementation(async (input, init) => {
      const url = typeof input === "string" ? input : input.toString();
      const method = init?.method ?? "GET";

      if (url.endsWith("/api/workspaces") && method === "GET") {
        return new Response(
          JSON.stringify([
            { id: "workspace-1", title: "Workspace 1", root_path: "/tmp/workspace-1" },
          ]),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      if (url.endsWith("/api/workspaces/workspace-1/activity") && method === "GET") {
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }

      throw new Error(`Unhandled request: ${url}`);
    });

    render(<App />);

    expect(await screen.findByText("No activity found")).toBeInTheDocument();
    expect(screen.getByText("Adjust your filters or check back later")).toBeInTheDocument();
  });

  it("handles error with retry", async () => {
    fetchMock.mockImplementation(async (input, init) => {
      const url = typeof input === "string" ? input : input.toString();
      const method = init?.method ?? "GET";

      if (url.endsWith("/api/workspaces") && method === "GET") {
        return new Response(
          JSON.stringify([
            { id: "workspace-1", title: "Workspace 1", root_path: "/tmp/workspace-1" },
          ]),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      if (url.endsWith("/api/workspaces/workspace-1/activity") && method === "GET") {
        return new Response(null, { status: 500 });
      }

      throw new Error(`Unhandled request: ${url}`);
    });

    const user = userEvent.setup();
    render(<App />);

    expect(await screen.findByText("Failed to load activity")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();

    fetchMock.mockImplementation(async (input, init) => {
      const url = typeof input === "string" ? input : input.toString();
      const method = init?.method ?? "GET";

      if (url.endsWith("/api/workspaces") && method === "GET") {
        return new Response(
          JSON.stringify([
            { id: "workspace-1", title: "Workspace 1", root_path: "/tmp/workspace-1" },
          ]),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      if (url.endsWith("/api/workspaces/workspace-1/activity") && method === "GET") {
        return new Response(
          JSON.stringify([
            {
              id: "event-1",
              type: "task_created",
              actor: "Ari",
              target: "TASK-001",
              timestamp: new Date().toISOString(),
            },
          ]),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      throw new Error(`Unhandled request: ${url}`);
    });

    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(await screen.findByText("Ari created task TASK-001")).toBeInTheDocument();
  });
});
