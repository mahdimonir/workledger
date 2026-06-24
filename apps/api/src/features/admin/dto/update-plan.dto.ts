import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Plan } from '@prisma/client';

export class UpdatePlanDto {
  @ApiProperty({ enum: Plan, example: 'PRO' })
  @IsEnum(Plan)
  plan: Plan;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59.999Z' })
  @IsOptional()
  @IsDateString()
  planExpiresAt?: string;
}
