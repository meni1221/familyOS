import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type BudgetDocument = Budget & Document;

@Schema({ timestamps: true, collection: 'budgets' })
export class Budget {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Family', required: true })
  familyId: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Number, required: true, min: 0 })
  amount: number;

  @Prop({ type: String, default: 'ILS' })
  currency: string;

  @Prop({ type: String, default: 'MONTHLY', enum: ['MONTHLY', 'YEARLY'] })
  period: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const BudgetSchema = SchemaFactory.createForClass(Budget);
