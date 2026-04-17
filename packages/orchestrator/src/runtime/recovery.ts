import { teamSessionStore, type TeamSession } from '../db/team-sessions.js';

export interface RecoveryResult {
  recoveredSessions: TeamSession[];
  failedSessions: { sessionId: string; error: string }[];
}

export class TeamRecovery {
  async recoverActiveSessions(workspaceId: string): Promise<RecoveryResult> {
    const result: RecoveryResult = {
      recoveredSessions: [],
      failedSessions: [],
    };

    const activeSessions = await teamSessionStore.getActiveSessions(workspaceId);

    for (const session of activeSessions) {
      try {
        const isValid = await this.validateSession(session);
        if (isValid) {
          await this.rebindSession(session);
          result.recoveredSessions.push(session);
        } else {
          await teamSessionStore.updatePhase(session.id, 'failed', 'stale session');
          result.failedSessions.push({
            sessionId: session.id,
            error: 'Session validation failed - marked as failed',
          });
        }
      } catch (error) {
        result.failedSessions.push({
          sessionId: session.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return result;
  }

  private async validateSession(session: TeamSession): Promise<boolean> {
    if (session.completedAt) {
      return false;
    }

    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (session.createdAt < cutoff) {
      return false;
    }

    return true;
  }

  private async rebindSession(session: TeamSession): Promise<void> {
    const snapshot = { ...session.snapshot } as Record<string, unknown>;
    let modified = false;

    if (snapshot.continuationToken) {
      const tokenAge = Date.now() - ((snapshot.lastTokenUpdate as number) || 0);
      if (tokenAge > 24 * 60 * 60 * 1000) {
        delete snapshot.continuationToken;
        modified = true;
      }
    }

    if (modified) {
      await teamSessionStore.updateSnapshot(session.id, snapshot);
      await teamSessionStore.updatePhase(session.id, session.phase, 'session rebind - stale token cleared');
    }
  }

  async getRecoveryStatus(workspaceId: string): Promise<{
    activeCount: number;
    recoveredCount: number;
    failedCount: number;
    lastRecoveryAt: Date;
  }> {
    const activeSessions = await teamSessionStore.getActiveSessions(workspaceId);

    return {
      activeCount: activeSessions.length,
      recoveredCount: 0,
      failedCount: 0,
      lastRecoveryAt: new Date(),
    };
  }
}

export const teamRecovery = new TeamRecovery();
