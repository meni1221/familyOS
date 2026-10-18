import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ _id: false })
export class NotificationPreferences {
  @Prop({ type: Boolean, default: true })
  taskAssigned: boolean;

  @Prop({ type: Boolean, default: true })
  taskDueSoon: boolean;

  @Prop({ type: Boolean, default: true })
  eventReminder: boolean;

  @Prop({ type: Boolean, default: true })
  expenseAdded: boolean;

  @Prop({ type: Boolean, default: true })
  weeklySummary: boolean;

  @Prop({ type: Boolean, default: false })
  email: boolean;
}

export const NotificationPreferencesSchema = SchemaFactory.createForClass(NotificationPreferences);

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ type: String, required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ type: String, required: true })
  displayName: string;

  @Prop({ type: String })
  passwordHash?: string;

  @Prop({ type: String, default: 'he', enum: ['he', 'en'] })
  preferredLocale: string;

  @Prop({ type: String, default: 'Asia/Jerusalem' })
  timezone: string;

  @Prop({ type: NotificationPreferencesSchema, default: () => ({}) })
  notificationPreferences: NotificationPreferences;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Family' }], default: [] })
  families: Types.ObjectId[];

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
