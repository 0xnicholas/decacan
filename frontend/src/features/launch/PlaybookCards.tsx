import type { PlaybookCard } from "../../entities/playbook/types";

interface PlaybookCardsProps {
  playbooks: PlaybookCard[];
  selectedKey: string | null;
  onSelect: (playbook: PlaybookCard) => void;
}

export function PlaybookCards({
  playbooks,
  selectedKey,
  onSelect,
}: PlaybookCardsProps) {
  return (
    <section className="playbook-section">
      <div className="section-header">
        <p className="section-kicker">Playbooks</p>
        <h2>Choose a playbook</h2>
      </div>
      <div className="playbook-grid">
        {playbooks.map((playbook) => (
          <button
            key={playbook.key}
            type="button"
            aria-label={playbook.title}
            className={`playbook-card${selectedKey === playbook.key ? " selected" : ""}`}
            onClick={() => onSelect(playbook)}
          >
            <span className="playbook-mode">{playbook.mode_label}</span>
            <span className="playbook-title">{playbook.title}</span>
            <span className="playbook-summary">{playbook.summary}</span>
            <span className="playbook-output">
              {playbook.expected_output_label} {"->"} {playbook.expected_output_path}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
