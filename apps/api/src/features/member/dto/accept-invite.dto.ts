import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AcceptInviteDto {
  @ApiProperty({ example: 'some-invite-token-guid' })
  @IsString()
  token!: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'securepassword123', required: false })
  @IsString()
  @IsOptional()
  @MinLength(8)
  password?: string;
}
