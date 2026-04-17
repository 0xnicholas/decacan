import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TeamSessionStore } from '../src/db/team-sessions.js';
import { db } from '../src/db/client.js';
import { teamSessions, teamDelegations } from '../src/db/schema.js';
import { eq } from 'drizzle-orm';

describe('TeamSessionStore', () => {
  let store: TeamSessionStore;
  const workspaceId = '00000000-0000-0000-0000-000000000001';
  const taskId = '00000000-0000-0000-0000-000000000002';
  const executionId = 'exec-123';

  beforeEach(async () => {
    store = new TeamSessionStore();
    await db.delete(teamDelegations);
    await db.delete(teamSessions);
  });

  afterEach(async () => {
    await db.delete(teamDelegations);
    await db.delete(teamSessions);
  });

  describe('createSession', () => {
    it('creates a new team session', async () => {
      const snapshot = { agents: ['agent1', 'agent2'] };
      const session = await store.createSession(workspaceId, taskId, executionId, snapshot);

      expect(session.id).toBeDefined();
      expect(session.workspaceId).toBe(workspaceId);
      expect(session.taskId).toBe(taskId);
      expect(session.executionId).toBe(executionId);
      expect(session.phase).toBe('initialized');
      expect(session.snapshot).toEqual(snapshot);
      expect(session.createdAt).toBeInstanceOf(Date);
      expect(session.updatedAt).toBeInstanceOf(Date);
      expect(session.completedAt).toBeFalsy();
    });

    it('creates session with empty snapshot by default', async () => {
      const session = await store.createSession(workspaceId, taskId, executionId);

      expect(session.snapshot).toEqual({});
    });
  });

  describe('getSession', () => {
    it('retrieves session by id', async () => {
      const created = await store.createSession(workspaceId, taskId, executionId);

      const retrieved = await store.getSession(created.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved!.id).toBe(created.id);
      expect(retrieved!.workspaceId).toBe(workspaceId);
      expect(retrieved!.taskId).toBe(taskId);
    });

    it('returns null for nonexistent id', async () => {
      const result = await store.getSession('00000000-0000-0000-0000-000000000099');

      expect(result).toBeNull();
    });
  });

  describe('getSessionByTask', () => {
    it('retrieves session by task id', async () => {
      await store.createSession(workspaceId, taskId, executionId);

      const retrieved = await store.getSessionByTask(taskId);

      expect(retrieved).not.toBeNull();
      expect(retrieved!.taskId).toBe(taskId);
      expect(retrieved!.executionId).toBe(executionId);
    });

    it('returns null for nonexistent task id', async () => {
      const result = await store.getSessionByTask('00000000-0000-0000-0000-000000000099');

      expect(result).toBeNull();
    });
  });

  describe('updatePhase', () => {
    it('updates phase and blocked reason', async () => {
      const session = await store.createSession(workspaceId, taskId, executionId);

      await store.updatePhase(session.id, 'running', 'waiting for approval');

      const updated = await store.getSession(session.id);
      expect(updated!.phase).toBe('running');
      expect(updated!.blockedReason).toBe('waiting for approval');
    });

    it('updates phase without blocked reason', async () => {
      const session = await store.createSession(workspaceId, taskId, executionId);

      await store.updatePhase(session.id, 'running');

      const updated = await store.getSession(session.id);
      expect(updated!.phase).toBe('running');
      expect(updated!.blockedReason).toBeFalsy();
    });
  });

  describe('completeSession', () => {
    it('sets phase to completed', async () => {
      const session = await store.createSession(workspaceId, taskId, executionId);

      await store.completeSession(session.id);

      const completed = await store.getSession(session.id);
      expect(completed!.phase).toBe('completed');
      expect(completed!.completedAt).toBeInstanceOf(Date);
    });
  });

  describe('getActiveSessions', () => {
    it('returns running sessions for workspace', async () => {
      const session1 = await store.createSession(workspaceId, taskId, executionId);
      await store.updatePhase(session1.id, 'running');

      const taskId2 = '00000000-0000-0000-0000-000000000003';
      const session2 = await store.createSession(workspaceId, taskId2, 'exec-456');
      await store.completeSession(session2.id);

      const taskId3 = '00000000-0000-0000-0000-000000000004';
      const session3 = await store.createSession(workspaceId, taskId3, 'exec-789');
      await store.updatePhase(session3.id, 'running');

      const activeSessions = await store.getActiveSessions(workspaceId);

      expect(activeSessions).toHaveLength(2);
      expect(activeSessions.map(s => s.id).sort()).toEqual([session1.id, session3.id].sort());
    });

    it('returns empty array when no active sessions', async () => {
      const session = await store.createSession(workspaceId, taskId, executionId);
      await store.completeSession(session.id);

      const activeSessions = await store.getActiveSessions(workspaceId);

      expect(activeSessions).toHaveLength(0);
    });
  });

  describe('createDelegation', () => {
    it('creates a delegation', async () => {
      const session = await store.createSession(workspaceId, taskId, executionId);

      const delegation = await store.createDelegation(
        session.id,
        'delegator-1',
        'delegate-1',
        'code_execution'
      );

      expect(delegation.id).toBeDefined();
      expect(delegation.teamSessionId).toBe(session.id);
      expect(delegation.delegatorId).toBe('delegator-1');
      expect(delegation.delegateId).toBe('delegate-1');
      expect(delegation.capability).toBe('code_execution');
      expect(delegation.grantedAt).toBeInstanceOf(Date);
      expect(delegation.expiresAt).toBeFalsy();
      expect(delegation.revokedAt).toBeFalsy();
    });

    it('creates delegation with expiration', async () => {
      const session = await store.createSession(workspaceId, taskId, executionId);
      const expiresAt = new Date(Date.now() + 3600000);

      const delegation = await store.createDelegation(
        session.id,
        'delegator-1',
        'delegate-1',
        'file_write',
        expiresAt
      );

      expect(delegation.expiresAt).toEqual(expiresAt);
    });
  });

  describe('getDelegations', () => {
    it('returns delegations for session', async () => {
      const session = await store.createSession(workspaceId, taskId, executionId);
      await store.createDelegation(session.id, 'delegator-1', 'delegate-1', 'cap1');
      await store.createDelegation(session.id, 'delegator-2', 'delegate-2', 'cap2');

      const delegations = await store.getDelegations(session.id);

      expect(delegations).toHaveLength(2);
    });

    it('returns empty array for session with no delegations', async () => {
      const session = await store.createSession(workspaceId, taskId, executionId);

      const delegations = await store.getDelegations(session.id);

      expect(delegations).toHaveLength(0);
    });
  });

  describe('revokeDelegation', () => {
    it('sets revokedAt timestamp', async () => {
      const session = await store.createSession(workspaceId, taskId, executionId);
      const delegation = await store.createDelegation(
        session.id,
        'delegator-1',
        'delegate-1',
        'cap1'
      );

      await store.revokeDelegation(delegation.id);

      const delegations = await store.getDelegations(session.id);
      const revoked = delegations.find(d => d.id === delegation.id);
      expect(revoked!.revokedAt).toBeInstanceOf(Date);
    });
  });
});