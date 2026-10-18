import { Type } from 'class-transformer';
import { IsIn, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationPreferencesDto } from './notification-preferences.dto';

export class UpdatePreferencesDto {
  @ApiPropertyOptional({ example: 'he', enum: ['he', 'en'] })
  @IsOptional()
  @IsIn(['he', 'en'], { message: 'שפה לא נתמכת' })
  preferredLocale?: string;

  @ApiPropertyOptional({ example: 'Asia/Jerusalem' })
  @IsOptional()
  @IsString()
  @MaxLength(64, { message: 'אזור זמן לא תקין' })
  timezone?: string;

  @ApiPropertyOptional({ type: NotificationPreferencesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationPreferencesDto)
  notificationPreferences?: NotificationPreferencesDto;
}
