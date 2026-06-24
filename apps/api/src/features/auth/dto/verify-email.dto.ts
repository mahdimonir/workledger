import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({ example: 'some-verification-token-guid' })
  @IsString()
  token!: string;
}
