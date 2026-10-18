import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FamilyDocument = Family & Document;

@Schema({ timestamps: true, collection: 'families' })
export class Family {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, default: 'he' })
  defaultLocale: string;

  @Prop({ type: String, default: 'ILS' })
  defaultCurrency: string;

  @Prop({ type: String, default: 'Asia/Jerusalem' })
  timezone: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const FamilySchema = SchemaFactory.createForClass(Family);
