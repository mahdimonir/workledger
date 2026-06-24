import { IsString, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FileQueryDto {
  @ApiPropertyOptional({ description: 'Search term for file name' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by milestone ID' })
  @IsString()
  @IsOptional()
  milestoneId?: string;

  @ApiPropertyOptional({ description: 'Filter by deliverable status' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isDeliverable?: boolean;

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ minimum: 1, default: 10 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
}
