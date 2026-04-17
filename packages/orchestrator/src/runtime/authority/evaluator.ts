import { policyMatrix, ActionClass, RiskLevel } from './policy-matrix.js';

export interface DelegationGrant {
  delegatorId: string;
  delegateId: string;
  capabilities: string[];
  grantedAt: Date;
  expiresAt?: Date;
  revokedAt?: Date;
}

export interface AuthorizationRequest {
  actorId: string;
  action: string;
  profileId: string;
  resourceOwnerId?: string;
}

export interface AuthorizationResult {
  authorized: boolean;
  actionClass: ActionClass;
  reason: string;
  requiresApproval: boolean;
  approverRole?: 'human' | 'assistant' | 'any';
}

export class AuthorityEvaluator {
  evaluate(request: AuthorizationRequest, grants: DelegationGrant[] = []): AuthorizationResult {
    const { actorId, action, profileId, resourceOwnerId } = request;

    const actionClass = policyMatrix.classifyAction(profileId, action);
    const rule = policyMatrix.getRule(profileId, action);

    switch (actionClass) {
      case ActionClass.FORBIDDEN:
        return {
          authorized: false,
          actionClass,
          reason: `Action '${action}' is explicitly forbidden by policy`,
          requiresApproval: true,
          approverRole: 'human',
        };

      case ActionClass.HUMAN_MANDATORY:
        if (resourceOwnerId && actorId === resourceOwnerId) {
          return {
            authorized: true,
            actionClass,
            reason: 'Resource owner performing mandatory-human action',
            requiresApproval: true,
            approverRole: 'human',
          };
        }
        return {
          authorized: false,
          actionClass,
          reason: `Action '${action}' requires human approval`,
          requiresApproval: true,
          approverRole: rule?.approverRole ?? 'human',
        };

      case ActionClass.ASSISTANT_DELEGABLE:
        if (this.hasCapability(actorId, action, grants)) {
          return {
            authorized: true,
            actionClass,
            reason: 'Assistant has required capability',
            requiresApproval: false,
          };
        }

        const canSelfApprove = this.canDelegateToSelf(actorId, action, grants);
        return {
          authorized: canSelfApprove,
          actionClass,
          reason: canSelfApprove
            ? 'Assistant can self-approve this action'
            : `Assistant lacks capability '${action}'`,
          requiresApproval: !canSelfApprove,
        };

      default:
        return {
          authorized: false,
          actionClass: ActionClass.FORBIDDEN,
          reason: `Unknown action class for '${action}'`,
          requiresApproval: true,
          approverRole: 'human',
        };
    }
  }

  private hasCapability(actorId: string, action: string, grants: DelegationGrant[]): boolean {
    for (const grant of grants) {
      if (grant.delegateId === actorId && !this.isRevoked(grant)) {
        if (grant.capabilities.includes(action) || grant.capabilities.includes('*')) {
          return true;
        }
      }
    }
    return false;
  }

  private canDelegateToSelf(actorId: string, action: string, grants: DelegationGrant[]): boolean {
    for (const grant of grants) {
      if (grant.delegatorId === actorId && grant.delegateId === actorId && !this.isRevoked(grant)) {
        if (grant.capabilities.includes(action) || grant.capabilities.includes('*')) {
          return true;
        }
      }
    }
    return false;
  }

  private isRevoked(grant: DelegationGrant): boolean {
    if (grant.revokedAt) return true;
    if (grant.expiresAt && grant.expiresAt < new Date()) return true;
    return false;
  }

  evaluateWithRisk(profileId: string, action: string): {
    actionClass: ActionClass;
    riskLevel: RiskLevel;
    requiresApproval: boolean;
  } {
    return {
      actionClass: policyMatrix.classifyAction(profileId, action),
      riskLevel: policyMatrix.getRiskLevel(profileId, action),
      requiresApproval: policyMatrix.requiresApproval(profileId, action),
    };
  }
}

export const authorityEvaluator = new AuthorityEvaluator();
