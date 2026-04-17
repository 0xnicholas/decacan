import { randomBytes, createHmac, timingSafeEqual } from 'crypto';

export interface KeyVersion {
  version: number;
  secretKey: string;
  createdAt: Date;
  expiresAt?: Date;
  revokedAt?: Date;
}

export interface KeyManagerConfig {
  currentVersion: number;
  versions: KeyVersion[];
  rotationIntervalMs?: number;
}

export class KeyManager {
  private config: KeyManagerConfig;
  private nonces: Map<string, number> = new Map();
  private readonly NONCE_WINDOW_MS = 300000;

  constructor(config: KeyManagerConfig) {
    this.config = config;
  }

  static createDefault(): KeyManager {
    const secretKey = process.env.TEAM_GATEWAY_SIGNING_KEY ?? 'default-dev-key-change-in-production';
    return new KeyManager({
      currentVersion: 1,
      versions: [
        {
          version: 1,
          secretKey,
          createdAt: new Date(),
        },
      ],
    });
  }

  getCurrentKey(): KeyVersion {
    const current = this.config.versions.find(
      (v) => v.version === this.config.currentVersion
    );
    if (!current) {
      throw new Error("Current key version not found");
    }
    return current;
  }

  getKey(version: number): KeyVersion | undefined {
    return this.config.versions.find((v) => v.version === version);
  }

  rotateKey(): KeyVersion {
    const newVersion = this.config.currentVersion + 1;
    const newKey: KeyVersion = {
      version: newVersion,
      secretKey: randomBytes(32).toString('hex'),
      createdAt: new Date(),
    };

    const current = this.getCurrentKey();
    current.expiresAt = new Date();

    this.config.versions.push(newKey);
    this.config.currentVersion = newVersion;

    return newKey;
  }

  revokeKey(version: number): boolean {
    const key = this.getKey(version);
    if (!key) return false;

    key.revokedAt = new Date();
    return true;
  }

  isKeyValid(version: number): boolean {
    const key = this.getKey(version);
    if (!key) return false;
    if (key.revokedAt) return false;
    if (key.expiresAt && key.expiresAt < new Date()) return false;
    return true;
  }

  isNonceUsed(nonce: string): boolean {
    const timestamp = this.nonces.get(nonce);
    if (timestamp) {
      if (Date.now() - timestamp > this.NONCE_WINDOW_MS) {
        this.nonces.delete(nonce);
        return false;
      }
      return true;
    }
    return false;
  }

  recordNonce(nonce: string): void {
    this.nonces.set(nonce, Date.now());
    if (this.nonces.size > 10000) {
      const oldest = Array.from(this.nonces.entries())
        .sort((a, b) => a[1] - b[1])
        .slice(0, 1000);
      oldest.forEach(([key]) => this.nonces.delete(key));
    }
  }

  verifyRequest(
    payload: string,
    signature: string,
    timestamp: number,
    nonce: string,
    version?: number
  ): { valid: boolean; error?: string } {
    if (this.isNonceUsed(nonce)) {
      return { valid: false, error: 'Replay detected: nonce already used' };
    }

    const keyVersion = version ?? this.config.currentVersion;
    const key = this.getKey(keyVersion);

    if (!key) {
      return { valid: false, error: `Unknown key version: ${keyVersion}` };
    }

    if (!this.isKeyValid(keyVersion)) {
      return { valid: false, error: 'Key is revoked or expired' };
    }

    if (Math.abs(Date.now() - timestamp) > 300000) {
      return { valid: false, error: 'Request timestamp is stale' };
    }

    const data = `${timestamp}.${nonce}.${payload}`;
    const expectedSignature = createHmac('sha256', key.secretKey)
      .update(data)
      .digest('hex');

    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return { valid: false, error: 'Signature verification failed' };
    }

    this.recordNonce(nonce);
    return { valid: true };
  }
}

export const keyManager = KeyManager.createDefault();
