import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { MilestoneStatus } from '@prisma/client';

export class MilestoneQueryDto {
  @ApiProperty({ example: 'cmqphwiog0009nwh85ufgqswu', required: false, description: 'Filter by project ID' })
  @IsString()
  @IsOptional()
  projectId?: string;

  @ApiProperty({ enum: MilestoneStatus, required: false, description: 'Filter by milestone status' })
  @IsEnum(MilestoneStatus)
  @IsOptional()
  status?: MilestoneStatus;

  @ApiProperty({ example: 1, default: 1, required: false, description: 'Page number' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ example: 10, default: 10, required: false, description: 'Page size' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 10;
}
