import type { ExecutionEvent, ExecutionRequest, ExecutionInput } from '../contract/index.js';
import type { ExecutionHandle, ExecutionStatus } from '../runtime/ports.js';
import type { RetryConfig } from './retry.js';
import { withRetry, isIdempotentRequest } from './retry.js';
import { RequestSigner, type SigningConfig } from './signing.js';

export interface TeamGatewayConfig {
  baseUrl: string;
  teamId: string;
  apiKey: string;
  timeoutMs?: number;
  retryConfig?: RetryConfig;
  idempotencyKeyHeader?: string;
  signing?: SigningConfig;
}

export class TeamGatewayClient {
  private config: Required<TeamGatewayConfig>;
  private signer: RequestSigner | null = null;

  constructor(config: TeamGatewayConfig) {
    this.config = {
      baseUrl: config.baseUrl.replace(/\/$/, ''),
      teamId: config.teamId,
      apiKey: config.apiKey,
      timeoutMs: config.timeoutMs ?? 30000,
      retryConfig: config.retryConfig ?? {
        maxAttempts: 3,
        initialDelayMs: 100,
        maxDelayMs: 5000,
        backoffMultiplier: 2,
      },
      idempotencyKeyHeader: config.idempotencyKeyHeader ?? 'X-Idempotency-Key',
    };

    if (config.signing) {
      this.signer = new RequestSigner(config.signing);
    }
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    idempotencyKey?: string
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
      'X-Team-ID': this.config.teamId,
    };

    if (idempotencyKey && !isIdempotentRequest(method)) {
      headers[this.config.idempotencyKeyHeader] = idempotencyKey;
    }

    if (this.signer) {
      const sig = this.signer.signRequest(method, path, JSON.stringify(body));
      headers['X-Signature'] = sig.signature;
      headers['X-Timestamp'] = sig.timestamp.toString();
      headers['X-Nonce'] = sig.nonce;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const response = await fetch(`${this.config.baseUrl}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`) as any;
        error.statusCode = response.status;
        error.retryable = response.status >= 500 || response.status === 429;
        throw error;
      }

      return response.json() as Promise<T>;
    } finally {
      clearTimeout(timeout);
    }
  }

  async start(req: ExecutionRequest): Promise<ExecutionHandle> {
    return withRetry(
      () => this.request<ExecutionHandle>('/api/executions', 'POST', req),
      this.config.retryConfig,
      (err) => err.retryable
    );
  }

  async submit(execution_id: string, input: ExecutionInput): Promise<void> {
    const idempotencyKey = `submit-${execution_id}-${Date.now()}`;
    return withRetry(
      () => this.request<void>(`/api/executions/${execution_id}/input`, 'POST', input, idempotencyKey),
      this.config.retryConfig,
      (err) => err.retryable
    );
  }

  async getStatus(execution_id: string): Promise<ExecutionStatus | null> {
    try {
      return await this.request<ExecutionStatus | null>(`/api/executions/${execution_id}`, 'GET');
    } catch (error) {
      if ((error as any).statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  async subscribeEvents(
    execution_id: string,
    onEvent: (event: ExecutionEvent) => void | Promise<void>
  ): Promise<() => void> {
    const headers: Record<string, string> = {
      'Accept': 'text/event-stream',
      'Authorization': `Bearer ${this.config.apiKey}`,
      'X-Team-ID': this.config.teamId,
    };

    const response = await fetch(`${this.config.baseUrl}/api/executions/${execution_id}/events`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to subscribe: HTTP ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    const processEvents = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') return;
              try {
                const event = JSON.parse(data) as ExecutionEvent;
                await onEvent(event);
              } catch {}
            }
          }
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Event stream error:', error);
        }
      }
    };

    processEvents().catch((err) => {
      if ((err as Error).name !== 'AbortError') {
        console.error('Event stream error:', err);
      }
    });

    return () => reader.cancel();
  }
}