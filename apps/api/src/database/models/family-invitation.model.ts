import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FamilyInvitationDocument = FamilyInvitation & Document;

@Schema({ timestamps: true, collection: 'family_invitations' })
export class FamilyInvitation {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Family' })
  familyId: Types.ObjectId;

  @Prop({ required: true })
  email: string;

  @Prop({ default: 'MEMBER', enum: ['OWNER', 'MEMBER'] })
  role: string;

  @Prop({ required: true, unique: true })
  tokenHash: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop()
  acceptedAt: Date;

  @Prop()
  revokedAt: Date;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  createdByUserId: Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const FamilyInvitationSchema = SchemaFactory.createForClass(FamilyInvitation);
