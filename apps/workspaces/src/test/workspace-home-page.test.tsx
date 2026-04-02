import { screen, waitFor } from "@testing-library/react";
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

      if (url.endsWith("/api/published-playbooks") && method === "GET") {
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }

      throw new Error(`Unhandled request: ${method} ${url}`);
    });
  });

  it("renders the resume-first workbench regions in priority order", async () => {
    renderAppAtRoute("/workspaces/workspace-1");

    expect(await screen.findByRole("heading", { name: "Resume Work" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Current Work" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "My Queue" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Team Activity" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Discussion" })).toBeInTheDocument();

    const headings = screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent);

    expect(headings.slice(0, 5)).toEqual([
      "Resume Work",
      "Current Work",
      "My Queue",
      "Team Activity",
      "Discussion",
    ]);

    expect(screen.getByText("Legal copy sign-off pending")).toBeInTheDocument();
    expect(screen.getByText(/Running: 4/)).toBeInTheDocument();
    expect(screen.getAllByText(/Release Notes Draft/)).toHaveLength(2);
    expect(screen.getByText(/Ari/)).toBeInTheDocument();
    expect(
      screen.queryByText("Content for this route will be implemented in later tasks."),
    ).not.toBeInTheDocument();
  });

  it("renders the workspace assistant dock with suggested actions", async () => {
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
            attention: [],
            task_health: {
              running: 1,
              waiting_approval: 0,
              blocked: 0,
              completed_today: 2,
            },
            activity: [],
            deliverables: [
              {
                id: "deliverable-1",
                label: "Release Notes Draft",
                canonical_path: "output/release-notes.md",
                status: "reviewing",
              },
            ],
            team_snapshot: [],
            assistant: {
              summary: "Catch up on the launch blockers before you queue more work.",
              suggested_actions: [
                {
                  id: "action-task-1",
                  label: "Open launch blocker task",
                  target_kind: "task",
                  target_id: "task-42",
                },
                {
                  id: "action-deliverable-1",
                  label: "Review release notes draft",
                  target_kind: "deliverable",
                  target_id: "deliverable-1",
                },
              ],
            },
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        );
      }

      if (url.endsWith("/api/published-playbooks") && method === "GET") {
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }

      throw new Error(`Unhandled request: ${method} ${url}`);
    });

    renderAppAtRoute("/workspaces/workspace-1");

    expect(await screen.findByRole("heading", { name: "Workspace Assistant" })).toBeInTheDocument();
    expect(
      screen.getByText("Catch up on the launch blockers before you queue more work."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open launch blocker task" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Review release notes draft" })).toBeInTheDocument();
  });

  it("shows an explicit empty state for team activity when no activity or team data exists", async () => {
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
            attention: [],
            task_health: {
              running: 0,
              waiting_approval: 0,
              blocked: 0,
              completed_today: 0,
            },
            activity: [],
            deliverables: [],
            team_snapshot: [],
            discussion: [],
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

    expect(await screen.findByRole("heading", { name: "Team Activity" })).toBeInTheDocument();
    expect(screen.getByText("No team activity yet")).toBeInTheDocument();
    expect(
      screen.getByText("Activity updates and teammate focus will appear here as work starts moving."),
    ).toBeInTheDocument();
  });

  it("turns the resume strip into a start surface when there is no current work", async () => {
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
            attention: [],
            task_health: {
              running: 0,
              waiting_approval: 0,
              blocked: 0,
              completed_today: 0,
            },
            activity: [],
            deliverables: [],
            team_snapshot: [],
            discussion: [],
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

    expect(await screen.findByText("Start new work")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Launch task" })).toBeInTheDocument();
    expect(screen.getByText("Nothing is waiting in your queue")).toBeInTheDocument();
  });

  it("navigates to new-task when launch task is clicked from the start surface", async () => {
    const user = userEvent.setup();

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
            attention: [],
            task_health: {
              running: 0,
              waiting_approval: 0,
              blocked: 0,
              completed_today: 0,
            },
            activity: [],
            deliverables: [],
            team_snapshot: [],
            discussion: [],
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        );
      }

      if (url.endsWith("/api/published-playbooks") && method === "GET") {
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }

      throw new Error(`Unhandled request: ${method} ${url}`);
    });

    renderAppAtRoute("/workspaces/workspace-1");

    await user.click(await screen.findByRole("button", { name: "Launch task" }));

    expect(window.location.pathname).toBe("/workspaces/workspace-1/new-task");
  });

  it("keeps the workbench visible with local fallback guidance when the home request fails", async () => {
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
        return new Response(JSON.stringify({ message: "boom" }), {
          status: 500,
          headers: { "content-type": "application/json" },
        });
      }

      throw new Error(`Unhandled request: ${method} ${url}`);
    });

    renderAppAtRoute("/workspaces/workspace-1");

    expect(await screen.findByText("Start new work")).toBeInTheDocument();
    expect(screen.getByText("Assistant unavailable")).toBeInTheDocument();
    expect(screen.getByText("No discussion yet")).toBeInTheDocument();
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

    expect(await screen.findByText("Loading workspace workbench…")).toBeInTheDocument();
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
