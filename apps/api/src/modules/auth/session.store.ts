import { createHash } from 'crypto';

interface SessionData {
  userId: string;
  expiresAt: number;
}

export class SessionStore {
  private store = new Map<string, SessionData>();

  set(token: string, data: SessionData) {
    this.store.set(token, data);
  }

  get(token: string): SessionData | undefined {
    return this.store.get(token);
  }

  delete(token: string) {
    this.store.delete(token);
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

// Cleanup expired sessions every 5 minutes
setInterval(() => sessionStore.cleanup(), 300000);
