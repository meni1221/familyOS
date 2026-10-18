import { IsString, IsOptional, IsDateString, IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ example: 'ארוחת ערב משפחתית' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'פגישה משפחתית חשובה' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2024-12-25T19:00:00Z' })
  @IsDateString()
  startsAt: string;

  @ApiProperty({ example: '2024-12-25T21:00:00Z' })
  @IsDateString()
  endsAt: string;

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
