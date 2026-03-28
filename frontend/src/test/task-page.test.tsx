import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, vi } from "vitest";

import { App } from "../app/App";

const fetchMock = vi.fn<typeof fetch>();

class FakeEventSource {
  static instances: FakeEventSource[] = [];

  onmessage: ((event: MessageEvent<string>) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  readonly url: string;

  constructor(url: string) {
    this.url = url;
    FakeEventSource.instances.push(this);
  }

  close() {}

  emitMessage(data: unknown) {
    this.onmessage?.(new MessageEvent("message", { data: JSON.stringify(data) }));
  }

  emitError() {
    this.onerror?.(new Event("error"));
  }
}

vi.stubGlobal("fetch", fetchMock);
vi.stubGlobal("EventSource", FakeEventSource as unknown as typeof EventSource);

describe("TaskPage", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    FakeEventSource.instances = [];
    window.history.replaceState({}, "", "/tasks/task-1");
  });

  it("submits an approval decision and opens the primary artifact preview", async () => {
    let approvalStatus = "pending";

    fetchMock.mockImplementation(async (input, init) => {
      const url = typeof input === "string" ? input : input.toString();
      const method = init?.method ?? "GET";

      if (url.endsWith("/api/tasks/task-1") && method === "GET") {
        return new Response(
          JSON.stringify({
            task: {
              id: "task-1",
              workspace_id: "workspace-1",
              playbook_key: "总结资料",
              input: "Summarize notes",
              status: "running",
              status_summary: "Task is running",
              artifact_id: "artifact-1"
            },
            plan: {
              steps: [
                "Scan markdown files in the selected workspace",
                "Draft a concise summary with key takeaways",
                "Write the final summary artifact to output/summary.md"
              ],
              current_step_index: 1,
              status: "running"
            },
            approvals: [
              {
                id: "approval-1",
                task_id: "task-1",
                decision: approvalStatus,
                comment: approvalStatus === "approved" ? "Proceed" : null,
                status: approvalStatus
              }
            ],
            artifacts: [
              {
                id: "artifact-1",
                task_id: "task-1",
                label: "primary-output",
                canonical_path: "output/summary.md",
                status: "pending"
              }
            ],
            timeline: [
              {
                event_id: "event-1",
                task_id: "task-1",
                sequence: 1,
                event_type: "task.accepted",
                snapshot_version: 1,
                message: "Task accepted by API"
              }
            ]
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      if (url.endsWith("/api/approvals/approval-1/decision") && method === "POST") {
        approvalStatus = "approved";
        return new Response(
          JSON.stringify({
            id: "approval-1",
            task_id: "task-1",
            decision: "approved",
            comment: "Proceed",
            status: "approved"
          }),
          { status: 202, headers: { "content-type": "application/json" } },
        );
      }

      if (url.endsWith("/api/artifacts/artifact-1/content") && method === "GET") {
        return new Response(
          JSON.stringify({
            artifact_id: "artifact-1",
            content_type: "text/markdown",
            content: "## Summary preview"
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      throw new Error(`Unhandled request: ${url}`);
    });

    const user = userEvent.setup();

    render(<App />);

    await user.click(await screen.findByRole("button", { name: "Approve" }));

    expect(await screen.findByText(/approved/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Preview output/summary.md" }));

    expect(await screen.findByText("## Summary preview")).toBeInTheDocument();
  });

  it("renders a summary-first task context sidebar", async () => {
    fetchMock.mockImplementation(async (input, init) => {
      const url = typeof input === "string" ? input : input.toString();
      const method = init?.method ?? "GET";

      if (url.endsWith("/api/tasks/task-1") && method === "GET") {
        return new Response(
          JSON.stringify({
            task: {
              id: "task-1",
              workspace_id: "workspace-1",
              playbook_key: "总结资料",
              input: "Summarize notes",
              status: "waiting_approval",
              status_summary: "Need your approval before writing the final artifact",
              artifact_id: "artifact-1"
            },
            plan: {
              steps: [
                "Scan markdown files in the selected workspace",
                "Draft a concise summary with key takeaways",
                "Write the final summary artifact to output/summary.md"
              ],
              current_step_index: 1,
              status: "waiting_approval"
            },
            approvals: [],
            artifacts: [
              {
                id: "artifact-1",
                task_id: "task-1",
                label: "primary-output",
                canonical_path: "output/summary.md",
                status: "pending"
              }
            ],
            timeline: [
              {
                event_id: "event-2",
                task_id: "task-1",
                sequence: 2,
                event_type: "task.waiting_approval",
                snapshot_version: 2,
                message: "Approval requested before final write"
              }
            ]
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      throw new Error(`Unhandled request: ${url}`);
    });

    render(<App />);

    const sidebar = await screen.findByRole("complementary", { name: "Task context" });

    expect(within(sidebar).getByText("Workspace")).toBeInTheDocument();
    expect(within(sidebar).getByText("workspace-1")).toBeInTheDocument();
    expect(within(sidebar).getByText("Playbook")).toBeInTheDocument();
    expect(within(sidebar).getByText("Status")).toBeInTheDocument();
    expect(
      within(sidebar).getByText("Need your approval before writing the final artifact"),
    ).toBeInTheDocument();
    expect(within(sidebar).getByText("Step 2 of 3")).toBeInTheDocument();
    expect(within(sidebar).getByRole("button", { name: "Open output/summary.md" })).toBeInTheDocument();
  });

  it("shows live activity and refreshes the task snapshot from stream events", async () => {
    let currentTask = {
      task: {
        id: "task-1",
        workspace_id: "workspace-1",
        playbook_key: "总结资料",
        input: "Summarize notes",
        status: "running",
        status_summary: "Task is running",
        artifact_id: "artifact-1"
      },
      plan: {
        steps: [
          "Scan markdown files in the selected workspace",
          "Draft a concise summary with key takeaways",
          "Write the final summary artifact to output/summary.md"
        ],
        current_step_index: 1,
        status: "running"
      },
      approvals: [],
      artifacts: [
        {
          id: "artifact-1",
          task_id: "task-1",
          label: "primary-output",
          canonical_path: "output/summary.md",
          status: "pending"
        }
      ],
      timeline: [
        {
          event_id: "event-1",
          task_id: "task-1",
          sequence: 1,
          event_type: "task.running",
          snapshot_version: 1,
          message: "Task accepted by API"
        }
      ]
    };

    fetchMock.mockImplementation(async (input, init) => {
      const url = typeof input === "string" ? input : input.toString();
      const method = init?.method ?? "GET";

      if (url.endsWith("/api/tasks/task-1") && method === "GET") {
        return new Response(JSON.stringify(currentTask), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }

      throw new Error(`Unhandled request: ${url}`);
    });

    render(<App />);

    expect(await screen.findByText("Last event: Task accepted by API")).toBeInTheDocument();
    expect(screen.getByText("Live")).toBeInTheDocument();
    expect(FakeEventSource.instances[0]?.url).toBe("/api/tasks/task-1/events/stream");

    currentTask = {
      ...currentTask,
      task: {
        ...currentTask.task,
        status: "waiting_approval",
        status_summary: "Task is waiting for approval"
      },
      timeline: [
        ...currentTask.timeline,
        {
          event_id: "event-2",
          task_id: "task-1",
          sequence: 2,
          event_type: "task.waiting_approval",
          snapshot_version: 2,
          message: "Approval requested before final write"
        }
      ]
    };

    await act(async () => {
      FakeEventSource.instances[0]?.emitMessage({
        event_id: "event-2",
        task_id: "task-1",
        sequence: 2,
        event_type: "task.waiting_approval",
        snapshot_version: 2,
        message: "Approval requested before final write"
      });
    });

    await waitFor(() => {
      expect(screen.getByText("Last event: Approval requested before final write")).toBeInTheDocument();
    });
    expect(screen.getAllByText("Task is waiting for approval")).toHaveLength(2);

    await act(async () => {
      FakeEventSource.instances[0]?.emitError();
    });

    await waitFor(() => {
      expect(screen.getByText("Reconnecting")).toBeInTheDocument();
    });
  });
});
