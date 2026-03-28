import { useEffect, useState } from "react";

import type { ArtifactContent } from "../../entities/artifact/types";
import { fetchArtifactContent } from "../../shared/api/artifacts";
import type { TaskAgentMessage } from "../../entities/task/types";
import { decideApproval, sendTaskInstruction } from "../../shared/api/tasks";
import { AgentRail } from "./AgentRail";
import { ApprovalPanel } from "./ApprovalPanel";
import { ArtifactPanel } from "./ArtifactPanel";
import { ArtifactPreviewDrawer } from "./ArtifactPreviewDrawer";
import { ContextRail } from "./ContextRail";
import { HistoryRail } from "./HistoryRail";
import { LiveActivityStrip } from "./LiveActivityStrip";
import { PlanProgressPanel } from "./PlanProgressPanel";
import { TaskHeader } from "./TaskHeader";
import { TimelinePanel } from "./TimelinePanel";
import { useTaskDetail } from "./useTaskDetail";

interface TaskPageProps {
  taskId: string;
  workspaceId?: string;
}

type RailTab = "agent" | "context" | "history";

export function TaskPage({ taskId, workspaceId }: TaskPageProps) {
  const { connectionState, latestEvent, recentTasks, taskDetail, reload } = useTaskDetail(
    taskId,
    workspaceId,
  );
  const [copyNotice, setCopyNotice] = useState<string | null>(null);
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [preview, setPreview] = useState<ArtifactContent | null>(null);
  const [activeRailTab, setActiveRailTab] = useState<RailTab>("context");
  const [agentMessages, setAgentMessages] = useState<TaskAgentMessage[]>([]);
  const [pendingInstructionKey, setPendingInstructionKey] = useState<string | null>(null);

  useEffect(() => {
    if (!taskDetail) {
      return;
    }

    setAgentMessages(taskDetail.collaboration?.agent_messages ?? []);
  }, [taskDetail]);

  if (!taskDetail) {
    return (
      <main className="task-route-placeholder">
        <p className="eyebrow">Decacan</p>
        <h1>Loading task</h1>
      </main>
    );
  }

  async function handleApprove(approvalId: string) {
    await decideApproval(approvalId, {
      decision: "approved",
      comment: "Proceed",
    });
    reload();
  }

  async function handlePreview(artifactId: string) {
    setCopyNotice(null);
    setSelectedArtifactId(artifactId);
    setPreviewError(null);
    setPreviewLoading(true);
    setPreview(null);

    try {
      const nextPreview = await fetchArtifactContent(artifactId);
      setPreview(nextPreview);
    } catch (error) {
      setPreviewError(error instanceof Error ? error.message : "preview failed");
    } finally {
      setPreviewLoading(false);
    }
  }

  function handleClosePreview() {
    setCopyNotice(null);
    setSelectedArtifactId(null);
    setPreviewError(null);
    setPreviewLoading(false);
    setPreview(null);
  }

  async function handleRefreshPreview() {
    if (!selectedArtifactId) {
      return;
    }

    await handlePreview(selectedArtifactId);
  }

  const selectedArtifact =
    taskDetail.artifacts.find((artifact) => artifact.id === selectedArtifactId) ?? null;

  async function handleInstruction(instructionKey: string) {
    setPendingInstructionKey(instructionKey);
    try {
      const response = await sendTaskInstruction(taskId, { instruction_key: instructionKey });
      setAgentMessages((current) => [...current, response.message]);
      reload();
    } catch (error) {
      setAgentMessages((current) => [
        ...current,
        {
          id: `agent-error-${Date.now()}`,
          task_id: taskId,
          role: "agent",
          summary: "Instruction could not be processed",
          detail: error instanceof Error ? error.message : "Unknown instruction error",
        },
      ]);
    } finally {
      setPendingInstructionKey(null);
    }
  }

  function renderRailContent() {
    if (activeRailTab === "agent") {
      return (
        <AgentRail
          instructionActions={taskDetail.collaboration?.instruction_actions ?? []}
          isSubmittingKey={pendingInstructionKey}
          messages={agentMessages}
          onRunInstruction={handleInstruction}
        />
      );
    }

    if (activeRailTab === "history") {
      return <HistoryRail timeline={taskDetail.timeline} />;
    }

    return (
      <ContextRail recentTasks={recentTasks} taskDetail={taskDetail} onOpenArtifact={handlePreview} />
    );
  }

  return (
    <main className="task-page">
      <div
        style={{
          display: "grid",
          gap: "24px",
          gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 360px)",
        }}
      >
        <section className="task-main-column">
        <p className="eyebrow">Decacan</p>
        <TaskHeader task={taskDetail.task} />
        <LiveActivityStrip latestEvent={latestEvent} connectionState={connectionState} />
        <div className="task-grid">
          <PlanProgressPanel plan={taskDetail.plan} />
          <ApprovalPanel approvals={taskDetail.approvals} onApprove={handleApprove} />
          <ArtifactPanel artifacts={taskDetail.artifacts} onPreview={handlePreview} />
          <TimelinePanel timeline={taskDetail.timeline} />
        </div>
        </section>
        <aside>
          <div role="tablist" aria-label="Task collaboration tabs" className="artifact-drawer-actions">
            <button
              type="button"
              role="tab"
              id="task-tab-agent"
              aria-controls="task-tabpanel-agent"
              aria-selected={activeRailTab === "agent"}
              className="secondary-button"
              onClick={() => {
                setActiveRailTab("agent");
              }}
            >
              Agent
            </button>
            <button
              type="button"
              role="tab"
              id="task-tab-context"
              aria-controls="task-tabpanel-context"
              aria-selected={activeRailTab === "context"}
              className="secondary-button"
              onClick={() => {
                setActiveRailTab("context");
              }}
            >
              Context
            </button>
            <button
              type="button"
              role="tab"
              id="task-tab-history"
              aria-controls="task-tabpanel-history"
              aria-selected={activeRailTab === "history"}
              className="secondary-button"
              onClick={() => {
                setActiveRailTab("history");
              }}
            >
              History
            </button>
          </div>
          <div
            role="tabpanel"
            id={`task-tabpanel-${activeRailTab}`}
            aria-labelledby={`task-tab-${activeRailTab}`}
            style={{ marginTop: "12px" }}
          >
            {renderRailContent()}
          </div>
        </aside>
      </div>
      {selectedArtifact ? (
        <ArtifactPreviewDrawer
          artifact={selectedArtifact}
          copyNotice={copyNotice}
          errorMessage={previewError}
          isLoading={previewLoading}
          onCopyPath={() => {
            void navigator.clipboard?.writeText?.(selectedArtifact.canonical_path);
            setCopyNotice("Path copied.");
          }}
          preview={preview}
          onClose={handleClosePreview}
          onRefresh={handleRefreshPreview}
        />
      ) : null}
    </main>
  );
}
