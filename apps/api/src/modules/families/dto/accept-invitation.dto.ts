import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AcceptInvitationDto {
  @ApiProperty({ example: 'a1b2c3d4...' })
  @IsString()
  @IsNotEmpty()
  token: string;
}
