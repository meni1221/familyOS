import { IsString, IsOptional, IsNumber, IsIn, Length, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBudgetDto {
  @ApiProperty({ example: 'תקציב מזון' })
  @IsString()
  @Length(1, 60, { message: 'שם התקציב חייב להיות באורך 1-60 תווים' })
  name: string;

  @ApiProperty({ example: 2500 })
  @IsNumber({}, { message: 'סכום חייב להיות מספר תקין' })
  @Min(0, { message: 'סכום לא יכול להיות שלילי' })
  amount: number;

  @ApiPropertyOptional({ example: 'ILS', enum: ['ILS', 'USD', 'EUR'] })
  @IsOptional()
  @IsIn(['ILS', 'USD', 'EUR'], { message: 'מטבע לא תקין' })
  currency?: 'ILS' | 'USD' | 'EUR';

  @ApiPropertyOptional({ example: 'MONTHLY', enum: ['MONTHLY', 'YEARLY'] })
  @IsOptional()
  @IsIn(['MONTHLY', 'YEARLY'], { message: 'תדירות לא תקינה' })
  period?: 'MONTHLY' | 'YEARLY';
}
