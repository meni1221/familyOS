import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type BudgetDocument = Budget & Document;

@Schema({ timestamps: true, collection: 'budgets' })
export class Budget {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Family' })
  familyId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: 'ILS' })
  currency: string;

  @Prop({ default: 'MONTHLY' })
  period: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const BudgetSchema = SchemaFactory.createForClass(Budget);
