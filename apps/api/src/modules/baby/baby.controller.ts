import { Controller, Get, Post, Patch, Delete, Body, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiParam } from '@nestjs/swagger';
import { BabyService } from './baby.service';
import { Request } from 'express';
import { ValidationPipe } from '@nestjs/common';
import { CreateBabyLogDto } from './dto/index';

@ApiTags('baby')
@Controller('api/v1/baby')
export class BabyController {
  constructor(private readonly babyService: BabyService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get baby profile' })
  async getProfile(@Req() req: Request) {
    const user = (req as any).user;
    if (!user) return null;
    return this.babyService.getProfile(user.familyId);
  }

  @Get('logs')
  @ApiOperation({ summary: 'List baby logs' })
  async getLogs(@Req() req: Request) {
    const user = (req as any).user;
    if (!user) return { data: [] };
    return this.babyService.getLogs(user.familyId);
  }

  @Post('logs')
  @ApiOperation({ summary: 'Create a baby log entry' })
  @ApiBody({ type: CreateBabyLogDto })
  async createLog(
    @Body(new ValidationPipe({ whitelist: true, transform: true })) body: CreateBabyLogDto,
    @Req() req: Request
  ) {
    const user = (req as any).user;
    if (!user) throw new Error('Unauthorized');
    return this.babyService.createLog(user.familyId, user.id, body);
  }

  @Patch('logs/:id')
  @ApiOperation({ summary: 'Update a baby log entry' })
  @ApiParam({ name: 'id', type: String })
  async updateLog(@Param('id') id: string, @Body() body: any, @Req() req: Request) {
    const user = (req as any).user;
    if (!user) throw new Error('Unauthorized');
    return this.babyService.updateLog(user.familyId, id, body);
  }

  @Delete('logs/:id')
  @ApiOperation({ summary: 'Delete a baby log entry' })
  @ApiParam({ name: 'id', type: String })
  async deleteLog(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any).user;
    if (!user) throw new Error('Unauthorized');
    return this.babyService.deleteLog(user.familyId, id);
  }
}
