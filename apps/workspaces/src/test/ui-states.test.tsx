import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import { LoadingState } from "../shared/ui/LoadingState";
import { ErrorState } from "../shared/ui/ErrorState";
import { EmptyState } from "../shared/ui/EmptyState";
import { PageHeader } from "../shared/ui/PageHeader";
import { DiscussionPanel } from "../features/workspace-home/DiscussionPanel";
import { MyQueuePanel } from "../features/workspace-home/MyQueuePanel";
import { ResumeStrip } from "../features/workspace-home/ResumeStrip";
import { WorkspaceAssistantDock } from "../features/workspace-home/WorkspaceAssistantDock";

describe("LoadingState", () => {
  it("renders a spinner", () => {
    render(<LoadingState />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("displays custom message when provided", () => {
    render(<LoadingState message="Loading tasks..." />);
    expect(screen.getByText("Loading tasks...")).toBeInTheDocument();
  });

  it("displays default message when no message provided", () => {
    render(<LoadingState />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});

describe("ErrorState", () => {
  it("renders error message", () => {
    render(<ErrorState message="Failed to load data" />);
    expect(screen.getByText("Failed to load data")).toBeInTheDocument();
  });

  it("renders retry button when onRetry provided", () => {
    const handleRetry = vi.fn();
    render(<ErrorState message="Error" onRetry={handleRetry} />);
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("does not render retry button when onRetry not provided", () => {
    render(<ErrorState message="Error" />);
    expect(screen.queryByRole("button", { name: /retry/i })).not.toBeInTheDocument();
  });

  it("calls onRetry when retry button is clicked", async () => {
    const user = userEvent.setup();
    const handleRetry = vi.fn();
    render(<ErrorState message="Error" onRetry={handleRetry} />);
    await user.click(screen.getByRole("button", { name: /retry/i }));
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});

describe("EmptyState", () => {
  it("renders message", () => {
    render(<EmptyState title="No Data" message="No tasks found" />);
    expect(screen.getByText("No tasks found")).toBeInTheDocument();
  });

  it("renders action button when action provided", () => {
    const handleAction = vi.fn();
    render(<EmptyState title="Empty" message="Empty" action={{ label: "Create Task", onClick: handleAction }} />);
    expect(screen.getByRole("button", { name: "Create Task" })).toBeInTheDocument();
  });

  it("does not render action button when action not provided", () => {
    render(<EmptyState title="Empty" message="Empty" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("calls action.onClick when action button is clicked", async () => {
    const user = userEvent.setup();
    const handleAction = vi.fn();
    render(<EmptyState title="Empty" message="Empty" action={{ label: "Create", onClick: handleAction }} />);
    await user.click(screen.getByRole("button", { name: "Create" }));
    expect(handleAction).toHaveBeenCalledTimes(1);
  });
});

describe("PageHeader", () => {
  it("renders title", () => {
    render(<PageHeader title="Tasks" />);
    expect(screen.getByRole("heading", { name: "Tasks" })).toBeInTheDocument();
  });

  it("renders subtitle when provided", () => {
    render(<PageHeader title="Tasks" subtitle="Manage your work" />);
    expect(screen.getByText("Manage your work")).toBeInTheDocument();
  });

  it("does not render subtitle when not provided", () => {
    render(<PageHeader title="Tasks" />);
    expect(screen.queryByText("Manage your work")).not.toBeInTheDocument();
  });
});

describe("Workspace workbench panel states", () => {
  it("shows a start surface when there is no current work to resume", () => {
    render(
      <ResumeStrip
        resume={{
          primary_label: "Resume Work",
          title: "Ignored title for empty resume",
          detail: "Semantic empty-state detection should not depend on this copy.",
          has_current_work: false,
        }}
        onOpenPrimary={vi.fn()}
      />,
    );

    expect(screen.getByText("Start new work")).toBeInTheDocument();
    expect(screen.getByText("There is no active work to resume in this workspace yet.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Launch task" })).toBeInTheDocument();
  });

  it("keeps the resume card when current work exists even if the title matches the old fallback copy", () => {
    render(
      <ResumeStrip
        resume={{
          primary_label: "Resume Work",
          title: "Resume current work",
          detail: "output/work.md",
          has_current_work: true,
        }}
        onOpenPrimary={vi.fn()}
      />,
    );

    expect(screen.getByText("Resume current work")).toBeInTheDocument();
    expect(screen.queryByText("Start new work")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Resume Work" })).toBeEnabled();
  });

  it("shows panel-level empty state for discussion without collapsing the page", () => {
    render(<DiscussionPanel items={[]} />);

    expect(screen.getByText("No discussion yet")).toBeInTheDocument();
  });

  it("shows assistant-unavailable guidance when the dock has no usable summary or actions", () => {
    render(
      <WorkspaceAssistantDock
        assistant={{
          state: "ambient",
          summary: "",
          suggested_actions: [],
        }}
        onOpenTask={vi.fn()}
        onDelegate={vi.fn()}
        isDelegating={false}
        delegationStatus={null}
      />,
    );

    expect(screen.getByText("Assistant unavailable")).toBeInTheDocument();
    expect(
      screen.getByText("Use the workspace panels directly while assistant guidance is unavailable."),
    ).toBeInTheDocument();
  });

  it("shows empty-state parity for my queue when there is nothing waiting", () => {
    render(
      <MyQueuePanel
        queue={{
          items: [],
        }}
        templateLabels={{
          task: "Task",
          deliverable: "Deliverable",
          approval: "Sign-off",
        }}
      />,
    );

    expect(screen.getByText("Nothing is waiting in your queue")).toBeInTheDocument();
    expect(
      screen.getByText("Sign-offs, blockers, and follow-ups assigned to you will appear here."),
    ).toBeInTheDocument();
  });
});
