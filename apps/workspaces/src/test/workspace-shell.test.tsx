import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, vi } from "vitest";

import { renderAppAtRoute } from "./renderApp";

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
    renderAppAtRoute("/workspaces/workspace-1");

    expect(await screen.findByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Tasks")).toBeInTheDocument();
    const deliverableMatches = screen.getAllByText("Deliverables");
    expect(deliverableMatches.some((node) => node.tagName === "BUTTON")).toBeTruthy();
    expect(screen.getByRole("button", { name: "New Task" })).toBeInTheDocument();
  });

  it("rejects unknown workspace sections", async () => {
    renderAppAtRoute("/workspaces/workspace-1/unknown");

    expect(await screen.findByText("Route not available")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New Task" })).toBeInTheDocument();
  });

  it("rejects workspace sections with extra path segments", async () => {
    renderAppAtRoute("/workspaces/workspace-1/tasks/extra/overflow");

    const placeholders = await screen.findAllByText("Content for this route will be implemented in later tasks.");
    expect(placeholders.length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "New Task" })).toBeInTheDocument();
  });

  it("updates the URL when section nav buttons are clicked", async () => {
    const user = userEvent.setup();
    renderAppAtRoute("/workspaces/workspace-1");

    await screen.findByRole("button", { name: "Home" });

    await user.click(screen.getByRole("button", { name: "Tasks" }));
    expect(window.location.pathname).toBe("/workspaces/workspace-1/tasks");

    await user.click(screen.getByRole("button", { name: "Deliverables" }));
    expect(window.location.pathname).toBe("/workspaces/workspace-1/deliverables");
  });

  it("updates the URL when switching workspaces and preserves the current section", async () => {
    const user = userEvent.setup();
    renderAppAtRoute("/workspaces/workspace-1/tasks");

    await screen.findByRole("button", { name: "Tasks" });
    await user.selectOptions(screen.getByLabelText("Workspace switcher"), "workspace-2");

    expect(window.location.pathname).toBe("/workspaces/workspace-2/tasks");
  });

  it("shows an account hub entry in the top bar", async () => {
    renderAppAtRoute("/workspaces/workspace-1");

    expect(await screen.findByRole("link", { name: "Account Hub" })).toHaveAttribute(
      "href",
      "http://localhost:3001",
    );
  });
});
