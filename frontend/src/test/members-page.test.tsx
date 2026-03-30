import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, vi } from "vitest";

import { App } from "../app/App";

const fetchMock = vi.fn<typeof fetch>();
vi.stubGlobal("fetch", fetchMock);

describe("MembersPage", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    window.history.replaceState({}, "", "/workspaces/workspace-1/members");
  });

  it("renders workspace members list", async () => {
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

    expect(await screen.findByRole("heading", { name: "Members" })).toBeInTheDocument();
    
    // Wait for 300ms mock delay + rendering
    await waitFor(() => {
      expect(screen.getByText("Ari Mitchell")).toBeInTheDocument();
    }, { timeout: 1000 });
    
    expect(screen.getByText("Maya Chen")).toBeInTheDocument();
    expect(screen.getByText("Sam Park")).toBeInTheDocument();
  });

  it("shows member roles and workload", async () => {
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

    expect(await screen.findByRole("heading", { name: "Members" })).toBeInTheDocument();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText("Loading members...")).not.toBeInTheDocument();
    }, { timeout: 1000 });
    
    // Check for roles
    expect(screen.getByText("admin")).toBeInTheDocument();
    expect(screen.getByText("lead")).toBeInTheDocument();
    expect(screen.getByText("executor")).toBeInTheDocument();
    
    // Check for workload - use getAllByText since there are multiple members
    expect(screen.getAllByText("active tasks").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("pending approvals").length).toBeGreaterThanOrEqual(1);
  });

  it("shows recent activity for members", async () => {
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

    expect(await screen.findByRole("heading", { name: "Members" })).toBeInTheDocument();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText("Loading members...")).not.toBeInTheDocument();
    }, { timeout: 1000 });
    
    // Check for recent activity text
    expect(screen.getByText(/Created task TASK-001/)).toBeInTheDocument();
    expect(screen.getByText(/Completed task TASK-002/)).toBeInTheDocument();
    expect(screen.getByText(/Requested approval/)).toBeInTheDocument();
  });

  it("handles errors with retry", async () => {
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
    window.history.replaceState({}, "", "/workspaces/error-workspace/members");
    render(<App />);

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText("Failed to load members")).toBeInTheDocument();
    }, { timeout: 1000 });
    
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    
    // Click retry button
    await user.click(screen.getByRole("button", { name: "Retry" }));
    
    // Should still show error after retry (since we're still on error workspace)
    await waitFor(() => {
      expect(screen.getByText("Failed to load members")).toBeInTheDocument();
    }, { timeout: 1000 });
  });
});
