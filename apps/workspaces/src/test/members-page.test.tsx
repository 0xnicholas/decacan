import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, vi } from "vitest";

import { App } from "../app/App";

const fetchMock = vi.fn<typeof fetch>();
vi.stubGlobal("fetch", fetchMock);

// Mock member data matching the backend API response
const mockMembers = [
  {
    id: "member-1",
    user_id: "user-1",
    name: "Ari Mitchell",
    email: "ari@example.com",
    role: "admin",
    invited_by: null,
    joined_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "member-2",
    user_id: "user-2",
    name: "Maya Chen",
    email: "maya@example.com",
    role: "editor",
    invited_by: null,
    joined_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "member-3",
    user_id: "user-3",
    name: "Sam Park",
    email: "sam@example.com",
    role: "viewer",
    invited_by: null,
    joined_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

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

      if (url.includes("/api/workspaces/workspace-1/members") && method === "GET") {
        return new Response(
          JSON.stringify(mockMembers),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      throw new Error(`Unhandled request: ${url}`);
    });

    render(<App />);

    expect(await screen.findByRole("heading", { name: "Members" })).toBeInTheDocument();
    
    // Wait for members to load
    await waitFor(() => {
      expect(screen.getByText("Ari Mitchell")).toBeInTheDocument();
    }, { timeout: 1000 });
    
    expect(screen.getByText("Maya Chen")).toBeInTheDocument();
    expect(screen.getByText("Sam Park")).toBeInTheDocument();
  });

  it("shows member roles", async () => {
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

      if (url.includes("/api/workspaces/workspace-1/members") && method === "GET") {
        return new Response(
          JSON.stringify(mockMembers),
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
    
    // Check for roles (matching new MemberRole type)
    expect(screen.getByText("admin")).toBeInTheDocument();
    expect(screen.getByText("editor")).toBeInTheDocument();
    expect(screen.getByText("viewer")).toBeInTheDocument();
  });

  it("shows member emails", async () => {
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

      if (url.includes("/api/workspaces/workspace-1/members") && method === "GET") {
        return new Response(
          JSON.stringify(mockMembers),
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
    
    // Check for emails
    expect(screen.getByText("ari@example.com")).toBeInTheDocument();
    expect(screen.getByText("maya@example.com")).toBeInTheDocument();
    expect(screen.getByText("sam@example.com")).toBeInTheDocument();
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

      if (url.includes("/api/workspaces/error-workspace/members") && method === "GET") {
        return new Response(
          JSON.stringify({ error: "internal_error", message: "Failed to load members" }),
          { status: 500, headers: { "content-type": "application/json" } },
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
      expect(screen.getByText(/failed/i)).toBeInTheDocument();
    }, { timeout: 1000 });
    
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    
    // Click retry button
    await user.click(screen.getByRole("button", { name: "Retry" }));
    
    // Should still show error after retry (since we're still on error workspace)
    await waitFor(() => {
      expect(screen.getByText(/failed/i)).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it("opens invite modal when clicking invite button", async () => {
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

      if (url.includes("/api/workspaces/workspace-1/members") && method === "GET") {
        return new Response(
          JSON.stringify(mockMembers),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      throw new Error(`Unhandled request: ${url}`);
    });

    const user = userEvent.setup();

    render(<App />);

    expect(await screen.findByRole("heading", { name: "Members" })).toBeInTheDocument();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText("Loading members...")).not.toBeInTheDocument();
    }, { timeout: 1000 });
    
    // Click invite button
    await user.click(screen.getByRole("button", { name: "Invite Member" }));
    
    // Modal should open
    expect(await screen.findByRole("heading", { name: "Invite Member" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });
});
