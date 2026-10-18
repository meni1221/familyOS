import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type BabyProfileDocument = BabyProfile & Document;

@Schema({ timestamps: true, collection: 'baby_profiles' })
export class BabyProfile {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Family', required: true })
  familyId: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, required: true })
  displayName: string;

  @Prop({ type: Date })
  dateOfBirth: Date;

  @Prop({ type: Boolean, default: true })
  trackingEnabled: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const BabyProfileSchema = SchemaFactory.createForClass(BabyProfile);
