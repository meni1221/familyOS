import { Controller, Get, Post, Patch, Delete, Body, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiParam } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { Request } from 'express';
import { ValidationPipe } from '@nestjs/common';
import { CreateDocumentDto } from './dto/index';

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
  @ApiOperation({ summary: 'Create document metadata' })
  @ApiBody({ type: CreateDocumentDto })
  async createDocument(
    @Body(new ValidationPipe({ whitelist: true, transform: true })) body: CreateDocumentDto,
    @Req() req: Request
  ) {
    const user = (req as any).user;
    if (!user) throw new Error('Unauthorized');
    return this.documentsService.createDocument(user.familyId, user.id, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update document metadata' })
  @ApiParam({ name: 'id', type: String })
  async updateDocument(@Param('id') id: string, @Body() body: any, @Req() req: Request) {
    const user = (req as any).user;
    if (!user) throw new Error('Unauthorized');
    return this.documentsService.updateDocument(user.familyId, id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete document' })
  @ApiParam({ name: 'id', type: String })
  async deleteDocument(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any).user;
    if (!user) throw new Error('Unauthorized');
    return this.documentsService.deleteDocument(user.familyId, id);
  }
}
