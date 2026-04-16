export interface TaskEvent {
  event_type: string;
  task_id: string;
  sequence: number;
  [key: string]: unknown;
}

type Listener = (event: TaskEvent) => void;

export class EventBus {
  private listeners = new Map<string, Set<Listener>>();

  subscribe(task_id: string, listener: Listener): () => void {
    const set = this.listeners.get(task_id) ?? new Set<Listener>();
    set.add(listener);
    this.listeners.set(task_id, set);
    return () => {
      set.delete(listener);
      if (set.size === 0) {
        this.listeners.delete(task_id);
      }
    };
  }

  publish(task_id: string, event: Record<string, unknown>): void {
    const set = this.listeners.get(task_id);
    if (!set) return;
    const fullEvent = { ...event, task_id } as TaskEvent;
    for (const listener of set) {
      try {
        listener(fullEvent);
      } catch {}
    }
  }
}
