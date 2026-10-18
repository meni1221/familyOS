import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFamilyDto {
  @ApiProperty({ example: 'משפחת ישראלי' })
  @IsString()
  @Length(2, 60, { message: 'שם המשפחה חייב להכיל בין 2 ל-60 תווים' })
  name: string;
}
