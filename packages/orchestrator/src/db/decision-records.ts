import { eq, desc } from 'drizzle-orm';
import { db } from './client.js';
import { decisionRecords } from './schema.js';

export interface DecisionRecord {
  id: string;
  teamSessionId: string;
  taskId: string;
  executionId: string;
  decisionType: string;
  decision: string;
  reason?: string;
  policyId?: string;
  riskLevel?: string;
  decidedBy: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export class DecisionRecordStore {
  async createRecord(data: {
    teamSessionId: string;
    taskId: string;
    executionId: string;
    decisionType: string;
    decision: string;
    reason?: string;
    policyId?: string;
    riskLevel?: string;
    decidedBy: string;
    metadata?: Record<string, unknown>;
  }): Promise<DecisionRecord> {
    const [record] = await db.insert(decisionRecords).values({
      teamSessionId: data.teamSessionId,
      taskId: data.taskId,
      executionId: data.executionId,
      decisionType: data.decisionType,
      decision: data.decision,
      reason: data.reason,
      policyId: data.policyId,
      riskLevel: data.riskLevel,
      decidedBy: data.decidedBy,
      metadata: data.metadata ?? {},
    }).returning();
    return record as DecisionRecord;
  }

  async getRecord(id: string): Promise<DecisionRecord | null> {
    const row = await db.query.decisionRecords.findFirst({
      where: eq(decisionRecords.id, id),
    });
    return row as DecisionRecord | null;
  }

  async getRecordsByTask(taskId: string): Promise<DecisionRecord[]> {
    const rows = await db.query.decisionRecords.findMany({
      where: eq(decisionRecords.taskId, taskId),
      orderBy: [desc(decisionRecords.createdAt)],
    });
    return rows as DecisionRecord[];
  }

  async getRecordsByTeamSession(teamSessionId: string): Promise<DecisionRecord[]> {
    const rows = await db.query.decisionRecords.findMany({
      where: eq(decisionRecords.teamSessionId, teamSessionId),
      orderBy: [desc(decisionRecords.createdAt)],
    });
    return rows as DecisionRecord[];
  }

  async getRecordsByExecution(executionId: string): Promise<DecisionRecord[]> {
    const rows = await db.query.decisionRecords.findMany({
      where: eq(decisionRecords.executionId, executionId),
      orderBy: [desc(decisionRecords.createdAt)],
    });
    return rows as DecisionRecord[];
  }

  async getAuditTrail(
    taskId: string,
    limit: number = 100
  ): Promise<DecisionRecord[]> {
    const rows = await db.query.decisionRecords.findMany({
      where: eq(decisionRecords.taskId, taskId),
      orderBy: [desc(decisionRecords.createdAt)],
      limit,
    });
    return rows as DecisionRecord[];
  }
}

export const decisionRecordStore = new DecisionRecordStore();
