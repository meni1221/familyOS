import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CalendarEventDocument = CalendarEvent & Document;

@Schema({ timestamps: true, collection: 'calendar_events' })
export class CalendarEvent {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Family' })
  familyId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  startsAt: Date;

  @Prop({ required: true })
  endsAt: Date;

  @Prop({ default: false })
  isAllDay: boolean;

  @Prop({ default: 'Asia/Jerusalem' })
  timezone: string;

  @Prop()
  location: string;

  @Prop()
  category: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  createdByUserId: Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const CalendarEventSchema = SchemaFactory.createForClass(CalendarEvent);
