import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class NotificationPreferencesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  taskAssigned?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  taskDueSoon?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  eventReminder?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  expenseAdded?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  weeklySummary?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  email?: boolean;
}
