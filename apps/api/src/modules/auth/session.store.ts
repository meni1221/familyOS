import { createHash } from 'crypto';
import { Model } from 'mongoose';
import { Session } from '../../database/models/session.model';

export interface SessionData {
  userId: string;
  familyId?: string;
  expiresAt: number;
}

let boundModel: Model<Session> | null = null;

/**
 * Hands the store the model Nest created for the `sessions` collection.
 *
 * The store stays a plain module singleton — `AuthMiddleware` is constructed by
 * hand in `app.setup.ts` and cannot receive an injected provider — so the model
 * is bound once during bootstrap instead of being injected. It cannot be taken
 * from the global mongoose connection either: `MongooseModule.forRoot` opens its
 * own connection.
 */
export const bindSessionModel = (model: Model<Session>): void => {
  boundModel = model;
};

const sessions = (): Model<Session> => {
  if (!boundModel) {
    throw new Error(
      'Session model is not bound yet: call bindSessionModel() during bootstrap.'
    );
  }
  return boundModel;
};

/**
 * Session storage backed by MongoDB.
 *
 * Every method is async because the data outlives the process: this is what
 * stops a restart of the API from signing everybody out. Updates are upserts on
 * the unique `tokenHash`, so a re-login overwrites the row instead of
 * accumulating duplicates.
 */
export class SessionStore {
  async set(tokenHash: string, data: SessionData): Promise<void> {
    await sessions()
      .updateOne(
        { tokenHash },
        {
          $set: {
            tokenHash,
            userId: data.userId,
            familyId: data.familyId,
            expiresAt: new Date(data.expiresAt),
          },
        },
        { upsert: true }
      )
      .exec();
  }

  async get(tokenHash: string): Promise<SessionData | undefined> {
    const document = await sessions().findOne({ tokenHash }).lean().exec();

    if (!document) {
      return undefined;
    }

    return {
      userId: String(document.userId),
      familyId: document.familyId ? String(document.familyId) : undefined,
      expiresAt: new Date(document.expiresAt).getTime(),
    };
  }

  async delete(tokenHash: string): Promise<void> {
    await sessions().deleteOne({ tokenHash }).exec();
  }

  /**
   * Signs a user out everywhere — after a password reset, a session opened with
   * the old password should not survive it.
   */
  async deleteForUser(userId: string): Promise<void> {
    await sessions().deleteMany({ userId }).exec();
  }

  /** Safety net for deployments that disable Mongo's TTL monitor. */
  async cleanup(): Promise<void> {
    await sessions().deleteMany({ expiresAt: { $lte: new Date() } }).exec();
  }
}

export const sessionStore = new SessionStore();

export const hashToken = (token: string): string => {
  return createHash('sha256').update(token).digest('hex');
};

// Sweeps leftovers every 5 minutes (does not keep the process alive).
const cleanupTimer = setInterval(() => {
  void sessionStore.cleanup().catch(() => undefined);
}, 300_000);
cleanupTimer.unref?.();
