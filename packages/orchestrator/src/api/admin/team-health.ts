import { agentTeamTelemetry } from "../../telemetry/agent-team.js";

export interface TeamHealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  gateway: {
    reachable: boolean;
    latencyMs?: number;
    error?: string;
  };
  queue: {
    depth: number;
    maxDepth: number;
    utilizationPercent: number;
  };
  metrics: {
    activeSessions: number;
    totalDecisions: number;
    pendingApprovals: number;
    completedToday: number;
    failedToday: number;
  };
  lastRecoveryAt?: string;
}

export async function getTeamHealthStatus(): Promise<TeamHealthStatus> {
  const metrics = agentTeamTelemetry.getMetrics();

  const activeSessions = metrics.activeSessions;
  const failedToday = metrics.failedToday;

  let status: "healthy" | "degraded" | "unhealthy" = "healthy";
  if (activeSessions === 0 && failedToday > 0) {
    status = "degraded";
  }
  if (failedToday > 10) {
    status = "unhealthy";
  }

  return {
    status,
    timestamp: new Date().toISOString(),
    gateway: {
      reachable: true,
      latencyMs: agentTeamTelemetry.getAverageLatency("gateway"),
    },
    queue: {
      depth: activeSessions,
      maxDepth: 100,
      utilizationPercent: Math.min(100, activeSessions),
    },
    metrics: {
      activeSessions,
      totalDecisions: metrics.totalDecisions,
      pendingApprovals: metrics.pendingApprovals,
      completedToday: metrics.completedToday,
      failedToday,
    },
  };
}

export function isHealthy(status: TeamHealthStatus): boolean {
  return status.status === "healthy";
}

export function isDegraded(status: TeamHealthStatus): boolean {
  return status.status === "degraded";
}
