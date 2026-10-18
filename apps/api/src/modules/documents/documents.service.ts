import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'crypto';
import { DocumentModel, DocumentDocument } from '../../database/models/document.model';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(DocumentModel.name) private documentModel: Model<DocumentDocument>,
  ) {}

  async getDocuments(familyId: string) {
    const documents = await this.documentModel
      .find({ familyId })
      .sort({ createdAt: -1 })
      .exec();
    return { data: documents };
  }

  async createDocument(familyId: string, userId: string, data: any) {
    const storageKey = `families/${familyId}/${randomBytes(16).toString('hex')}`;

    const document = await this.documentModel.create({
      familyId,
      title: data.title,
      description: data.description,
      category: data.category,
      storageKey,
      contentType: data.contentType,
      sizeBytes: data.sizeBytes,
      issuedAt: data.issuedAt ? new Date(data.issuedAt) : null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      uploadedByUserId: userId,
    });
    return { data: document };
  }

  async updateDocument(familyId: string, documentId: string, data: any) {
    const document = await this.documentModel.findOneAndUpdate(
      { _id: documentId, familyId },
      data,
      { new: true },
    ).exec();

    if (!document) {
      throw new NotFoundException('מסמך לא נמצא');
    }
    return { data: document };
  }

  async deleteDocument(familyId: string, documentId: string) {
    const result = await this.documentModel.deleteOne({ _id: documentId, familyId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('מסמך לא נמצא');
    }
    return { success: true };
  }
}
