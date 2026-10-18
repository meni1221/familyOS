import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { AuthenticatedRequest } from '../../middleware/authenticated-request';
import { UpdateProfileDto, UpdatePreferencesDto, ChangePasswordDto } from './dto';

@ApiTags('settings')
@Controller('api/v1/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

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
  async changePassword(@Body() body: ChangePasswordDto, @Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('נדרשת התחברות');
    return this.settingsService.changePassword(user.id, body);
  }
}
