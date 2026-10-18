import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type FamilyInvitationDocument = FamilyInvitation & Document;

@Schema({ timestamps: true, collection: 'family_invitations' })
export class FamilyInvitation {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Family', required: true })
  familyId: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, required: true, lowercase: true })
  email: string;

  @Prop({ type: String, default: 'MEMBER', enum: ['OWNER', 'MEMBER'] })
  role: string;

  @Prop({ type: String, required: true, unique: true })
  tokenHash: string;

  @Prop({ type: Date, required: true })
  expiresAt: Date;

  @Prop({ type: Date, default: null })
  acceptedAt: Date;

  @Prop({ type: Date, default: null })
  revokedAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdByUserId: MongooseSchema.Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const FamilyInvitationSchema = SchemaFactory.createForClass(FamilyInvitation);
