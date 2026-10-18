import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type FamilyMembershipDocument = FamilyMembership & Document;

@Schema({ timestamps: true, collection: 'family_memberships' })
export class FamilyMembership {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Family', required: true })
  familyId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, default: 'MEMBER', enum: ['OWNER', 'MEMBER'] })
  role: string;

  @Prop({ type: Date, default: Date.now })
  joinedAt: Date;
}

export const FamilyMembershipSchema = SchemaFactory.createForClass(FamilyMembership);
