import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type BabyProfileDocument = BabyProfile & Document;

/**
 * The colours a baby can be marked with. The web app maps each one to a brand
 * token, so the two lists have to agree; they are also what the API accepts.
 */
export const BABY_COLORS = ['forest', 'gold', 'sage', 'ink'];
export const DEFAULT_BABY_COLOR = BABY_COLORS[0];

@Schema({ timestamps: true, collection: 'baby_profiles' })
export class BabyProfile {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Family', required: true })
  familyId: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, required: true })
  displayName: string;

  @Prop({ type: Date })
  dateOfBirth: Date;

  @Prop({ type: String, enum: BABY_COLORS, default: DEFAULT_BABY_COLOR })
  color: string;

  @Prop({ type: Boolean, default: true })
  trackingEnabled: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const BabyProfileSchema = SchemaFactory.createForClass(BabyProfile);
