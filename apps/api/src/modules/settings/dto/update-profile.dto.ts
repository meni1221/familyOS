import { IsIn, IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'דנה ישראלי' })
  @IsOptional()
  @IsString()
  @Length(2, 60, { message: 'שם התצוגה חייב להכיל בין 2 ל-60 תווים' })
  displayName?: string;

  @ApiPropertyOptional({ example: 'he', enum: ['he', 'en'] })
  @IsOptional()
  @IsIn(['he', 'en'], { message: 'שפה לא נתמכת' })
  preferredLocale?: string;

  @ApiPropertyOptional({ example: 'Asia/Jerusalem' })
  @IsOptional()
  @IsString()
  @MaxLength(64, { message: 'אזור זמן לא תקין' })
  timezone?: string;
}
