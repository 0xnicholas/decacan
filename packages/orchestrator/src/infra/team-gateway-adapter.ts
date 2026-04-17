import type { ExecutionEvent, ExecutionInput, ExecutionRequest } from '../contract/index.js';
import type { ExecutionEnginePort, ExecutionHandle, ExecutionStatus } from '../runtime/ports.js';
import { TeamGatewayClient, type TeamGatewayConfig } from './team-gateway-client.js';

export type AdapterMode = 'in_process' | 'gateway';

export interface TeamGatewayAdapterConfig extends TeamGatewayConfig {
  mode: AdapterMode;
  inProcessEngine?: ExecutionEnginePort;
}

export class TeamGatewayAdapter implements ExecutionEnginePort {
  private gateway: TeamGatewayClient | null = null;
  private inProcess?: ExecutionEnginePort;
  private currentMode: AdapterMode;
  private config: TeamGatewayAdapterConfig;

  constructor(config: TeamGatewayAdapterConfig) {
    this.config = config;
    this.currentMode = config.mode;
    if (config.mode === 'in_process' && !config.inProcessEngine) {
      throw new Error('inProcessEngine is required when mode is in_process');
    }
    if (config.inProcessEngine) {
      this.inProcess = config.inProcessEngine;
    }
    if (config.mode === 'gateway') {
      this.gateway = new TeamGatewayClient(config);
    }
  }

  static createDefault(mode: AdapterMode = 'gateway'): TeamGatewayAdapter {
    return new TeamGatewayAdapter({
      mode,
      baseUrl: process.env.TEAM_GATEWAY_URL ?? 'http://localhost:4001',
      teamId: process.env.TEAM_ID ?? 'default',
      apiKey: process.env.TEAM_GATEWAY_API_KEY ?? '',
    });
  }

  async start(req: ExecutionRequest): Promise<ExecutionHandle> {
    if (this.currentMode === 'gateway' && this.gateway) {
      return this.gateway.start(req);
    }
    return this.inProcess!.start(req);
  }

  async submit(execution_id: string, input: ExecutionInput): Promise<void> {
    if (this.currentMode === 'gateway' && this.gateway) {
      return this.gateway.submit(execution_id, input);
    }
    return this.inProcess!.submit(execution_id, input);
  }

  async getStatus(execution_id: string): Promise<ExecutionStatus | null> {
    if (this.currentMode === 'gateway' && this.gateway) {
      return this.gateway.getStatus(execution_id);
    }
    return this.inProcess!.getStatus(execution_id);
  }

  async subscribeEvents(
    execution_id: string,
    onEvent: (event: ExecutionEvent) => void | Promise<void>
  ): Promise<() => void> {
    if (this.currentMode === 'gateway' && this.gateway) {
      return this.gateway.subscribeEvents(execution_id, onEvent);
    }
    return this.inProcess!.subscribeEvents(execution_id, onEvent);
  }

  switchMode(mode: AdapterMode): void {
    if (mode === 'gateway' && !this.gateway) {
      this.gateway = new TeamGatewayClient(this.config);
    }
    this.currentMode = mode;
  }
}