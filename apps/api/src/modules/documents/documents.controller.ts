import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { DocumentsService, allowedMimeTypes, maxFileSizeBytes } from './documents.service';
import { UpdateDocumentDto, UploadDocumentDto } from './dto/index';
import { UploadedFile as UploadedFileShape } from './uploads.types';

@ApiTags('documents')
@Controller('api/v1/documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @ApiOperation({ summary: 'List documents' })
  async getDocuments(@Req() req: Request) {
    const user = (req as any).user;
    if (!user) return { data: [] };
    return this.documentsService.getDocuments(user.familyId);
  }

  @Post()
  @ApiOperation({ summary: 'Upload a document file with its metadata' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadDocumentDto })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: maxFileSizeBytes() },
      fileFilter: (_req, file, callback) => {
        if (!allowedMimeTypes().includes(file.mimetype)) {
          callback(new BadRequestException('סוג קובץ לא נתמך') as never, false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  async createDocument(
    @UploadedFile() file: UploadedFileShape,
    @Body() body: UploadDocumentDto,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    if (!user) throw new UnauthorizedException('נדרשת התחברות');
    return this.documentsService.createDocument(user.familyId, user.id, file, body);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download a document file' })
  @ApiParam({ name: 'id', type: String })
  async download(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    if (!user) throw new UnauthorizedException('נדרשת התחברות');

    const { absolutePath, originalName, contentType } =
      await this.documentsService.getDownload(user.familyId, id);

    res.setHeader('Content-Type', contentType);
    res.download(absolutePath, originalName);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update document metadata' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateDocumentDto })
  async updateDocument(
    @Param('id') id: string,
    @Body() body: UpdateDocumentDto,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    if (!user) throw new UnauthorizedException('נדרשת התחברות');
    return this.documentsService.updateDocument(user.familyId, id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a document and its stored file' })
  @ApiParam({ name: 'id', type: String })
  async deleteDocument(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any).user;
    if (!user) throw new UnauthorizedException('נדרשת התחברות');
    return this.documentsService.deleteDocument(user.familyId, id);
  }
}
