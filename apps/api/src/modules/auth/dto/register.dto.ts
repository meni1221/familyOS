import { IsEmail, IsString, MinLength, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'כתובת אימייל לא תקינה' })
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(8, { message: 'סיסמה צריכה להכיל לפחות 8 תווים' })
  password: string;

  @ApiProperty({ example: 'ישראל ישראלי' })
  @IsString()
  @MinLength(2, { message: 'שם צריך להכיל לפחות 2 תווים' })
  displayName: string;

  @ApiPropertyOptional({ example: 'he', enum: ['he', 'en'] })
  @IsOptional()
  @IsIn(['he', 'en'], { message: 'שפה חייבת להיות he או en' })
  preferredLocale?: 'he' | 'en';
}
