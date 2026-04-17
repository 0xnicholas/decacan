export interface RolloutConfig {
  enabled: boolean;
  cohorts: string[];
  percentage: number;
  featureFlags: Record<string, boolean>;
}

export interface RolloutStatus {
  rollout: RolloutConfig;
  isEnabled: boolean;
  isCohortMember: boolean;
  enabledFlags: string[];
}

const DEFAULT_ROLLOUT: RolloutConfig = {
  enabled: false,
  cohorts: [],
  percentage: 0,
  featureFlags: {
    'team-gateway': false,
    'team-sessions': false,
    'team-decisions': false,
    'team-queue': false,
    'team-recovery': false,
  },
};

export class TeamRollout {
  private config: RolloutConfig;

  constructor(config?: Partial<RolloutConfig>) {
    this.config = { ...DEFAULT_ROLLOUT, ...config };
  }

  static fromEnv(): TeamRollout {
    const enabled = process.env.TEAM_FEATURE_ENABLED === 'true';
    const cohorts = process.env.TEAM_COHORT_IDS?.split(',') ?? [];
    const percentage = parseInt(process.env.TEAM_ROLLOUT_PERCENTAGE ?? '0', 10);

    const featureFlags: Record<string, boolean> = {};
    const flagPrefix = 'TEAM_FLAG_';

    for (const [key, value] of Object.entries(process.env)) {
      if (key.startsWith(flagPrefix)) {
        const flagName = key.slice(flagPrefix.length).toLowerCase();
        featureFlags[flagName] = value === 'true';
      }
    }

    return new TeamRollout({
      enabled,
      cohorts,
      percentage,
      featureFlags,
    });
  }

  isEnabled(workspaceId: string): boolean {
    if (!this.config.enabled) {
      return false;
    }

    if (this.config.cohorts.length > 0) {
      return this.config.cohorts.includes(workspaceId);
    }

    if (this.config.percentage > 0) {
      const hash = this.hashWorkspaceId(workspaceId);
      return hash < this.config.percentage;
    }

    return false;
  }

  isFlagEnabled(flag: string): boolean {
    return this.config.featureFlags[flag] ?? false;
  }

  getStatus(workspaceId: string): RolloutStatus {
    return {
      rollout: { ...this.config },
      isEnabled: this.isEnabled(workspaceId),
      isCohortMember: this.config.cohorts.includes(workspaceId),
      enabledFlags: Object.entries(this.config.featureFlags)
        .filter(([, enabled]) => enabled)
        .map(([flag]) => flag),
    };
  }

  private hashWorkspaceId(workspaceId: string): number {
    let hash = 0;
    for (let i = 0; i < workspaceId.length; i++) {
      const char = workspaceId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash) % 100;
  }

  enableCohort(workspaceIds: string[]): void {
    this.config.enabled = true;
    this.config.cohorts = [...new Set([...this.config.cohorts, ...workspaceIds])];
    this.config.percentage = 0;
  }

  enablePercentage(percentage: number): void {
    this.config.enabled = true;
    this.config.cohorts = [];
    this.config.percentage = Math.min(100, Math.max(0, percentage));
  }

  disable(): void {
    this.config.enabled = false;
  }

  setFlag(flag: string, enabled: boolean): void {
    this.config.featureFlags[flag] = enabled;
  }
}

export const teamRollout = TeamRollout.fromEnv();
