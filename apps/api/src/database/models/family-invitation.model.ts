import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type FamilyInvitationDocument = FamilyInvitation & Document;

@Schema({ timestamps: true, collection: 'family_invitations' })
export class FamilyInvitation {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Family' })
  familyId: MongooseSchema.Types.ObjectId;

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

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  createdByUserId: MongooseSchema.Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const FamilyInvitationSchema = SchemaFactory.createForClass(FamilyInvitation);
