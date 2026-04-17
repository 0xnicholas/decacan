export interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

export interface RetryableError extends Error {
  retryable: boolean;
  statusCode?: number;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig,
  shouldRetry?: (error: RetryableError) => boolean
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      const err = error as RetryableError;
      const statusCode = err.statusCode ?? (error as any).statusCode;

      if (attempt === config.maxAttempts) break;
      const retryableErr: RetryableError = {
        name: err.name ?? 'Error',
        message: err.message ?? '',
        retryable: err.retryable ?? true,
        statusCode,
      };
      if (shouldRetry && !shouldRetry(retryableErr)) break;

      const delay = Math.min(
        config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt - 1),
        config.maxDelayMs
      );
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

export function isIdempotentRequest(method: string): boolean {
  return ['GET', 'HEAD', 'OPTIONS'].includes(method);
}