import { useEffect, useState } from "react";

import { getInbox, type InboxData } from "../../shared/api/inbox";

export function InboxPage() {
  const [inbox, setInbox] = useState<InboxData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadInbox() {
      setIsLoading(true);
      setError(null);
      try {
        const next = await getInbox();
        if (active) {
          setInbox(next);
        }
      } catch {
        if (active) {
          setError("Failed to load inbox");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadInbox();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section aria-label="Inbox">
      <p className="eyebrow">Global</p>
      <h1>Inbox</h1>
      {isLoading ? <p className="subcopy">Loading inbox...</p> : null}
      {error ? <p className="subcopy">{error}</p> : null}
      {!isLoading && !error && inbox ? (
        <>
          <h2>Waiting on me</h2>
          {inbox.waiting_on_me.length ? (
            <ul className="detail-list">
              {inbox.waiting_on_me.map((item) => (
                <li key={item.id} className="task-panel">
                  <strong>{item.title}</strong>
                  <span>{item.workspace_id}</span>
                  <span>{item.task_id}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="subcopy">Nothing waiting on you.</p>
          )}
        </>
      ) : null}
    </section>
  );
}
