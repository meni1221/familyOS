import { IsString, IsOptional, IsNumber, IsDateString, IsIn, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExpenseDto {
  @ApiProperty({ example: 120.5 })
  @IsNumber({}, { message: 'סכום חייב להיות מספר תקין' })
  amount: number;

  @ApiPropertyOptional({ example: 'ILS', enum: ['ILS', 'USD', 'EUR', 'GBP'] })
  @IsOptional()
  @IsIn(['ILS', 'USD', 'EUR', 'GBP'], { message: 'מטבע לא תקין' })
  currency?: 'ILS' | 'USD' | 'EUR' | 'GBP';

  @ApiProperty({ example: 'מזון' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiPropertyOptional({ example: 'קניות שבועיות' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2024-12-25T10:00:00Z' })
  @IsDateString()
  occurredAt: string;
}
