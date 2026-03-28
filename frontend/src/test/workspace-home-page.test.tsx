import { render, screen } from "@testing-library/react";
import { beforeEach, vi } from "vitest";

import { WorkspaceHomePage } from "../features/workspace-home/WorkspaceHomePage";

const fetchMock = vi.fn<typeof fetch>();

vi.stubGlobal("fetch", fetchMock);

describe("WorkspaceHomePage", () => {
  beforeEach(() => {
    fetchMock.mockReset();

    fetchMock.mockImplementation(async (input, init) => {
      const url = typeof input === "string" ? input : input.toString();
      const method = init?.method ?? "GET";

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
    render(<WorkspaceHomePage workspaceId="workspace-1" />);

    expect(await screen.findByRole("heading", { name: "Needs Attention" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Execution Overview" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Deliverables" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Team Snapshot" })).toBeInTheDocument();
  });
});
