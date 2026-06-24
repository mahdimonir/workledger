import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'some-password-reset-token-guid' })
  @IsString()
  token!: string;

  @ApiProperty({ example: 'newsecurepassword123' })
  @IsString()
  @MinLength(8)
  password!: string;
}
