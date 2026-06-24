import { IsString, IsNotEmpty, IsOptional, IsDateString, IsNumber, Min, IsArray, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class InvoiceLineItemDto {
  @ApiProperty({ example: 'Backend Development - Phase 1', description: 'Item description' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ example: 10, description: 'Quantity of item' })
  @IsNumber()
  @Min(0)
  quantity!: number;

  @ApiProperty({ example: 150.00, description: 'Rate of item' })
  @IsNumber()
  @Min(0)
  rate!: number;

  @ApiProperty({ example: 15.0, description: 'Tax rate percentage', required: false, default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  taxRate?: number;
}

export class CreateInvoiceDto {
  @ApiProperty({ example: 'cmqpf90a60000nwzkvar0pta2', description: 'Linked client ID' })
  @IsString()
  @IsNotEmpty()
  clientId!: string;

  @ApiProperty({ example: 'cmqpf90a60000nwzkvar0ptb4', required: false, description: 'Linked project ID' })
  @IsString()
  @IsOptional()
  projectId?: string;

  @ApiProperty({ example: 'cmqpf90a60000nwzkvar0ptc5', required: false, description: 'Linked milestone ID' })
  @IsString()
  @IsOptional()
  milestoneId?: string;

  @ApiProperty({ type: [InvoiceLineItemDto], description: 'Invoice line items' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineItemDto)
  lineItems!: InvoiceLineItemDto[];

  @ApiProperty({ example: 100.00, required: false, default: 0, description: 'Discount value' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discountValue?: number;

  @ApiProperty({ example: 'fixed', required: false, enum: ['fixed', 'percentage'], description: 'Discount type' })
  @IsString()
  @IsOptional()
  @IsIn(['fixed', 'percentage'])
  discountType?: string;

  @ApiProperty({ example: 'USD', default: 'USD', required: false })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ example: '2026-07-30T00:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiProperty({ example: 'Payment terms: Net 30. Thank you for your business.', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ example: 'Client requested Net 30 instead of 15.', required: false })
  @IsString()
  @IsOptional()
  internalNote?: string;
}
