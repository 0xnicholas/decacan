export enum Priority {
  HIGH = 1,
  NORMAL = 2,
  LOW = 3,
}

export interface QueuedRequest {
  id: string;
  priority: Priority;
  workspaceId: string;
  createdAt: number;
  execute: () => Promise<void>;
}

export interface QueueMetrics {
  depth: number;
  highPriorityCount: number;
  normalPriorityCount: number;
  lowPriorityCount: number;
  utilizationPercent: number;
  totalProcessed: number;
  totalRejected: number;
}

export interface QueueConfig {
  maxDepth: number;
  highPriorityLimit: number;
  normalPriorityLimit: number;
  lowPriorityLimit: number;
  defaultPriority: Priority;
}

const DEFAULT_CONFIG: QueueConfig = {
  maxDepth: 100,
  highPriorityLimit: 50,
  normalPriorityLimit: 30,
  lowPriorityLimit: 20,
  defaultPriority: Priority.NORMAL,
};

export class TeamQueue {
  private queue: QueuedRequest[] = [];
  private config: QueueConfig;
  private processing = false;
  private metrics: QueueMetrics = {
    depth: 0,
    highPriorityCount: 0,
    normalPriorityCount: 0,
    lowPriorityCount: 0,
    utilizationPercent: 0,
    totalProcessed: 0,
    totalRejected: 0,
  };

  constructor(config: Partial<QueueConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  enqueue(request: Omit<QueuedRequest, 'priority' | 'createdAt'>): {
    accepted: boolean;
    position?: number;
    reason?: string;
  } {
    const priority = this.calculatePriority(request.workspaceId);

    if (this.queue.length >= this.config.maxDepth) {
      this.metrics.totalRejected++;
      return {
        accepted: false,
        reason: `Queue full (${this.config.maxDepth})`,
      };
    }

    const priorityCount = this.getPriorityCount(priority);
    const limit = this.getPriorityLimit(priority);

    if (priorityCount >= limit) {
      this.metrics.totalRejected++;
      return {
        accepted: false,
        reason: `Priority ${Priority[priority]} limit reached (${limit})`,
      };
    }

    const queuedRequest: QueuedRequest = {
      id: request.id,
      priority,
      workspaceId: request.workspaceId,
      createdAt: Date.now(),
      execute: request.execute,
    };

    this.insertByPriority(queuedRequest);
    this.updateMetrics();

    const position = this.queue.findIndex((r) => r.id === request.id) + 1;

    return { accepted: true, position };
  }

  private calculatePriority(_workspaceId: string): Priority {
    return Priority.NORMAL;
  }

  private getPriorityCount(priority: Priority): number {
    return this.queue.filter((r) => r.priority === priority).length;
  }

  private getPriorityLimit(priority: Priority): number {
    switch (priority) {
      case Priority.HIGH:
        return this.config.highPriorityLimit;
      case Priority.NORMAL:
        return this.config.normalPriorityLimit;
      case Priority.LOW:
        return this.config.lowPriorityLimit;
    }
  }

  private insertByPriority(request: QueuedRequest): void {
    const insertIndex = this.queue.findIndex(
      (r) => r.priority > request.priority
    );
    if (insertIndex === -1) {
      this.queue.push(request);
    } else {
      this.queue.splice(insertIndex, 0, request);
    }
  }

  async process(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    try {
      while (this.queue.length > 0) {
        const request = this.queue.shift()!;
        try {
          await request.execute();
          this.metrics.totalProcessed++;
        } catch (error) {
          console.error(`Queue processing error for ${request.id}:`, error);
        }
        this.updateMetrics();
      }
    } finally {
      this.processing = false;
    }
  }

  private updateMetrics(): void {
    this.metrics.depth = this.queue.length;
    this.metrics.highPriorityCount = this.getPriorityCount(Priority.HIGH);
    this.metrics.normalPriorityCount = this.getPriorityCount(Priority.NORMAL);
    this.metrics.lowPriorityCount = this.getPriorityCount(Priority.LOW);
    this.metrics.utilizationPercent = Math.round(
      (this.queue.length / this.config.maxDepth) * 100
    );
  }

  getMetrics(): QueueMetrics {
    return { ...this.metrics };
  }

  clear(): void {
    this.queue = [];
    this.updateMetrics();
  }

  isFull(): boolean {
    return this.queue.length >= this.config.maxDepth;
  }

  getPosition(id: string): number | null {
    const index = this.queue.findIndex((r) => r.id === id);
    return index === -1 ? null : index + 1;
  }
}

export const teamQueue = new TeamQueue();
