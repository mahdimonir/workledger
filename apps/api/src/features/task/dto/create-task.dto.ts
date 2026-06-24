import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsBoolean, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus, Priority } from '@prisma/client';

export class CreateTaskDto {
  @ApiProperty({ example: 'cmqphwiog0009nwh85ufgqswu', description: 'Linked project ID' })
  @IsString()
  @IsNotEmpty()
  projectId!: string;

  @ApiProperty({ example: 'cmqphwiog0009nwh85ufgqswu', required: false, description: 'Parent task ID for nested subtasks' })
  @IsString()
  @IsOptional()
  parentId?: string;

  @ApiProperty({ example: 'Build authentication controller' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'Implement signup, login, and jwt endpoints.', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: TaskStatus, default: TaskStatus.TODO, required: false })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiProperty({ enum: Priority, default: Priority.MEDIUM, required: false })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @ApiProperty({ example: 'cmqpf90fu0001nwzkl0epokxt', required: false, description: 'Assigned member ID' })
  @IsString()
  @IsOptional()
  assigneeId?: string;

  @ApiProperty({ example: '2026-07-15T00:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiProperty({ example: true, default: true, required: false, description: 'If true, never shown to client portal' })
  @IsBoolean()
  @IsOptional()
  isInternal?: boolean;
}
