import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

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

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Family' }] })
  families: Types.ObjectId[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
