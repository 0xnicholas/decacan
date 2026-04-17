import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TeamGatewayAdapter, type TeamGatewayAdapterConfig } from '../src/infra/team-gateway-adapter.js';
import type { ExecutionRequest, ExecutionHandle, ExecutionStatus, ExecutionEvent } from '../src/contract/index.js';

const mockExecutionRequest: ExecutionRequest = {
  playbook: {
    id: 'pb-1',
    version: '1.0.0',
    image_ref: 'test-image',
    input_schema: { type: 'object' },
    output_schema: { type: 'object' },
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

describe('TeamGatewayAdapter', () => {
  let mockInProcessEngine: any;
  let originalFetch: typeof fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    mockInProcessEngine = {
      start: vi.fn().mockResolvedValue(mockExecutionHandle),
      submit: vi.fn().mockResolvedValue(undefined),
      getStatus: vi.fn().mockResolvedValue({ execution_id: 'exec-123', state: 'running' }),
      subscribeEvents: vi.fn().mockResolvedValue(() => {}),
    };
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('mode switching', () => {
    it('starts in gateway mode when configured', () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: vi.fn().mockResolvedValue(mockExecutionHandle),
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse) as any;

      const adapter = new TeamGatewayAdapter({
        mode: 'gateway',
        baseUrl: 'http://localhost:4001',
        teamId: 'test-team',
        apiKey: 'test-api-key',
      });

      adapter.start(mockExecutionRequest);

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('switches to gateway mode lazily when switchMode is called', () => {
      global.fetch = vi.fn();

      const adapter = new TeamGatewayAdapter({
        mode: 'in_process',
        baseUrl: 'http://localhost:4001',
        teamId: 'test-team',
        apiKey: 'test-api-key',
        inProcessEngine: mockInProcessEngine,
      });

      expect(mockInProcessEngine.start).not.toHaveBeenCalled();

      adapter.start(mockExecutionRequest);
      expect(mockInProcessEngine.start).toHaveBeenCalledTimes(1);
      expect(global.fetch).not.toHaveBeenCalled();

      adapter.switchMode('gateway');

      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: vi.fn().mockResolvedValue({ execution_id: 'exec-456' }),
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse) as any;

      adapter.start(mockExecutionRequest);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(mockInProcessEngine.start).toHaveBeenCalledTimes(1);
    });
  });

  describe('in_process mode fallback', () => {
    it('uses inProcess engine when mode is in_process', async () => {
      global.fetch = vi.fn();

      const adapter = new TeamGatewayAdapter({
        mode: 'in_process',
        baseUrl: 'http://localhost:4001',
        teamId: 'test-team',
        apiKey: 'test-api-key',
        inProcessEngine: mockInProcessEngine,
      });

      const result = await adapter.start(mockExecutionRequest);

      expect(result).toEqual(mockExecutionHandle);
      expect(mockInProcessEngine.start).toHaveBeenCalledTimes(1);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('submit uses inProcess engine when mode is in_process', async () => {
      global.fetch = vi.fn();

      const adapter = new TeamGatewayAdapter({
        mode: 'in_process',
        baseUrl: 'http://localhost:4001',
        teamId: 'test-team',
        apiKey: 'test-api-key',
        inProcessEngine: mockInProcessEngine,
      });

      await adapter.submit('exec-123', { key: 'input1', value: 'test' });

      expect(mockInProcessEngine.submit).toHaveBeenCalledTimes(1);
      expect(mockInProcessEngine.submit).toHaveBeenCalledWith('exec-123', { key: 'input1', value: 'test' });
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('getStatus uses inProcess engine when mode is in_process', async () => {
      global.fetch = vi.fn();

      const adapter = new TeamGatewayAdapter({
        mode: 'in_process',
        baseUrl: 'http://localhost:4001',
        teamId: 'test-team',
        apiKey: 'test-api-key',
        inProcessEngine: mockInProcessEngine,
      });

      const result = await adapter.getStatus('exec-123');

      expect(result).toEqual({ execution_id: 'exec-123', state: 'running' });
      expect(mockInProcessEngine.getStatus).toHaveBeenCalledTimes(1);
      expect(mockInProcessEngine.getStatus).toHaveBeenCalledWith('exec-123');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('subscribeEvents uses inProcess engine when mode is in_process', async () => {
      global.fetch = vi.fn();

      const adapter = new TeamGatewayAdapter({
        mode: 'in_process',
        baseUrl: 'http://localhost:4001',
        teamId: 'test-team',
        apiKey: 'test-api-key',
        inProcessEngine: mockInProcessEngine,
      });

      const onEvent = vi.fn();
      const unsubscribe = await adapter.subscribeEvents('exec-123', onEvent);

      expect(mockInProcessEngine.subscribeEvents).toHaveBeenCalledTimes(1);
      expect(mockInProcessEngine.subscribeEvents).toHaveBeenCalledWith('exec-123', onEvent);
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('gateway mode', () => {
    it('uses gateway client when mode is gateway', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: vi.fn().mockResolvedValue(mockExecutionHandle),
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse) as any;

      const adapter = new TeamGatewayAdapter({
        mode: 'gateway',
        baseUrl: 'http://localhost:4001',
        teamId: 'test-team',
        apiKey: 'test-api-key',
      });

      const result = await adapter.start(mockExecutionRequest);

      expect(result).toEqual(mockExecutionHandle);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(mockInProcessEngine.start).not.toHaveBeenCalled();
    });
  });
});
