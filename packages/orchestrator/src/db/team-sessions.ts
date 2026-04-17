import { eq, and } from 'drizzle-orm';
import { db } from './client.js';
import { teamSessions, teamDelegations } from './schema.js';

export interface TeamSession {
  id: string;
  workspaceId: string;
  taskId: string;
  executionId: string;
  phase: string;
  blockedReason?: string;
  snapshot: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface TeamDelegation {
  id: string;
  teamSessionId: string;
  delegatorId: string;
  delegateId: string;
  capability: string;
  grantedAt: Date;
  expiresAt?: Date;
  revokedAt?: Date;
}

export class TeamSessionStore {
  async createSession(
    workspaceId: string,
    taskId: string,
    executionId: string,
    snapshot: Record<string, unknown> = {}
  ): Promise<TeamSession> {
    const [session] = await db.insert(teamSessions).values({
      workspaceId,
      taskId,
      executionId,
      phase: 'initialized',
      snapshot,
    }).returning();
    return session as TeamSession;
  }

  async getSession(id: string): Promise<TeamSession | null> {
    const row = await db.query.teamSessions.findFirst({
      where: eq(teamSessions.id, id),
    });
    return row as TeamSession | null;
  }

  async getSessionByTask(taskId: string): Promise<TeamSession | null> {
    const row = await db.query.teamSessions.findFirst({
      where: eq(teamSessions.taskId, taskId),
    });
    return row as TeamSession | null;
  }

  async updatePhase(id: string, phase: string, blockedReason?: string): Promise<void> {
    await db.update(teamSessions)
      .set({ phase, blockedReason, updatedAt: new Date() })
      .where(eq(teamSessions.id, id));
  }

  async updateSnapshot(id: string, snapshot: Record<string, unknown>): Promise<void> {
    await db.update(teamSessions)
      .set({ snapshot, updatedAt: new Date() })
      .where(eq(teamSessions.id, id));
  }

  async completeSession(id: string): Promise<void> {
    await db.update(teamSessions)
      .set({ phase: 'completed', completedAt: new Date(), updatedAt: new Date() })
      .where(eq(teamSessions.id, id));
  }

  async getActiveSessions(workspaceId: string): Promise<TeamSession[]> {
    const rows = await db.query.teamSessions.findMany({
      where: and(
        eq(teamSessions.workspaceId, workspaceId),
        eq(teamSessions.phase, 'running')
      ),
    });
    return rows as TeamSession[];
  }

  async createDelegation(
    teamSessionId: string,
    delegatorId: string,
    delegateId: string,
    capability: string,
    expiresAt?: Date
  ): Promise<TeamDelegation> {
    const [delegation] = await db.insert(teamDelegations).values({
      teamSessionId,
      delegatorId,
      delegateId,
      capability,
      expiresAt,
    }).returning();
    return delegation as TeamDelegation;
  }

  async getDelegations(teamSessionId: string): Promise<TeamDelegation[]> {
    const rows = await db.query.teamDelegations.findMany({
      where: eq(teamDelegations.teamSessionId, teamSessionId),
    });
    return rows as TeamDelegation[];
  }

  async revokeDelegation(id: string): Promise<void> {
    await db.update(teamDelegations)
      .set({ revokedAt: new Date() })
      .where(eq(teamDelegations.id, id));
  }
}

export const teamSessionStore = new TeamSessionStore();