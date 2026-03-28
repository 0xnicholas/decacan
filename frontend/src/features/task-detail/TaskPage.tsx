import { useState } from "react";

import type { ArtifactContent } from "../../entities/artifact/types";
import { fetchArtifactContent } from "../../shared/api/artifacts";
import { decideApproval } from "../../shared/api/tasks";
import { ApprovalPanel } from "./ApprovalPanel";
import { ArtifactPanel } from "./ArtifactPanel";
import { ArtifactPreviewDrawer } from "./ArtifactPreviewDrawer";
import { ContextSidebar } from "./ContextSidebar";
import { LiveActivityStrip } from "./LiveActivityStrip";
import { PlanProgressPanel } from "./PlanProgressPanel";
import { TaskHeader } from "./TaskHeader";
import { TimelinePanel } from "./TimelinePanel";
import { useTaskDetail } from "./useTaskDetail";

interface TaskPageProps {
  taskId: string;
}

export function TaskPage({ taskId }: TaskPageProps) {
  const { connectionState, latestEvent, recentTasks, taskDetail, reload } = useTaskDetail(taskId);
  const [copyNotice, setCopyNotice] = useState<string | null>(null);
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [preview, setPreview] = useState<ArtifactContent | null>(null);

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

  return (
    <main className="workspace-shell task-workspace-shell">
      <ContextSidebar
        recentTasks={recentTasks}
        taskDetail={taskDetail}
        onOpenArtifact={handlePreview}
      />
      <section className="main-panel task-main-column">
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
