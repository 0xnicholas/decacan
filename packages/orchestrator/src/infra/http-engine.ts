import type { ExecutionEvent, ExecutionInput, ExecutionRequest } from '../contract/index.js';
import { isCompatible, PROTOCOL_VERSION } from '../contract/index.js';
import type { ExecutionEnginePort, ExecutionHandle, ExecutionStatus } from '../runtime/ports.js';

export interface HttpEngineClientConfig {
  baseUrl: string;
  timeoutMs?: number;
}

export class HttpExecutionEngineClient implements ExecutionEnginePort {
  private httpClient: typeof fetch;

  constructor(private config: HttpEngineClientConfig) {
    this.httpClient = fetch;
  }

  async start(req: ExecutionRequest): Promise<ExecutionHandle> {
    const url = `${this.config.baseUrl}/api/executions`;
    const response = await this.httpClient(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ request: req }),
    });

    if (!response.ok) {
      throw new Error(`Engine start failed: ${response.status}`);
    }

    const data = (await response.json()) as {
      execution_id: string;
      protocol_version: string;
    };

    if (!isCompatible(data.protocol_version)) {
      throw new Error(
        `Protocol mismatch: remote=${data.protocol_version}, local=${PROTOCOL_VERSION}`
      );
    }

    return { execution_id: data.execution_id };
  }

  async submit(execution_id: string, input: ExecutionInput): Promise<void> {
    const url = `${this.config.baseUrl}/api/executions/${execution_id}/input`;
    const response = await this.httpClient(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ input }),
    });

    if (!response.ok) {
      throw new Error(`Engine submit failed: ${response.status}`);
    }
  }

  async getStatus(execution_id: string): Promise<ExecutionStatus | null> {
    const url = `${this.config.baseUrl}/api/executions/${execution_id}`;
    try {
      const response = await this.httpClient(url);
      if (response.status === 404) return null;
      if (!response.ok) throw new Error(`Engine status failed: ${response.status}`);
      const data = (await response.json()) as {
        execution_id: string;
        state: string;
        phase?: string;
      };
      return {
        execution_id: data.execution_id,
        state: data.state as ExecutionStatus['state'],
        phase: data.phase,
      };
    } catch {
      return null;
    }
  }

  async subscribeEvents(
    execution_id: string,
    onEvent: (event: ExecutionEvent) => void | Promise<void>
  ): Promise<() => void> {
    const url = `${this.config.baseUrl}/api/executions/${execution_id}/events`;
    const abort = new AbortController();

    const run = async () => {
      try {
        const response = await this.httpClient(url, {
          headers: { Accept: 'text/event-stream' },
          signal: abort.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`SSE connection failed: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (!abort.signal.aborted) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data:')) {
              const data = trimmed.slice(5).trim();
              if (!data) continue;
              try {
                const event = JSON.parse(data) as ExecutionEvent;
                await onEvent(event);
              } catch {}
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('SSE error:', err);
        }
      }
    };

    void run();

    return () => {
      abort.abort();
    };
  }
}
