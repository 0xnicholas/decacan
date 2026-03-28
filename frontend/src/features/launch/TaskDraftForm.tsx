interface TaskDraftFormProps {
  goal: string;
  selectedTitle: string | null;
  disabled: boolean;
  onGoalChange: (value: string) => void;
  onPreview: () => void;
}

export function TaskDraftForm({
  goal,
  selectedTitle,
  disabled,
  onGoalChange,
  onPreview,
}: TaskDraftFormProps) {
  return (
    <section className="draft-panel">
      <div className="section-header">
        <p className="section-kicker">Launch</p>
        <h2>Task draft</h2>
      </div>
      <p className="panel-copy">
        {selectedTitle
          ? `Prepare a launch brief for ${selectedTitle}.`
          : "Pick a playbook to unlock the launch brief."}
      </p>
      <label className="field">
        <span>Goal</span>
        <textarea
          aria-label="Goal"
          value={goal}
          onChange={(event) => onGoalChange(event.target.value)}
          placeholder="Summarize notes"
          rows={5}
        />
      </label>
      <button type="button" className="primary-button" onClick={onPreview} disabled={disabled}>
        Preview plan
      </button>
    </section>
  );
}
