import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { MilestoneStatus } from '@prisma/client';

export class CreateMilestoneDto {
  @ApiProperty({ example: 'cmqphwiog0009nwh85ufgqswu', description: 'Linked project ID' })
  @IsString()
  @IsNotEmpty()
  projectId!: string;

  @ApiProperty({ example: 'Milestone 1: Project Setup & Design' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'Scaffolding and UI mocks approval.', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2026-07-30T00:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiProperty({ enum: MilestoneStatus, default: MilestoneStatus.PENDING, required: false })
  @IsEnum(MilestoneStatus)
  @IsOptional()
  status?: MilestoneStatus;

  @ApiProperty({ example: 0, default: 0, required: false, description: 'Display order of milestones' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}
