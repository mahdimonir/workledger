import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordRequestDto {
  @ApiProperty({ example: 'test@workledger.io' })
  @IsEmail()
  email!: string;
}
