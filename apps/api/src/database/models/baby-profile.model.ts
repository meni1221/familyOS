import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type BabyProfileDocument = BabyProfile & Document;

@Schema({ timestamps: true, collection: 'baby_profiles' })
export class BabyProfile {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Family' })
  familyId: MongooseSchema.Types.ObjectId;

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
