import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, vi } from "vitest";

import { renderAppAtRoute } from "./renderApp";

const fetchMock = vi.fn<typeof fetch>();
vi.stubGlobal("fetch", fetchMock);

describe("ApprovalsPage", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    window.history.replaceState({}, "", "/workspaces/workspace-1/approvals");
  });

  it("renders pending approvals queue and supports approve/reject actions", async () => {
    let approveCalled = false;
    let rejectCalled = false;

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

      if (url.endsWith("/api/workspaces/workspace-1/approvals") && method === "GET") {
        return new Response(
          JSON.stringify([
            {
              id: "approval-1",
              workspace_id: "workspace-1",
              task_id: "task-1",
              task_playbook_key: "总结资料",
              decision: "pending",
              comment: "Needs sign-off",
              status: "pending",
            },
          ]),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      if (url.endsWith("/api/workspaces/workspace-1/approvals/approval-1/decision") && method === "POST") {
        const payload = JSON.parse((init?.body as string | undefined) ?? "{}") as {
          decision?: string;
        };
        if (payload.decision === "approved") {
          approveCalled = true;
        }
        if (payload.decision === "rejected") {
          rejectCalled = true;
        }
        return new Response(
          JSON.stringify({
            id: "approval-1",
            workspace_id: "workspace-1",
            task_id: "task-1",
            task_playbook_key: "总结资料",
            decision: payload.decision ?? "pending",
            comment: "Needs sign-off",
            status: payload.decision === "approved" ? "approved" : "rejected",
          }),
          { status: 202, headers: { "content-type": "application/json" } },
        );
      }

      throw new Error(`Unhandled request: ${url}`);
    });

    const user = userEvent.setup();
    renderAppAtRoute();

    expect(await screen.findByRole("heading", { name: "Approvals" })).toBeInTheDocument();
    expect(screen.getByText("approval-1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reject" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Approve" }));
    await user.click(screen.getByRole("button", { name: "Reject" }));

    expect(approveCalled).toBe(true);
    expect(rejectCalled).toBe(true);
  });
});
