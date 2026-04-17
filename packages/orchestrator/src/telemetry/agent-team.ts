export enum AgentTeamEvent {
  SESSION_START = "agent_team.session.start",
  SESSION_COMPLETE = "agent_team.session.complete",
  SESSION_FAIL = "agent_team.session.fail",
  APPROVAL_BLOCK = "agent_team.approval.block",
  APPROVAL_CONTINUE = "agent_team.approval.continue",
  DELEGATION_CREATE = "agent_team.delegation.create",
  DELEGATION_EXPIRE = "agent_team.delegation.expire",
  DECISION_RECORD = "agent_team.decision.record",
}

export interface TelemetrySpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  event: AgentTeamEvent;
  timestamp: number;
  metadata: Record<string, unknown>;
}

export interface TeamMetrics {
  activeSessions: number;
  totalDecisions: number;
  pendingApprovals: number;
  completedToday: number;
  failedToday: number;
  averageSessionDurationMs: number;
}

class AgentTeamTelemetry {
  private spans: TelemetrySpan[] = [];
  private counters: Map<string, number> = new Map();
  private latencies: Map<string, number[]> = new Map();

  generateTraceId(): string {
    return `trace-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }

  generateSpanId(): string {
    return `span-${Math.random().toString(36).slice(2, 11)}`;
  }

  startSpan(
    event: AgentTeamEvent,
    parentSpanId?: string,
    metadata: Record<string, unknown> = {}
  ): TelemetrySpan {
    const span: TelemetrySpan = {
      traceId: this.generateTraceId(),
      spanId: this.generateSpanId(),
      parentSpanId,
      event,
      timestamp: Date.now(),
      metadata,
    };
    this.spans.push(span);
    this.incrementCounter(`${event}.count`);
    return span;
  }

  recordLatency(event: string, durationMs: number): void {
    const key = `${event}.latency`;
    const existing = this.latencies.get(key) ?? [];
    existing.push(durationMs);
    if (existing.length > 1000) {
      existing.shift();
    }
    this.latencies.set(key, existing);
  }

  incrementCounter(name: string, delta = 1): void {
    const current = this.counters.get(name) ?? 0;
    this.counters.set(name, current + delta);
  }

  getCounter(name: string): number {
    return this.counters.get(name) ?? 0;
  }

  getAverageLatency(event: string): number {
    const key = `${event}.latency`;
    const values = this.latencies.get(key) ?? [];
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  getSpans(traceId?: string): TelemetrySpan[] {
    if (traceId) {
      return this.spans.filter((s) => s.traceId === traceId);
    }
    return [...this.spans];
  }

  getMetrics(): TeamMetrics {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();

    const todaySessions = this.spans.filter(
      (s) =>
        s.event === AgentTeamEvent.SESSION_COMPLETE &&
        s.timestamp >= todayMs
    ).length;

    const todayFailed = this.spans.filter(
      (s) => s.event === AgentTeamEvent.SESSION_FAIL && s.timestamp >= todayMs
    ).length;

    return {
      activeSessions: this.getCounter("agent_team.session.start.count") -
        this.getCounter("agent_team.session.complete.count") -
        this.getCounter("agent_team.session.fail.count"),
      totalDecisions: this.getCounter(AgentTeamEvent.DECISION_RECORD + ".count"),
      pendingApprovals: this.getCounter(AgentTeamEvent.APPROVAL_BLOCK + ".count"),
      completedToday: todaySessions,
      failedToday: todayFailed,
      averageSessionDurationMs: this.getAverageLatency("session"),
    };
  }

  clear(): void {
    this.spans = [];
    this.counters.clear();
    this.latencies.clear();
  }
}

export const agentTeamTelemetry = new AgentTeamTelemetry();
