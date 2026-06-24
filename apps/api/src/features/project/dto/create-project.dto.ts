import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsNumber, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProjectStatus, Priority } from '@prisma/client';

export class CreateProjectDto {
  @ApiProperty({ example: 'cmqpf90a60000nwzkvar0pta2', description: 'Linked client ID' })
  @IsString()
  @IsNotEmpty()
  clientId!: string;

  @ApiProperty({ example: 'E-commerce Website redesign' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'Redesigning the shopping cart flow.', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: ProjectStatus, default: ProjectStatus.LEAD, required: false })
  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @ApiProperty({ example: '2026-06-01T00:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ example: '2026-08-30T00:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  deadline?: string;

  @ApiProperty({ example: 'USD', default: 'USD', required: false })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ enum: Priority, default: Priority.MEDIUM, required: false })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @ApiProperty({ example: 4500, required: false })
  @IsNumber()
  @IsOptional()
  estimatedValue?: number;

  @ApiProperty({ example: ['web', 'design'], required: false, type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
