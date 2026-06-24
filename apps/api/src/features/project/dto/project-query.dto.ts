import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ProjectStatus, Priority } from '@prisma/client';

export class ProjectQueryDto {
  @ApiProperty({ example: 'website', required: false, description: 'Search term matching project name or description' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ example: 'cmqpf90a60000nwzkvar0pta2', required: false, description: 'Filter by client ID' })
  @IsString()
  @IsOptional()
  clientId?: string;

  @ApiProperty({ enum: ProjectStatus, required: false, description: 'Filter by project status' })
  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @ApiProperty({ enum: Priority, required: false, description: 'Filter by project priority' })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

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
