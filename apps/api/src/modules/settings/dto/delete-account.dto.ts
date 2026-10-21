import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteAccountDto {
  @ApiProperty({ description: 'The current password, to prove it is the account owner.' })
  @IsString()
  @MinLength(1, { message: 'נדרשת הסיסמה כדי למחוק את החשבון' })
  password: string;
}
