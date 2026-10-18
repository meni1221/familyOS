import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type BabyLogDocument = BabyLog & Document;

@Schema({ timestamps: true, collection: 'baby_logs' })
export class BabyLog {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Family' })
  familyId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'BabyProfile' })
  babyProfileId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, enum: ['FEEDING', 'SLEEP', 'DIAPER', 'NOTE'] })
  type: string;

  @Prop({ required: true })
  occurredAt: Date;

  @Prop()
  endedAt: Date;

  @Prop({ type: Object })
  details: Record<string, unknown>;

  @Prop()
  note: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  createdByUserId: MongooseSchema.Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const BabyLogSchema = SchemaFactory.createForClass(BabyLog);
