import { IsString, IsOptional, IsDateString, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateEventDto {
  @ApiPropertyOptional({ example: 'ארוחת ערב משפחתית' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'פגישה משפחתית חשובה' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '2024-12-25T19:00:00Z' })
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiPropertyOptional({ example: '2024-12-25T21:00:00Z' })
  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isAllDay?: boolean;

  @ApiPropertyOptional({ example: 'Asia/Jerusalem' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ example: 'בית' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 'משפחה' })
  @IsOptional()
  @IsString()
  category?: string;
}
