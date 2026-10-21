import { IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ description: 'The token from the link in the reset mail.' })
  @IsString()
  @Matches(/^[0-9a-f]{64}$/, { message: 'קישור איפוס הסיסמה אינו תקין' })
  token: string;

  @ApiProperty({ example: 'new-password-123' })
  @IsString()
  @MinLength(8, { message: 'הסיסמה החדשה חייבת להכיל לפחות 8 תווים' })
  password: string;
}
