import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ProposalStatus } from '@workledger/shared';

export class ProposalQueryDto {
  @ApiProperty({ example: 'website', required: false, description: 'Search term matching proposal title or introduction' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ example: 'cmqpf90a60000nwzkvar0pta2', required: false, description: 'Filter by client ID' })
  @IsString()
  @IsOptional()
  clientId?: string;

  @ApiProperty({ enum: ProposalStatus, required: false, description: 'Filter by proposal status' })
  @IsEnum(ProposalStatus)
  @IsOptional()
  status?: ProposalStatus;

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
