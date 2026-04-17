import { eq, and } from 'drizzle-orm';
import { db } from './client.js';
import { assistantSessions, teamSessions } from './schema.js';

export interface AssistantSession {
  id: string;
  workspaceId: string;
  taskId: string;
  teamSessionId: string;
  objective: Record<string, unknown>;
  executionMode: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export class AssistantSessionStore {
  async createSession(
    workspaceId: string,
    taskId: string,
    teamSessionId: string,
    objective: Record<string, unknown>,
    executionMode: string = 'interactive'
  ): Promise<AssistantSession> {
    const [session] = await db.insert(assistantSessions).values({
      workspaceId,
      taskId,
      teamSessionId,
      objective,
      executionMode,
      status: 'active',
    }).returning();
    return session as AssistantSession;
  }

  async getSession(id: string): Promise<AssistantSession | null> {
    const row = await db.query.assistantSessions.findFirst({
      where: eq(assistantSessions.id, id),
    });
    return row ? row as AssistantSession : null;
  }

  async getActiveSessionByWorkspace(workspaceId: string): Promise<AssistantSession | null> {
    const row = await db.query.assistantSessions.findFirst({
      where: and(
        eq(assistantSessions.workspaceId, workspaceId),
        eq(assistantSessions.status, 'active')
      ),
    });
    return row ? row as AssistantSession : null;
  }

  async completeSession(id: string): Promise<void> {
    await db.update(assistantSessions)
      .set({ status: 'completed', updatedAt: new Date() })
      .where(eq(assistantSessions.id, id));
  }

  async getSessionWithTeamSession(id: string): Promise<{ assistant: AssistantSession; teamSession: typeof teamSessions.$inferSelect } | null> {
    const assistant = await this.getSession(id);
    if (!assistant) return null;
    
    const teamSessionRow = await db.query.teamSessions.findFirst({
      where: eq(teamSessions.id, assistant.teamSessionId),
    });
    if (!teamSessionRow) return null;
    
    return { assistant, teamSession: teamSessionRow };
  }
}

export const assistantSessionStore = new AssistantSessionStore();