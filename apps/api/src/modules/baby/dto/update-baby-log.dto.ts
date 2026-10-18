import { IsString, IsOptional, IsDateString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBabyLogDto {
  @ApiPropertyOptional({ example: 'FEEDING', enum: ['FEEDING', 'SLEEP', 'DIAPER', 'NOTE'] })
  @IsOptional()
  @IsIn(['FEEDING', 'SLEEP', 'DIAPER', 'NOTE'], { message: 'סוג לוג לא תקין' })
  type?: 'FEEDING' | 'SLEEP' | 'DIAPER' | 'NOTE';

  @ApiPropertyOptional({ example: '2024-12-25T10:00:00Z' })
  @IsOptional()
  @IsDateString({}, { message: 'מועד לא תקין' })
  occurredAt?: string;

  @ApiPropertyOptional({ example: '2024-12-25T11:00:00Z' })
  @IsOptional()
  @IsDateString({}, { message: 'מועד סיום לא תקין' })
  endedAt?: string;

  @ApiPropertyOptional({ example: 'הנקה משני הצדדים' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ example: { amount: 120, unit: 'ml' } })
  @IsOptional()
  details?: Record<string, unknown>;
}
