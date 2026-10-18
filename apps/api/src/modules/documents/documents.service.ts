import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { isValidObjectId, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { promises as fs } from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { DocumentModel, DocumentDocument } from '../../database/models/document.model';
import { UpdateDocumentDto, UploadDocumentDto } from './dto';
import { UploadedFile } from './uploads.types';

const DEFAULT_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/** MIME types accepted for upload, extensible through `ALLOWED_FILE_TYPES`. */
export function allowedMimeTypes(): string[] {
  const configured = process.env.ALLOWED_FILE_TYPES;
  if (configured) {
    return configured
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
  }

  return [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
}

export function maxFileSizeBytes(): number {
  const configured = Number(process.env.MAX_FILE_SIZE_BYTES);
  return Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_MAX_FILE_SIZE_BYTES;
}

/**
 * Local uploads directory. Resolved lazily (not at module load) so that
 * `ConfigModule` has already populated `process.env` before the first request.
 */
export function uploadsRoot(): string {
  return process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');
}

function familyUploadDir(familyId: string): string {
  return path.join(uploadsRoot(), familyId);
}

function absolutePathFor(storageKey: string): string {
  // `storageKey` always uses forward slashes; normalise for Windows.
  return path.join(uploadsRoot(), ...storageKey.split('/'));
}

const MIME_EXTENSIONS: Record<string, string> = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'text/plain': '.txt',
  'text/csv': '.csv',
};

function extensionFor(file: UploadedFile): string {
  const byMime = MIME_EXTENSIONS[file.mimetype];
  if (byMime) return byMime;

  const fromName = path.extname(file.originalname || '').toLowerCase();
  return /^\.[a-z0-9]{1,8}$/.test(fromName) ? fromName : '.bin';
}

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(DocumentModel.name) private documentModel: Model<DocumentDocument>,
  ) {}

  private toPublic(document: DocumentDocument) {
    return {
      id: document._id.toString(),
      title: document.title,
      description: document.description,
      category: document.category,
      contentType: document.contentType,
      sizeBytes: document.sizeBytes,
      originalName: document.originalName,
      issuedAt: document.issuedAt,
      expiresAt: document.expiresAt,
      uploadedByUserId: document.uploadedByUserId?.toString(),
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      downloadUrl: `/api/v1/documents/${document._id.toString()}/download`,
    };
  }

  async getDocuments(familyId: string) {
    const documents = await this.documentModel
      .find({ familyId })
      .sort({ createdAt: -1 })
      .limit(500)
      .exec();

    return { data: documents.map((document) => this.toPublic(document)) };
  }

  async createDocument(
    familyId: string,
    userId: string,
    file: UploadedFile | undefined,
    dto: UploadDocumentDto,
  ) {
    if (!file) {
      throw new BadRequestException('נדרש קובץ להעלאה');
    }

    if (file.size > maxFileSizeBytes()) {
      throw new BadRequestException('הקובץ גדול מדי');
    }

    const filename = `${randomUUID()}${extensionFor(file)}`;
    const directory = familyUploadDir(familyId);
    const storageKey = `${familyId}/${filename}`;
    const absolutePath = path.join(directory, filename);

    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(absolutePath, file.buffer);

    try {
      const document = await this.documentModel.create({
        familyId,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        storageKey,
        originalName: file.originalname,
        contentType: file.mimetype,
        sizeBytes: file.size,
        issuedAt: dto.issuedAt ? new Date(dto.issuedAt) : undefined,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        uploadedByUserId: userId,
      });

      return { data: this.toPublic(document) };
    } catch (error) {
      // Never leave an orphaned file behind when the write to Mongo fails.
      await fs.unlink(absolutePath).catch(() => undefined);
      throw error;
    }
  }

  async getDownload(familyId: string, documentId: string) {
    const document = await this.findOwnedDocument(familyId, documentId);
    const absolutePath = absolutePathFor(document.storageKey);

    try {
      await fs.access(absolutePath);
    } catch {
      throw new NotFoundException('קובץ המסמך לא נמצא באחסון');
    }

    return {
      absolutePath,
      originalName: document.originalName || path.basename(absolutePath),
      contentType: document.contentType,
    };
  }

  async updateDocument(familyId: string, documentId: string, dto: UpdateDocumentDto) {
    const document = await this.findOwnedDocument(familyId, documentId);

    const update: Record<string, unknown> = {};
    if (dto.title !== undefined) update.title = dto.title;
    if (dto.category !== undefined) update.category = dto.category;
    if (dto.description !== undefined) update.description = dto.description;
    if (dto.issuedAt !== undefined) update.issuedAt = new Date(dto.issuedAt);
    if (dto.expiresAt !== undefined) update.expiresAt = new Date(dto.expiresAt);

    Object.assign(document, update);
    await document.save();

    return { data: this.toPublic(document) };
  }

  async deleteDocument(familyId: string, documentId: string) {
    const document = await this.findOwnedDocument(familyId, documentId);
    const absolutePath = absolutePathFor(document.storageKey);

    await this.documentModel.deleteOne({ _id: document._id, familyId }).exec();
    await fs.unlink(absolutePath).catch(() => undefined);

    return { success: true };
  }

  private async findOwnedDocument(
    familyId: string,
    documentId: string,
  ): Promise<DocumentDocument> {
    if (!isValidObjectId(documentId)) {
      throw new NotFoundException('מסמך לא נמצא');
    }

    const document = await this.documentModel.findOne({ _id: documentId, familyId }).exec();
    if (!document) {
      throw new NotFoundException('מסמך לא נמצא');
    }

    return document;
  }
}
