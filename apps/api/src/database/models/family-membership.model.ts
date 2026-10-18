import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FamilyMembershipDocument = FamilyMembership & Document;

@Schema({ timestamps: true, collection: 'family_memberships' })
export class FamilyMembership {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Family' })
  familyId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ default: 'MEMBER', enum: ['OWNER', 'MEMBER'] })
  role: string;

  @Prop({ default: Date.now })
  joinedAt: Date;
}

export const FamilyMembershipSchema = SchemaFactory.createForClass(FamilyMembership);
