import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ClientHealth } from '@prisma/client';

export class ClientQueryDto {
  @ApiProperty({ example: 'Acme', required: false, description: 'Search term matching client name or company' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ example: 'tech', required: false, description: 'Filter by tag' })
  @IsString()
  @IsOptional()
  tag?: string;

  @ApiProperty({ enum: ClientHealth, required: false, description: 'Filter by client health status' })
  @IsEnum(ClientHealth)
  @IsOptional()
  healthStatus?: ClientHealth;

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
