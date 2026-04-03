import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import type { ArtifactContent } from "../../entities/artifact/types";
import { readAssistantContextState } from "../../entities/workbench/assistantHandoff";
import { fetchArtifactContent } from "../../shared/api/artifacts";
import { reviewEvolutionProposal } from "../../shared/api/evolutionProposals";
import { decideApproval, sendTaskInstruction } from "../../shared/api/tasks";
import { AssistantContextNotice } from "./AssistantContextNotice";
import { AgentRail } from "./AgentRail";
import { ApprovalPanel } from "./ApprovalPanel";
import { ArtifactPanel } from "./ArtifactPanel";
import { ArtifactPreviewDrawer } from "./ArtifactPreviewDrawer";
import { ContextRail } from "./ContextRail";
import { HistoryRail } from "./HistoryRail";
import { LiveActivityStrip } from "./LiveActivityStrip";
import { PlanProgressPanel } from "./PlanProgressPanel";
import { TaskHeader } from "./TaskHeader";
import { TeamSessionPanel } from "./TeamSessionPanel";
import { TimelinePanel } from "./TimelinePanel";
import { useTaskDetail } from "./useTaskDetail";

interface TaskPageProps {
  taskId: string;
  workspaceId?: string;
}

type RailTab = "agent" | "context" | "history";

export function TaskPage({ taskId, workspaceId }: TaskPageProps) {
  const location = useLocation();
  const { connectionState, latestEvent, loadState, recentTasks, taskDetail, reload } = useTaskDetail(
    taskId,
    workspaceId,
  );
  const assistantContext = readAssistantContextState(location.state);
  const activeAssistantContext =
    assistantContext?.targetKind === "task" && assistantContext.targetId === taskId
      ? assistantContext
      : null;
  const assistantContextKey = activeAssistantContext
    ? [
        activeAssistantContext.source,
        activeAssistantContext.targetKind,
        activeAssistantContext.targetId,
        activeAssistantContext.actionLabel,
        activeAssistantContext.summary,
      ].join(":")
    : null;
  const [copyNotice, setCopyNotice] = useState<string | null>(null);
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [preview, setPreview] = useState<ArtifactContent | null>(null);
  const [activeRailTab, setActiveRailTab] = useState<RailTab>(
    activeAssistantContext ? "agent" : "context",
  );
  const [pendingInstructionKey, setPendingInstructionKey] = useState<string | null>(null);
  const [pendingReviewProposalId, setPendingReviewProposalId] = useState<string | null>(null);

  useEffect(() => {
    setActiveRailTab(activeAssistantContext ? "agent" : "context");
  }, [taskId, assistantContextKey]);

  if (loadState === "not_found") {
    return (
      <main className="task-route-placeholder">
        <p className="eyebrow">Decacan</p>
        <h1>
          {workspaceId
            ? `Task not found in workspace ${workspaceId}`
            : `Task ${taskId} was not found`}
        </h1>
      </main>
    );
  }

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
      await sendTaskInstruction(taskId, { instruction_key: instructionKey }, workspaceId);
      reload();
    } catch {
      // Keep the current rail content unchanged when instruction submission fails.
    } finally {
      setPendingInstructionKey(null);
    }
  }

  async function handleProposalReview(proposalId: string, title: string, reviewState: string) {
    const teamSessionId = taskDetail?.collaboration?.team_session?.session_id;
    if (!teamSessionId) {
      return;
    }

    setPendingReviewProposalId(proposalId);
    try {
      await reviewEvolutionProposal(proposalId, {
        team_session_id: teamSessionId,
        title,
        review_state: reviewState,
      });
      reload();
    } catch {
      // Keep existing session panel state when review update fails.
    } finally {
      setPendingReviewProposalId(null);
    }
  }

  function renderRailContent() {
    if (!taskDetail) return null;
    
    if (activeRailTab === "agent") {
      return (
        <>
          <AgentRail
            instructionActions={taskDetail.collaboration?.instruction_actions ?? []}
            isSubmittingKey={pendingInstructionKey}
            messages={taskDetail.collaboration?.agent_messages ?? []}
            onRunInstruction={handleInstruction}
          />
          {taskDetail.collaboration?.team_session ? (
            <div style={{ marginTop: "12px" }}>
              <TeamSessionPanel
                session={taskDetail.collaboration.team_session}
                isReviewingProposalId={pendingReviewProposalId}
                onReviewProposal={handleProposalReview}
              />
            </div>
          ) : null}
        </>
      );
    }

    if (activeRailTab === "history") {
      return <HistoryRail timeline={taskDetail.timeline} />;
    }

    return (
      <ContextRail recentTasks={recentTasks} taskDetail={taskDetail!} onOpenArtifact={handlePreview} />
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
        {activeAssistantContext ? <AssistantContextNotice context={activeAssistantContext} /> : null}
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
