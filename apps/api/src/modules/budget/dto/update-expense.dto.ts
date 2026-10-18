import { IsString, IsOptional, IsNumber, IsDateString, IsIn, IsNotEmpty } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateExpenseDto {
  @ApiPropertyOptional({ example: 120.5 })
  @IsOptional()
  @IsNumber({}, { message: 'סכום חייב להיות מספר תקין' })
  amount?: number;

  @ApiPropertyOptional({ example: 'ILS', enum: ['ILS', 'USD', 'EUR', 'GBP'] })
  @IsOptional()
  @IsIn(['ILS', 'USD', 'EUR', 'GBP'], { message: 'מטבע לא תקין' })
  currency?: 'ILS' | 'USD' | 'EUR' | 'GBP';

  @ApiPropertyOptional({ example: 'מזון' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  category?: string;

  @ApiPropertyOptional({ example: 'קניות שבועיות' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '2024-12-25T10:00:00Z' })
  @IsOptional()
  @IsDateString({}, { message: 'מועד לא תקין' })
  occurredAt?: string;
}
