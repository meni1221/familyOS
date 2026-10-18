import { IsEmail, IsIn, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInvitationDto {
  @ApiProperty({ example: 'member@example.com' })
  @IsEmail({}, { message: 'כתובת אימייל לא תקינה' })
  email: string;

  @ApiPropertyOptional({ example: 'MEMBER', enum: ['OWNER', 'MEMBER'] })
  @IsOptional()
  @IsIn(['OWNER', 'MEMBER'], { message: 'תפקיד לא תקין' })
  role?: 'OWNER' | 'MEMBER';
}
