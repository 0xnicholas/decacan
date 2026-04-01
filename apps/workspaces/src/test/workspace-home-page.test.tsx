import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, vi } from "vitest";

import { renderAppAtRoute } from "./renderApp";

const fetchMock = vi.fn<typeof fetch>();

vi.stubGlobal("fetch", fetchMock);

describe("WorkspaceHomePage", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    window.history.replaceState({}, "", "/workspaces/workspace-1");

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
          ]),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        );
      }

      if (url.endsWith("/api/workspaces/workspace-1/home") && method === "GET") {
        return new Response(
          JSON.stringify({
            attention: [
              {
                id: "attention-1",
                title: "Legal copy sign-off pending",
                reason: "Final launch copy is waiting for approval before release.",
                severity: "high",
              },
            ],
            task_health: {
              running: 4,
              waiting_approval: 2,
              blocked: 1,
              completed_today: 9,
            },
            activity: [
              {
                id: "activity-1",
                message: "Summary rollout task moved to final QA.",
                relative_time: "5m ago",
              },
            ],
            deliverables: [
              {
                id: "deliverable-1",
                label: "Release Notes Draft",
                canonical_path: "output/release-notes.md",
                status: "reviewing",
              },
            ],
            team_snapshot: [
              {
                id: "member-1",
                name: "Ari",
                role: "Project Lead",
                focus: "Final milestone coordination",
                status: "online",
              },
            ],
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        );
      }

      throw new Error(`Unhandled request: ${method} ${url}`);
    });
  });

  it("renders the control-center panels on workspace home", async () => {
    renderAppAtRoute("/workspaces/workspace-1");

    expect(await screen.findByRole("heading", { name: "Needs Attention" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Execution Overview" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Deliverables" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Team Snapshot" })).toBeInTheDocument();
    expect(screen.getByText("Legal copy sign-off pending")).toBeInTheDocument();
    expect(screen.getByText(/Running: 4/)).toBeInTheDocument();
    const deliverablesPanel = screen.getByRole("region", { name: "Deliverables panel" });
    expect(within(deliverablesPanel).getByText(/Release Notes Draft/)).toBeInTheDocument();
    expect(
      within(deliverablesPanel).getByText(
        (_, element) =>
          element?.tagName.toLowerCase() === "li" &&
          (element.textContent?.includes("output/release-notes.md") ?? false),
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/Ari/)).toBeInTheDocument();
    expect(
      screen.queryByText("Content for this route will be implemented in later tasks."),
    ).not.toBeInTheDocument();
  });

  it("ignores stale home responses after switching workspaces", async () => {
    const user = userEvent.setup();

    let resolveWorkspace1Home: ((response: Response) => void) | null = null;

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

      if (url.endsWith("/api/workspaces/workspace-1/home") && method === "GET") {
        return new Promise<Response>((resolve) => {
          resolveWorkspace1Home = resolve;
        });
      }

      if (url.endsWith("/api/workspaces/workspace-2/home") && method === "GET") {
        return new Response(
          JSON.stringify({
            attention: [
              {
                id: "attention-2",
                title: "Workspace 2 launch checklist",
                reason: "Final launch checklist needs confirmation.",
                severity: "high",
              },
            ],
            task_health: {
              running: 1,
              waiting_approval: 0,
              blocked: 0,
              completed_today: 3,
            },
            activity: [],
            deliverables: [],
            team_snapshot: [],
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        );
      }

      throw new Error(`Unhandled request: ${method} ${url}`);
    });

    renderAppAtRoute("/workspaces/workspace-1");

    await screen.findByRole("option", { name: "Workspace 2" });
    await waitFor(() => {
      expect(resolveWorkspace1Home).not.toBeNull();
    });
    await user.selectOptions(screen.getByLabelText("Workspace switcher"), "workspace-2");

    (resolveWorkspace1Home as unknown as (response: Response) => void)?.(
      new Response(
        JSON.stringify({
          attention: [
            {
              id: "attention-1",
              title: "Workspace 1 stale payload",
              reason: "Stale data should not replace workspace 2.",
              severity: "high",
            },
          ],
          task_health: {
            running: 9,
            waiting_approval: 9,
            blocked: 9,
            completed_today: 9,
          },
          activity: [],
          deliverables: [],
          team_snapshot: [],
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );

    expect(await screen.findByText("Workspace 2 launch checklist")).toBeInTheDocument();
    expect(screen.queryByText("Workspace 1 stale payload")).not.toBeInTheDocument();
  });

  it("clears previous workspace payload while the next workspace loads", async () => {
    const user = userEvent.setup();

    let resolveWorkspace2Home: ((response: Response) => void) | null = null;

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

      if (url.endsWith("/api/workspaces/workspace-1/home") && method === "GET") {
        return new Response(
          JSON.stringify({
            attention: [
              {
                id: "attention-1",
                title: "Workspace 1 current payload",
                reason: "Workspace 1 data should be cleared on switch.",
                severity: "high",
              },
            ],
            task_health: {
              running: 1,
              waiting_approval: 0,
              blocked: 0,
              completed_today: 1,
            },
            activity: [],
            deliverables: [],
            team_snapshot: [],
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        );
      }

      if (url.endsWith("/api/workspaces/workspace-2/home") && method === "GET") {
        return new Promise<Response>((resolve) => {
          resolveWorkspace2Home = resolve;
        });
      }

      throw new Error(`Unhandled request: ${method} ${url}`);
    });

    renderAppAtRoute("/workspaces/workspace-1");

    expect(await screen.findByText("Workspace 1 current payload")).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Workspace switcher"), "workspace-2");

    expect(await screen.findByText("Loading workspace control center…")).toBeInTheDocument();
    expect(screen.queryByText("Workspace 1 current payload")).not.toBeInTheDocument();

    (resolveWorkspace2Home as unknown as (response: Response) => void)?.(
      new Response(
        JSON.stringify({
          attention: [
            {
              id: "attention-2",
              title: "Workspace 2 loaded payload",
              reason: "Workspace 2 load completed.",
              severity: "high",
            },
          ],
          task_health: {
            running: 2,
            waiting_approval: 0,
            blocked: 0,
            completed_today: 1,
          },
          activity: [],
          deliverables: [],
          team_snapshot: [],
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );

    expect(await screen.findByText("Workspace 2 loaded payload")).toBeInTheDocument();
  });
});
