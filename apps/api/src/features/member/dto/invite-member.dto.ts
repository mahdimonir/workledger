import { IsEmail, IsEnum, NotEquals } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@workledger/shared';

export class InviteMemberDto {
  @ApiProperty({ example: 'colleague@workledger.io' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'MANAGER', enum: Role })
  @IsEnum(Role)
  @NotEquals(Role.OWNER, { message: 'Cannot invite a user as OWNER' })
  role!: Role;
}
