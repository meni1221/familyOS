import { IsString, IsOptional, IsIn, IsDateString, IsMongoId } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTaskDto {
  @ApiPropertyOptional({ example: 'קניות שבועיות' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'לקנות מזון לשבוע' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'OPEN', enum: ['OPEN', 'IN_PROGRESS', 'COMPLETED'] })
  @IsOptional()
  @IsIn(['OPEN', 'IN_PROGRESS', 'COMPLETED'], { message: 'סטטוס לא תקין' })
  status?: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';

  @ApiPropertyOptional({ example: 'HIGH', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] })
  @IsOptional()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'], { message: 'עדיפות לא תקינה' })
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

  @ApiPropertyOptional({ example: 'בית' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: '2024-12-31T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  dueAt?: string;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439011' })
  @IsOptional()
  @IsMongoId({ message: 'מזהה המשתמש שהוקצה אינו תקין' })
  assigneeUserId?: string;
}
