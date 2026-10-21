import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { BabyService } from './baby.service';
import { AuthenticatedRequest } from '../../middleware/authenticated-request';
import {
  CreateBabyLogDto,
  UpdateBabyLogDto,
  CreateBabyProfileDto,
  UpdateBabyProfileDto,
} from './dto/index';

@ApiTags('baby')
@Controller('api/v1/baby')
export class BabyController {
  constructor(private readonly babyService: BabyService) {}

  @Get('profiles')
  @ApiOperation({ summary: 'List the babies of the family' })
  async listProfiles(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) return { data: [] };
    return this.babyService.listProfiles(user.familyId);
  }

  @Post('profiles')
  @ApiOperation({ summary: 'Add a baby to the family' })
  @ApiBody({ type: CreateBabyProfileDto })
  async createProfile(
    @Body(new ValidationPipe({ whitelist: true, transform: true })) body: CreateBabyProfileDto,
    @Req() req: AuthenticatedRequest
  ) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('נדרשת התחברות');
    return this.babyService.createProfile(user.familyId, body);
  }

  @Patch('profiles/:id')
  @ApiOperation({ summary: 'Update one baby' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateBabyProfileDto })
  async updateProfile(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true, transform: true })) body: UpdateBabyProfileDto,
    @Req() req: AuthenticatedRequest
  ) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('נדרשת התחברות');
    return this.babyService.updateProfile(user.familyId, id, body);
  }

  @Delete('profiles/:id')
  @ApiOperation({ summary: 'Delete a baby and the log entries recorded for them' })
  @ApiParam({ name: 'id', type: String })
  async deleteProfile(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('נדרשת התחברות');
    return this.babyService.deleteProfile(user.familyId, id);
  }

  @Get('logs')
  @ApiOperation({ summary: 'List baby log entries, optionally of one baby' })
  @ApiQuery({ name: 'babyProfileId', required: false, type: String })
  async getLogs(
    @Query('babyProfileId') babyProfileId: string | undefined,
    @Req() req: AuthenticatedRequest
  ) {
    const user = req.user;
    if (!user) return { data: [] };
    return this.babyService.getLogs(user.familyId, babyProfileId);
  }

  @Post('logs')
  @ApiOperation({ summary: 'Create a baby log entry' })
  @ApiBody({ type: CreateBabyLogDto })
  async createLog(
    @Body(new ValidationPipe({ whitelist: true, transform: true })) body: CreateBabyLogDto,
    @Req() req: AuthenticatedRequest
  ) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('נדרשת התחברות');
    return this.babyService.createLog(user.familyId, user.id, body);
  }

  @Patch('logs/:id')
  @ApiOperation({ summary: 'Update a baby log entry' })
  @ApiParam({ name: 'id', type: String })
  async updateLog(
    @Param('id') id: string,
    @Body() body: UpdateBabyLogDto,
    @Req() req: AuthenticatedRequest
  ) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('נדרשת התחברות');
    return this.babyService.updateLog(user.familyId, id, body);
  }

  @Delete('logs/:id')
  @ApiOperation({ summary: 'Delete a baby log entry' })
  @ApiParam({ name: 'id', type: String })
  async deleteLog(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('נדרשת התחברות');
    return this.babyService.deleteLog(user.familyId, id);
  }
}
