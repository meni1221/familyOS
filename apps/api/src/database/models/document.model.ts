import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type DocumentDocument = DocumentModel & Document;

@Schema({ timestamps: true, collection: 'documents' })
export class DocumentModel {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Family', required: true })
  familyId: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String, required: true })
  category: string;

  /** Path of the file relative to the uploads root, e.g. `<familyId>/<uuid>.pdf`. */
  @Prop({ type: String, required: true, unique: true })
  storageKey: string;

  @Prop({ type: String })
  originalName: string;

  @Prop({ type: String, required: true })
  contentType: string;

  @Prop({ type: Number, required: true, min: 0 })
  sizeBytes: number;

  @Prop({ type: Date })
  issuedAt: Date;

  @Prop({ type: Date })
  expiresAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  uploadedByUserId: MongooseSchema.Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const DocumentSchema = SchemaFactory.createForClass(DocumentModel);
