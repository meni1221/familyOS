import { IsString, IsOptional, IsDateString, IsIn, IsMongoId } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBabyLogDto {
  @ApiProperty({ example: 'FEEDING', enum: ['FEEDING', 'SLEEP', 'DIAPER', 'NOTE'] })
  @IsString()
  @IsIn(['FEEDING', 'SLEEP', 'DIAPER', 'NOTE'], { message: 'סוג לוג לא תקין' })
  type: 'FEEDING' | 'SLEEP' | 'DIAPER' | 'NOTE';

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439011' })
  @IsOptional()
  @IsMongoId({ message: 'מזהה פרופיל התינוק אינו תקין' })
  babyProfileId?: string;

  @ApiProperty({ example: '2024-12-25T10:00:00Z' })
  @IsDateString()
  occurredAt: string;

  @ApiPropertyOptional({ example: '2024-12-25T11:00:00Z' })
  @IsOptional()
  @IsDateString()
  endedAt?: string;

  @ApiPropertyOptional({ example: 'הנקה משני הצדדים' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ example: { amount: 120, unit: 'ml' } })
  @IsOptional()
  details?: Record<string, unknown>;
}
