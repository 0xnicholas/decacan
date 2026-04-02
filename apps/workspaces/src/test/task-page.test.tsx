import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes, MemoryRouter, useNavigate, useParams } from "react-router-dom";
import { beforeEach, vi } from "vitest";
import { ThemeProvider } from "@decacan/ui";

import { TaskPage } from "../features/task-detail/TaskPage";
import { renderAppAtRoute } from "./renderApp";

const fetchMock = vi.fn<typeof fetch>();
const writeTextMock = vi.fn();

class FakeEventSource {
  static instances: FakeEventSource[] = [];
  private listeners = new Map<string, Array<(event: MessageEvent<string>) => void>>();

  onmessage: ((event: MessageEvent<string>) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  readonly url: string;

  constructor(url: string) {
    this.url = url;
    FakeEventSource.instances.push(this);
  }

  close() {}

  addEventListener(type: string, listener: (event: MessageEvent<string>) => void) {
    const existing = this.listeners.get(type) ?? [];
    this.listeners.set(type, [...existing, listener]);
  }

  emitMessage(data: unknown) {
    this.onmessage?.(new MessageEvent("message", { data: JSON.stringify(data) }));
  }

  emitNamedMessage(type: string, data: unknown) {
    const event = new MessageEvent(type, { data: JSON.stringify(data) });
    for (const listener of this.listeners.get(type) ?? []) {
      listener(event);
    }
  }

  emitError() {
    this.onerror?.(new Event("error"));
  }
}

vi.stubGlobal("fetch", fetchMock);
vi.stubGlobal("EventSource", FakeEventSource as unknown as typeof EventSource);

function TaskPageRouteWrapper() {
  const { taskId, workspaceId } = useParams();
  return workspaceId && taskId ? <TaskPage taskId={taskId} workspaceId={workspaceId} /> : null;
}

function TaskPageNavigationHarness() {
  const navigate = useNavigate();

  return (
    <>
      <button
        type="button"
        onClick={() => {
          navigate("/workspaces/workspace-1/tasks/task-1", {
            state: {
              assistantContext: {
                source: "workspace-assistant-dock",
                summary: "Catch up on the launch blocker before you queue more work.",
                actionLabel: "Open launch blocker task",
                targetKind: "task",
                targetId: "task-1",
              },
            },
          });
        }}
      >
        Open task 1 with assistant context
      </button>
      <button
        type="button"
        onClick={() => {
          navigate("/workspaces/workspace-1/tasks/task-2");
        }}
      >
        Open task 2 without assistant context
      </button>
      <Routes>
        <Route path="/workspaces/:workspaceId/tasks/:taskId" element={<TaskPageRouteWrapper />} />
      </Routes>
    </>
  );
}

describe("TaskPage", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    writeTextMock.mockReset();
    FakeEventSource.instances = [];
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: writeTextMock,
      },
    });
    window.history.replaceState({}, "", "/tasks/task-1");
  });

  it("renders an agent rail with agent, context, and history tabs on task detail", async () => {
    fetchMock.mockImplementation(async (input, init) => {
      const url = typeof input === "string" ? input : input.toString();
      const method = init?.method ?? "GET";

      if (url.endsWith("/api/workspaces/workspace-1/tasks/task-1") && method === "GET") {
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
            approvals: [],
            artifacts: [],
            timeline: []
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      if (url.endsWith("/api/workspaces/workspace-1/tasks") && method === "GET") {
        return new Response(
          JSON.stringify([
            {
              id: "task-1",
              workspace_id: "workspace-1",
              playbook_key: "总结资料",
              input: "Summarize notes",
              status: "running",
              artifact_id: "artifact-1"
            }
          ]),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      if (url.endsWith("/api/tasks") && method === "GET") {
        throw new Error("Global task list should not be fetched for workspace-scoped task detail");
      }

      if (url.endsWith("/api/workspaces") && method === "GET") {
        return new Response(
          JSON.stringify([{ id: "workspace-1", title: "Workspace 1", root_path: "/tmp/workspace-1" }]),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      throw new Error(`Unhandled request: ${url}`);
    });

    window.history.replaceState({}, "", "/workspaces/workspace-1/tasks/task-1");

    renderAppAtRoute();

    expect(await screen.findByRole("tab", { name: "Agent" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Context" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "History" })).toBeInTheDocument();
    await waitFor(() => {
      expect(FakeEventSource.instances[0]?.url).toBe(
        "/api/workspaces/workspace-1/tasks/task-1/events/stream",
      );
    });
  });

  it("opens task detail in agent mode when assistant context is handed off in route state", async () => {
    fetchMock.mockImplementation(async (input, init) => {
      const url = typeof input === "string" ? input : input.toString();
      const method = init?.method ?? "GET";

      if (url.endsWith("/api/workspaces/workspace-1/tasks/task-1") && method === "GET") {
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
              steps: ["Scan markdown files"],
              current_step_index: 0,
              status: "running"
            },
            approvals: [],
            artifacts: [],
            timeline: [],
            collaboration: {
              agent_messages: [],
              instruction_actions: [],
            }
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      if (url.endsWith("/api/workspaces/workspace-1/tasks") && method === "GET") {
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }

      if (url.endsWith("/api/workspaces") && method === "GET") {
        return new Response(
          JSON.stringify([{ id: "workspace-1", title: "Workspace 1", root_path: "/tmp/workspace-1" }]),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      throw new Error(`Unhandled request: ${url}`);
    });

    window.history.replaceState(
      {
        usr: {
          assistantContext: {
            source: "workspace-assistant-dock",
            summary: "Catch up on the launch blocker before you queue more work.",
            actionLabel: "Open launch blocker task",
            targetKind: "task",
            targetId: "task-1",
          },
        },
      },
      "",
      "/workspaces/workspace-1/tasks/task-1",
    );

    renderAppAtRoute();

    const agentTab = await screen.findByRole("tab", { name: "Agent" });
    const contextTab = screen.getByRole("tab", { name: "Context" });

    expect(agentTab).toHaveAttribute("aria-selected", "true");
    expect(contextTab).toHaveAttribute("aria-selected", "false");
    expect(screen.getByText("Opened from Workspace Assistant")).toBeInTheDocument();
    expect(
      screen.getByText("Catch up on the launch blocker before you queue more work."),
    ).toBeInTheDocument();
    expect(screen.getByText("Open launch blocker task")).toBeInTheDocument();
  });

  it("re-syncs the default rail tab when assistant context or task id changes", async () => {
    fetchMock.mockImplementation(async (input, init) => {
      const url = typeof input === "string" ? input : input.toString();
      const method = init?.method ?? "GET";

      if (url.endsWith("/api/workspaces/workspace-1/tasks/task-1") && method === "GET") {
        return new Response(
          JSON.stringify({
            task: {
              id: "task-1",
              workspace_id: "workspace-1",
              playbook_key: "总结资料",
              input: "Summarize notes",
              status: "running",
              status_summary: "Task 1 is running",
              artifact_id: "artifact-1",
            },
            plan: {
              steps: ["Scan markdown files"],
              current_step_index: 0,
              status: "running",
            },
            approvals: [],
            artifacts: [],
            timeline: [],
            collaboration: {
              agent_messages: [],
              instruction_actions: [],
            },
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      if (url.endsWith("/api/workspaces/workspace-1/tasks/task-2") && method === "GET") {
        return new Response(
          JSON.stringify({
            task: {
              id: "task-2",
              workspace_id: "workspace-1",
              playbook_key: "总结资料",
              input: "Review blockers",
              status: "running",
              status_summary: "Task 2 is running",
              artifact_id: "artifact-2",
            },
            plan: {
              steps: ["Review blocker notes"],
              current_step_index: 0,
              status: "running",
            },
            approvals: [],
            artifacts: [],
            timeline: [],
            collaboration: {
              agent_messages: [],
              instruction_actions: [],
            },
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      if (url.endsWith("/api/workspaces/workspace-1/tasks") && method === "GET") {
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }

      if (url.endsWith("/api/workspaces") && method === "GET") {
        return new Response(
          JSON.stringify([{ id: "workspace-1", title: "Workspace 1", root_path: "/tmp/workspace-1" }]),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      throw new Error(`Unhandled request: ${url}`);
    });

    const user = userEvent.setup();

    render(
      <ThemeProvider defaultTheme="light" storageKey="test-theme">
        <MemoryRouter initialEntries={["/workspaces/workspace-1/tasks/task-1"]}>
          <TaskPageNavigationHarness />
        </MemoryRouter>
      </ThemeProvider>,
    );

    expect(await screen.findByRole("tab", { name: "Context" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    await user.click(screen.getByRole("button", { name: "Open task 1 with assistant context" }));
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "Agent" })).toHaveAttribute("aria-selected", "true");
    });
    expect(screen.getByText("Opened from Workspace Assistant")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open task 2 without assistant context" }));
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "Context" })).toHaveAttribute("aria-selected", "true");
    });
    expect(screen.queryByText("Opened from Workspace Assistant")).not.toBeInTheDocument();
    expect(screen.getByText("Review blockers")).toBeInTheDocument();
  });

  it("shows a workspace-scoped not-found state when task does not belong to route workspace", async () => {
    let scopedTaskListCalled = false;
    fetchMock.mockImplementation(async (input, init) => {
      const url = typeof input === "string" ? input : input.toString();
      const method = init?.method ?? "GET";

      if (url.endsWith("/api/workspaces/workspace-2/tasks/task-1") && method === "GET") {
        return new Response(null, { status: 404 });
      }

      if (url.endsWith("/api/tasks/task-1") && method === "GET") {
        throw new Error("Unscoped task detail endpoint should not be called for workspace routes");
      }

      if (url.endsWith("/api/tasks/task-1/events/stream")) {
        throw new Error("Unscoped task stream should not be used for workspace routes");
      }

      if (url.endsWith("/api/workspaces/workspace-2/tasks/task-1/events/stream")) {
        return new Response(
          JSON.stringify({ error: "not found" }),
          { status: 404, headers: { "content-type": "application/json" } },
        );
      }

      if (url.endsWith("/api/workspaces/workspace-2/tasks") && method === "GET") {
        scopedTaskListCalled = true;
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }

      if (url.endsWith("/api/tasks") && method === "GET") {
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }

      if (url.endsWith("/api/workspaces") && method === "GET") {
        return new Response(
          JSON.stringify([{ id: "workspace-2", title: "Workspace 2", root_path: "/tmp/workspace-2" }]),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      throw new Error(`Unhandled request: ${url}`);
    });

    window.history.replaceState({}, "", "/workspaces/workspace-2/tasks/task-1");

    renderAppAtRoute();

    expect(
      await screen.findByText("Task not found in workspace workspace-2"),
    ).toBeInTheDocument();
    expect(FakeEventSource.instances).toHaveLength(0);
    expect(scopedTaskListCalled).toBe(false);
  });

  it("refreshes collaboration from named SSE events and keeps persisted agent messages visible", async () => {
    let detailRequestCount = 0;
    let persistedMessages = [
      {
        id: "agent-initial",
        task_id: "task-1",
        role: "agent",
        summary: "Current task status",
        detail: "Task is running"
      }
    ];

    fetchMock.mockImplementation(async (input, init) => {
      const url = typeof input === "string" ? input : input.toString();
      const method = init?.method ?? "GET";

      if (url.endsWith("/api/tasks/task-1") && method === "GET") {
        detailRequestCount += 1;
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
              steps: ["Scan markdown files"],
              current_step_index: 0,
              status: "running"
            },
            approvals: [],
            artifacts: [],
            timeline: [
              {
                event_id: "event-1",
                task_id: "task-1",
                sequence: detailRequestCount,
                event_type: "task.running",
                snapshot_version: detailRequestCount,
                message: "Task running"
              }
            ],
            collaboration: {
              agent_messages: persistedMessages,
              instruction_actions: [
                {
                  key: "status-brief",
                  label: "Status brief",
                  instruction: "Provide a concise status update for this task."
                }
              ]
            }
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      if (url.endsWith("/api/tasks/task-1/instructions") && method === "POST") {
        return new Response(
          JSON.stringify({
            message: {
              id: "agent-queued",
              task_id: "task-1",
              role: "agent",
              summary: "Queued local instruction",
              detail: "Queued"
            }
          }),
          { status: 202, headers: { "content-type": "application/json" } },
        );
      }

      if (url.endsWith("/api/tasks") && method === "GET") {
        return new Response(
          JSON.stringify([
            {
              id: "task-1",
              workspace_id: "workspace-1",
              playbook_key: "总结资料",
              input: "Summarize notes",
              status: "running",
              artifact_id: "artifact-1"
            }
          ]),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      throw new Error(`Unhandled request: ${url}`);
    });

    const user = userEvent.setup();
    renderAppAtRoute();

    await user.click(await screen.findByRole("tab", { name: "Agent" }));
    await user.click(screen.getByRole("button", { name: "Status brief" }));

    expect(screen.queryByText("Server persisted instruction")).not.toBeInTheDocument();

    persistedMessages = [
      ...persistedMessages,
      {
        id: "agent-persisted",
        task_id: "task-1",
        role: "agent",
        summary: "Server persisted instruction",
        detail: "Persisted collaboration message from backend"
      }
    ];

    await act(async () => {
      FakeEventSource.instances[0]?.emitNamedMessage("task.collaboration", {
        event_id: "event-2",
        task_id: "task-1",
        sequence: 2,
        event_type: "task.collaboration.instruction",
        snapshot_version: 2,
        message: "Instruction persisted"
      });
    });

    await waitFor(() => {
      expect(screen.getByText("Server persisted instruction")).toBeInTheDocument();
    });
  });

  it("uses workspace-scoped endpoints for recent tasks and instruction actions", async () => {
    let scopedInstructionCalled = false;
    fetchMock.mockImplementation(async (input, init) => {
      const url = typeof input === "string" ? input : input.toString();
      const method = init?.method ?? "GET";

      if (url.endsWith("/api/workspaces/workspace-1/tasks/task-1") && method === "GET") {
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
              steps: ["Scan markdown files"],
              current_step_index: 0,
              status: "running"
            },
            approvals: [],
            artifacts: [],
            timeline: [],
            collaboration: {
              agent_messages: [],
              instruction_actions: [
                {
                  key: "status-brief",
                  label: "Status brief",
                  instruction: "Provide a concise status update for this task."
                }
              ]
            }
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      if (url.endsWith("/api/workspaces/workspace-1/tasks") && method === "GET") {
        return new Response(
          JSON.stringify([
            {
              id: "task-2",
              workspace_id: "workspace-1",
              playbook_key: "总结资料",
              input: "Another task",
              status: "accepted",
              artifact_id: "artifact-2"
            }
          ]),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      if (
        url.endsWith("/api/workspaces/workspace-1/tasks/task-1/instructions")
        && method === "POST"
      ) {
        scopedInstructionCalled = true;
        return new Response(
          JSON.stringify({
            message: {
              id: "agent-1",
              task_id: "task-1",
              role: "agent",
              summary: "Status brief ready",
              detail: "Scoped instruction accepted."
            }
          }),
          { status: 202, headers: { "content-type": "application/json" } },
        );
      }

      if (url.endsWith("/api/tasks") && method === "GET") {
        throw new Error("Global tasks list should not be fetched for workspace task pages");
      }

      if (url.endsWith("/api/tasks/task-1/instructions") && method === "POST") {
        throw new Error("Global instruction endpoint should not be used for workspace task pages");
      }

      if (url.endsWith("/api/workspaces") && method === "GET") {
        return new Response(
          JSON.stringify([{ id: "workspace-1", title: "Workspace 1", root_path: "/tmp/workspace-1" }]),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      throw new Error(`Unhandled request: ${url}`);
    });

    const user = userEvent.setup();
    window.history.replaceState({}, "", "/workspaces/workspace-1/tasks/task-1");

    renderAppAtRoute();

    await user.click(await screen.findByRole("tab", { name: "Agent" }));
    await user.click(screen.getByRole("button", { name: "Status brief" }));

    await waitFor(() => {
      expect(scopedInstructionCalled).toBe(true);
    });
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

      if (url.endsWith("/api/tasks") && method === "GET") {
        return new Response(
          JSON.stringify([
            {
              id: "task-1",
              workspace_id: "workspace-1",
              playbook_key: "总结资料",
              input: "Summarize notes",
              status: approvalStatus,
              artifact_id: "artifact-1"
            }
          ]),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      throw new Error(`Unhandled request: ${url}`);
    });

    const user = userEvent.setup();

    renderAppAtRoute();

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

      if (url.endsWith("/api/tasks") && method === "GET") {
        return new Response(
          JSON.stringify([
            {
              id: "task-1",
              workspace_id: "workspace-1",
              playbook_key: "总结资料",
              input: "Summarize notes",
              status: "waiting_approval",
              artifact_id: "artifact-1"
            }
          ]),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      throw new Error(`Unhandled request: ${url}`);
    });

    renderAppAtRoute();

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

      if (url.endsWith("/api/tasks") && method === "GET") {
        return new Response(
          JSON.stringify([
            {
              id: "task-1",
              workspace_id: "workspace-1",
              playbook_key: "总结资料",
              input: "Summarize notes",
              status: currentTask.task.status,
              artifact_id: "artifact-1"
            }
          ]),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      throw new Error(`Unhandled request: ${url}`);
    });

    renderAppAtRoute();

    expect(await screen.findByText("Last event: Task accepted by API")).toBeInTheDocument();
    expect(await screen.findByText("Live")).toBeInTheDocument();
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

  it("renders recent tasks in the sidebar and keeps approvals ahead of artifacts", async () => {
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
              status_summary: "Task is waiting for approval",
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
            approvals: [
              {
                id: "approval-1",
                task_id: "task-1",
                decision: null,
                comment: null,
                status: "pending"
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
                event_id: "event-3",
                task_id: "task-1",
                sequence: 3,
                event_type: "task.waiting_approval",
                snapshot_version: 3,
                message: "Approval requested before final write"
              }
            ]
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      if (url.endsWith("/api/tasks") && method === "GET") {
        return new Response(
          JSON.stringify([
            {
              id: "task-1",
              workspace_id: "workspace-1",
              playbook_key: "总结资料",
              input: "Summarize notes",
              status: "waiting_approval",
              artifact_id: "artifact-1"
            },
            {
              id: "task-2",
              workspace_id: "workspace-1",
              playbook_key: "发现资料主题",
              input: "Discover themes",
              status: "completed",
              artifact_id: "artifact-2"
            },
            {
              id: "task-3",
              workspace_id: "workspace-1",
              playbook_key: "总结资料",
              input: "Prepare release summary",
              status: "accepted",
              artifact_id: "artifact-3"
            }
          ]),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      throw new Error(`Unhandled request: ${url}`);
    });

    renderAppAtRoute();

    const sidebar = await screen.findByRole("complementary", { name: "Task context" });

    expect(within(sidebar).getByText("Discover themes")).toBeInTheDocument();
    expect(within(sidebar).getByText("Prepare release summary")).toBeInTheDocument();
    expect(within(sidebar).getByRole("button", { name: "Open output/summary.md" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Preview output/summary.md" })).toBeInTheDocument();

    const approvalsHeading = screen.getByRole("heading", { name: "Approvals" });
    const artifactsHeading = screen.getByRole("heading", { name: "Artifacts" });

    expect(
      approvalsHeading.compareDocumentPosition(artifactsHeading) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("opens and closes an artifact preview drawer with artifact metadata", async () => {
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
              status: "completed",
              status_summary: "Task completed successfully",
              artifact_id: "artifact-1"
            },
            plan: {
              steps: [
                "Scan markdown files in the selected workspace",
                "Draft a concise summary with key takeaways",
                "Write the final summary artifact to output/summary.md"
              ],
              current_step_index: 2,
              status: "completed"
            },
            approvals: [],
            artifacts: [
              {
                id: "artifact-1",
                task_id: "task-1",
                label: "primary-output",
                canonical_path: "output/summary.md",
                status: "ready"
              }
            ],
            timeline: [
              {
                event_id: "event-4",
                task_id: "task-1",
                sequence: 4,
                event_type: "artifact.ready",
                snapshot_version: 4,
                message: "Summary artifact is ready"
              }
            ]
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      if (url.endsWith("/api/tasks") && method === "GET") {
        return new Response(
          JSON.stringify([
            {
              id: "task-1",
              workspace_id: "workspace-1",
              playbook_key: "总结资料",
              input: "Summarize notes",
              status: "completed",
              artifact_id: "artifact-1"
            }
          ]),
          { status: 200, headers: { "content-type": "application/json" } },
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

    renderAppAtRoute();

    await user.click(await screen.findByRole("button", { name: "Preview output/summary.md" }));

    const drawer = await screen.findByRole("dialog", { name: "Artifact preview" });

    expect(within(drawer).getByText("output/summary.md")).toBeInTheDocument();
    expect(within(drawer).getByText("ready")).toBeInTheDocument();

    await user.click(within(drawer).getByRole("button", { name: "Close preview" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Artifact preview" })).not.toBeInTheDocument();
    });
  });

  it("copies the artifact path and refreshes drawer preview content", async () => {
    let previewContent = "## Summary preview v1";

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
              status: "completed",
              status_summary: "Task completed successfully",
              artifact_id: "artifact-1"
            },
            plan: {
              steps: [
                "Scan markdown files in the selected workspace",
                "Draft a concise summary with key takeaways",
                "Write the final summary artifact to output/summary.md"
              ],
              current_step_index: 2,
              status: "completed"
            },
            approvals: [],
            artifacts: [
              {
                id: "artifact-1",
                task_id: "task-1",
                label: "primary-output",
                canonical_path: "output/summary.md",
                status: "ready"
              }
            ],
            timeline: [
              {
                event_id: "event-5",
                task_id: "task-1",
                sequence: 5,
                event_type: "artifact.ready",
                snapshot_version: 5,
                message: "Summary artifact is ready"
              }
            ]
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      if (url.endsWith("/api/tasks") && method === "GET") {
        return new Response(
          JSON.stringify([
            {
              id: "task-1",
              workspace_id: "workspace-1",
              playbook_key: "总结资料",
              input: "Summarize notes",
              status: "completed",
              artifact_id: "artifact-1"
            }
          ]),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      if (url.endsWith("/api/artifacts/artifact-1/content") && method === "GET") {
        return new Response(
          JSON.stringify({
            artifact_id: "artifact-1",
            content_type: "text/markdown",
            content: previewContent
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      throw new Error(`Unhandled request: ${url}`);
    });

    const user = userEvent.setup();

    renderAppAtRoute();

    await user.click(await screen.findByRole("button", { name: "Preview output/summary.md" }));

    const drawer = await screen.findByRole("dialog", { name: "Artifact preview" });

    expect(within(drawer).getByText("## Summary preview v1")).toBeInTheDocument();

    await user.click(within(drawer).getByRole("button", { name: "Copy path" }));

    expect(await within(drawer).findByText("Path copied.")).toBeInTheDocument();

    previewContent = "## Summary preview v2";

    await user.click(within(drawer).getByRole("button", { name: "Refresh preview" }));

    await waitFor(() => {
      expect(
        within(screen.getByRole("dialog", { name: "Artifact preview" })).getByText(
          "## Summary preview v2",
        ),
      ).toBeInTheDocument();
    });
  });

  it("shows empty and error states in the artifact preview drawer", async () => {
    let previewMode: "empty" | "error" = "empty";

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
              status: "completed",
              status_summary: "Task completed successfully",
              artifact_id: "artifact-1"
            },
            plan: {
              steps: [
                "Scan markdown files in the selected workspace",
                "Draft a concise summary with key takeaways",
                "Write the final summary artifact to output/summary.md"
              ],
              current_step_index: 2,
              status: "completed"
            },
            approvals: [],
            artifacts: [
              {
                id: "artifact-1",
                task_id: "task-1",
                label: "primary-output",
                canonical_path: "output/summary.md",
                status: "ready"
              }
            ],
            timeline: [
              {
                event_id: "event-6",
                task_id: "task-1",
                sequence: 6,
                event_type: "artifact.ready",
                snapshot_version: 6,
                message: "Summary artifact is ready"
              }
            ]
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      if (url.endsWith("/api/tasks") && method === "GET") {
        return new Response(
          JSON.stringify([
            {
              id: "task-1",
              workspace_id: "workspace-1",
              playbook_key: "总结资料",
              input: "Summarize notes",
              status: "completed",
              artifact_id: "artifact-1"
            }
          ]),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      if (url.endsWith("/api/artifacts/artifact-1/content") && method === "GET") {
        if (previewMode === "error") {
          return new Response("preview failed", { status: 500 });
        }

        return new Response(
          JSON.stringify({
            artifact_id: "artifact-1",
            content_type: "text/markdown",
            content: ""
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      throw new Error(`Unhandled request: ${url}`);
    });

    const user = userEvent.setup();

    renderAppAtRoute();

    await user.click(await screen.findByRole("button", { name: "Preview output/summary.md" }));

    const drawer = await screen.findByRole("dialog", { name: "Artifact preview" });

    expect(within(drawer).getByText("No preview content available.")).toBeInTheDocument();

    previewMode = "error";

    await user.click(within(drawer).getByRole("button", { name: "Refresh preview" }));

    await waitFor(() => {
      expect(
        within(screen.getByRole("dialog", { name: "Artifact preview" })).getByText(
          "Could not load preview.",
        ),
      ).toBeInTheDocument();
    });
  });
});
