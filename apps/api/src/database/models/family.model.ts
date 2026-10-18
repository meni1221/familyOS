import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FamilyDocument = Family & Document;

@Schema({ timestamps: true, collection: 'families' })
export class Family {
  @Prop({ required: true })
  name: string;

  @Prop({ default: 'he' })
  defaultLocale: string;

  @Prop({ default: 'ILS' })
  defaultCurrency: string;

  @Prop({ default: 'Asia/Jerusalem' })
  timezone: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const FamilySchema = SchemaFactory.createForClass(Family);
