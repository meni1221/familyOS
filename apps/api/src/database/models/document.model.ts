import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DocumentDocument = DocumentModel & Document;

@Schema({ timestamps: true, collection: 'documents' })
export class DocumentModel {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Family' })
  familyId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true, unique: true })
  storageKey: string;

  @Prop({ required: true })
  contentType: string;

  @Prop({ required: true })
  sizeBytes: number;

  @Prop()
  issuedAt: Date;

  @Prop()
  expiresAt: Date;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  uploadedByUserId: Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const DocumentSchema = SchemaFactory.createForClass(DocumentModel);
