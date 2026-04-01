import type { Artifact } from "../../entities/artifact/types";
import type { TaskDetail, TaskListItem } from "../../entities/task/types";

interface ContextRailProps {
  onOpenArtifact: (artifactId: string) => void;
  recentTasks: TaskListItem[];
  taskDetail: TaskDetail;
}

export function ContextRail({ onOpenArtifact, recentTasks, taskDetail }: ContextRailProps) {
  const currentStep = Math.min(taskDetail.plan.current_step_index + 1, taskDetail.plan.steps.length);
  const primaryArtifact = findPrimaryArtifact(taskDetail);

  return (
    <aside className="task-panel" aria-label="Task context">
      <p className="section-kicker">Context</p>
      <ul className="detail-list">
        <li>
          <strong>Workspace</strong>
          <span className="panel-copy">{taskDetail.task.workspace_id}</span>
        </li>
        <li>
          <strong>Playbook</strong>
          <span className="panel-copy">{taskDetail.task.playbook_key}</span>
        </li>
        <li>
          <strong>Status</strong>
          <span className="panel-copy">{taskDetail.task.status_summary}</span>
        </li>
        <li>
          <strong>Progress</strong>
          <span className="panel-copy">
            Step {currentStep} of {taskDetail.plan.steps.length}
          </span>
        </li>
      </ul>

      {primaryArtifact ? (
        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            onOpenArtifact(primaryArtifact.id);
          }}
        >
          Open {primaryArtifact.canonical_path}
        </button>
      ) : null}

      <p className="section-kicker">Recent Tasks</p>
      {recentTasks.length ? (
        <ul className="timeline-list">
          {recentTasks.map((task) => (
            <li key={task.id}>
              <strong>{task.input}</strong>
              <span className="panel-copy">{task.status}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="panel-copy">Recent tasks will appear here.</p>
      )}
    </aside>
  );
}

function findPrimaryArtifact(taskDetail: TaskDetail): Artifact | undefined {
  if (taskDetail.task.artifact_id) {
    return taskDetail.artifacts.find((artifact) => artifact.id === taskDetail.task.artifact_id);
  }

  return taskDetail.artifacts[0];
}
