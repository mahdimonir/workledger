import { IsEnum, NotEquals } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@workledger/shared';

export class UpdateMemberRoleDto {
  @ApiProperty({ example: 'MANAGER', enum: Role })
  @IsEnum(Role)
  @NotEquals(Role.OWNER, { message: 'Cannot set user role to OWNER' })
  role!: Role;
}
