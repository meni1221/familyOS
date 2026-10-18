import { IsDateString, IsNotEmpty, IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Text fields sent alongside the uploaded file as `multipart/form-data`.
 * The file itself arrives through `@UploadedFile()`.
 */
export class UploadDocumentDto {
  @ApiProperty({ example: 'חוזה שכירות' })
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'נדרש שם למסמך' })
  @Length(1, 120, { message: 'שם המסמך חייב להיות באורך 1-120 תווים' })
  title: string;

  @ApiProperty({ example: 'חוזים' })
  @IsString()
  @IsNotEmpty({ message: 'נדרשת קטגוריה' })
  @Length(1, 60, { message: 'הקטגוריה חייבת להיות באורך 1-60 תווים' })
  category: string;

  @ApiPropertyOptional({ example: 'חוזה לדירה ברחוב הרצל' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: '2024-12-25' })
  @IsOptional()
  @IsDateString({}, { message: 'תאריך הנפקה לא תקין' })
  issuedAt?: string;

  @ApiPropertyOptional({ example: '2026-12-25' })
  @IsOptional()
  @IsDateString({}, { message: 'תאריך תפוגה לא תקין' })
  expiresAt?: string;
}
