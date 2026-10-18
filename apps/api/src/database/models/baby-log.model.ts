import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type BabyLogDocument = BabyLog & Document;

@Schema({ timestamps: true, collection: 'baby_logs' })
export class BabyLog {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Family', required: true })
  familyId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'BabyProfile', required: true })
  babyProfileId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    enum: ['FEEDING', 'SLEEP', 'DIAPER', 'NOTE'],
  })
  type: string;

  @Prop({ type: Date, required: true })
  occurredAt: Date;

  @Prop({ type: Date })
  endedAt: Date;

  @Prop({ type: Object })
  details: Record<string, unknown>;

  @Prop({ type: String })
  note: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdByUserId: MongooseSchema.Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const BabyLogSchema = SchemaFactory.createForClass(BabyLog);
