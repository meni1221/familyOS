import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type PasswordResetTokenDocument = PasswordResetToken & Document;

/**
 * A single-use password reset token.
 *
 * Only the hash is stored: a leaked database dump must not be a list of working
 * reset links. `usedAt` is set on redemption rather than deleting the row, so a
 * second attempt with the same link is refused instead of "not found".
 */
@Schema({ timestamps: true, collection: 'password_reset_tokens' })
export class PasswordResetToken {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, required: true, unique: true })
  tokenHash: string;

  @Prop({ type: Date, required: true })
  expiresAt: Date;

  @Prop({ type: Date, default: null })
  usedAt: Date | null;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const PasswordResetTokenSchema = SchemaFactory.createForClass(PasswordResetToken);

// Mongo removes the row when it expires. `reset()` still compares `expiresAt`:
// the TTL monitor runs about once a minute, and those sixty seconds must not be
// a window in which an expired link works.
PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
