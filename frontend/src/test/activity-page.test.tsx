import { render, screen, waitFor } from "@testing-library/react";
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

      throw new Error(`Unhandled request: ${url}`);
    });

    render(<App />);

    expect(await screen.findByRole("heading", { name: "Activity" })).toBeInTheDocument();
    
    // Wait for 300ms mock delay + rendering
    await waitFor(() => {
      expect(screen.getByText("Ari created task TASK-001")).toBeInTheDocument();
    }, { timeout: 1000 });
    
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

      throw new Error(`Unhandled request: ${url}`);
    });

    const user = userEvent.setup();
    render(<App />);

    expect(await screen.findByRole("heading", { name: "Activity" })).toBeInTheDocument();
    
    // First wait for loading to start
    expect(await screen.findByText("Loading activity...")).toBeInTheDocument();
    
    // Then wait for initial load to complete (all 4 events)
    await waitFor(() => {
      expect(screen.queryByText("Loading activity...")).not.toBeInTheDocument();
    }, { timeout: 3000 });
    
    expect(screen.getByText("Ari created task TASK-001")).toBeInTheDocument();
    
    // All 4 mock events should be visible initially
    expect(screen.getByText("Maya completed task TASK-002")).toBeInTheDocument();
    expect(screen.getByText("Sam requested approval APPROVAL-001")).toBeInTheDocument();
    expect(screen.getByText("Alex created deliverable DELIVERABLE-001")).toBeInTheDocument();

    // Apply filter
    await user.selectOptions(screen.getByLabelText("Filter by event type"), "task_created");

    // Wait for filtered load to complete (filter triggers new load)
    await waitFor(() => {
      expect(screen.queryByText("Loading activity...")).not.toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Should only show task_created events (Ari's task)
    expect(screen.getByText("Ari created task TASK-001")).toBeInTheDocument();
    expect(screen.queryByText("Maya completed task TASK-002")).not.toBeInTheDocument();
    expect(screen.queryByText("Sam requested approval APPROVAL-001")).not.toBeInTheDocument();
    expect(screen.queryByText("Alex created deliverable DELIVERABLE-001")).not.toBeInTheDocument();
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

      throw new Error(`Unhandled request: ${url}`);
    });

    const user = userEvent.setup();
    render(<App />);

    expect(await screen.findByRole("heading", { name: "Activity" })).toBeInTheDocument();

    // Select a type that doesn't exist in mock data
    await user.selectOptions(screen.getByLabelText("Filter by event type"), "member_joined");

    // Wait for empty state to appear
    await waitFor(() => {
      expect(screen.getByText("No activity found")).toBeInTheDocument();
    }, { timeout: 1000 });
    
    expect(screen.getByText("Adjust your filters or check back later")).toBeInTheDocument();
  });

  it("handles error with retry", async () => {
    fetchMock.mockImplementation(async (input, init) => {
      const url = typeof input === "string" ? input : input.toString();
      const method = init?.method ?? "GET";

      if (url.endsWith("/api/workspaces") && method === "GET") {
        return new Response(
          JSON.stringify([
            { id: "error-workspace", title: "Error Workspace", root_path: "/tmp/error" },
          ]),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      throw new Error(`Unhandled request: ${url}`);
    });

    const user = userEvent.setup();
    
    // Navigate to error workspace
    window.history.replaceState({}, "", "/workspaces/error-workspace/activity");
    render(<App />);

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText("Failed to load activity")).toBeInTheDocument();
    }, { timeout: 1000 });
    
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });
});