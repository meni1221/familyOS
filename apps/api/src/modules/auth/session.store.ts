import { createHash } from 'crypto';

export interface SessionData {
  userId: string;
  familyId?: string;
  expiresAt: number;
}

export class SessionStore {
  private readonly store = new Map<string, SessionData>();

  set(tokenHash: string, data: SessionData) {
    this.store.set(tokenHash, data);
  }

  get(tokenHash: string): SessionData | undefined {
    return this.store.get(tokenHash);
  }

  delete(tokenHash: string) {
    this.store.delete(tokenHash);
  }

  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (now > value.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}

export const sessionStore = new SessionStore();

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

// Cleanup expired sessions every 5 minutes (does not keep the process alive)
const cleanupTimer = setInterval(() => sessionStore.cleanup(), 300_000);
cleanupTimer.unref?.();
