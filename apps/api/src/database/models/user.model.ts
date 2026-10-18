import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ _id: false })
export class NotificationPreferences {
  @Prop({ default: true })
  taskAssigned: boolean;

  @Prop({ default: true })
  taskDueSoon: boolean;

  @Prop({ default: true })
  eventReminder: boolean;

  @Prop({ default: true })
  expenseAdded: boolean;

  @Prop({ default: true })
  weeklySummary: boolean;

  @Prop({ default: false })
  email: boolean;
}

export const NotificationPreferencesSchema = SchemaFactory.createForClass(NotificationPreferences);

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  displayName: string;

  @Prop()
  passwordHash?: string;

  @Prop({ default: 'he' })
  preferredLocale: string;

  @Prop({ default: 'Asia/Jerusalem' })
  timezone: string;

  @Prop({ type: NotificationPreferencesSchema, default: () => ({}) })
  notificationPreferences: NotificationPreferences;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Family' }] })
  families: Types.ObjectId[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
