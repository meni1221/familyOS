import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TaskDocument = Task & Document;

@Schema({ timestamps: true, collection: 'tasks' })
export class Task {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Family' })
  familyId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ default: 'OPEN', enum: ['OPEN', 'IN_PROGRESS', 'COMPLETED'] })
  status: string;

  @Prop({ default: 'MEDIUM', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] })
  priority: string;

  @Prop()
  category: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assigneeUserId: Types.ObjectId;

  @Prop()
  dueAt: Date;

  @Prop()
  completedAt: Date;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  createdByUserId: Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
