import { IsDateString, IsNotEmpty, IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Metadata-only update. The stored file and its `storageKey` are immutable —
 * a replacement means uploading a new document.
 */
export class UpdateDocumentDto {
  @ApiPropertyOptional({ example: 'חוזה שכירות' })
  @IsOptional()
  @IsString()
  @Length(1, 120, { message: 'שם המסמך חייב להיות באורך 1-120 תווים' })
  title?: string;

  @ApiPropertyOptional({ example: 'חוזים' })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'נדרשת קטגוריה' })
  @Length(1, 60)
  category?: string;

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
