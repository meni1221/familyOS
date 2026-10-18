import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type TaskDocument = Task & Document;

/*
 * Every `@Prop()` below declares its `type` explicitly instead of relying on
 * `emitDecoratorMetadata`. That inference only exists when the code is compiled
 * by `tsc`; esbuild (used by vitest) and swc do not emit it, which made the
 * schema throw at runtime under those tools.
 */
@Schema({ timestamps: true, collection: 'tasks' })
export class Task {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Family', required: true })
  familyId: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String })
  description: string;

  @Prop({
    type: String,
    default: 'OPEN',
    enum: ['OPEN', 'IN_PROGRESS', 'COMPLETED'],
  })
  status: string;

  @Prop({
    type: String,
    default: 'MEDIUM',
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
  })
  priority: string;

  @Prop({ type: String })
  category: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  assigneeUserId: MongooseSchema.Types.ObjectId;

  @Prop({ type: Date })
  dueAt: Date;

  @Prop({ type: Date })
  completedAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdByUserId: MongooseSchema.Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
