import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withRetry, isIdempotentRequest, type RetryConfig, type RetryableError } from '../src/infra/retry.js';
import { TeamGatewayClient, type TeamGatewayConfig } from '../src/infra/team-gateway-client.js';
import type { ExecutionRequest, ExecutionHandle } from '../src/contract/index.js';

describe('isIdempotentRequest', () => {
  it('returns true for GET requests', () => {
    expect(isIdempotentRequest('GET')).toBe(true);
  });

  it('returns true for HEAD requests', () => {
    expect(isIdempotentRequest('HEAD')).toBe(true);
  });

  it('returns true for OPTIONS requests', () => {
    expect(isIdempotentRequest('OPTIONS')).toBe(true);
  });

  it('returns false for POST requests', () => {
    expect(isIdempotentRequest('POST')).toBe(false);
  });

  it('returns false for PUT requests', () => {
    expect(isIdempotentRequest('PUT')).toBe(false);
  });

  it('returns false for DELETE requests', () => {
    expect(isIdempotentRequest('DELETE')).toBe(false);
  });

  it('returns false for PATCH requests', () => {
    expect(isIdempotentRequest('PATCH')).toBe(false);
  });
});

describe('withRetry', () => {
  const defaultConfig: RetryConfig = {
    maxAttempts: 3,
    initialDelayMs: 10,
    maxDelayMs: 100,
    backoffMultiplier: 2,
  };

  it('succeeds on first attempt', async () => {
    const operation = vi.fn().mockResolvedValue('success');
    const result = await withRetry(operation, defaultConfig);
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('retries on failure and eventually succeeds', async () => {
    const operation = vi.fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValue('success');

    const result = await withRetry(operation, defaultConfig);
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('throws after max attempts exceeded', async () => {
    const operation = vi.fn().mockRejectedValue(new Error('always fails'));
    await expect(withRetry(operation, defaultConfig)).rejects.toThrow('always fails');
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('respects shouldRetry callback and does not retry when it returns false', async () => {
    const error = new Error('non-retryable error') as RetryableError;
    error.retryable = false;
    error.statusCode = 400;

    const operation = vi.fn().mockRejectedValue(error);
    const shouldRetry = vi.fn().mockReturnValue(false);

    await expect(withRetry(operation, defaultConfig, shouldRetry)).rejects.toThrow();
    expect(shouldRetry).toHaveBeenCalledWith(expect.objectContaining({ retryable: false, statusCode: 400 }));
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('retries on 500 errors', async () => {
    const error500 = new Error('Server Error') as RetryableError;
    error500.statusCode = 500;
    error500.retryable = true;

    const operation = vi.fn()
      .mockRejectedValueOnce(error500)
      .mockResolvedValue('success');

    const result = await withRetry(operation, defaultConfig, (e) => e.retryable);
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it('does not retry on 400 errors', async () => {
    const error400 = new Error('Bad Request') as RetryableError;
    error400.statusCode = 400;
    error400.retryable = false;

    const operation = vi.fn().mockRejectedValue(error400);

    await expect(withRetry(operation, defaultConfig, (e) => e.retryable)).rejects.toThrow();
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('does not retry on 404 errors', async () => {
    const error404 = new Error('Not Found') as RetryableError;
    error404.statusCode = 404;
    error404.retryable = false;

    const operation = vi.fn().mockRejectedValue(error404);

    await expect(withRetry(operation, defaultConfig, (e) => e.retryable)).rejects.toThrow();
    expect(operation).toHaveBeenCalledTimes(1);
  });
});

describe('TeamGatewayClient', () => {
  const mockExecutionRequest: ExecutionRequest = {
    execution_id: 'exec-123',
    protocol_version: '1.0',
    snapshot: {
      playbook_id: 'pb-1',
      playbook_version_id: 'pv-1',
      playbook_key: 'test-playbook',
      execution_profile: 'standard',
      workflow: {
        id: 'wf-1',
        steps: [],
        compiled_at: new Date().toISOString(),
      },
      policy_profile_id: 'pp-1',
      capability_refs: [],
    },
    context: {
      workspace_id: 'ws-1',
      playbook_id: 'pb-1',
      task_id: 'task-1',
      run_id: 'run-1',
      initiated_by: 'test',
    },
    initial_inputs: [],
  };

  const mockExecutionHandle: ExecutionHandle = {
    execution_id: 'exec-123',
  };

  let originalFetch: typeof fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  function createClient(overrides: Partial<TeamGatewayConfig> = {}): TeamGatewayClient {
    return new TeamGatewayClient({
      baseUrl: 'http://localhost:4001',
      teamId: 'test-team',
      apiKey: 'test-api-key',
      ...overrides,
    });
  }

  function createMockResponse(response: unknown, ok = true, status = 200, statusText = 'OK') {
    return {
      ok,
      status,
      statusText,
      json: vi.fn().mockResolvedValue(response),
      body: {
        getReader: vi.fn().mockReturnValue({
          read: vi.fn().mockResolvedValue({ done: true, value: undefined }),
        }),
      },
    };
  }

  describe('start', () => {
    it('sends execution request to gateway', async () => {
      const mockResponse = createMockResponse(mockExecutionHandle);
      global.fetch = vi.fn().mockResolvedValue(mockResponse) as any;

      const client = createClient();
      const result = await client.start(mockExecutionRequest);

      expect(result).toEqual(mockExecutionHandle);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('throws on gateway 500 error', async () => {
      const mockResponse = createMockResponse(null, false, 500, 'Internal Server Error');
      global.fetch = vi.fn().mockResolvedValue(mockResponse) as any;

      const client = createClient();
      await expect(client.start(mockExecutionRequest)).rejects.toThrow('HTTP 500: Internal Server Error');
    });

    it('throws on 400 error without retry', async () => {
      const mockResponse = createMockResponse(null, false, 400, 'Bad Request');
      global.fetch = vi.fn().mockResolvedValue(mockResponse) as any;

      const client = createClient();
      await expect(client.start(mockExecutionRequest)).rejects.toThrow();
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('retries on 500 errors and eventually succeeds', async () => {
      const mockResponse500 = createMockResponse(null, false, 500, 'Internal Server Error');
      const mockResponse200 = createMockResponse(mockExecutionHandle);

      global.fetch = vi.fn()
        .mockResolvedValueOnce(mockResponse500)
        .mockResolvedValueOnce(mockResponse200) as any;

      const client = createClient();
      const result = await client.start(mockExecutionRequest);

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockExecutionHandle);
    });
  });

  describe('submit', () => {
    it('sends input to gateway with idempotency key', async () => {
      const mockResponse = createMockResponse(undefined);
      global.fetch = vi.fn().mockResolvedValue(mockResponse) as any;

      const client = createClient();
      await client.submit('exec-123', { key: 'input1', value: 'test' });

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('does not add idempotency key for GET requests', async () => {
      const mockResponse = createMockResponse({ execution_id: 'exec-123', state: 'running' });
      global.fetch = vi.fn().mockResolvedValue(mockResponse) as any;

      const client = createClient();
      await client.getStatus('exec-123');

      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[1].headers['X-Idempotency-Key']).toBeUndefined();
    });
  });

  describe('getStatus', () => {
    it('returns execution status', async () => {
      const mockStatus = { execution_id: 'exec-123', state: 'running' };
      const mockResponse = createMockResponse(mockStatus);
      global.fetch = vi.fn().mockResolvedValue(mockResponse) as any;

      const client = createClient();
      const result = await client.getStatus('exec-123');

      expect(result).toEqual(mockStatus);
    });

    it('returns null for not found', async () => {
      const mockResponse = createMockResponse(null, false, 404, 'Not Found');
      global.fetch = vi.fn().mockResolvedValue(mockResponse) as any;

      const client = createClient();
      const result = await client.getStatus('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('retry behavior', () => {
    it('retries on 429 rate limit errors', async () => {
      const mockResponse429 = createMockResponse(null, false, 429, 'Too Many Requests');
      const mockResponse200 = createMockResponse(mockExecutionHandle);

      global.fetch = vi.fn()
        .mockResolvedValueOnce(mockResponse429)
        .mockResolvedValueOnce(mockResponse200) as any;

      const client = createClient();
      const result = await client.start(mockExecutionRequest);

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockExecutionHandle);
    });
  });
});