import { IsOptional, IsString, IsEnum, IsInt, Min, IsBoolean, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '@prisma/client';

export class TaskQueryDto {
  @ApiProperty({ example: 'cmqphwiog0009nwh85ufgqswu', description: 'Linked project ID' })
  @IsString()
  @IsNotEmpty()
  projectId!: string;

  @ApiProperty({ enum: TaskStatus, required: false, description: 'Filter by task status' })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiProperty({ example: 'cmqpf90fu0001nwzkl0epokxt', required: false, description: 'Filter by assignee member ID' })
  @IsString()
  @IsOptional()
  assigneeId?: string;

  @ApiProperty({ example: true, required: false, description: 'Filter by internal/external visibility' })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isInternal?: boolean;

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
