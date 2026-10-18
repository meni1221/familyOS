import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SessionDocument = Session & Document;

/**
 * A server-side session record.
 *
 * It lives in MongoDB rather than in process memory so that signing in survives
 * an API restart: the browser keeps its cookie for 30 days, and this collection
 * is the other half of that promise. Mongo deletes expired rows by itself
 * through the TTL index defined below.
 *
 * Only the SHA-256 hash of the token is stored, matching the rest of the auth
 * flow — a database leak does not hand out usable sessions.
 */
@Schema({ timestamps: true, collection: 'sessions' })
export class Session {
  @Prop({ type: String, required: true, unique: true })
  tokenHash: string;

  @Prop({ type: String, required: true })
  userId: string;

  /** The family that is active for this session (changed when joining one). */
  @Prop({ type: String })
  familyId?: string;

  @Prop({ type: Date, required: true })
  expiresAt: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);

// `expireAfterSeconds: 0` means "delete as soon as `expiresAt` has passed".
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
