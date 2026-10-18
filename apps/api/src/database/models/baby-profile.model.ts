import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BabyProfileDocument = BabyProfile & Document;

@Schema({ timestamps: true, collection: 'baby_profiles' })
export class BabyProfile {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Family' })
  familyId: Types.ObjectId;

  @Prop({ required: true })
  displayName: string;

  @Prop()
  dateOfBirth: Date;

  @Prop({ default: true })
  trackingEnabled: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const BabyProfileSchema = SchemaFactory.createForClass(BabyProfile);
