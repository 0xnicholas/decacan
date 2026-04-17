export enum ActionClass {
  HUMAN_MANDATORY = 'human_mandatory',
  ASSISTANT_DELEGABLE = 'assistant_delegable',
  FORBIDDEN = 'forbidden',
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface PolicyRule {
  action: string;
  actionClass: ActionClass;
  riskLevel: RiskLevel;
  requiresApproval: boolean;
  approverRole?: 'human' | 'assistant' | 'any';
}

export interface PolicyProfile {
  id: string;
  name: string;
  rules: PolicyRule[];
  createdAt: Date;
}

const DEFAULT_POLICY_RULES: PolicyRule[] = [
  {
    action: 'file:write',
    actionClass: ActionClass.HUMAN_MANDATORY,
    riskLevel: RiskLevel.HIGH,
    requiresApproval: true,
    approverRole: 'human',
  },
  {
    action: 'file:delete',
    actionClass: ActionClass.HUMAN_MANDATORY,
    riskLevel: RiskLevel.CRITICAL,
    requiresApproval: true,
    approverRole: 'human',
  },
  {
    action: 'code:execute',
    actionClass: ActionClass.HUMAN_MANDATORY,
    riskLevel: RiskLevel.HIGH,
    requiresApproval: true,
    approverRole: 'human',
  },
  {
    action: 'network:external',
    actionClass: ActionClass.HUMAN_MANDATORY,
    riskLevel: RiskLevel.MEDIUM,
    requiresApproval: true,
    approverRole: 'human',
  },
  {
    action: 'data:read',
    actionClass: ActionClass.ASSISTANT_DELEGABLE,
    riskLevel: RiskLevel.LOW,
    requiresApproval: false,
  },
  {
    action: 'data:write',
    actionClass: ActionClass.ASSISTANT_DELEGABLE,
    riskLevel: RiskLevel.MEDIUM,
    requiresApproval: false,
  },
  {
    action: 'task:create',
    actionClass: ActionClass.ASSISTANT_DELEGABLE,
    riskLevel: RiskLevel.LOW,
    requiresApproval: false,
  },
  {
    action: 'task:complete',
    actionClass: ActionClass.ASSISTANT_DELEGABLE,
    riskLevel: RiskLevel.LOW,
    requiresApproval: false,
  },
  {
    action: 'system:admin',
    actionClass: ActionClass.FORBIDDEN,
    riskLevel: RiskLevel.CRITICAL,
    requiresApproval: true,
    approverRole: 'human',
  },
  {
    action: 'security:bypass',
    actionClass: ActionClass.FORBIDDEN,
    riskLevel: RiskLevel.CRITICAL,
    requiresApproval: true,
    approverRole: 'human',
  },
];

export class PolicyMatrix {
  private profiles: Map<string, PolicyProfile> = new Map();

  constructor() {
    this.registerDefaultProfile();
  }

  private registerDefaultProfile(): void {
    const defaultProfile: PolicyProfile = {
      id: 'default',
      name: 'Default Policy Profile',
      rules: DEFAULT_POLICY_RULES,
      createdAt: new Date(),
    };
    this.profiles.set(defaultProfile.id, defaultProfile);
  }

  registerProfile(profile: PolicyProfile): void {
    this.profiles.set(profile.id, profile);
  }

  getProfile(profileId: string): PolicyProfile | undefined {
    return this.profiles.get(profileId);
  }

  getRule(profileId: string, action: string): PolicyRule | undefined {
    const profile = this.profiles.get(profileId);
    if (!profile) return undefined;
    return profile.rules.find(rule => rule.action === action);
  }

  classifyAction(profileId: string, action: string): ActionClass {
    const rule = this.getRule(profileId, action);
    return rule?.actionClass ?? ActionClass.FORBIDDEN;
  }

  requiresApproval(profileId: string, action: string): boolean {
    const rule = this.getRule(profileId, action);
    return rule?.requiresApproval ?? true;
  }

  getRiskLevel(profileId: string, action: string): RiskLevel {
    const rule = this.getRule(profileId, action);
    return rule?.riskLevel ?? RiskLevel.CRITICAL;
  }

  getAllActions(profileId: string): PolicyRule[] {
    const profile = this.profiles.get(profileId);
    return profile?.rules ?? [];
  }
}

export const policyMatrix = new PolicyMatrix();
