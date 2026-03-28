export interface DeliverableItem {
  id: string;
  label: string;
  canonical_path: string;
  status: string;
}

interface WorkspaceDeliverablesPanelProps {
  deliverables: DeliverableItem[];
}

export function WorkspaceDeliverablesPanel({ deliverables }: WorkspaceDeliverablesPanelProps) {
  return (
    <section aria-label="Deliverables panel">
      <h2>Deliverables</h2>
      <ul>
        {deliverables.map((deliverable) => (
          <li key={deliverable.id}>
            <strong>{deliverable.label}</strong>: {deliverable.canonical_path} ({deliverable.status})
          </li>
        ))}
      </ul>
    </section>
  );
}
