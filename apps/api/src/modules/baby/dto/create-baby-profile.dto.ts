import { IsString, IsOptional, IsDateString, IsBoolean, IsIn, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BABY_COLORS } from '../../../database/models/baby-profile.model';

export class CreateBabyProfileDto {
  @ApiProperty({ example: 'יונתן' })
  @IsString()
  @Length(1, 60, { message: 'שם התינוק/ת חייב להיות באורך 1-60 תווים' })
  displayName: string;

  @ApiPropertyOptional({ example: '2024-12-25' })
  @IsOptional()
  @IsDateString({}, { message: 'תאריך לידה לא תקין' })
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: 'gold', enum: BABY_COLORS })
  @IsOptional()
  @IsIn(BABY_COLORS, { message: 'צבע לא מוכר' })
  color?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  trackingEnabled?: boolean;
}
