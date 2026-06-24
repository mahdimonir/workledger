import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordRequestDto {
  @ApiProperty({ example: 'mahdi@workledger.io' })
  @IsEmail()
  email!: string;
}
