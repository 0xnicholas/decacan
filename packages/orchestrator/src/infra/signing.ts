import { createHmac, randomBytes } from 'crypto';

export interface SigningConfig {
  secretKey: string;
  algorithm?: 'sha256' | 'sha384' | 'sha512';
  timestampToleranceMs?: number;
}

export interface SignedRequest {
  signature: string;
  timestamp: number;
  nonce: string;
}

export function createSignature(
  payload: string,
  timestamp: number,
  nonce: string,
  secretKey: string,
  algorithm: 'sha256' | 'sha384' | 'sha512' = 'sha256'
): string {
  const data = `${timestamp}.${nonce}.${payload}`;
  return createHmac(algorithm, secretKey).update(data).digest('hex');
}

export function verifySignature(
  payload: string,
  timestamp: number,
  nonce: string,
  signature: string,
  secretKey: string,
  algorithm: 'sha256' | 'sha384' | 'sha512' = 'sha256',
  toleranceMs: number = 300000
): boolean {
  if (Math.abs(Date.now() - timestamp) > toleranceMs) {
    return false;
  }

  const expectedSignature = createSignature(payload, timestamp, nonce, secretKey, algorithm);
  return timingSafeEqual(signature, expectedSignature);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export class RequestSigner {
  private config: Required<SigningConfig>;

  constructor(config: SigningConfig) {
    this.config = {
      secretKey: config.secretKey,
      algorithm: config.algorithm ?? 'sha256',
      timestampToleranceMs: config.timestampToleranceMs ?? 300000,
    };
  }

  sign(payload: string): SignedRequest {
    const timestamp = Date.now();
    const nonce = randomBytes(16).toString('hex');
    const signature = createSignature(
      payload,
      timestamp,
      nonce,
      this.config.secretKey,
      this.config.algorithm
    );
    return { signature, timestamp, nonce };
  }

  verify(
    payload: string,
    signature: string,
    timestamp: number,
    nonce: string
  ): boolean {
    return verifySignature(
      payload,
      timestamp,
      nonce,
      signature,
      this.config.secretKey,
      this.config.algorithm,
      this.config.timestampToleranceMs
    );
  }

  signRequest(
    method: string,
    path: string,
    body?: string
  ): { signature: string; timestamp: number; nonce: string } {
    const payload = [method.toUpperCase(), path, body ?? ''].join('\n');
    return this.sign(payload);
  }
}