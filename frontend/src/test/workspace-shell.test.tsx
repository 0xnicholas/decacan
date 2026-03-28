import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, vi } from "vitest";

import { App } from "../app/App";

const fetchMock = vi.fn<typeof fetch>();

vi.stubGlobal("fetch", fetchMock);

describe("WorkspaceShell", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockImplementation(async (input, init) => {
      const url = typeof input === "string" ? input : input.toString();
      const method = init?.method ?? "GET";

      if (url.endsWith("/api/workspaces") && method === "GET") {
        return new Response(
          JSON.stringify([
            {
              id: "workspace-1",
              title: "Workspace 1",
              root_path: "/workspace-1",
            },
            {
              id: "workspace-2",
              title: "Workspace 2",
              root_path: "/workspace-2",
            },
          ]),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        );
      }

      if (url.endsWith("/api/playbooks") && method === "GET") {
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }

      throw new Error(`Unhandled request: ${method} ${url}`);
    });
    window.history.replaceState({}, "", "/");
  });

  it("renders the full workspace shell around workspace routes", async () => {
    window.history.replaceState({}, "", "/workspaces/workspace-1");

    render(<App />);

    expect(await screen.findByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Tasks")).toBeInTheDocument();
    expect(screen.getByText("Deliverables")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New Task" })).toBeInTheDocument();
  });

  it("rejects unknown workspace sections", async () => {
    window.history.replaceState({}, "", "/workspaces/workspace-1/unknown");

    render(<App />);

    expect(await screen.findByText("Choose a playbook")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "New Task" })).not.toBeInTheDocument();
  });

  it("rejects workspace sections with extra path segments", async () => {
    window.history.replaceState({}, "", "/workspaces/workspace-1/tasks/extra");

    render(<App />);

    expect(await screen.findByText("Choose a playbook")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "New Task" })).not.toBeInTheDocument();
  });

  it("updates the URL when section nav buttons are clicked", async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, "", "/workspaces/workspace-1");

    render(<App />);

    await screen.findByRole("button", { name: "Home" });

    await user.click(screen.getByRole("button", { name: "Tasks" }));
    expect(window.location.pathname).toBe("/workspaces/workspace-1/tasks");

    await user.click(screen.getByRole("button", { name: "Deliverables" }));
    expect(window.location.pathname).toBe("/workspaces/workspace-1/deliverables");
  });

  it("updates the URL when switching workspaces and preserves the current section", async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, "", "/workspaces/workspace-1/tasks");

    render(<App />);

    await screen.findByRole("button", { name: "Tasks" });
    await user.selectOptions(screen.getByLabelText("Workspace switcher"), "workspace-2");

    expect(window.location.pathname).toBe("/workspaces/workspace-2/tasks");
  });
});
