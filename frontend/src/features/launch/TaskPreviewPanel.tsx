import type { PlaybookCard, Workspace } from "../../entities/playbook/types";
import type { TaskPreview } from "../../shared/api/tasks";

interface TaskPreviewPanelProps {
  workspace: Workspace | null;
  playbook: PlaybookCard | null;
  preview: TaskPreview | null;
  canStart: boolean;
  isStarting: boolean;
  onStart: () => void;
}

export function TaskPreviewPanel({
  workspace,
  playbook,
  preview,
  canStart,
  isStarting,
  onStart,
}: TaskPreviewPanelProps) {
  return (
    <section className="preview-panel">
      <div className="section-header">
        <p className="section-kicker">Plan</p>
        <h2>Plan preview</h2>
      </div>
      {preview ? (
        <>
          <p className="panel-copy">
            {playbook?.title} will run in {workspace?.title ?? "the current workspace"} and
            produce {preview.expected_artifact_label}.
          </p>
          <ol className="plan-steps">
            {preview.plan_steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p className="artifact-path">{preview.expected_artifact_path}</p>
          <button
            type="button"
            className="primary-button"
            onClick={onStart}
            disabled={!canStart || isStarting}
          >
            {isStarting ? "Starting task..." : "Start task"}
          </button>
        </>
      ) : (
        <p className="panel-copy">Preview a short plan before the task starts running.</p>
      )}
    </section>
  );
}
