import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { FamiliesService } from './families.service';
import { Request } from 'express';
import { ValidationPipe } from '@nestjs/common';

@ApiTags('families')
@Controller('api/v1/families')
export class FamiliesController {
  constructor(private readonly familiesService: FamiliesService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user families' })
  async getFamilies(@Req() req: Request) {
    const user = (req as any).user;
    if (!user) return { data: [] };
    return this.familiesService.getUserFamilies(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new family' })
  @ApiBody({ schema: { properties: { name: { type: 'string', example: 'משפחת ישראלי' } } } })
  async createFamily(
    @Body(new ValidationPipe({ whitelist: true, transform: true })) body: { name: string },
    @Req() req: Request
  ) {
    const user = (req as any).user;
    if (!user) throw new Error('Unauthorized');
    return this.familiesService.createFamily(user.id, body.name);
  }
}
