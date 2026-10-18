import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ExpenseDocument = Expense & Document;

@Schema({ timestamps: true, collection: 'expenses' })
export class Expense {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Family' })
  familyId: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: 'ILS' })
  currency: string;

  @Prop({ required: true })
  category: string;

  @Prop()
  description: string;

  @Prop({ default: Date.now })
  occurredAt: Date;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  createdByUserId: Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
