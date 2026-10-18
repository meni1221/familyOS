import { IsString, IsOptional, IsDateString, IsBoolean, Length } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBabyProfileDto {
  @ApiPropertyOptional({ example: 'יונתן' })
  @IsOptional()
  @IsString()
  @Length(1, 60, { message: 'שם התינוק/ת חייב להיות באורך 1-60 תווים' })
  displayName?: string;

  @ApiPropertyOptional({ example: '2024-12-25' })
  @IsOptional()
  @IsDateString({}, { message: 'תאריך לידה לא תקין' })
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  trackingEnabled?: boolean;
}
