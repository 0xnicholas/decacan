import type { Artifact } from "../../entities/artifact/types";
import type { TaskDetail } from "../../entities/task/types";

interface ContextSidebarProps {
  taskDetail: TaskDetail;
  onOpenArtifact: (artifactId: string) => void;
}

export function ContextSidebar({ taskDetail, onOpenArtifact }: ContextSidebarProps) {
  const currentStep = Math.min(taskDetail.plan.current_step_index + 1, taskDetail.plan.steps.length);
  const primaryArtifact = findPrimaryArtifact(taskDetail);

  return (
    <aside className="sidebar task-context-sidebar" aria-label="Task context">
      <p className="eyebrow">Context</p>
      <section className="sidebar-section">
        <p className="sidebar-label">Workspace</p>
        <p className="sidebar-value">{taskDetail.task.workspace_id}</p>
      </section>
      <section className="sidebar-section">
        <p className="sidebar-label">Playbook</p>
        <p className="sidebar-value">{taskDetail.task.playbook_key}</p>
      </section>
      <section className="sidebar-section">
        <p className="sidebar-label">Status</p>
        <p className="sidebar-value">{taskDetail.task.status}</p>
        <p className="sidebar-copy">{taskDetail.task.status_summary}</p>
      </section>
      <section className="sidebar-section">
        <p className="sidebar-label">Progress</p>
        <p className="sidebar-value">
          Step {currentStep} of {taskDetail.plan.steps.length}
        </p>
        <p className="sidebar-copy">{taskDetail.plan.steps[taskDetail.plan.current_step_index]}</p>
      </section>
      <section className="sidebar-section">
        <p className="sidebar-label">Primary Artifact</p>
        {primaryArtifact ? (
          <button
            type="button"
            className="secondary-button"
            onClick={() => onOpenArtifact(primaryArtifact.id)}
          >
            Open {primaryArtifact.canonical_path}
          </button>
        ) : (
          <p className="sidebar-copy">No primary artifact yet.</p>
        )}
      </section>
      <section className="sidebar-section">
        <p className="sidebar-label">Recent Tasks</p>
        <p className="sidebar-copy">Recent tasks will appear here.</p>
      </section>
    </aside>
  );
}

function findPrimaryArtifact(taskDetail: TaskDetail): Artifact | undefined {
  if (taskDetail.task.artifact_id) {
    return taskDetail.artifacts.find((artifact) => artifact.id === taskDetail.task.artifact_id);
  }

  return taskDetail.artifacts[0];
}
