import type { AttentionItem } from "../../entities/workspace-home/types";

interface NeedsAttentionPanelProps {
  items: AttentionItem[];
}

export function NeedsAttentionPanel({ items }: NeedsAttentionPanelProps) {
  return (
    <section aria-label="Needs Attention panel">
      <h2>Needs Attention</h2>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <strong>{item.title}</strong> ({item.severity})<p>{item.reason}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
