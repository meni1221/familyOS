import {
  Controller,
  Delete,
  Get,
  Post,
  Patch,
  Body,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { StatusCodes } from 'http-status-codes';
import { SettingsService } from './settings.service';
import { AccountService } from './account.service';
import { AuthenticatedRequest } from '../../middleware/authenticated-request';
import { ApiSessionAuth } from '../../api-docs';
import { SESSION_COOKIE_OPTIONS } from '../auth/session-cookie';
import {
  UpdateProfileDto,
  UpdatePreferencesDto,
  ChangePasswordDto,
  DeleteAccountDto,
} from './dto';

@ApiTags('settings')
@ApiSessionAuth()
@Controller('api/v1/settings')
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly accountService: AccountService,
  ) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile settings' })
  async getProfile(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('נדרשת התחברות');
    return this.settingsService.getProfile(user.id);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiBody({ type: UpdateProfileDto })
  async updateProfile(@Body() body: UpdateProfileDto, @Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('נדרשת התחברות');
    return this.settingsService.updateProfile(user.id, body);
  }

  @Patch('preferences')
  @ApiOperation({ summary: 'Update user preferences' })
  @ApiBody({ type: UpdatePreferencesDto })
  async updatePreferences(@Body() body: UpdatePreferencesDto, @Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('נדרשת התחברות');
    return this.settingsService.updatePreferences(user.id, body);
  }

  @Post('password')
  @ApiOperation({ summary: 'Change the current user password' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: StatusCodes.UNAUTHORIZED,
    description: 'The current password is wrong.',
  })
  @ApiResponse({
    status: StatusCodes.BAD_REQUEST,
    description: 'The new password is the same as the current one.',
  })
  async changePassword(@Body() body: ChangePasswordDto, @Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('נדרשת התחברות');
    return this.settingsService.changePassword(user.id, body);
  }

  @Get('export')
  @ApiOperation({ summary: 'Download the account and its family data as one JSON file' })
  @ApiResponse({
    status: StatusCodes.OK,
    description: 'The file is sent as an attachment; it contains no password material.',
  })
  async exportAccount(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response
  ) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('נדרשת התחברות');

    const exported = await this.accountService.export(user.id, user.familyId);
    const stamp = new Date().toISOString().slice(0, 10);

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="shlanu-export-${stamp}.json"`);

    return exported;
  }

  @Delete('account')
  @ApiOperation({ summary: 'Delete the account (and the family, if it has no other members)' })
  @ApiBody({ type: DeleteAccountDto })
  @ApiResponse({
    status: StatusCodes.UNAUTHORIZED,
    description: 'The password is wrong.',
  })
  async deleteAccount(
    @Body() body: DeleteAccountDto,
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response
  ) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('נדרשת התחברות');

    const result = await this.accountService.deleteAccount(user.id, body.password);
    res.clearCookie('session', SESSION_COOKIE_OPTIONS);

    return result;
  }
}
