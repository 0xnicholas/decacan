import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import { LoadingState } from "../shared/ui/LoadingState";
import { ErrorState } from "../shared/ui/ErrorState";
import { EmptyState } from "../shared/ui/EmptyState";
import { PageHeader } from "../shared/ui/PageHeader";

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
    render(<ErrorState message="Something went wrong" />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
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
    render(<EmptyState message="No tasks found" />);
    expect(screen.getByText("No tasks found")).toBeInTheDocument();
  });

  it("renders action button when actionLabel and onAction provided", () => {
    const handleAction = vi.fn();
    render(<EmptyState message="Empty" actionLabel="Create Task" onAction={handleAction} />);
    expect(screen.getByRole("button", { name: "Create Task" })).toBeInTheDocument();
  });

  it("does not render action button when actionLabel not provided", () => {
    render(<EmptyState message="Empty" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("calls onAction when action button is clicked", async () => {
    const user = userEvent.setup();
    const handleAction = vi.fn();
    render(<EmptyState message="Empty" actionLabel="Create" onAction={handleAction} />);
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
