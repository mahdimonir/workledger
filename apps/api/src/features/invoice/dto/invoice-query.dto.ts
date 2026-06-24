import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { InvoiceStatus } from '@workledger/shared';

export class InvoiceQueryDto {
  @ApiProperty({ example: 'INV-0001', required: false, description: 'Search term matching invoice number or notes' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ example: 'cmqpf90a60000nwzkvar0pta2', required: false, description: 'Filter by client ID' })
  @IsString()
  @IsOptional()
  clientId?: string;

  @ApiProperty({ enum: InvoiceStatus, required: false, description: 'Filter by invoice status' })
  @IsEnum(InvoiceStatus)
  @IsOptional()
  status?: InvoiceStatus;

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
